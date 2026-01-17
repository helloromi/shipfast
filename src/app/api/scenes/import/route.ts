import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { extractTextFromFile, type ExtractionProgressEventV2 } from "@/lib/utils/text-extraction";
import { parseTextWithAI, type ParsedScene } from "@/lib/utils/text-parser";
import { assertSameOrigin } from "@/lib/utils/csrf";
import { checkRateLimit } from "@/lib/utils/rate-limit";

export const runtime = "nodejs"; // Nécessaire pour Tesseract.js et pdfjs-dist
export const maxDuration = 300; // 5 minutes max pour le traitement

type ImportStreamEvent =
  | {
      type: "progress";
      stage: "downloading" | "extracting" | "parsing" | "creating";
      message?: string;
      progress?: number; // 0..1
      current?: number;
      total?: number;
      fileName?: string;
      page?: number;
      totalPages?: number;
    }
  | {
      type: "done";
      mode: "preview" | "create";
      sceneId?: string;
      draft?: ParsedScene;
    }
  | {
      type: "error";
      error: string;
      details?: string;
    };

export async function POST(request: NextRequest) {
  try {
    const csrf = assertSameOrigin(request);
    if (!csrf.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const rl = checkRateLimit(`import:${user.id}`, { windowMs: 60_000, max: 10 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Trop de requêtes" },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
      );
    }

    // Récupérer les chemins des fichiers depuis le body JSON
    const body = await request.json();
    const { filePaths, action, consentToThirdPartyAI } = body as {
      filePaths?: unknown;
      action?: unknown;
      consentToThirdPartyAI?: unknown;
    };
    const importAction: "preview" | "create" = action === "preview" ? "preview" : "create";

    if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
      return NextResponse.json({ error: "Aucun chemin de fichier fourni" }, { status: 400 });
    }

    // Defense-in-depth: refuser tout accès à des fichiers Storage qui ne sont pas dans le dossier user_id.
    // Cela protège même si les policies Storage sont mal configurées.
    const expectedPrefix = `${user.id}/`;
    const invalidPath = (filePaths as unknown[]).find(
      (p) => typeof p !== "string" || !p.startsWith(expectedPrefix)
    );
    if (invalidPath) {
      return NextResponse.json({ error: "Chemin de fichier invalide (accès refusé)" }, { status: 403 });
    }

    // Consentement explicite (RGPD / confidentialité): l'import peut envoyer le contenu à un prestataire IA tiers (OpenAI)
    // pour OCR/parsing. Par défaut, on exige ce consentement.
    const requireConsent = process.env.REQUIRE_AI_CONSENT !== "0";
    const allowThirdPartyAI = Boolean(consentToThirdPartyAI);
    if (requireConsent && !allowThirdPartyAI) {
      return NextResponse.json(
        {
          error:
            "Consentement requis: l'import peut envoyer le contenu à un prestataire d'IA tiers pour OCR/parsing.",
          code: "CONSENT_REQUIRED",
        },
        { status: 403 }
      );
    }

    // Mode background: créer un job et traiter en arrière-plan
    const isBackground = request.headers.get("x-import-background") === "1";

    if (isBackground) {
      // Créer un job dans import_jobs
      const { data: job, error: jobError } = await supabase
        .from("import_jobs")
        .insert({
          user_id: user.id,
          status: "pending",
          file_paths: filePaths,
          // Colonne ajoutée via migration (voir supabase/migrations)
          consent_to_ai: allowThirdPartyAI,
        })
        .select()
        .single();

      if (jobError || !job) {
        console.error("Erreur lors de la création du job:", jobError);
        return NextResponse.json(
          { error: "Erreur lors de la création du job d'import", details: jobError?.message },
          { status: 500 }
        );
      }

      // Lancer le traitement en arrière-plan (sans bloquer la réponse)
      processImportJob(job.id, filePaths, allowThirdPartyAI, supabase).catch((error) => {
        console.error(`[Import Job ${job.id}] Erreur lors du traitement:`, error);
      });

      // Retourner immédiatement le job_id
      return NextResponse.json({
        success: true,
        jobId: job.id,
        message: "Import lancé en arrière-plan",
      });
    }

    const wantsStream = request.headers.get("x-import-stream") === "1";

    if (wantsStream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          const write = (evt: ImportStreamEvent) => {
            controller.enqueue(encoder.encode(`${JSON.stringify(evt)}\n`));
          };

          (async () => {
            try {
              let aggregatedText = "";
              const totalFiles = filePaths.length;

              for (let index = 0; index < totalFiles; index++) {
                const filePath = filePaths[index];
                write({
                  type: "progress",
                  stage: "downloading",
                  message: "Récupération du fichier...",
                  current: index + 1,
                  total: totalFiles,
                  progress: Math.min(0.05 + (index / Math.max(1, totalFiles)) * 0.6, 0.65),
                });

                const { data: fileData, error: downloadError } = await supabase.storage
                  .from("scene-imports")
                  .download(filePath);

                if (downloadError || !fileData) {
                  write({
                    type: "error",
                    error: "Erreur lors du téléchargement du fichier",
                    details: downloadError?.message,
                  });
                  controller.close();
                  return;
                }

                const fileName = filePath.split("/").pop() || "file";
                const file = new File([fileData], fileName, { type: fileData.type });

                write({
                  type: "progress",
                  stage: "extracting",
                  message: "Extraction du texte...",
                  current: index + 1,
                  total: totalFiles,
                  fileName: file.name,
                  progress: Math.min(0.1 + (index / Math.max(1, totalFiles)) * 0.6, 0.7),
                });

                let aiTicks = 0;
                const extractionResult = await extractTextFromFile(
                  file,
                  (evt: ExtractionProgressEventV2) => {
                  const perFileBase = 0.1 + (index / Math.max(1, totalFiles)) * 0.6;
                  const perFileSpan = 0.6 / Math.max(1, totalFiles);

                  // Compat ancien event
                  if (evt.type === "pdf_ocr_page") {
                    const pageProgress = (evt.page / Math.max(1, evt.totalPages)) * perFileSpan;
                    write({
                      type: "progress",
                      stage: "extracting",
                      message: "OCR en cours...",
                      current: index + 1,
                      total: totalFiles,
                      fileName: file.name,
                      page: evt.page,
                      totalPages: evt.totalPages,
                      progress: Math.min(perFileBase + pageProgress, 0.8),
                    });
                    return;
                  }

                  if (evt.type === "pdf_progress") {
                    if (evt.phase === "render" && evt.page && evt.totalPages) {
                      const pageProgress = (evt.page / Math.max(1, evt.totalPages)) * (perFileSpan * 0.6);
                      write({
                        type: "progress",
                        stage: "extracting",
                        message: evt.message || "Préparation du PDF...",
                        current: index + 1,
                        total: totalFiles,
                        fileName: file.name,
                        page: evt.page,
                        totalPages: evt.totalPages,
                        progress: Math.min(perFileBase + pageProgress, 0.75),
                      });
                      return;
                    }

                    if (evt.phase === "ai") {
                      aiTicks += 1;
                      write({
                        type: "progress",
                        stage: "extracting",
                        message: evt.message || "Analyse OCR (OpenAI)...",
                        current: index + 1,
                        total: totalFiles,
                        fileName: file.name,
                        progress: Math.min(perFileBase + perFileSpan * (0.78 + Math.min(aiTicks, 30) * 0.003), 0.88),
                      });
                      return;
                    }

                    if (evt.phase === "tesseract" && evt.page && evt.totalPages) {
                      const pageProgress = perFileSpan * (0.6 + (evt.page / Math.max(1, evt.totalPages)) * 0.35);
                      write({
                        type: "progress",
                        stage: "extracting",
                        message: evt.message || "OCR (Tesseract) en cours...",
                        current: index + 1,
                        total: totalFiles,
                        fileName: file.name,
                        page: evt.page,
                        totalPages: evt.totalPages,
                        progress: Math.min(perFileBase + pageProgress, 0.88),
                      });
                    }
                  }
                  },
                  { allowOpenAI: allowThirdPartyAI }
                );

                if (!extractionResult.success) {
                  write({
                    type: "error",
                    error: "Erreur lors de l'extraction du texte",
                    details: extractionResult.error,
                  });
                  controller.close();
                  return;
                }

                if (extractionResult.text?.trim()) {
                  aggregatedText += `${extractionResult.text.trim()}\n\n`;
                }
              }

              if (!aggregatedText.trim()) {
                write({
                  type: "error",
                  error: "Aucun texte n'a pu être extrait des fichiers",
                });
                controller.close();
                return;
              }

              write({
                type: "progress",
                stage: "parsing",
                message: "Analyse du texte avec l'IA...",
                progress: 0.85,
              });

              const parseResult = await parseTextWithAI(aggregatedText, { allowThirdPartyAI });
              if (!parseResult.success || !parseResult.data) {
                write({
                  type: "error",
                  error: "Erreur lors du parsing du texte",
                  details: parseResult.error || "Erreur inconnue",
                });
                controller.close();
                return;
              }

              const parsedScene = parseResult.data;

              // Mode preview: on s'arrête ici et on laisse l'utilisateur sélectionner les répliques à garder.
              if (importAction === "preview") {
                write({
                  type: "done",
                  mode: "preview",
                  draft: parsedScene,
                });
                controller.close();
                return;
              }

              write({
                type: "progress",
                stage: "creating",
                message: "Création de la scène...",
                progress: 0.93,
              });

              const { data: scene, error: sceneError } = await supabase
                .from("scenes")
                .insert({
                  title: parsedScene.title,
                  author: parsedScene.author || null,
                  summary: null,
                  chapter: null,
                  is_private: true,
                  owner_user_id: user.id,
                })
                .select()
                .single();

              if (sceneError || !scene) {
                write({
                  type: "error",
                  error: "Erreur lors de la création de la scène",
                  details: sceneError?.message,
                });
                controller.close();
                return;
              }

              const sceneId = scene.id;

              if (parsedScene.characters && parsedScene.characters.length > 0) {
                const charactersToInsert = parsedScene.characters.map((charName) => ({
                  scene_id: sceneId,
                  name: charName,
                }));
                await supabase.from("characters").insert(charactersToInsert);
              }

              const { data: sceneCharacters } = await supabase
                .from("characters")
                .select("id, name")
                .eq("scene_id", sceneId);

              const characterMap = new Map(sceneCharacters?.map((c) => [c.name, c.id]) || []);

              if (parsedScene.lines && parsedScene.lines.length > 0) {
                const linesToInsert = parsedScene.lines
                  .map((line) => {
                    const characterId = characterMap.get(line.characterName);
                    if (!characterId) return null;
                    return {
                      scene_id: sceneId,
                      character_id: characterId,
                      text: line.text,
                      order: line.order,
                    };
                  })
                  .filter((l) => l !== null);

                if (linesToInsert.length > 0) {
                  await supabase.from("lines").insert(linesToInsert);
                }
              }

              await supabase.from("user_work_access").insert({
                user_id: user.id,
                scene_id: sceneId,
                access_type: "private",
              });

              write({ type: "done", mode: "create", sceneId });
              controller.close();
            } catch (error: any) {
              write({
                type: "error",
                error: "Erreur interne du serveur",
                details: error?.message || "Erreur inconnue",
              });
              controller.close();
            }
          })();
        },
      });

      return new Response(stream, {
        status: 200,
        headers: {
          "Content-Type": "application/x-ndjson; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
        },
      });
    }

    // Télécharger et concaténer le texte de tous les fichiers (images ou PDF)
    let aggregatedText = "";
    for (const filePath of filePaths) {
      // Éviter les logs verbeux contenant des infos utilisateur (file paths). Active via DEBUG_IMPORTS=1.
      if (process.env.DEBUG_IMPORTS === "1") {
        console.log(`[Import] Téléchargement du fichier depuis Storage: ${filePath}...`);
      }
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("scene-imports")
        .download(filePath);

      if (downloadError || !fileData) {
        console.error("Erreur lors du téléchargement:", downloadError);
        return NextResponse.json(
          { error: "Erreur lors du téléchargement du fichier", details: downloadError?.message },
          { status: 500 }
        );
      }

      const fileName = filePath.split("/").pop() || "file";
      const file = new File([fileData], fileName, { type: fileData.type });

      if (process.env.DEBUG_IMPORTS === "1") {
        console.log(`[Import] Extraction du texte depuis ${file.name}...`);
      }
      const extractionResult = await extractTextFromFile(file, undefined, { allowOpenAI: allowThirdPartyAI });

      if (!extractionResult.success) {
        return NextResponse.json(
          {
            error: "Erreur lors de l'extraction du texte",
            details: extractionResult.error,
          },
          { status: 400 }
        );
      }

      if (extractionResult.text?.trim()) {
        aggregatedText += `${extractionResult.text.trim()}\n\n`;
      }
    }

    if (!aggregatedText.trim()) {
      return NextResponse.json(
        {
          error: "Aucun texte n'a pu être extrait des fichiers",
        },
        { status: 400 }
      );
    }

    // Étape 2 : Parsing avec l'IA
    if (process.env.DEBUG_IMPORTS === "1") {
      console.log(`[Import] Parsing du texte avec l'IA...`);
    }
    const parseResult = await parseTextWithAI(aggregatedText, { allowThirdPartyAI });

    if (!parseResult.success || !parseResult.data) {
      return NextResponse.json(
        {
          error: "Erreur lors du parsing du texte",
          details: parseResult.error || "Erreur inconnue",
        },
        { status: 400 }
      );
    }

    const parsedScene = parseResult.data;

    if (importAction === "preview") {
      return NextResponse.json({
        success: true,
        mode: "preview",
        draft: parsedScene,
      });
    }

    // Étape 3 : Créer la scène privée
    console.log(`[Import] Création de la scène "${parsedScene.title}"...`);

    // Créer la scène
    const { data: scene, error: sceneError } = await supabase
      .from("scenes")
      .insert({
        title: parsedScene.title,
        author: parsedScene.author || null,
        summary: null,
        chapter: null,
        is_private: true,
        owner_user_id: user.id,
      })
      .select()
      .single();

    if (sceneError || !scene) {
      console.error("Erreur lors de la création de la scène:", sceneError);
      return NextResponse.json(
        { error: "Erreur lors de la création de la scène", details: sceneError?.message },
        { status: 500 }
      );
    }

    const sceneId = scene.id;

    // Créer les personnages
    if (parsedScene.characters && parsedScene.characters.length > 0) {
      const charactersToInsert = parsedScene.characters.map((charName) => ({
        scene_id: sceneId,
        name: charName,
      }));

      const { error: charsError } = await supabase.from("characters").insert(charactersToInsert);

      if (charsError) {
        console.error("Erreur lors de la création des personnages:", charsError);
        // Continuer même si les personnages échouent
      }
    }

    // Récupérer les personnages pour mapper les répliques
    const { data: sceneCharacters } = await supabase
      .from("characters")
      .select("id, name")
      .eq("scene_id", sceneId);

    const characterMap = new Map(sceneCharacters?.map((c) => [c.name, c.id]) || []);

    // Créer les répliques
    if (parsedScene.lines && parsedScene.lines.length > 0) {
      const linesToInsert = parsedScene.lines
        .map((line) => {
          const characterId = characterMap.get(line.characterName);
          if (!characterId) {
            console.warn(`Personnage non trouvé: ${line.characterName}`);
            return null;
          }

          return {
            scene_id: sceneId,
            character_id: characterId,
            text: line.text,
            order: line.order,
          };
        })
        .filter((l) => l !== null);

      if (linesToInsert.length > 0) {
        const { error: linesError } = await supabase.from("lines").insert(linesToInsert);

        if (linesError) {
          console.error("Erreur lors de la création des répliques:", linesError);
          // Continuer même si les répliques échouent
        }
      }
    }

    // Créer l'entrée dans user_work_access
    const { error: accessError } = await supabase.from("user_work_access").insert({
      user_id: user.id,
      scene_id: sceneId,
      access_type: "private",
    });

    if (accessError) {
      console.error("Erreur lors de la création de l'accès:", accessError);
      // Continuer même si l'accès échoue (la scène est déjà créée)
    }

    console.log(`[Import] Scène créée avec succès: ${sceneId}`);

    return NextResponse.json({
      success: true,
      sceneId,
      scene: {
        id: sceneId,
        title: parsedScene.title,
        author: parsedScene.author,
        charactersCount: parsedScene.characters.length,
        linesCount: parsedScene.lines.length,
      },
    });
  } catch (error: any) {
    console.error("Erreur lors de l'import:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur",
        details: error.message || "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

// Fonction pour traiter un job d'import en arrière-plan
async function processImportJob(
  jobId: string,
  filePaths: string[],
  allowThirdPartyAI: boolean,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
) {
  try {
    console.log(`[Import Job ${jobId}] Démarrage du traitement...`);

    // Mettre à jour le job avec status 'processing'
    await supabase
      .from("import_jobs")
      .update({ status: "processing" })
      .eq("id", jobId);

    // Télécharger et concaténer le texte de tous les fichiers
    let aggregatedText = "";
    for (const filePath of filePaths) {
      console.log(`[Import Job ${jobId}] Téléchargement du fichier: ${filePath}...`);
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("scene-imports")
        .download(filePath);

      if (downloadError || !fileData) {
        console.error(`[Import Job ${jobId}] Erreur lors du téléchargement:`, downloadError);
        await supabase
          .from("import_jobs")
          .update({
            status: "error",
            error_message: `Erreur lors du téléchargement: ${downloadError?.message || "inconnue"}`,
          })
          .eq("id", jobId);
        return;
      }

      const fileName = filePath.split("/").pop() || "file";
      const file = new File([fileData], fileName, { type: fileData.type });

      console.log(`[Import Job ${jobId}] Extraction du texte depuis ${file.name}...`);
      const extractionResult = await extractTextFromFile(file, undefined, { allowOpenAI: allowThirdPartyAI });

      if (!extractionResult.success) {
        console.error(`[Import Job ${jobId}] Erreur lors de l'extraction:`, extractionResult.error);
        await supabase
          .from("import_jobs")
          .update({
            status: "error",
            error_message: `Erreur lors de l'extraction: ${extractionResult.error}`,
          })
          .eq("id", jobId);
        return;
      }

      if (extractionResult.text?.trim()) {
        aggregatedText += `${extractionResult.text.trim()}\n\n`;
      }
    }

    if (!aggregatedText.trim()) {
      await supabase
        .from("import_jobs")
        .update({
          status: "error",
          error_message: "Aucun texte n'a pu être extrait des fichiers",
        })
        .eq("id", jobId);
      return;
    }

    // Parsing avec l'IA
    console.log(`[Import Job ${jobId}] Parsing du texte avec l'IA...`);
    const parseResult = await parseTextWithAI(aggregatedText, { allowThirdPartyAI });

    if (!parseResult.success || !parseResult.data) {
      console.error(`[Import Job ${jobId}] Erreur lors du parsing:`, parseResult.error);
      await supabase
        .from("import_jobs")
        .update({
          status: "error",
          error_message: `Erreur lors du parsing: ${parseResult.error || "inconnue"}`,
        })
        .eq("id", jobId);
      return;
    }

    const parsedScene = parseResult.data;

    // Mettre à jour le job avec status 'preview_ready' et le draft_data
    console.log(`[Import Job ${jobId}] Preview prêt, mise à jour du job...`);
    const { error: updateError } = await supabase
      .from("import_jobs")
      .update({
        status: "preview_ready",
        draft_data: parsedScene as any,
      })
      .eq("id", jobId);

    if (updateError) {
      console.error(`[Import Job ${jobId}] Erreur lors de la mise à jour:`, updateError);
      await supabase
        .from("import_jobs")
        .update({
          status: "error",
          error_message: `Erreur lors de la mise à jour: ${updateError.message}`,
        })
        .eq("id", jobId);
      return;
    }

    console.log(`[Import Job ${jobId}] Traitement terminé avec succès`);
  } catch (error: any) {
    console.error(`[Import Job ${jobId}] Erreur lors du traitement:`, error);
    await supabase
      .from("import_jobs")
      .update({
        status: "error",
        error_message: `Erreur interne: ${error.message || "inconnue"}`,
      })
      .eq("id", jobId);
  }
}

