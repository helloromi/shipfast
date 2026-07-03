import { redirect } from "next/navigation";

import { MagicLinkForm } from "@/components/auth/magic-link-form";
import { getSupabaseSessionUser } from "@/lib/queries/scenes";
import { safeInternalPath } from "@/lib/utils/safe-path";
import { t } from "@/locales/fr";

type Props = {
  searchParams: Promise<{ error?: string; redirect?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  // Cible post-connexion (ex: /rejoindre?code=XXXX pour un élève invité).
  const next = safeInternalPath(params.redirect, "/onboarding");

  const user = await getSupabaseSessionUser();
  if (user) {
    redirect(next === "/onboarding" ? "/home" : next);
  }

  const errorMessage = params.error;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">{t.login.sectionLabel}</p>
        <h1 className="font-display text-3xl font-semibold text-[#1c1b1f]">{t.login.title}</h1>
        <p className="text-sm text-[#524b5a]">
          {t.login.description}
        </p>
      </div>
      {errorMessage ? (
        <div className="rounded-2xl border border-[#f2c2c2] bg-[#fff1f2] p-4 text-sm text-[#9f1239]">
          {errorMessage}
        </div>
      ) : null}
      <MagicLinkForm next={next} />
    </div>
  );
}
