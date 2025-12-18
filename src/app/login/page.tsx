import Link from "next/link";
import { redirect } from "next/navigation";

import { MagicLinkForm } from "@/components/auth/magic-link-form";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  if (user) {
    redirect("/scenes");
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">Connexion</p>
        <h1 className="font-display text-3xl font-semibold text-[#1c1b1f]">Reçois un lien magique</h1>
        <p className="text-sm text-[#524b5a]">
          Authentification simple via email. Une fois connecté, tu seras redirigé vers la bibliothèque.
        </p>
      </div>
      <MagicLinkForm />
      <div className="text-sm text-[#524b5a]">
        <Link href="/scenes" className="font-semibold text-[#3b1f4a] underline underline-offset-4">
          Retour à la bibliothèque
        </Link>
      </div>
    </div>
  );
}
