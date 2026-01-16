import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { AccountPageClient } from "@/components/account/account-page-client";

export default async function ComptePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-[#3b1f4a]">Mon compte</h1>
        <p className="mt-2 text-sm text-[#524b5a]">
          Gérez votre abonnement et vos données.
        </p>
      </div>

      <AccountPageClient userEmail={user.email ?? null} />
    </div>
  );
}

