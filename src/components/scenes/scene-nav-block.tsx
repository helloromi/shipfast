import Link from "next/link";

import { fetchWorkScenesForNav } from "@/lib/queries/scenes";
import { sortScenesDramaturgical } from "@/lib/utils/scene-order";
import { slugify } from "@/lib/utils/slugify";
import { SceneWithRelations } from "@/types/scenes";

// Au-delà de ce seuil, une liste plate deviendrait un mur de texte sur mobile :
// on replie chaque acte dans un <details> natif (ouvert sur l'acte courant).
const FOLD_THRESHOLD = 12;

type Props = { scene: SceneWithRelations };

/**
 * Maillage interne, rendu entièrement côté serveur (les href sont dans le HTML
 * servi, pas injectés après hydratation). Réservé aux scènes publiques du
 * domaine public à URL slug : c'est le seul cas où les liens voisins répondent
 * 200. Sur la route UUID partagée (copies privées, catalogue payant) le bloc ne
 * rend rien. Une seule requête Supabase supplémentaire (fetchWorkScenesForNav).
 */
export async function SceneNavBlock({ scene }: Props) {
  const work = scene.work;
  if (scene.is_private || !scene.work_id || !work?.slug || !work.is_public_domain) {
    return null;
  }

  const siblings = await fetchWorkScenesForNav(scene.work_id);
  if (siblings.length <= 1) return null;

  const ordered = sortScenesDramaturgical(siblings);

  // Tous les frères partagent l'œuvre courante (déjà domaine public), et aucune
  // scène éligible n'a d'auteur distinct de celui de l'œuvre : construire le
  // segment auteur depuis l'œuvre donne exactement l'URL canonique (200, pas 308).
  const authorSlug = slugify(scene.author ?? work.author ?? "");
  const hrefFor = (s: { slug: string }) => `/scenes/${authorSlug}/${work.slug}/${s.slug}`;

  const currentIndex = ordered.findIndex((s) => s.id === scene.id);
  const prev = currentIndex > 0 ? ordered[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < ordered.length - 1 ? ordered[currentIndex + 1] : null;

  // Regroupement par acte. sortScenesDramaturgical trie d'abord par acte, donc
  // les scènes d'un même acte sont déjà contiguës.
  const groups: { chapter: string; scenes: typeof ordered }[] = [];
  for (const s of ordered) {
    const chapter = s.chapter ?? "Autres scènes";
    const last = groups[groups.length - 1];
    if (last && last.chapter === chapter) last.scenes.push(s);
    else groups.push({ chapter, scenes: [s] });
  }

  const fold = ordered.length > FOLD_THRESHOLD;
  const currentChapter = scene.chapter ?? "Autres scènes";

  return (
    <nav
      aria-label={`Autres scènes de ${work.title}`}
      className="flex flex-col gap-5 border-t border-[#e7e1d9] pt-6"
    >
      {(prev || next) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {prev ? (
            <Link
              href={hrefFor(prev)}
              className="flex flex-col gap-1 rounded-2xl border border-[#e7e1d9] bg-white px-4 py-3 transition hover:border-[#3b1f4a66]"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#7a7184]">
                ← Scène précédente
              </span>
              <span className="text-sm font-semibold text-[#3b1f4a]">{prev.title}</span>
            </Link>
          ) : (
            <span aria-hidden className="hidden sm:block" />
          )}
          {next && (
            <Link
              href={hrefFor(next)}
              className="flex flex-col gap-1 rounded-2xl border border-[#e7e1d9] bg-white px-4 py-3 transition hover:border-[#3b1f4a66] sm:items-end sm:text-right"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#7a7184]">
                Scène suivante →
              </span>
              <span className="text-sm font-semibold text-[#3b1f4a]">{next.title}</span>
            </Link>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">
          Toutes les scènes de {work.title}
        </p>
        <div className="flex flex-col gap-2">
          {groups.map((group) => {
            const items = (
              <ol className="flex flex-col gap-1 py-1">
                {group.scenes.map((s) => (
                  <li key={s.id}>
                    {s.id === scene.id ? (
                      <span
                        aria-current="page"
                        className="block rounded-lg bg-[#f4c95d33] px-3 py-1.5 text-sm font-semibold text-[#3b1f4a]"
                      >
                        {s.title}
                      </span>
                    ) : (
                      <Link
                        href={hrefFor(s)}
                        className="block rounded-lg px-3 py-1.5 text-sm text-[#524b5a] underline underline-offset-4 transition hover:bg-white hover:text-[#3b1f4a]"
                      >
                        {s.title}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            );

            if (fold) {
              return (
                <details
                  key={group.chapter}
                  open={group.chapter === currentChapter}
                  className="rounded-2xl border border-[#e7e1d9] bg-white/60 px-3 py-2"
                >
                  <summary className="cursor-pointer text-sm font-semibold text-[#3b1f4a]">
                    {group.chapter}
                  </summary>
                  {items}
                </details>
              );
            }

            return (
              <div key={group.chapter} className="flex flex-col gap-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7a7184]">
                  {group.chapter}
                </p>
                {items}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
