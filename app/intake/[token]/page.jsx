"use client";

import { useEffect, useState } from "react";

const initialForm = {
  coupleNames: "",
  weddingDate: "",
  venueName: "",
  venueType: "Church",
  guestCount: "50-150",
  photographyStyle: "Romantic/Editorial",
  ceremonyTime: "",
  coverageHours: "",
  specialMoments: "",
  extraDetails: ""
};

export default function IntakePage({ params }) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("loading");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkToken() {
      try {
        const response = await fetch(`/api/intake/${params.token}`);
        setStatus(response.ok ? "ready" : "invalid");
      } catch {
        setStatus("invalid");
      }
    }
    checkToken();
  }, [params.token]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/intake-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: params.token, ...form })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Submission failed.");
      setStatus("submitted");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return <main className="min-h-screen bg-obsidian text-text grid place-items-center font-sans">Loading...</main>;
  }

  if (status === "invalid") {
    return <main className="min-h-screen bg-obsidian text-text grid place-items-center font-serif text-3xl">This intake link is no longer active.</main>;
  }

  if (status === "submitted") {
    return (
      <main className="min-h-screen bg-obsidian text-text grid place-items-center px-4">
        <div className="w-full max-w-xl rounded border border-line bg-surface p-6 text-center">
          <p className="font-serif text-4xl text-text">Thank you.</p>
          <p className="mt-3 font-sans text-sm text-muted">Your wedding details were sent to your photographer.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-obsidian text-text px-4 py-10">
      <div className="mx-auto w-full max-w-3xl rounded border border-line bg-surface p-6">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">Wedding Intake</p>
        <h1 className="mt-3 font-serif text-4xl text-text">Share your wedding details</h1>
        <p className="mt-2 font-sans text-sm text-muted">This helps your photographer prepare your shot plan.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Couple names *" value={form.coupleNames} onChange={(v) => update("coupleNames", v)} />
          <Field label="Wedding date" type="date" value={form.weddingDate} onChange={(v) => update("weddingDate", v)} />
          <Field label="Venue name" value={form.venueName} onChange={(v) => update("venueName", v)} />
          <Select label="Venue type" value={form.venueType} onChange={(v) => update("venueType", v)} options={["Church", "Outdoor Garden", "Ballroom/Hotel", "Barn/Rustic", "Beach", "Rooftop"]} />
          <Select label="Guest count" value={form.guestCount} onChange={(v) => update("guestCount", v)} options={["Under 50", "50-150", "150+"]} />
          <Select label="Photography style" value={form.photographyStyle} onChange={(v) => update("photographyStyle", v)} options={["Romantic/Editorial", "Documentary/Candid", "Fine Art/Moody", "Bright & Airy"]} />
          <Field label="Ceremony time" value={form.ceremonyTime} onChange={(v) => update("ceremonyTime", v)} />
          <Field label="Coverage hours" value={form.coverageHours} onChange={(v) => update("coverageHours", v)} />
        </div>

        <label className="mt-4 block">
          <span className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted">Special moments</span>
          <textarea className="input min-h-24" value={form.specialMoments} onChange={(e) => update("specialMoments", e.target.value)} />
        </label>
        <label className="mt-4 block">
          <span className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted">Any extra details for your photographer</span>
          <textarea className="input min-h-28" value={form.extraDetails} onChange={(e) => update("extraDetails", e.target.value)} />
        </label>

        {error ? <p className="mt-4 font-sans text-sm text-red-400">{error}</p> : null}
        <button onClick={submit} disabled={loading || !form.coupleNames} className="primary-button mt-6 w-full justify-center">
          {loading ? "Submitting..." : "Submit Details"}
        </button>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</span>
      <input className="input" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</span>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </label>
  );
}
