/**
 * Côté-Cour — chargement du contenu d'amorçage.
 *
 * Usage (depuis la racine du repo) :
 *   npm run seed:scenes
 *
 * Le script charge automatiquement .env.local (pas besoin de source).
 * Prérequis : NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 */

import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** Charge .env.local sans interpréter les virgules (ex. ADMIN_EMAILS). */
function loadEnvLocal(rootDir: string) {
  const envPath = join(rootDir, ".env.local");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

const ROOT = join(import.meta.dirname, "../..");
loadEnvLocal(ROOT);

// ─────────────────────────────────────────────────────────────
// CONFIG — À ADAPTER à ton schéma réel (cf. doc technique §14)
// ─────────────────────────────────────────────────────────────
const CONFIG = {
  tables: {
    works: "works",
    scenes: "scenes",
    characters: "characters",
    lines: "lines",
  },
  // Colonnes. Mets ici les noms réels si différents.
  cols: {
    work: { title: "title", author: "author", isPublic: "is_public_domain" },
    scene: {
      title: "title",
      workId: "work_id",
      author: "author",
      chapter: "chapter",
      isPrivate: "is_private",
      ownerUserId: "owner_user_id",
    },
    character: { name: "name", sceneId: "scene_id" },
    line: {
      sceneId: "scene_id",
      characterId: "character_id",
      order: "order", // attention : "order" est un mot réservé SQL, déjà géré par PostgREST
      text: "text",
    },
  },
  // Valeurs par défaut pour une œuvre/scène publique.
  defaults: {
    workIsPublic: true,
    sceneIsPrivate: false,
    sceneOwnerUserId: null as string | null,
  },
};

const SEED_FILE = join(import.meta.dirname, "cote-cour-seed.json");

// ─────────────────────────────────────────────────────────────

type SeedLine = { order: number; character: string; text: string };
type SeedScene = { title: string; characters: string[]; lines: SeedLine[] };
type SeedWork = {
  title: string;
  author: string;
  year?: number;
  reliability?: string;
  scenes: SeedScene[];
};

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  throw new Error("SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis dans l'environnement.");
}
const db = createClient(url, key, { auth: { persistSession: false } });

async function insertScene(work: SeedWork, workId: string, scene: SeedScene) {
  const C = CONFIG.cols;
  const T = CONFIG.tables;

  const { data: sceneRow, error: sceneErr } = await db
    .from(T.scenes)
    .insert({
      [C.scene.title]: scene.title,
      [C.scene.workId]: workId,
      [C.scene.author]: work.author,
      [C.scene.chapter]: scene.title.match(/^Acte [IVXLC]+/i)?.[0] ?? null,
      [C.scene.isPrivate]: CONFIG.defaults.sceneIsPrivate,
      [C.scene.ownerUserId]: CONFIG.defaults.sceneOwnerUserId,
    })
    .select("id")
    .single();
  if (sceneErr) throw new Error(`Scène "${scene.title}" : ${sceneErr.message}`);
  const sceneId = sceneRow.id;

  const charIdByName = new Map<string, string>();
  for (const name of scene.characters) {
    const { data: charRow, error: charErr } = await db
      .from(T.characters)
      .insert({ [C.character.name]: name, [C.character.sceneId]: sceneId })
      .select("id")
      .single();
    if (charErr) throw new Error(`Personnage "${name}" : ${charErr.message}`);
    charIdByName.set(name, charRow.id);
  }

  const lineRows = scene.lines.map((l) => {
    const characterId = charIdByName.get(l.character);
    if (!characterId) throw new Error(`Personnage inconnu "${l.character}" dans "${scene.title}"`);
    return {
      [C.line.sceneId]: sceneId,
      [C.line.characterId]: characterId,
      [C.line.order]: l.order,
      [C.line.text]: l.text,
    };
  });
  const { error: linesErr } = await db.from(T.lines).insert(lineRows);
  if (linesErr) throw new Error(`Répliques de "${scene.title}" : ${linesErr.message}`);

  console.log(`✓ ${work.title} — ${scene.title} (${scene.lines.length} répliques)`);
}

async function main() {
  const raw = JSON.parse(readFileSync(SEED_FILE, "utf8")) as { works: SeedWork[] };
  const C = CONFIG.cols;
  const T = CONFIG.tables;

  for (const work of raw.works) {
    const { data: existingRows, error: existingErr } = await db
      .from(T.works)
      .select("id")
      .eq(C.work.title, work.title)
      .eq(C.work.author, work.author)
      .order("id", { ascending: true })
      .limit(2);
    if (existingErr) throw new Error(`Œuvre "${work.title}" : ${existingErr.message}`);
    if ((existingRows?.length ?? 0) > 1) {
      console.warn(
        `⚠ doublons en base pour ${work.title} — ${work.author} ; utilisation de la plus ancienne (id ${existingRows![0].id})`,
      );
    }

    let workId = existingRows?.[0]?.id;
    if (workId) {
      console.log(`↷ œuvre existante : ${work.title} — ${work.author} (ajout des scènes manquantes)`);
    } else {
      const { data: workRow, error: workErr } = await db
        .from(T.works)
        .insert({
          [C.work.title]: work.title,
          [C.work.author]: work.author,
          [C.work.isPublic]: CONFIG.defaults.workIsPublic,
        })
        .select("id")
        .single();
      if (workErr) throw new Error(`Œuvre "${work.title}" : ${workErr.message}`);
      workId = workRow.id;
    }

    const { data: existingScenes, error: scenesErr } = await db
      .from(T.scenes)
      .select("title")
      .eq(C.scene.workId, workId);
    if (scenesErr) throw new Error(`Scènes de "${work.title}" : ${scenesErr.message}`);
    const existingTitles = new Set((existingScenes ?? []).map((s) => s.title));

    for (const scene of work.scenes) {
      if (existingTitles.has(scene.title)) {
        console.log(`↷ scène déjà présente, saut : ${work.title} — ${scene.title}`);
        continue;
      }
      await insertScene(work, workId, scene);
    }
  }

  console.log("\nTerminé.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
