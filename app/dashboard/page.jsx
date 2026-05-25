import { getCurrentMonthKey } from "@/lib/plans";
import { getClerkUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { DashboardGenerator } from "@/components/DashboardGenerator";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard"
};

export default async function DashboardPage() {
  const userId = getClerkUserId();
  if (!userId) redirect("/login");
  const supabase = createSupabaseAdminClient();

  const { data: profile } = await supabase
    .from("users")
    .select("id, email, name, plan, clerk_user_id, onboarded")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (!profile?.id) {
    return <DashboardGenerator profile={{ plan: "free", onboarded: false }} usage={{ count: 0 }} intakeLink={null} intakeSubmissions={[]} />;
  }

  const { data: usage } = await supabase
    .from("usage")
    .select("count")
    .eq("user_id", profile.id)
    .eq("month", getCurrentMonthKey())
    .maybeSingle();

  const { data: intakeLink } = await supabase
    .from("intake_links")
    .select("id, token, is_active")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .maybeSingle();

  const { data: intakeSubmissions } = await supabase
    .from("intake_submissions")
    .select("id, couple_names, wedding_date, venue_name, venue_type, guest_count, photography_style, ceremony_time, coverage_hours, special_moments, extra_details, status, created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <DashboardGenerator
      profile={profile || { plan: "free", onboarded: false }}
      usage={usage || { count: 0 }}
      intakeLink={intakeLink || null}
      intakeSubmissions={intakeSubmissions || []}
    />
  );
}
