/**
 * Côté-Cour — retire les scènes en double du catalogue public.
 *
 * L'audit SEO du 30/07/2026 a relevé trois lots de doublons, hérités du chevauchement
 * de deux générations de seed (titres en chiffres arabes vs romains) :
 *
 *   1. Phèdre, acte I scène 3 — deux entrées du même texte (`acte-i-scene-iii`,
 *      65 répliques, orthographe moderne ; `acte-i-scene-3`, 63 répliques).
 *   2. Le Médecin malgré lui, acte I scène 1 — idem, dont une version tronquée
 *      (`acte-i-scene-i`, 51 répliques ; `acte-i-scene-1`, 12 répliques).
 *   3. Trois scènes à `work_id` nul dont le texte est identique à celui du Médecin
 *      acte I scène 1, servies sur URL UUID.
 *
 * Ce script ne DÉCIDE rien : les scènes à retirer sont listées en dur ci-dessous, avec
 * leur remplaçante. Il vérifie, affiche, et n'écrit qu'avec --apply.
 *
 * Usage (depuis la racine du repo) :
 *   npx tsx supabase/seed/dedupe-scenes.ts             # dry-run : n'écrit rien
 *   npx tsx supabase/seed/dedupe-scenes.ts -- --apply   # supprime en base
 *
 * ⚠️ Avant --apply : lire le rapport de dry-run en entier. Une scène qui porte des
 * sessions d'apprentissage ou des feedbacks utilisateur n'est PAS supprimée — le
 * script la signale et l'ignore (même garde-fou que pour les pierres tombales
 * Building, cf. src/lib/seo/gone-scenes.ts). Après --apply, reporter les UUID
 * supprimés dans goneSceneIds et les slugs retirés dans legacySceneRedirects.
 */

import { join } from "node:path";

import { slugify } from "@/lib/utils/slugify";
import { createAdminClient, loadEnvLocal } from "./env";

const ROOT = join(import.meta.dirname, "../..");
loadEnvLocal(ROOT);

const APPLY = process.argv.includes("--apply");
const db = createAdminClient();

type Target = {
  /** UUID de la scène à retirer. */
  id: string;
  /** Pour les logs : d'où elle vient. */
  label: string;
  /** UUID de la scène conservée, qui porte le même texte. null = pas de remplaçante. */
  keepId: string | null;
  /** Chemin de l'URL retirée, à rediriger en 308. null si l'URL était un UUID (→ 410). */
  removedPath: string | null;
};

/**
 * Établi à partir des mesures de l'audit (section G du rapport). Les UUID sont figés
 * volontairement : un script qui redétecterait les doublons tout seul risquerait de
 * supprimer une scène légitime au prochain lot de seed.
 */
const TARGETS: Target[] = [
  {
    id: "160f68d5-2560-4549-8627-172caf172bcc",
    label: "Phèdre — « Acte I, scène 3 » (slug acte-i-scene-3, 63 répl.)",
    keepId: "0744a271-1bb2-45ef-9712-ad0b66987e1e",
    removedPath: "/scenes/jean-racine/phedre/acte-i-scene-3",
  },
  {
    id: "93441a8d-ce64-40f1-9f16-3690f0e4fd30",
    label: "Le Médecin malgré lui — « Acte I, scène 1 » (slug acte-i-scene-1, 12 répl., extrait)",
    keepId: "84dc34fa-e010-49c1-b0a6-4b13e7a7c5c5",
    removedPath: "/scenes/moliere/le-medecin-malgre-lui/acte-i-scene-1",
  },
  {
    id: "db9f670e-59b7-4895-b20e-0906ea648a6c",
    label: "Orpheline work_id nul — « Acte I, scène 1 » (créée 2026-06-25)",
    keepId: "84dc34fa-e010-49c1-b0a6-4b13e7a7c5c5",
    removedPath: null,
  },
  {
    id: "964f24d6-03d7-46ba-94ee-8f40fa9fc63f",
    label: "Orpheline work_id nul — « Acte I, scène 1 » (créée 2026-07-03 13:29)",
    keepId: "84dc34fa-e010-49c1-b0a6-4b13e7a7c5c5",
    removedPath: null,
  },
  {
    id: "b9d01f8e-6999-4e9a-b3d4-3e4b31f48e3e",
    label: "Orpheline work_id nul — « Acte I, scène 1 » (créée 2026-07-03 16:45)",
    keepId: "84dc34fa-e010-49c1-b0a6-4b13e7a7c5c5",
    removedPath: null,
  },
];

type SceneUsage = {
  id: string;
  title: string;
  slug: string | null;
  workTitle: string | null;
  /** Chemin canonique de la page scène, si elle en a un. */
  canonicalPath: string | null;
  isPrivate: boolean;
  linesCount: number;
  charactersCount: number;
  sessionsCount: number;
  feedbackCount: number;
  personalCopiesCount: number;
};

