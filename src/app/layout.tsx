import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import { Header } from "@/components/header";
import { SupabaseProvider } from "@/components/supabase-provider";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-display",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Côté-Cour - Maîtrise tes textes 3x plus vite",
  description: "Importe ta scène, révèle tes répliques au fur et à mesure, et reçois un feedback instantané. Simple, efficace, sans configuration.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const {
    data: { session: rawSession },
  } = await supabase.auth.getSession();

  const session = rawSession
    ? ({ ...rawSession, user } as typeof rawSession)
    : null;

  return (
    <html lang="fr">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <SupabaseProvider initialSession={session}>
          <div className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,#F4C95D22,transparent_25%),radial-gradient(circle_at_80%_10%,#FF6B6B22,transparent_22%),radial-gradient(circle_at_80%_80%,#3B1F4A18,transparent_28%),#F9F7F3] text-[#1C1B1F]">
            <Header />
            <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</main>
          </div>
        </SupabaseProvider>
      </body>
    </html>
  );
}
