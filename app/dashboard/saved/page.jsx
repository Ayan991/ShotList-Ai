import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { getClerkUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const metadata = {
  title: "Saved Weddings"
};

export default async function SavedWeddingsPage() {
  const userId = getClerkUserId();
  if (!userId) redirect("/login");
  const supabase = createSupabaseAdminClient();

  const { data: profile } = await supabase.from("users").select("id").eq("clerk_user_id", userId).maybeSingle();
  if (!profile?.id) {
    return (
      <div>
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">Saved Weddings</p>
            <h1 className="mt-3 font-serif text-4xl text-text md:text-5xl">Past wedding plans.</h1>
          </div>
          <Link href="/dashboard" className="primary-button">New Wedding</Link>
        </div>
        <EmptyState />
      </div>
    );
  }

  const { data: weddings } = await supabase
    .from("weddings")
    .select("id, couple_names, date, venue, created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">Saved Weddings</p>
          <h1 className="mt-3 font-serif text-4xl text-text md:text-5xl">Past wedding plans.</h1>
        </div>
        <Link href="/dashboard" className="primary-button">New Wedding</Link>
      </div>

      {!weddings?.length ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4">
          {weddings.map((wedding) => (
            <Link key={wedding.id} href={`/dashboard/saved/${wedding.id}`} className="grid gap-3 rounded border border-line bg-surface p-5 transition hover:border-gold md:grid-cols-[1fr_180px_1fr] md:items-center">
              <div>
                <p className="font-serif text-2xl text-text">{wedding.couple_names}</p>
                <p className="mt-1 font-sans text-sm text-muted">Created {formatDate(wedding.created_at?.slice(0, 10))}</p>
              </div>
              <p className="font-sans text-sm text-gold">{formatDate(wedding.date)}</p>
              <p className="font-sans text-sm text-muted md:text-right">{wedding.venue || "No venue"}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="grid min-h-80 place-items-center rounded border border-dashed border-line bg-surface p-8 text-center">
      <div>
        <p className="font-serif text-3xl text-text">No weddings saved yet.</p>
        <p className="mt-3 max-w-sm font-sans text-sm leading-6 text-muted">
          Generate your first wedding pack and save it to build your library.
        </p>
        <Link href="/dashboard" className="primary-button mt-6 inline-flex">
          Generate Your First Wedding →
        </Link>
      </div>
    </div>
  );
}