async function loadUsage(sceneId: string): Promise<SceneUsage | null> {
  const { data: scene, error } = await db
    .from("scenes")
    .select("id, title, slug, author, is_private, works(title, slug, author, is_public_domain)")
    .eq("id", sceneId)
    .maybeSingle<{
      id: string;
      title: string;
      slug: string | null;
      author: string | null;
      is_private: boolean;
      works: { title: string; slug: string | null; author: string | null; is_public_domain: boolean } | null;
    }>();
  if (error) throw new Error(`Lecture scène ${sceneId} : ${error.message}`);
  if (!scene) return null;

  const countOf = async (table: string, column: string, value: string) => {
    const { count, error: err } = await db
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq(column, value);
    if (err) throw new Error(`Comptage ${table}.${column} pour ${value} : ${err.message}`);
    return count ?? 0;
  };

  // user_line_feedback pointe des lines, pas des scenes : on passe par les ids de lignes.
  const { data: lines, error: linesError } = await db.from("lines").select("id").eq("scene_id", sceneId);
  if (linesError) throw new Error(`Lecture lignes de ${sceneId} : ${linesError.message}`);
  const lineIds = (lines ?? []).map((l) => l.id as string);

  let feedbackCount = 0;
  if (lineIds.length > 0) {
    const { count, error: fbError } = await db
      .from("user_line_feedback")
      .select("id", { count: "exact", head: true })
      .in("line_id", lineIds);
    if (fbError) throw new Error(`Comptage feedbacks de ${sceneId} : ${fbError.message}`);
    feedbackCount = count ?? 0;
  }

  return {
    id: scene.id,
    title: scene.title,
    slug: scene.slug,
    workTitle: scene.works?.title ?? null,
    // Même règle que @/lib/seo/urls : slug de scène ET d'œuvre requis, œuvre du
    // domaine public, scène publique.
    canonicalPath:
      !scene.is_private && scene.works?.is_public_domain && scene.slug && scene.works.slug
        ? `/scenes/${slugify(scene.author ?? scene.works.author ?? "")}/${scene.works.slug}/${scene.slug}`
        : null,
    isPrivate: scene.is_private,
    linesCount: lineIds.length,
    charactersCount: await countOf("characters", "scene_id", sceneId),
    sessionsCount: await countOf("user_learning_sessions", "scene_id", sceneId),
    feedbackCount,
    // Une copie perso pointe la scène source : la supprimer orphelinerait la copie.
    personalCopiesCount: await countOf("scenes", "source_scene_id", sceneId),
  };
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

async function textOf(sceneId: string): Promise<string[]> {
  const { data, error } = await db
    .from("lines")
    .select("order, text")
    .eq("scene_id", sceneId)
    .order("order");
  if (error) throw new Error(`Lecture texte de ${sceneId} : ${error.message}`);
  return (data ?? []).map((l) => normalize(l.text as string));
}

function describe(u: SceneUsage): string {
  return (
    `${u.workTitle ?? "(œuvre inconnue)"} — « ${u.title} » slug=${u.slug ?? "null"}\n` +
    `        ${u.linesCount} réplique(s), ${u.charactersCount} personnage(s)\n` +
    `        sessions d'apprentissage : ${u.sessionsCount} | feedbacks de ligne : ${u.feedbackCount} | copies perso : ${u.personalCopiesCount}`
  );
}

async function main() {
  console.log(APPLY ? "Mode APPLICATION (écriture en base)\n" : "Mode DRY-RUN (aucune écriture)\n");

  const unresolved = TARGETS.filter((t) => t.id.startsWith("__") || t.keepId?.startsWith("__"));
  if (unresolved.length > 0) {
    console.log("⚠️  UUID à renseigner avant utilisation :\n");
    for (const t of unresolved) {
      console.log(`   ${t.label}`);
      if (t.id.startsWith("__")) console.log(`      id à retirer  : ${t.id}`);
      if (t.keepId?.startsWith("__")) console.log(`      id à conserver: ${t.keepId}`);
    }
    console.log(
      "\nLes récupérer avec :\n" +
        "   select s.id, w.slug as oeuvre, s.slug, s.title\n" +
        "   from scenes s left join works w on w.id = s.work_id\n" +
        "   where s.slug in ('acte-i-scene-3','acte-i-scene-iii','acte-i-scene-1','acte-i-scene-i');\n"
    );
    console.log("Arrêt : rien n'a été lu ni écrit.");
    process.exitCode = 1;
    return;
  }

  const removable: Target[] = [];
  const blocked: { target: Target; reason: string }[] = [];
  /** keepId -> chemin canonique de la scène conservée, pour émettre les 308. */
  const keepPathById = new Map<string, string | null>();

  for (const target of TARGETS) {
    console.log("─".repeat(78));
    console.log(`À RETIRER : ${target.label}`);

    const usage = await loadUsage(target.id);
    if (!usage) {
      console.log("   ⓘ introuvable en base — déjà supprimée, rien à faire.");
      continue;
    }
    console.log(`   ${describe(usage)}`);

    if (usage.isPrivate) {
      blocked.push({ target, reason: "la scène est privée (copie utilisateur)" });
      console.log("   ✗ IGNORÉE : scène privée, ce script ne touche que le catalogue public.");
      continue;
    }

    if (target.keepId) {
      const keep = await loadUsage(target.keepId);
      if (!keep) {
        blocked.push({ target, reason: `la scène conservée ${target.keepId} est introuvable` });
        console.log(`   ✗ IGNORÉE : remplaçante ${target.keepId} introuvable.`);
        continue;
      }
      console.log(`   À CONSERVER : ${describe(keep)}`);
      keepPathById.set(target.keepId, keep.canonicalPath);

      const [removedText, keptText] = await Promise.all([textOf(target.id), textOf(target.keepId)]);
      const kept = new Set(keptText);
      const missing = removedText.filter((line) => !kept.has(line));
      console.log(
        `   Recouvrement de texte : ${removedText.length - missing.length}/${removedText.length} ` +
          `réplique(s) de la scène retirée présentes à l'identique dans la conservée.`
      );
      if (missing.length > 0) {
        console.log(`   ⚠ ${missing.length} réplique(s) ne se retrouvent pas telles quelles :`);
        for (const line of missing.slice(0, 3)) console.log(`       « ${line.slice(0, 110)}… »`);
        console.log(
          "     (causes possibles : apostrophe droite vs typographique, ou découpage des\n" +
            "      répliques différent entre les deux éditions. À vérifier à l'œil AVANT --apply :\n" +
            "      un écart élevé peut aussi signifier que ce n'est pas la même scène.)"
        );
      }
    }

    const historyBlockers: string[] = [];
    if (usage.sessionsCount > 0) historyBlockers.push(`${usage.sessionsCount} session(s)`);
    if (usage.feedbackCount > 0) historyBlockers.push(`${usage.feedbackCount} feedback(s)`);
    if (usage.personalCopiesCount > 0) historyBlockers.push(`${usage.personalCopiesCount} copie(s) perso`);
    if (historyBlockers.length > 0) {
      blocked.push({ target, reason: `historique utilisateur rattaché : ${historyBlockers.join(", ")}` });
      console.log(
        `   ✗ IGNORÉE : ${historyBlockers.join(", ")} rattaché(s). Supprimer la scène détruirait ` +
          "de l'historique utilisateur — décision à prendre à la main."
      );
      continue;
    }

    removable.push(target);
    console.log("   ✓ supprimable (aucun historique utilisateur rattaché)");
  }

  console.log("─".repeat(78));
  console.log(`\nSupprimables : ${removable.length} / ${TARGETS.length}`);
  console.log(`Ignorées     : ${blocked.length}`);
  for (const b of blocked) console.log(`   • ${b.target.label}\n     → ${b.reason}`);

  if (removable.length > 0) {
    console.log("\nÀ reporter dans le code après application :");
    console.log("\n  // src/lib/seo/gone-scenes.ts — 410 sur l'URL UUID");
    for (const t of removable) console.log(`  "${t.id}", // ${t.label}`);
    const withPath = removable.filter((t) => t.removedPath && t.keepId);
    if (withPath.length > 0) {
      console.log(
        "\n  // src/lib/seo/legacy-scene-redirects.ts — 308 de l'URL slug retirée vers la conservée"
      );
      for (const t of withPath) {
        const to = keepPathById.get(t.keepId!) ?? "<la scène conservée n'a pas d'URL slug>";
        console.log(`  { from: "${t.removedPath}", to: "${to}" },`);
      }
    }
  }

  if (!APPLY) {
    console.log("\nDry-run terminé, rien n'a été écrit. Relancer avec --apply pour supprimer.");
    return;
  }

  for (const target of removable) {
    // characters et lines ont un ON DELETE CASCADE sur scene_id : supprimer la scène
    // suffit. On supprime explicitement dans l'ordre inverse si ce n'est pas le cas.
    const { error: linesErr } = await db.from("lines").delete().eq("scene_id", target.id);
    if (linesErr) throw new Error(`Suppression lignes de ${target.id} : ${linesErr.message}`);
    const { error: charsErr } = await db.from("characters").delete().eq("scene_id", target.id);
    if (charsErr) throw new Error(`Suppression personnages de ${target.id} : ${charsErr.message}`);
    const { error: sceneErr } = await db.from("scenes").delete().eq("id", target.id);
    if (sceneErr) throw new Error(`Suppression scène ${target.id} : ${sceneErr.message}`);
    console.log(`   supprimée : ${target.id} (${target.label})`);
  }

  console.log(`\nAppliqué : ${removable.length} scène(s) supprimée(s).`);
  console.log(
    "Étapes restantes, à la main : reporter les UUID dans goneSceneIds, ajouter les 308 " +
      "dans legacySceneRedirects, écrire la migration de traçabilité, rebuild + vérifier le sitemap."
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
