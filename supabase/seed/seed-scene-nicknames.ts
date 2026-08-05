/**
 * Côté-Cour — pose le nom d'usage (`scenes.nickname`) sur les scènes célèbres.
 *
 * Pourquoi. Cf. l'en-tête de la migration 20260805120000_add_scenes_nickname.sql : les
 * titres du catalogue sont des coordonnées (« Acte IV, Scène III »), personne ne les
 * tape, et les pages scènes font 0,8 % de CTR à la position 10.
 *
 * Ce que ce script a de particulier : il VÉRIFIE avant d'écrire.
 *
 * Chaque entrée porte un `verifiedBy`, un fragment du texte réel de la scène. Le script
 * refuse de poser un nickname si le fragment n'apparaît dans aucune réplique de la scène
 * visée. C'est le garde-fou qui manquait aux lots précédents : le repo a déjà connu des
 * scènes mal étiquetées (migration 20260731120000) et deux générations de numérotation
 * qui se chevauchent (arabe vs romain, migration 20260730120000). Se fier au numéro
 * d'acte de mémoire, c'est exactement comme ça qu'on se trompe — d'autant que la
 * numérotation varie d'une édition à l'autre. Exemple réel rencontré en préparant ce
 * lot : « Que diable allait-il faire dans cette galère ? » n'est PAS dans la scène que
 * les éditions modernes numérotent II,7, mais dans acte-ii-scene-xi de notre édition.
 *
 * La comparaison normalise les apostrophes (’ vs ') et la casse : le catalogue est en
 * typographie française, un fragment saisi au clavier ne l'est pas forcément.
 *
 * Usage (depuis la racine du repo) :
 *   npx tsx supabase/seed/seed-scene-nicknames.ts             # dry-run : n'écrit rien
 *   npx tsx supabase/seed/seed-scene-nicknames.ts --apply     # écrit en base
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { createAdminClient, loadEnvLocal } from "./env";

const ROOT = join(import.meta.dirname, "../..");
loadEnvLocal(ROOT);

const APPLY = process.argv.includes("--apply");
const db = createAdminClient();

type Entree = {
  /** Slug de l'œuvre (works.slug). */
  workSlug: string;
  /** Slug de la scène (scenes.slug), unique dans son œuvre. */
  slug: string;
  /** Nom d'usage, en typographie française. */
  nickname: string;
  /**
   * Fragment du texte de la scène qui prouve qu'on vise la bonne. `null` seulement
   * quand le slug lui-même porte déjà le nom (cas hérité d'un seed antérieur) : le
   * script le signale alors explicitement au lieu de le laisser passer en silence.
   */
  verifiedBy: string | null;
};

const ENTREES: Entree[] = JSON.parse(
  readFileSync(join(import.meta.dirname, "scene-nicknames.json"), "utf8")
) as Entree[];

type SceneRow = {
  id: string;
  title: string;
  slug: string;
  nickname: string | null;
  lines: { text: string | null }[];
};

/** Apostrophes et casse unifiées : le catalogue est en ’ , les fragments souvent en '. */
const normalize = (text: string) =>
  text
    .replace(/[’‘‛]/g, "'")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();

async function main(): Promise<void> {
  console.log(
    `${APPLY ? "✍️  ÉCRITURE" : "🔍 DRY-RUN"} — ${ENTREES.length} nom(s) d'usage à poser.\n`
  );

  let toWrite = 0;
  let unchanged = 0;
  let overwritten = 0;
  let unverified = 0;
  const rejected: string[] = [];
  const missing: string[] = [];
  const updates: { id: string; nickname: string }[] = [];

  for (const entree of ENTREES) {
    const ref = `${entree.workSlug}/${entree.slug}`;

    const { data, error } = await db
      .from("scenes")
      .select("id, title, slug, nickname, works!inner(slug), lines(text)")
      .eq("slug", entree.slug)
      .eq("works.slug", entree.workSlug)
      .eq("is_private", false)
      .returns<SceneRow[]>();

    if (error) {
      console.error(`❌ ${ref} — erreur Supabase : ${error.message}`);
      process.exitCode = 1;
      continue;
    }
    if (!data || data.length === 0) {
      console.log(`⚠️  ${ref} — scène introuvable, ignorée.`);
      missing.push(ref);
      continue;
    }
    if (data.length > 1) {
      console.log(`⚠️  ${ref} — ${data.length} scènes portent ce couple (slug, œuvre), ignorée.`);
      missing.push(ref);
      continue;
    }

    const scene = data[0]!;

    // Vérification : le fragment doit exister dans le texte de CETTE scène.
    if (entree.verifiedBy) {
      const needle = normalize(entree.verifiedBy);
      const found = (scene.lines ?? []).some((line) =>
        line.text ? normalize(line.text).includes(needle) : false
      );
      if (!found) {
        console.error(
          `❌ ${ref} — « ${entree.verifiedBy} » ABSENT du texte de « ${scene.title} ». ` +
            `Nickname REFUSÉ : la scène visée est probablement la mauvaise.`
        );
        rejected.push(ref);
        process.exitCode = 1;
        continue;
      }
    } else {
      console.log(`⚠️  ${ref} — aucun verifiedBy, posé sur la foi du slug seul.`);
      unverified++;
    }

    if (scene.nickname === entree.nickname) {
      console.log(`＝ ${ref} — déjà à jour.`);
      unchanged++;
      continue;
    }

    console.log(`→ ${ref} — « ${scene.title} » → « ${entree.nickname} »`);
    if (scene.nickname) {
      console.log(`  ⚠️  ÉCRASE le nom actuel : « ${scene.nickname} »`);
      overwritten++;
    }
    updates.push({ id: scene.id, nickname: entree.nickname });
    toWrite++;
  }

  console.log(
    `\nRésumé : ${toWrite} à écrire (dont ${overwritten} écrasement(s)), ${unchanged} inchangé(s), ` +
      `${rejected.length} refusé(s), ${missing.length} introuvable(s), ${unverified} non vérifié(s).`
  );
  if (rejected.length > 0) console.log(`Refusés : ${rejected.join(", ")}`);
  if (missing.length > 0) console.log(`Introuvables : ${missing.join(", ")}`);

  if (!APPLY) {
    console.log("\nDry-run : rien n'a été écrit. Relance avec --apply pour appliquer.");
    return;
  }

  if (rejected.length > 0) {
    console.error("\n⛔ Des entrées ont été refusées : rien n'est écrit tant qu'elles ne sont pas corrigées.");
    return;
  }

  for (const update of updates) {
    const { error } = await db
      .from("scenes")
      .update({ nickname: update.nickname })
      .eq("id", update.id);
    if (error) {
      console.error(`❌ écriture ${update.id} : ${error.message}`);
      process.exitCode = 1;
    }
  }
  console.log(`\n✅ ${updates.length} nom(s) d'usage écrit(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
