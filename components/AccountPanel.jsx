"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Spinner } from "@/components/Spinner";
import { Toast } from "@/components/Toast";

export function AccountPanel({ profile, usage }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [name, setName] = useState(profile?.name || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState("");
  const [toast, setToast] = useState(null);

  async function updateProfile() {
    setLoading("profile");
    const { error } = await supabase.from("users").update({ name }).eq("id", profile.id);
    setLoading("");
    if (error) setToast({ type: "error", message: error.message });
    else {
      setToast({ type: "success", message: "Profile updated." });
      router.refresh();
    }
  }

  async function updatePassword() {
    setLoading("password");
    const { error } = await supabase.auth.updateUser({ password });
    setLoading("");
    if (error) setToast({ type: "error", message: error.message });
    else {
      setPassword("");
      setToast({ type: "success", message: "Password updated." });
    }
  }

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
              <input className="input" value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="block">
              <span className="label">Email</span>
              <input className="input opacity-70" value={profile.email} disabled />
            </label>
            <button onClick={updateProfile} disabled={loading === "profile"} className="primary-button">
              {loading === "profile" && <Spinner />} Save profile
            </button>
          </div>

          <div className="mt-8 border-t border-line pt-6">
            <h3 className="font-serif text-2xl text-text">Change password</h3>
            <label className="mt-4 block">
              <span className="label">New password</span>
              <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            <button onClick={updatePassword} disabled={!password || loading === "password"} className="primary-button mt-4">
              {loading === "password" && <Spinner />} Update password
            </button>
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
            <button onClick={() => checkout("pro")} disabled={loading === "pro"} className="primary-button">
              {loading === "pro" && <Spinner />} Upgrade to Pro
            </button>
            <button onClick={() => checkout("studio")} disabled={loading === "studio"} className="btn-outline">
              {loading === "studio" && <Spinner />} Upgrade to Studio
            </button>
            <button onClick={portal} disabled={loading === "portal"} className="btn-outline">
              {loading === "portal" && <Spinner />} Manage or cancel subscription
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
