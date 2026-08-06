import { redirect } from "next/navigation";

import { getSupabaseSessionUser } from "@/lib/queries/scenes";
import { ImportForm } from "@/components/scenes/import-form";
import { t } from "@/locales/fr";
import { FREE_IMPORT_MAX_FILES, getImportQuota } from "@/lib/utils/import-quota";

export default async function ImportScenePage() {
  const user = await getSupabaseSessionUser();
  if (!user) {
    redirect("/login");
  }

  // L'import n'est plus un tout-ou-rien : le premier texte est offert, et c'est
  // seulement une fois cet import consommé qu'on propose le pass. Un compte neuf
  // doit pouvoir voir l'import fonctionner avant de payer.
  const quota = await getImportQuota(user.id);
  if (!quota.allowed) {
    redirect("/subscribe");
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

      {!quota.entitled && (
        <div className="flex flex-col gap-2 rounded-2xl border border-[#f4c95d80] bg-[#f4c95d1f] px-4 py-4">
          <p className="text-sm font-semibold text-[#3b1f4a]">
            {t.scenes.import.offert.titre}
          </p>
          <p className="text-sm text-[#524b5a] leading-relaxed">
            {t.scenes.import.offert.description}
          </p>
          <p className="text-xs text-[#7a7184]">
            {t.scenes.import.offert.limite(FREE_IMPORT_MAX_FILES)}
          </p>
        </div>
      )}

      <ImportForm />
    </div>
  );
}
