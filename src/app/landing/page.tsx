import Link from "next/link";
import { redirect } from "next/navigation";

import { getSupabaseSessionUser } from "@/lib/queries/scenes";

export default async function LandingPage() {
  const user = await getSupabaseSessionUser();
  if (user) {
    redirect("/home");
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 py-12">
      <section className="relative overflow-hidden rounded-3xl border border-[#e7e1d9] bg-white/80 px-8 py-10 shadow-xl">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[#f4c95d33] blur-3xl" />
          <div className="absolute -right-10 top-10 h-52 w-52 rounded-full bg-[#ff6b6b22] blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
          <div className="flex-1 space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f4c95d33] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">
              Casting-ready
            </span>
            <h1 className="font-display text-4xl font-semibold leading-tight text-[#1c1b1f] sm:text-5xl">
              Entraîne tes répliques comme un·e pro, sans perdre le flow.
            </h1>
            <p className="max-w-2xl text-lg text-[#524b5a]">
              Import de scènes, masquage intelligent, mode flashcard et feedback immédiat (0–3). Suis ta maîtrise et reprends là où tu t’es arrêté avant l’audition.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-[#ff6b6b] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#ff6b6b33] hover:-translate-y-[1px] hover:bg-[#e75a5a]"
              >
                Commencer maintenant
              </Link>
              <Link
                href="/scenes"
                className="inline-flex items-center justify-center rounded-full border border-[#e7e1d9] bg-white px-5 py-3 text-sm font-semibold text-[#3b1f4a] shadow-sm hover:border-[#3b1f4a33] hover:text-[#3b1f4a]"
              >
                Voir la bibliothèque
              </Link>
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-semibold text-[#524b5a]">
              <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">Flashcards scène</span>
              <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">Rappels auditions</span>
              <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">Feedback rapide</span>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-3 rounded-2xl border border-[#e7e1d9] bg-white/90 p-4 shadow-lg lg:max-w-md">
            {[
              { title: "Casting en cours", meta: "2 rôles ouverts", badge: "Deadline 24h" },
              { title: "Self-tape à envoyer", meta: "Studio / intérieur", badge: "Rappel 18:00" },
              { title: "Réplique à maîtriser", meta: "Acte II, scène 3", badge: "Score 1.7 / 3" },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start justify-between gap-3 rounded-xl border border-[#e7e1d9] bg-white/90 px-3 py-3 shadow-sm"
              >
                <div>
                  <div className="text-sm font-semibold text-[#3b1f4a]">{item.title}</div>
                  <div className="text-xs text-[#524b5a]">{item.meta}</div>
                </div>
                <span className="rounded-full bg-[#f4c95d33] px-3 py-1 text-[11px] font-semibold text-[#3b1f4a]">
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Masquage intelligent",
            desc: "Tes répliques floutées, un tap pour révéler, un score rapide.",
          },
          {
            title: "Progression claire",
            desc: "Maîtrise moyenne par scène, reprise automatique du personnage.",
          },
          {
            title: "Pensé mobile",
            desc: "Mode flashcard séquentiel pour éviter de scroller en répétant.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-[#e7e1d9] bg-white/85 p-5 shadow-sm shadow-[#3b1f4a0d] transition hover:-translate-y-[1px] hover:shadow-lg"
          >
            <h3 className="font-display text-xl font-semibold text-[#3b1f4a]">{item.title}</h3>
            <p className="mt-2 text-sm text-[#524b5a]">{item.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
