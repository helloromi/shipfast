import { redirect } from "next/navigation";
import { getSupabaseSessionUser } from "@/lib/queries/scenes";
import { ImportForm } from "@/components/scenes/import-form";
import { t } from "@/locales/fr";

export default async function ImportScenePage() {
  const user = await getSupabaseSessionUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">
          {t.scenes.import.sectionLabel}
        </p>
        <h1 className="font-display text-3xl font-semibold text-[#1c1b1f]">
          {t.scenes.import.title}
        </h1>
        <p className="text-sm text-[#524b5a] leading-relaxed">
          {t.scenes.import.description}
        </p>
      </div>

      <ImportForm />
    </div>
  );
}

