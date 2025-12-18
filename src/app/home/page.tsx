import Link from "next/link";
import { redirect } from "next/navigation";

import { fetchUserProgressScenes, getSupabaseSessionUser } from "@/lib/queries/scenes";

export default async function HomePage() {
  const user = await getSupabaseSessionUser();
  if (!user) {
    redirect("/login");
  }

  const progresses = await fetchUserProgressScenes(user.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">Accueil</p>
        <h1 className="font-display text-3xl font-semibold text-[#1c1b1f]">
          Tes scènes en cours
        </h1>
        <p className="text-sm text-[#524b5a] leading-relaxed">
          Retrouve rapidement les scènes sur lesquelles tu as déjà noté des répliques.
        </p>
      </div>

      {progresses.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#e7e1d9] bg-white/85 p-4 text-sm text-[#524b5a]">
          Aucune scène en cours. Va dans la <Link href="/scenes" className="font-semibold text-[#3b1f4a] underline underline-offset-4">bibliothèque</Link> pour démarrer.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {progresses.map((item) => (
          <div
            key={item.sceneId}
            className="flex h-full flex-col gap-3 rounded-2xl border border-[#e7e1d9] bg-white/92 p-5 shadow-md shadow-[#3b1f4a14]"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-xl font-semibold text-[#3b1f4a]">
                {item.title}
              </h2>
              <span className="rounded-full bg-[#d9f2e4] px-3 py-1 text-xs font-semibold text-[#1c6b4f]">
                Maîtrise: {item.average.toFixed(2)} / 3
              </span>
            </div>
            <p className="text-sm text-[#524b5a]">
              {item.author ? `Par ${item.author}` : "Auteur inconnu"}
            </p>
            {item.summary && (
              <p className="text-sm text-[#1c1b1f] leading-relaxed line-clamp-3">
                {item.summary}
              </p>
            )}
            <div className="flex items-center justify-between gap-2 text-sm text-[#524b5a]">
              <span>Personnage : {item.lastCharacterName ?? "—"}</span>
              {item.chapter && <span className="text-[11px] font-semibold uppercase tracking-wide text-[#7a7184]">Chapitre : {item.chapter}</span>}
            </div>
            <div className="mt-2 flex gap-2">
              <Link
                href={
                  item.lastCharacterId
                    ? `/learn/${item.sceneId}?character=${item.lastCharacterId}`
                    : `/scenes/${item.sceneId}`
                }
                className="inline-flex flex-1 items-center justify-center rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-3 py-2 text-sm font-semibold text-white shadow-md shadow-[#ff6b6b33] hover:-translate-y-[1px]"
              >
                Continuer
              </Link>
              <Link
                href={`/scenes/${item.sceneId}`}
                className="inline-flex items-center justify-center rounded-full border border-[#e7e1d9] bg-white px-3 py-2 text-sm font-semibold text-[#3b1f4a] shadow-sm hover:border-[#3b1f4a66]"
              >
                Détails
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
