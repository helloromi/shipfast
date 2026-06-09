import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ClassDetailClient } from "@/components/teacher/class-detail-client";
import { fetchClassDetail } from "@/lib/queries/teacher";
import { fetchUserPrivateScenes, getSupabaseSessionUser } from "@/lib/queries/scenes";
import { requireSubscriptionOrRedirect } from "@/lib/utils/require-subscription";
import { t } from "@/locales/fr";

export const metadata: Metadata = {
  title: "Ma classe | Côté-Cour",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TeacherClassPage({ params }: Props) {
  const { id } = await params;
  const user = await getSupabaseSessionUser();
  if (!user) {
    redirect("/login");
  }
  await requireSubscriptionOrRedirect(user);

  const [detail, libraryScenes] = await Promise.all([
    fetchClassDetail(id, user.id),
    fetchUserPrivateScenes(user.id),
  ]);

  if (!detail) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 py-6">
      <div>
        <Link href="/professeur" className="btn-ghost -ml-3">
          ← {t.teacher.class.backToDashboard}
        </Link>
      </div>
      <ClassDetailClient
        detail={detail}
        libraryScenes={libraryScenes.map((s) => ({
          id: s.id,
          title: s.title,
          author: s.author,
        }))}
      />
    </div>
  );
}
