import Link from "next/link";
import { redirect } from "next/navigation";

import { fetchUserProgressScenes, getSupabaseSessionUser } from "@/lib/queries/scenes";
import { fetchLineMastery, fetchSceneStats } from "@/lib/queries/stats";
import { fetchUserLineHighlights } from "@/lib/queries/notes";
import { fetchAnnotationsForScene } from "@/lib/queries/teacher";
import { SceneDetailTabs } from "@/components/scenes/scene-detail-tabs";
import { SceneNavBlock } from "@/components/scenes/scene-nav-block";
import { sceneDisplayName } from "@/lib/scenes/scene-display";
import { TeacherAnnotationsPanel } from "@/components/classes/teacher-annotations-panel";
import { t } from "@/locales/fr";
import { buildBreadcrumbJsonLd, buildSceneJsonLd } from "@/lib/seo/json-ld";
import { scenePathFor, workPathForScene } from "@/lib/seo/urls";
import { hasAccess } from "@/lib/queries/access";
import { ensurePersonalSceneForCurrentUser } from "@/lib/utils/personal-scene";
import { canAccessPrivateScene } from "@/lib/utils/entitlement";
import { SceneWithRelations } from "@/types/scenes";

type Props = {
  scene: SceneWithRelations;
};

/**
 * Corps de la page détail scène (auth, copie perso, stats, JSON-LD, JSX),
 * partagé par la route UUID (/scenes/[identifiant] — copies privées, imports, catalogue
 * payant) et la route slug (/scenes/[auteur]/[piece]/[scene] — scènes publiques
 * du domaine public). Comportement identique quelle que soit la route d'entrée.
 */
