import { redirect } from "next/navigation";
import { getSupabaseSessionUser } from "@/lib/queries/scenes";
import { CreateSceneForm } from "@/components/admin/create-scene-form";
import { isAdmin } from "@/lib/utils/admin";

export default async function AdminCreateScenePage() {
  const user = await getSupabaseSessionUser();

  if (!user) {
    redirect("/login");
  }

  const admin = await isAdmin(user.id);
  if (!admin) {
    redirect("/scenes");
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">
          Administration
        </p>
        <h1 className="font-display text-3xl font-semibold text-[#1c1b1f]">
          Créer une scène privée
        </h1>
        <p className="text-sm text-[#524b5a]">
          Créez une scène privée pour un utilisateur. Cette scène ne sera visible que par son propriétaire.
        </p>
      </div>

      <CreateSceneForm />
    </div>
  );
}



