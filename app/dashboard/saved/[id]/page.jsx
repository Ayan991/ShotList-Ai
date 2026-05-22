import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SavedWeddingViewer } from "@/components/SavedWeddingViewer";
import { formatDate } from "@/lib/utils";
import { getClerkUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function SavedWeddingDetailPage({ params }) {
  const userId = getClerkUserId();
  if (!userId) redirect("/login");
  const supabase = createSupabaseAdminClient();
  const { data: profile } = await supabase.from("users").select("id").eq("clerk_user_id", userId).maybeSingle();
  if (!profile?.id) notFound();

  const { data: wedding } = await supabase
    .from("weddings")
    .select("id, couple_names, date, venue, inputs_json, result_json")
    .eq("id", params.id)
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!wedding) notFound();

  return (
    <div>
      <div className="mb-8">
        <Link href="/dashboard/saved" className="font-sans text-sm text-gold">← Saved Weddings</Link>
        <h1 className="mt-4 font-serif text-4xl text-text md:text-5xl">{wedding.couple_names}</h1>
        <p className="mt-3 font-sans text-sm text-muted">{formatDate(wedding.date)} · {wedding.venue || "No venue"}</p>
      </div>
      <SavedWeddingViewer result={wedding.result_json} />
    </div>
  );
}
