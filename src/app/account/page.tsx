import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getUserSubscriptions, hasActiveSubscriptions } from "@/lib/queries/subscriptions";
import { SubscriptionList } from "@/components/account/subscription-list";
import { DeleteAccountForm } from "@/components/account/delete-account-form";
import { ManageSubscriptionsButton } from "@/components/account/manage-subscriptions-button";
import { t } from "@/locales/fr";

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const subscriptions = await getUserSubscriptions(user.id);
  const hasActive = await hasActiveSubscriptions(user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-[#1c1b1f]">
          {t.account.title}
        </h1>
      </div>

      <div className="space-y-6">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#3b1f4a]">
              {t.account.subscriptions.title}
            </h2>
            <ManageSubscriptionsButton />
          </div>
          <SubscriptionList subscriptions={subscriptions} />
        </section>

        <section>
          <DeleteAccountForm hasActiveSubscriptions={hasActive} />
        </section>
      </div>
    </div>
  );
}
