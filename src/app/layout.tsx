import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, Karla } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Suspense } from "react";

import { Header } from "@/components/header";
import { JsonLdSoftwareApplication } from "@/components/seo/json-ld-software-application";
import { SupabaseProvider } from "@/components/supabase-provider";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseSessionUser } from "@/lib/queries/scenes";
import "./globals.css";

const karla = Karla({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-display",
  weight: "variable",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://cote-cour.studio"),
  title: "Apprendre son texte de théâtre – Mémorisation répliques | Côté-Cour",
  description:
    "Application pour comédiens : apprends ton texte de théâtre et mémorise tes répliques 3x plus vite. Importe ta scène, révèle tes répliques, reçois un feedback instantané.",
  openGraph: {
    title: "Apprendre son texte de théâtre – Mémorisation répliques | Côté-Cour",
    description:
      "Application pour comédiens : apprends ton texte de théâtre et mémorise tes répliques 3x plus vite. Importe ta scène, révèle tes répliques, reçois un feedback instantané.",
    type: "website",
    locale: "fr_FR",
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // getSupabaseSessionUser est mémoïsé par requête (React cache) : le layout et
  // les pages partagent le même appel auth.getUser(). getSession lit le cookie
  // localement (pas d'appel réseau).
  const supabase = await createSupabaseServerClient();
  const [user, sessionResult] = await Promise.all([
    getSupabaseSessionUser(),
    supabase.auth.getSession(),
  ]);
  const {
    data: { session: rawSession },
  } = sessionResult;

  const session = rawSession
    ? ({ ...rawSession, user } as typeof rawSession)
    : null;

  return (
    <html lang="fr">
      <body className={`${karla.variable} ${fraunces.variable} antialiased`}>
        <JsonLdSoftwareApplication />
        <SupabaseProvider initialSession={session}>
          <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_20%_20%,#F4C95D22,transparent_25%),radial-gradient(circle_at_80%_10%,#FF6B6B22,transparent_22%),radial-gradient(circle_at_80%_80%,#3B1F4A18,transparent_28%),#F9F7F3] text-[#1C1B1F]">
            <Suspense fallback={null}>
              <Header />
            </Suspense>
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">{children}</main>
            <footer className="mx-auto mt-16 w-full max-w-6xl border-t border-[#e7e0d4] px-4 py-10 text-sm text-[#5d5468] sm:px-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-xs space-y-2">
                  <p className="font-display text-lg font-semibold text-[#3b1f4a]">Côté-Cour</p>
                  <p className="text-xs leading-relaxed text-[#8a8093]">
                    Le partenaire de répétition des comédiens, des troupes et des cours de théâtre.
                  </p>
                  <p className="text-xs text-[#8a8093]">
                    © {new Date().getFullYear()} Côté-Cour. Tous droits réservés.
                  </p>
                </div>
                <nav className="grid grid-cols-2 gap-x-10 gap-y-2 sm:text-right">
                  <Link href="/landing" className="transition underline-offset-4 hover:text-[#3b1f4a] hover:underline">
                    Découvrir
                  </Link>
                  <Link href="/ressources" className="transition underline-offset-4 hover:text-[#3b1f4a] hover:underline">
                    Ressources
                  </Link>
                  <Link href="/rejoindre" className="transition underline-offset-4 hover:text-[#3b1f4a] hover:underline">
                    Rejoindre une classe
                  </Link>
                  <Link href="/professeur" className="transition underline-offset-4 hover:text-[#3b1f4a] hover:underline">
                    Espace professeur
                  </Link>
                  <Link href="/login" className="transition underline-offset-4 hover:text-[#3b1f4a] hover:underline">
                    Se connecter
                  </Link>
                  <Link href="/confidentialite" className="transition underline-offset-4 hover:text-[#3b1f4a] hover:underline">
                    Confidentialité
                  </Link>
                </nav>
              </div>
            </footer>
          </div>
        </SupabaseProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
