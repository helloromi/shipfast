"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { useSupabase } from "@/components/supabase-provider";
import { t } from "@/locales/fr";

const navItems = [
  { href: "/scenes", label: t.common.nav.bibliotheque },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { session, supabase } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.refresh();
    setLoading(false);
    setMenuOpen(false);
  };

  return (
    <header className="border-b border-[#e7e1d9] bg-[rgba(255,255,255,0.9)] backdrop-blur shadow-sm shadow-[#3b1f4a0d]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href={session?.user ? "/home" : "/landing"}
            className="font-display text-xl font-semibold text-[#3b1f4a]"
          >
            {t.common.header.appName}
          </Link>
          <nav className="hidden items-center gap-3 text-sm font-medium text-[#524b5a] sm:flex">
            {(() => {
              const allItems = navItems.concat(
                session?.user
                  ? [
                      { href: "/home", label: t.common.nav.accueil },
                      { href: "/scenes/import", label: t.common.nav.importer },
                    ]
                  : []
              );
              
              // Trier par longueur de href (du plus long au plus court) pour vérifier les plus spécifiques en premier
              const sortedItems = [...allItems].sort((a, b) => b.href.length - a.href.length);
              
              return sortedItems.map((item) => {
                // Vérifier si ce lien est actif
                // Pour éviter les conflits, on vérifie d'abord les liens les plus longs
                let active = false;
                if (pathname) {
                  // Correspondance exacte
                  if (pathname === item.href) {
                    active = true;
                  } else if (pathname.startsWith(item.href + "/")) {
                    // Vérifier qu'aucun lien plus spécifique ne correspond
                    const moreSpecificMatch = sortedItems.find(
                      (other) => other.href.length > item.href.length && pathname.startsWith(other.href)
                    );
                    active = !moreSpecificMatch;
                  }
                }
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-3 py-1 transition ${
                      active
                        ? "bg-[#3b1f4a] text-white shadow-sm"
                        : "hover:bg-[#f4c95d33] hover:text-[#3b1f4a]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              });
            })()}
          </nav>
        </div>
        <div className="relative flex items-center gap-3">
          {session?.user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="rounded-full border border-[#e7e1d9] bg-white px-3 py-1 text-sm font-semibold text-[#3b1f4a] shadow-sm hover:border-[#3b1f4a33] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6b6b]"
              >
                {session.user.email ?? t.common.header.monCompte}
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-12 z-20 w-56 rounded-2xl border border-[#e7e1d9] bg-white/95 shadow-lg">
                  <div className="px-4 py-3 text-xs text-[#524b5a]">{t.common.header.connecte}</div>
                  <div className="border-t border-[#e7e1d9]" />
                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-[#3b1f4a] transition hover:bg-[#f4c95d33] disabled:opacity-50"
                  >
                    <span>{t.common.header.seDeconnecter}</span>
                    {loading && <span className="text-xs text-[#524b5a]">...</span>}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-[#ff6b6b] px-3 py-1 text-sm font-semibold text-white shadow-sm hover:bg-[#e75a5a]"
            >
              {t.common.header.seConnecter}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}



