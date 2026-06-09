import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CreateClassForm } from "@/components/teacher/create-class-form";
import { fetchTeacherClasses } from "@/lib/queries/teacher";
import { getSupabaseSessionUser } from "@/lib/queries/scenes";
import { requireSubscriptionOrRedirect } from "@/lib/utils/require-subscription";
import { t } from "@/locales/fr";

export const metadata: Metadata = {
  title: "Espace professeur | Côté-Cour",
};

export default async function TeacherDashboardPage() {
  const user = await getSupabaseSessionUser();
  if (!user) {
    redirect("/login");
  }
  await requireSubscriptionOrRedirect(user);

  const classes = await fetchTeacherClasses(user.id);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 py-6">
      <div className="flex flex-col gap-2">
        <p className="chip w-fit">{t.teacher.dashboard.label}</p>
        <h1 className="font-display text-3xl font-semibold text-[#211a26] sm:text-4xl">
          {classes.length === 0 ? t.teacher.dashboard.emptyTitle : t.teacher.dashboard.title}
        </h1>
        <p className="max-w-2xl text-[15px] leading-relaxed text-[#5d5468]">
          {classes.length === 0 ? t.teacher.dashboard.emptyBody : t.teacher.dashboard.subtitle}
        </p>
      </div>

      {classes.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {classes.map((klass) => (
            <Link
              key={klass.id}
              href={`/professeur/classes/${klass.id}`}
              className="card card-hover flex flex-col gap-3 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-xl font-semibold text-[#3b1f4a]">{klass.name}</h2>
                <span className="rounded-full bg-[#3b1f4a] px-3 py-1 text-xs font-semibold text-white">
                  {t.teacher.dashboard.openClass} →
                </span>
              </div>
              {klass.description && (
                <p className="text-sm text-[#5d5468]">{klass.description}</p>
              )}
              <div className="mt-auto flex flex-wrap gap-3 text-xs font-semibold text-[#5d5468]">
                <span className="rounded-full bg-[#f4c95d2e] px-3 py-1 text-[#3b1f4a]">
                  {klass.memberCount} {t.teacher.dashboard.members}
                </span>
                <span className="rounded-full bg-[#ff6b6b1c] px-3 py-1 text-[#3b1f4a]">
                  {klass.sceneCount} {t.teacher.dashboard.texts}
                </span>
                {klass.show_date && (
                  <span className="rounded-full bg-[#2cb67d1f] px-3 py-1 text-[#1c6b4f]">
                    {t.teacher.dashboard.showPlanned} ·{" "}
                    {new Date(klass.show_date).toLocaleDateString("fr-FR")}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <CreateClassForm />
    </div>
  );
}
