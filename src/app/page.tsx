import { redirect } from "next/navigation";

import { getSupabaseSessionUser } from "@/lib/queries/scenes";

export default async function Root() {
  const user = await getSupabaseSessionUser();
  if (user) {
    redirect("/home");
  }
  redirect("/landing");
}
