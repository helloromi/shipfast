import { redirect } from "next/navigation";

import { getSupabaseSessionUser } from "@/lib/queries/scenes";
import { hasActiveSubscription } from "@/lib/queries/access";
import { hasClassMembership } from "@/lib/queries/teacher";
import { isAdmin } from "@/lib/utils/admin";
import OnboardingPageClient from "@/components/onboarding/onboarding-client";

export default async function OnboardingPage() {
  const user = await getSupabaseSessionUser();
  if (!user) {
    redirect("/login");
  }

  const [admin, subscribed, inClass] = await Promise.all([
    isAdmin(user.id),
    hasActiveSubscription(user.id),
    hasClassMembership(user.id),
  ]);

  if (admin || subscribed) {
    redirect("/home");
  }

  // Un élève déjà rattaché à une classe n'a rien à payer : direction ses cours.
  if (inClass) {
    redirect("/mes-cours");
  }

  return <OnboardingPageClient />;
}
