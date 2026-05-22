import Link from "next/link";
import { redirect } from "next/navigation";
import { CreditCard, FolderOpen, Settings, Wand2 } from "lucide-react";
import { getClerkUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { SignOutButton } from "@/components/SignOutButton";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default async function DashboardLayout({ children }) {
  const userId = getClerkUserId();
  if (!userId) redirect("/login");

  const supabase = createSupabaseAdminClient();

  const { data: profile } = await supabase
    .from("users")
    .select("name, email, plan")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-obsidian text-text">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-line bg-surface/80 p-5 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-4 lg:block">
            <div>
              <Link href="/dashboard" className="font-serif text-2xl text-text">ShotlistAI</Link>
              <p className="mt-2 font-sans text-xs uppercase tracking-[0.18em] text-muted">
                {profile?.plan || "free"} plan
              </p>
            </div>
            <div className="lg:mt-10">
              <SignOutButton />
            </div>
          </div>
          <nav className="mt-8 grid gap-2">
            <NavLink href="/dashboard" icon={Wand2}>New Wedding</NavLink>
            <NavLink href="/dashboard/saved" icon={FolderOpen}>Saved Weddings</NavLink>
            <NavLink href="/dashboard/account" icon={Settings}>Account</NavLink>
            <NavLink href="/dashboard/account#billing" icon={CreditCard}>Billing</NavLink>
          </nav>
          <div className="mt-10 rounded border border-line bg-obsidian p-4">
            <p className="font-serif text-xl text-text">Need a fast start?</p>
            <p className="mt-2 font-sans text-sm leading-6 text-muted">
              Fill the required fields, generate the pack, then refine the tabs before exporting.
            </p>
          </div>
        </aside>
        <section className="min-w-0 p-5 md:p-8">
          <ErrorBoundary>{children}</ErrorBoundary>
        </section>
      </div>
    </main>
  );
}

function NavLink({ href, icon: Icon, children }) {
  return (
    <Link href={href} className="flex min-h-11 items-center gap-3 rounded border border-transparent px-3 font-sans text-sm text-muted transition hover:border-line hover:bg-obsidian hover:text-gold">
      <Icon size={16} />
      {children}
    </Link>
  );
}
