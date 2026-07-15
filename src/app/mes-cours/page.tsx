import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { JoinClassForm } from "@/components/classes/join-class-form";
import { fetchStudentClasses } from "@/lib/queries/teacher";
import { getSupabaseSessionUser } from "@/lib/queries/scenes";
import { t } from "@/locales/fr";
import type { ShowNoteCategory } from "@/types/teacher";

export const metadata: Metadata = {
  title: "Mes cours | Côté-Cour",
};

const CATEGORY_ICON: Record<ShowNoteCategory, string> = {
  mise_en_scene: "🎬",
  costumes: "👗",
  decors: "🏛",
  accessoires: "🎭",
  technique: "💡",
  autre: "📌",
};

export default async function StudentClassesPage() {
  const user = await getSupabaseSessionUser();
  if (!user) {
    redirect("/login");
  }

  const classes = await fetchStudentClasses(user.id);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 py-6">
      <div className="flex flex-col gap-2">
        <p className="chip w-fit">{t.teacher.student.label}</p>
        <h1 className="font-display text-3xl font-semibold text-[#211a26] sm:text-4xl">
          {t.teacher.student.title}
        </h1>
        <p className="text-[15px] text-[#5d5468]">{t.teacher.student.subtitle}</p>
      </div>

      {classes.length === 0 && (
        <div className="card flex flex-col gap-4 p-6">
          <p className="text-sm text-[#5d5468]">{t.teacher.student.empty}</p>
          <JoinClassForm />
        </div>
      )}

      {classes.map(({ klass, membership, assignments, showNotes }) => {
        const myNotes = showNotes.filter((n) => n.member_id === membership.id);
        // Uniquement les éléments collectifs : ceux qui visent un camarade ne
        // regardent pas cet élève (et la RLS ne les renvoie plus).
        const classNotes = showNotes.filter((n) => n.member_id === null);
        return (
          <section key={klass.id} className="card flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-2xl font-semibold text-[#3b1f4a]">{klass.name}</h2>
              {klass.description && <p className="text-sm text-[#5d5468]">{klass.description}</p>}
            </div>

            {/* Le spectacle */}
            {(klass.show_title || klass.show_date || klass.show_venue) && (
              <div className="rounded-2xl bg-gradient-to-br from-[#3b1f4a] to-[#251331] p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f4c95d]">
                  {t.teacher.student.showSection}
                </p>
                {klass.show_title && (
                  <p className="mt-1 font-display text-xl font-semibold">{klass.show_title}</p>
                )}
                <p className="mt-1 text-sm text-white/80">
                  {[
                    klass.show_date ? new Date(klass.show_date).toLocaleDateString("fr-FR", { dateStyle: "long" }) : null,
                    klass.show_venue,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            )}

            {/* Mes textes */}
            <div className="flex flex-col gap-3">
              <h3 className="font-display text-lg font-semibold text-[#211a26]">
                {t.teacher.student.myAssignments}
              </h3>
              {assignments.length === 0 ? (
                <p className="text-sm text-[#8a8093]">{t.teacher.student.noAssignments}</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {assignments.map((a) => (
                    <li
                      key={a.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#efe9dd] bg-white/80 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#211a26]">{a.sceneTitle ?? "—"}</p>
                        <p className="text-xs text-[#8a8093]">
                          {a.characterName ? (
                            <>
                              {t.teacher.casting.playsRole}{" "}
                              <span className="font-semibold text-[#3b1f4a]">{a.characterName}</span>
                            </>
                          ) : (
                            t.teacher.casting.wholeText
                          )}
                          {a.note && <span className="italic"> · « {a.note} »</span>}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/scenes/${a.scene_id}`} className="btn-secondary !min-h-[36px] !px-4 !py-1.5 text-xs">
                          {t.common.buttons.details}
                        </Link>
                        <Link
                          href={
                            a.character_id
                              ? `/learn/${a.scene_id}?character=${a.character_id}${a.characterName ? `&characterName=${encodeURIComponent(a.characterName)}` : ""}`
                              : `/scenes/${a.scene_id}`
                          }
                          className="btn-primary !min-h-[36px] !px-4 !py-1.5 text-xs"
                        >
                          {t.teacher.student.learnCta}
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Côté coulisses */}
            {(myNotes.length > 0 || classNotes.length > 0) && (
              <div className="flex flex-col gap-3">
                <h3 className="font-display text-lg font-semibold text-[#211a26]">
                  {t.teacher.student.backstage}
                </h3>
                {myNotes.length > 0 && (
                  <div className="rounded-2xl border-l-4 border-[#f4c95d] bg-[#fdf8ec] p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#b08a26]">
                      {t.teacher.student.forYou}
                    </p>
                    <ul className="mt-2 flex flex-col gap-2">
                      {myNotes.map((n) => (
                        <li key={n.id} className="text-sm text-[#211a26]">
                          <span aria-hidden>{CATEGORY_ICON[n.category]}</span>{" "}
                          <span className="font-semibold">{n.title}</span>
                          {n.content && <span className="text-[#5d5468]"> — {n.content}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {classNotes.length > 0 && (
                  <ul className="flex flex-col gap-1.5">
                    {classNotes.map((n) => (
                      <li
                        key={n.id}
                        className="flex flex-wrap items-baseline gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm"
                      >
                        <span aria-hidden>{CATEGORY_ICON[n.category]}</span>
                        <span className="font-semibold text-[#211a26]">{n.title}</span>
                        {n.content && <span className="text-[#5d5468]">— {n.content}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>
        );
      })}

      {classes.length > 0 && (
        <div className="card flex flex-col gap-3 p-6">
          <h2 className="font-display text-lg font-semibold text-[#3b1f4a]">
            {t.teacher.student.joinTitle}
          </h2>
          <JoinClassForm />
        </div>
      )}
    </div>
  );
}
