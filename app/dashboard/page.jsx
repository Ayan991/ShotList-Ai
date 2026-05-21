import { getCurrentMonthKey } from "@/lib/plans";
import { getAuthedUser } from "@/lib/supabase/server";
import { DashboardGenerator } from "@/components/DashboardGenerator";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard"
};

export default async function DashboardPage() {
  const { supabase, user } = await getAuthedUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: usage }] = await Promise.all([
    supabase.from("users").select("id, email, name, plan").eq("id", user.id).maybeSingle(),
    supabase.from("usage").select("count").eq("user_id", user.id).eq("month", getCurrentMonthKey()).maybeSingle()
  ]);

  return <DashboardGenerator profile={profile || { plan: "free" }} usage={usage || { count: 0 }} />;
}
