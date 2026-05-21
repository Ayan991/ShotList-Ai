import { redirect } from "next/navigation";
import { AccountPanel } from "@/components/AccountPanel";
import { getCurrentMonthKey } from "@/lib/plans";
import { getAuthedUser } from "@/lib/supabase/server";

export const metadata = {
  title: "Account"
};

export default async function AccountPage() {
  const { supabase, user } = await getAuthedUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: usage }] = await Promise.all([
    supabase.from("users").select("id, email, name, plan, stripe_customer_id").eq("id", user.id).maybeSingle(),
    supabase.from("usage").select("count").eq("user_id", user.id).eq("month", getCurrentMonthKey()).maybeSingle()
  ]);

  return <AccountPanel profile={profile || { id: user.id, email: user.email, name: "", plan: "free" }} usage={usage || { count: 0 }} />;
}
