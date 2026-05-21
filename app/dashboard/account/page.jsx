import { redirect } from "next/navigation";
import { AccountPanel } from "@/components/AccountPanel";
import { getCurrentMonthKey } from "@/lib/plans";
import { getClerkUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const metadata = {
  title: "Account"
};

export default async function AccountPage() {
  const userId = getClerkUserId();
  if (!userId) redirect("/login");
  const supabase = createSupabaseAdminClient();

  const { data: profile } = await supabase
    .from("users")
    .select("id, email, name, plan, stripe_customer_id, clerk_user_id")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (!profile) {
    return <AccountPanel profile={{ id: "", email: "", name: "", plan: "free", clerk_user_id: userId }} usage={{ count: 0 }} />;
  }

  const { data: usage } = await supabase
    .from("usage")
    .select("count")
    .eq("user_id", profile.id)
    .eq("month", getCurrentMonthKey())
    .maybeSingle();

  return <AccountPanel profile={profile} usage={usage || { count: 0 }} />;
}