export async function SceneDetailView({ scene }: Props) {
  const id = scene.id;

  const user = await getSupabaseSessionUser();
  // Le paywall ne concerne que le contenu privé importé. Sur une scène du domaine
  // public, un utilisateur connecté a exactement le même accès qu'un visiteur
  // anonyme — jamais moins (règle produit n°1). On ne garde l'abonnement que si is_private.
  // Et sur une scène privée, le propriétaire est toujours chez lui : sans ça,
  // le texte de l'import offert était créé puis inaccessible.
  if (user && scene.is_private && !(await canAccessPrivateScene(user.id, scene))) {
    redirect("/subscribe");
  }

  // Si un user a accès à une scène publique, on travaille sur sa copie perso (éditable) + historique migré.
  if (user && !scene.is_private) {
    const access = await hasAccess(user.id, scene.work_id ?? undefined, scene.id);
    if (access) {
      const ensured = await ensurePersonalSceneForCurrentUser(scene.id);
      if (ensured.ok && ensured.personalSceneId !== scene.id) {
        redirect(`/scenes/${ensured.personalSceneId}`);
      }
    }
  }

  const [userProgress, sceneStats] = await Promise.all([
    user ? fetchUserProgressScenes(user.id).then((p) => p.find((p) => p.sceneId === id)) : Promise.resolve(null),
    user ? fetchSceneStats(user.id, id) : Promise.resolve(null),
  ]);

  const sortedLines = [...scene.lines].sort((a, b) => a.order - b.order);

  const lastCharacterId = userProgress?.lastCharacterId;
  const lastCharacterName = userProgress?.lastCharacterName;

  const continueLearnHref = (() => {
    if (!user) return null;
    if (!lastCharacterId) return null;
    const params = new URLSearchParams();
    params.set("character", lastCharacterId);
    if (lastCharacterName) params.set("characterName", lastCharacterName);
    return `/learn/${id}?${params.toString()}`;
  })();

  const [lineMastery, highlightsByLineId, teacherAnnotations] = await Promise.all([
    user && lastCharacterId ? fetchLineMastery(user.id, id, lastCharacterId) : Promise.resolve([]),
    user ? fetchUserLineHighlights(user.id, sortedLines.map((l) => l.id)) : Promise.resolve({}),
    user ? fetchAnnotationsForScene(id) : Promise.resolve([]),
  ]);

  // Chemins canoniques. Null pour une copie privée ou une scène non sluggée : dans ce
  // cas ni JSON-LD ni fil d'Ariane (l'URL servie n'est pas une URL canonique).
  const canonicalPath = scenePathFor(scene);
  const workPath = workPathForScene(scene);

  // Un seul calcul du nom affiché, partagé avec le <title> et le JSON-LD.
  const displayName = sceneDisplayName(scene);

  const jsonLd =
    scene.is_private || !canonicalPath
      ? null
      : buildSceneJsonLd({
          title: displayName.heading,
          alternateName: displayName.coordinate,
          canonicalPath,
          author: scene.author ?? scene.work?.author ?? null,
          summary: scene.summary,
          characters: scene.characters,
          work: scene.work?.title ? { title: scene.work.title, path: workPath } : null,
          datePublished: scene.created_at ?? null,
        });

  // Les fiches sont stockées en paragraphes séparés par une ligne vide.
  const summaryParagraphs = (scene.summary ?? "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const breadcrumb =
    canonicalPath && workPath && scene.work?.title
      ? [
          { name: "Scènes", path: "/scenes" },
          { name: scene.work.title, path: workPath },
          { name: displayName.heading, path: canonicalPath },
        ]
      : null;

  return (
    <div className="flex flex-col gap-6">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {breadcrumb && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumb)) }}
        />
      )}
      {user && (
        <div className="sticky top-0 z-30 -mx-4 border-b border-[#e7e1d9] bg-[rgba(249,247,243,0.92)] px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <Link
              href="/home"
              className="inline-flex items-center gap-2 rounded-full border border-[#e7e1d9] bg-white px-4 py-2 text-sm font-semibold text-[#3b1f4a] shadow-sm transition hover:border-[#3b1f4a66]"
            >
              ← {t.common.nav.accueil}
            </Link>

            {continueLearnHref ? (
              <Link
                href={continueLearnHref}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#ff6b6b33] transition hover:-translate-y-[1px]"
              >
                {t.common.buttons.continuer}
              </Link>
            ) : (
              <span className="text-sm font-semibold text-[#7a7184]">
                Choisis un personnage dans “Réglages” pour continuer.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Fil d'Ariane rendu côté serveur : c'était le seul lien manquant entre une page
          scène et la page de son œuvre. Absent pour les copies privées (pas d'URL
          canonique, et rien à relier dans le catalogue public). */}
      {breadcrumb && (
        <nav aria-label="Fil d'Ariane" className="text-sm text-[#7a7184]">
          <ol className="flex flex-wrap items-center gap-2">
            {breadcrumb.map((item, i) => {
              const isLast = i === breadcrumb.length - 1;
              return (
                <li key={item.path} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden>›</span>}
                  {isLast ? (
                    <span aria-current="page" className="font-semibold text-[#3b1f4a]">
                      {item.name}
                    </span>
                  ) : (
                    <Link
                      href={item.path}
                      className="underline underline-offset-4 hover:text-[#3b1f4a]"
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">{t.scenes.detail.sectionLabel}</p>
        <h1 className="font-display text-3xl font-semibold text-[#1c1b1f]">
          {displayName.heading}
        </h1>
        {/* La coordonnée n'apparaît que si le H1 porte un nom d'usage : sinon elle EST
            le H1. Elle reste visible parce qu'on la cherche aussi (« le cid acte 4 »). */}
        {displayName.coordinate && (
          <p className="text-sm font-medium text-[#7a7184]">{displayName.coordinate}</p>
        )}
        <p className="text-sm text-[#524b5a] leading-relaxed">
          {scene.author ? `${t.common.labels.par} ${scene.author}` : t.common.labels.auteurInconnu}
        </p>
        {/* La fiche éditoriale : le seul contenu de cette page qui n'existe pas déjà
            mot pour mot sur Wikisource. Rendue côté serveur, en paragraphes séparés
            par une ligne vide en base — un bloc de 150 mots dans un seul <p> serait
            illisible sur un écran de 375px. */}
        {summaryParagraphs.length > 0 && (
          <div className="mt-1 flex flex-col gap-3 border-l-2 border-[#e7e1d9] pl-4">
            {summaryParagraphs.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-relaxed text-[#1c1b1f]">
                {paragraph}
              </p>
            ))}
          </div>
        )}
        {scene.chapter && (
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7a7184]">
            {t.common.labels.chapitre} : {scene.chapter}
          </p>
        )}
        {lastCharacterId && (
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#f4c95d33] px-3 py-1 text-xs font-semibold text-[#3b1f4a]">
            {t.common.labels.personnageEnCours} : {lastCharacterName ?? "—"}
          </div>
        )}
      </div>

      <TeacherAnnotationsPanel
        annotations={teacherAnnotations}
        lines={sortedLines.map((line) => ({
          id: line.id,
          text: line.text,
          characterName: line.characters?.name ?? null,
        }))}
      />

      <SceneDetailTabs
        scene={scene}
        sceneId={id}
        user={user}
        sceneStats={sceneStats}
        lineMastery={lineMastery}
        lastCharacterId={lastCharacterId ?? null}
        lastCharacterName={lastCharacterName ?? null}
        sortedLines={sortedLines.map((line) => ({
          id: line.id,
          order: line.order,
          text: line.text,
          character_id: line.character_id,
          characters: line.characters,
        }))}
        highlightsByLineId={highlightsByLineId}
      />

      <div>
        <Link
          href="/scenes"
          className="text-sm font-semibold text-[#3b1f4a] underline underline-offset-4"
        >
          ← {t.scenes.bibliotheque.toutesLesScenes}
        </Link>
      </div>

      {/* Maillage interne SEO : préc/suiv + scènes de l'œuvre, rendu serveur.
          Ne rend rien pour les scènes privées/catalogue (garde interne). */}
      <SceneNavBlock scene={scene} />
    </div>
  );
}
