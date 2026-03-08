import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseSessionUser } from "@/lib/queries/scenes";
import { isAdmin } from "@/lib/utils/admin";
import { AdminActivityCharts } from "@/components/admin/admin-activity-charts";
import { AdminBillingSummary } from "@/components/admin/admin-billing-summary";
import { AdminLandingViews } from "@/components/admin/admin-landing-views";
import { AdminUsersTable } from "@/components/admin/admin-users-table";

export default async function AdminDashboardPage() {
  const user = await getSupabaseSessionUser();
  if (!user) {
    redirect("/login");
  }
  const admin = await isAdmin(user.id);
  if (!admin) {
    redirect("/scenes");
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">
            Administration
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#1c1b1f]">
            Dashboard
          </h1>
        </div>
        <Link
          href="/admin/scenes/create"
          className="rounded-full border border-[#e7e1d9] bg-white px-4 py-2 text-sm font-semibold text-[#3b1f4a] shadow-sm transition hover:border-[#3b1f4a33] hover:bg-[#f4c95d22]"
        >
          Créer une scène privée
        </Link>
      </div>

      <section className="rounded-2xl border border-[#e7e1d9] bg-white/95 p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-[#1c1b1f]">
          Vues landing
        </h2>
        <AdminLandingViews />
      </section>

      <section className="rounded-2xl border border-[#e7e1d9] bg-white/95 p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-[#1c1b1f]">
          Utilisateurs actifs
        </h2>
        <AdminActivityCharts />
      </section>

      <section className="rounded-2xl border border-[#e7e1d9] bg-white/95 p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-[#1c1b1f]">
          Abonnements
        </h2>
        <AdminBillingSummary />
      </section>

      <section className="rounded-2xl border border-[#e7e1d9] bg-white/95 p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-[#1c1b1f]">
          Utilisateurs
        </h2>
        <AdminUsersTable />
      </section>
    </div>
  );
}
