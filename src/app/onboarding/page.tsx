import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getSupabaseSessionUser } from "@/lib/queries/scenes";
import { hasActiveSubscription } from "@/lib/queries/access";
import { isAdmin } from "@/lib/utils/admin";

export default async function OnboardingPage() {
  const user = await getSupabaseSessionUser();
  if (!user) {
    redirect("/login");
  }

  const [admin, subscribed] = await Promise.all([
    isAdmin(user.id),
    hasActiveSubscription(user.id),
  ]);

  if (admin || subscribed) {
    redirect("/home");
  }

  const cards = [
    {
      title: "Apprentissage guidé",
      desc: "Révèle tes répliques au bon rythme, garde le contexte, et progresse avec un feedback clair.",
      img: "/window.svg",
      alt: "Aperçu apprentissage",
    },
    {
      title: "Import en 2 minutes",
      desc: "Importe ta scène automatiquement, modifie là à ta guise, puis choisis les répliques à travailler.",
      img: "/file.svg",
      alt: "Aperçu import",
    },
    {
      title: "Bibliothèque + suivi",
      desc: "Retrouve tes scènes, tes statistiques, et ton historique — tout au même endroit.",
      img: "/globe.svg",
      alt: "Aperçu bibliothèque",
    },
  ] as const;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">
          Bienvenue
        </p>
        <h1 className="font-display text-3xl font-semibold text-[#1c1b1f]">
          Tout débloquer en 1 abonnement
        </h1>
        <p className="text-sm text-[#524b5a] leading-relaxed">
          En 5€/mois, tu débloques l’apprentissage, l’import, la bibliothèque et le suivi.
        </p>
      </div>

      <div className="grid gap-4">
        {cards.map((c) => (
          <div
            key={c.title}
            className="flex flex-col gap-4 rounded-3xl border border-[#e7e1d9] bg-white/90 p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <h2 className="font-display text-xl font-semibold text-[#3b1f4a]">
                  {c.title}
                </h2>
                <p className="text-sm text-[#524b5a]">{c.desc}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#e7e1d9] bg-[#f9f7f3]">
                <Image src={c.img} alt={c.alt} width={28} height={28} />
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-[#e7e1d9] bg-[linear-gradient(120deg,#f4c95d22,#ff6b6b12,#3b1f4a10)]">
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                  Screenshot
                </p>
                <p className="mt-1 text-sm text-[#3b1f4a]">
                  (à remplacer par une capture réelle)
                </p>
              </div>
              <div className="h-28" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-[#e7e1d9] bg-white/90 p-6 shadow-sm">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-[#524b5a]">
            Prêt ? Il ne reste qu’une étape.
          </p>
          <Link
            href="/subscribe"
            className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-[1px]"
          >
            Continuer vers le paiement
          </Link>
          <p className="text-xs text-[#7a7184]">
            Tu pourras annuler à tout moment depuis “Mon compte”.
          </p>
        </div>
      </div>
    </div>
  );
}

