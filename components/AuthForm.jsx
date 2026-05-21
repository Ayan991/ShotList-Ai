"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Spinner } from "@/components/Spinner";
import { Toast } from "@/components/Toast";

export function AuthForm({ mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const next = searchParams.get("next") || "/dashboard";

  const isSignup = mode === "signup";
  const isForgot = mode === "forgot";

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setToast(null);

    try {
      if (isForgot) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/dashboard/account`
        });
        if (error) throw error;
        setToast({ type: "success", message: "Password reset email sent." });
        return;
      }

      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });
        if (error) throw error;
        setToast({ type: "success", message: "Account created. Check your email if confirmation is enabled." });
        router.push(next);
        router.refresh();
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push(next);
      router.refresh();
    } catch (error) {
      setToast({ type: "error", message: error.message || "Authentication failed." });
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${next}`
      }
    });
    if (error) {
      setToast({ type: "error", message: error.message });
      setLoading(false);
    }
  }

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <form onSubmit={handleSubmit} className="rounded border border-line bg-surface p-6 shadow-editorial">
        <div className="mb-8">
          <Link href="/" className="font-serif text-2xl text-text">ShotlistAI</Link>
          <h1 className="mt-8 font-serif text-4xl text-text">
            {isSignup ? "Create your account." : isForgot ? "Reset your password." : "Welcome back."}
          </h1>
          <p className="mt-3 font-sans text-sm leading-6 text-muted">
            {isSignup
              ? "Start with one free wedding plan."
              : isForgot
                ? "Enter your email and we will send a reset link."
                : "Log in to generate and manage wedding plans."}
          </p>
        </div>

        <div className="space-y-4">
          {isSignup && (
            <Field label="Name">
              <input value={name} onChange={(event) => setName(event.target.value)} required className="input" />
            </Field>
          )}
          <Field label="Email">
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="input" />
          </Field>
          {!isForgot && (
            <Field label="Password">
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} className="input" />
            </Field>
          )}
        </div>

        <button disabled={loading} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-gold px-4 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-obsidian transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60">
          {loading && <Spinner />}
          {isSignup ? "Start Free Trial" : isForgot ? "Send Reset Link" : "Login"}
        </button>

        {!isForgot && (
          <>
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-line" />
              <span className="font-sans text-xs uppercase tracking-[0.18em] text-muted">or</span>
              <div className="h-px flex-1 bg-line" />
            </div>
            <button type="button" disabled={loading} onClick={signInWithGoogle} className="inline-flex min-h-12 w-full items-center justify-center rounded-sm border border-line font-sans text-sm font-semibold text-text transition hover:border-gold hover:text-gold">
              Continue with Google
            </button>
          </>
        )}

        <div className="mt-6 flex flex-wrap justify-between gap-3 font-sans text-sm text-muted">
          {isSignup ? (
            <Link href="/login" className="hover:text-gold">Already have an account?</Link>
          ) : (
            <Link href="/signup" className="hover:text-gold">Create an account</Link>
          )}
          {!isForgot && <Link href="/forgot-password" className="hover:text-gold">Forgot password?</Link>}
        </div>
      </form>
    </>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</span>
      {children}
    </label>
  );
}
