import type { Metadata } from "next";
import Link from "next/link";

import { JoinClassForm } from "@/components/classes/join-class-form";
import { getSupabaseSessionUser } from "@/lib/queries/scenes";
import { t } from "@/locales/fr";

export const metadata: Metadata = {
  title: "Rejoindre une classe | Côté-Cour",
};

type Props = {
  searchParams: Promise<{ code?: string }>;
};

export default async function JoinClassPage({ searchParams }: Props) {
  const { code } = await searchParams;
  const user = await getSupabaseSessionUser();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 py-12">
      <div className="flex flex-col gap-2 text-center">
        <p className="chip mx-auto">{t.teacher.student.label}</p>
        <h1 className="font-display text-3xl font-semibold text-[#211a26]">
          {t.teacher.student.joinTitle}
        </h1>
        <p className="text-sm text-[#5d5468]">{t.teacher.student.joinSubtitle}</p>
      </div>

      <div className="card p-6">
        {user ? (
          <JoinClassForm initialCode={code} />
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-[#5d5468]">
              Connecte-toi (ou crée ton compte en 30 secondes) pour rejoindre ta classe.
            </p>
            <Link
              href={`/login?redirect=${encodeURIComponent(code ? `/rejoindre?code=${code}` : "/rejoindre")}`}
              className="btn-primary"
            >
              {t.common.header.seConnecter}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
