"use client";

import { useState } from "react";
import Link from "next/link";
import { Spinner } from "@/components/Spinner";
import { Toast } from "@/components/Toast";

export function AccountPanel({ profile, usage }) {
  const [loading, setLoading] = useState("");
  const [toast, setToast] = useState(null);
  const isFree = profile.plan === "free";
  const isPro = profile.plan === "pro";
  const isStudio = profile.plan === "studio";

  async function checkout(plan) {
    setLoading(plan);
    try {
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Checkout failed.");
      window.location.href = data.url;
    } catch (error) {
      setToast({ type: "error", message: error.message });
      setLoading("");
    }
  }

  async function portal() {
    setLoading("portal");
    try {
      const response = await fetch("/api/create-portal", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Portal failed.");
      window.location.href = data.url;
    } catch (error) {
      setToast({ type: "error", message: error.message });
      setLoading("");
    }
  }

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <div className="mb-8">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">Account</p>
        <h1 className="mt-3 font-serif text-4xl text-text md:text-5xl">Profile and billing.</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded border border-line bg-surface p-5">
          <h2 className="font-serif text-3xl text-text">Profile</h2>
          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="label">Name</span>
              <input className="input opacity-70" value={profile.name || "No name set"} disabled />
            </label>
            <label className="block">
              <span className="label">Email</span>
              <input className="input opacity-70" value={profile.email || "No email"} disabled />
            </label>
            <Link href="/user-profile" className="primary-button">
              Manage account in Clerk
            </Link>
          </div>
        </section>

        <section id="billing" className="rounded border border-line bg-surface p-5">
          <h2 className="font-serif text-3xl text-text">Billing</h2>
          <div className="mt-5 rounded border border-line bg-obsidian p-4">
            <p className="label">Current plan</p>
            <div className="mt-3 inline-flex rounded-sm bg-gold px-3 py-2 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-obsidian">
              {profile.plan}
            </div>
            <p className="mt-5 font-sans text-sm text-muted">
              Usage this month: <span className="text-text">{usage?.count || 0}</span>
              {profile.plan === "free" ? " of 1 weddings used" : " weddings generated"}
            </p>
          </div>

          <div className="mt-6 grid gap-3">
            {isFree && (
              <>
                <button onClick={() => checkout("pro")} disabled={loading === "pro"} className="primary-button">
                  {loading === "pro" && <Spinner />} Upgrade to Pro
                </button>
                <button onClick={() => checkout("studio")} disabled={loading === "studio"} className="btn-outline">
                  {loading === "studio" && <Spinner />} Upgrade to Studio
                </button>
              </>
            )}
            {isPro && (
              <button onClick={() => checkout("studio")} disabled={loading === "studio"} className="primary-button">
                {loading === "studio" && <Spinner />} Upgrade to Studio
              </button>
            )}
            {isStudio && (
              <p className="rounded border border-line bg-obsidian px-3 py-2 font-sans text-sm text-muted">
                You are on the highest plan.
              </p>
            )}
            <button onClick={portal} disabled={loading === "portal"} className="btn-outline">
              {loading === "portal" && <Spinner />} Manage or cancel subscription
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
