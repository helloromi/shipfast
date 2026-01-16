import Link from "next/link";
import { redirect } from "next/navigation";

import { MagicLinkForm } from "@/components/auth/magic-link-form";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { t } from "@/locales/fr";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  if (user) {
    redirect("/home");
  }

  const errorParam = searchParams?.error;
  const errorMessage = Array.isArray(errorParam) ? errorParam[0] : errorParam;

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
      <MagicLinkForm />
    </div>
  );
}





