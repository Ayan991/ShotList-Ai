import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { getAuthedUser } from "@/lib/supabase/server";

export const metadata = {
  title: "Saved Weddings"
};

export default async function SavedWeddingsPage() {
  const { supabase, user } = await getAuthedUser();
  if (!user) redirect("/login");
  const { data: weddings } = await supabase
    .from("weddings")
    .select("id, couple_names, date, venue, created_at")
    .eq("user_id", user.id)
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
        <div className="rounded border border-dashed border-line bg-surface p-10 text-center">
          <p className="font-serif text-3xl text-text">No saved weddings yet.</p>
          <p className="mt-3 font-sans text-sm text-muted">Generated plans will appear here automatically.</p>
        </div>
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
