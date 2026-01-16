"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { useSupabase } from "@/components/supabase-provider";
import { useImportNotifications } from "@/hooks/use-import-notifications";
import { t } from "@/locales/fr";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { session, supabase } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hasImportNotifications = useImportNotifications();

  // Mode Zen devient le mode par défaut sur /learn.
  // `?zen=0` reste un échappatoire (debug) pour afficher la nav.
  const isLearn = Boolean(pathname?.startsWith("/learn/"));
  const zenDisabled = searchParams?.get("zen") === "0";
  if (isLearn && !zenDisabled) return null;

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.refresh();
    setLoading(false);
    setMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const navItems = session?.user
    ? [
        { href: "/home", label: t.common.nav.accueil },
        { href: "/bibliotheque", label: t.common.nav.bibliotheque },
      ]
    : [];

  // Trier par longueur de href (du plus long au plus court) pour vérifier les plus spécifiques en premier
  const sortedItems = [...navItems].sort((a, b) => b.href.length - a.href.length);

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (pathname === href) return true;
    if (pathname.startsWith(href + "/")) {
      const moreSpecificMatch = sortedItems.find(
        (other) => other.href.length > href.length && pathname.startsWith(other.href)
      );
      return !moreSpecificMatch;
    }
    return false;
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
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-full px-3 py-1 transition ${
                  isActive(item.href)
                    ? "bg-[#3b1f4a] text-white shadow-sm"
                    : "hover:bg-[#f4c95d33] hover:text-[#3b1f4a]"
                }`}
              >
                {item.label}
                {item.href === "/bibliotheque" && hasImportNotifications && (
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#ff6b6b] border-2 border-white" />
                )}
              </Link>
            ))}
          </nav>
        </div>
        <div className="relative flex items-center gap-3">
          {session?.user ? (
            <>
              {/* Menu mobile */}
              <button
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="rounded-full border border-[#e7e1d9] bg-white p-2 text-[#3b1f4a] shadow-sm hover:border-[#3b1f4a33] sm:hidden"
                aria-label="Menu"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
              {mobileMenuOpen && (
                <div className="absolute right-0 top-12 z-[70] w-56 rounded-2xl border border-[#e7e1d9] bg-white/95 shadow-lg sm:hidden">
                  <nav className="flex flex-col gap-1 p-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`relative rounded-full px-3 py-2 text-sm font-medium transition ${
                          isActive(item.href)
                            ? "bg-[#3b1f4a] text-white shadow-sm"
                            : "text-[#524b5a] hover:bg-[#f4c95d33] hover:text-[#3b1f4a]"
                        }`}
                      >
                        {item.label}
                        {item.href === "/bibliotheque" && hasImportNotifications && (
                          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#ff6b6b] border-2 border-white" />
                        )}
                      </Link>
                    ))}
                    <div className="border-t border-[#e7e1d9] my-1" />
                    <div className="px-3 py-2 text-xs text-[#524b5a]">{t.common.header.connecte}</div>
                    <Link
                      href="/compte"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center justify-between rounded-full px-3 py-2 text-sm font-semibold text-[#3b1f4a] transition hover:bg-[#f4c95d33]"
                    >
                      <span>{t.common.header.monCompte}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      disabled={loading}
                      className="flex w-full items-center justify-between rounded-full px-3 py-2 text-sm font-semibold text-[#3b1f4a] transition hover:bg-[#f4c95d33] disabled:opacity-50"
                    >
                      <span>{t.common.header.seDeconnecter}</span>
                      {loading && <span className="text-xs text-[#524b5a]">...</span>}
                    </button>
                  </nav>
                </div>
              )}
              {/* Menu desktop */}
              <div className="hidden items-center gap-2 sm:flex">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="rounded-full border border-[#e7e1d9] bg-white px-3 py-1 text-sm font-semibold text-[#3b1f4a] shadow-sm hover:border-[#3b1f4a33] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6b6b]"
                >
                  {session.user.email ?? t.common.header.monCompte}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-12 z-[70] w-56 rounded-2xl border border-[#e7e1d9] bg-white/95 shadow-lg">
                    <div className="px-4 py-3 text-xs text-[#524b5a]">{t.common.header.connecte}</div>
                    <div className="border-t border-[#e7e1d9]" />
                    <Link
                      href="/compte"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-3 text-sm font-semibold text-[#3b1f4a] transition hover:bg-[#f4c95d33]"
                    >
                      {t.common.header.monCompte}
                    </Link>
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
            </>
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



