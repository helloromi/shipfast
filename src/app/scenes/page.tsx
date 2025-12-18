import Link from "next/link";
import { fetchScenes, fetchUserSceneAverages, getSupabaseSessionUser } from "@/lib/queries/scenes";

export default async function ScenesPage() {

  const user = await getSupabaseSessionUser();
  const [scenes, averages] = await Promise.all([
    fetchScenes(),
    user ? fetchUserSceneAverages(user.id) : Promise.resolve([]),
  ]);

  const averageByScene = new Map(averages.map((item) => [item.sceneId, item.average]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">Bibliothèque</p>
        <h1 className="font-display text-3xl font-semibold text-[#1c1b1f]">
          Scènes disponibles
        </h1>
        <p className="text-sm text-[#524b5a] leading-relaxed">
          Choisis une scène, sélectionne ton personnage, puis lance le mode apprentissage.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {scenes.map((scene) => {
          const average = averageByScene.get(scene.id);
          return (
            <Link
              key={scene.id}
              href={`/scenes/${scene.id}`}
              className="group flex h-full flex-col gap-3 rounded-2xl border border-[#e7e1d9] bg-white/92 p-5 shadow-sm shadow-[#3b1f4a14] transition hover:-translate-y-[1px] hover:border-[#3b1f4a33] hover:shadow-lg"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-xl font-semibold text-[#3b1f4a]">
                  {scene.title}
                </h2>
                {average !== undefined && (
                  <span className="rounded-full bg-[#d9f2e4] px-3 py-1 text-xs font-semibold text-[#1c6b4f]">
                    Maîtrise: {average.toFixed(2)} / 3
                  </span>
                )}
              </div>
              <p className="text-sm text-[#524b5a] leading-relaxed">
                {scene.author ? `Par ${scene.author}` : "Auteur inconnu"}
              </p>
              {scene.summary && (
                <p className="text-sm text-[#1c1b1f] leading-relaxed">{scene.summary}</p>
              )}
              {scene.chapter && (
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7a7184]">
                  Chapitre : {scene.chapter}
                </p>
              )}
            </Link>
          );
        })}
      </div>

      {!scenes.length && (
        <div className="rounded-2xl border border-dashed border-[#e7e1d9] bg-white/85 p-4 text-sm text-[#524b5a]">
          Aucune scène pour le moment. Ajoute des scènes via Supabase (seed) puis rafraîchis.
        </div>
      )}
    </div>
  );
}
