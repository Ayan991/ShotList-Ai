"use client";

import { useMemo, useState } from "react";
import { pdf, Document, Page, Text, StyleSheet } from "@react-pdf/renderer";
import { Download, Loader2, RefreshCcw, Save, Wand2 } from "lucide-react";
import { Toast } from "@/components/Toast";

const initialForm = {
  coupleNames: "",
  weddingDate: "",
  venueName: "",
  venueType: "Church",
  guestCount: "50-150",
  photographyStyle: "Romantic/Editorial",
  ceremonyTime: "4:00 PM",
  coverageHours: "8",
  specialMoments: "",
  outputs: ["shotList", "timeline", "secondShooterBrief", "clientEmail"]
};

const tabs = [
  ["shotList", "Shot List"],
  ["timeline", "Timeline"],
  ["secondShooterBrief", "Second Shooter Brief"],
  ["clientEmail", "Client Email"]
];

export function DashboardGenerator({ profile, usage }) {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [weddingId, setWeddingId] = useState(null);
  const [activeTab, setActiveTab] = useState("shotList");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const usedLabel = useMemo(() => {
    if (profile?.plan === "pro" || profile?.plan === "studio") return `${usage?.count || 0} generated`;
    return `${usage?.count || 0} of 1 weddings used`;
  }, [profile?.plan, usage?.count]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleOutput(output) {
    setForm((current) => ({
      ...current,
      outputs: current.outputs.includes(output)
        ? current.outputs.filter((item) => item !== output)
        : [...current.outputs, output]
    }));
  }

  async function generate() {
    setLoading(true);
    setToast(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed.");
      setResult(data.result);
      setWeddingId(data.weddingId);
      setActiveTab("shotList");
      setToast({ type: "success", message: "Wedding pack generated and saved." });
    } catch (error) {
      setToast({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  async function saveWedding() {
    if (!result) return;

    try {
      const response = await fetch("/api/weddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: form, result, weddingId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Save failed.");
      setWeddingId(data.weddingId);
      setToast({ type: "success", message: "Wedding saved." });
    } catch (error) {
      setToast({ type: "error", message: error.message });
    }
  }

  async function downloadPdf() {
    if (!result) return;
    const blob = await pdf(
      <PdfDocument title={`${form.coupleNames || "Wedding"} - ${labelForTab(activeTab)}`} activeTab={activeTab} result={result} />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slugify(form.coupleNames || "wedding")}-${activeTab}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">New Wedding</p>
          <h1 className="mt-3 font-serif text-4xl text-text md:text-5xl">Generate a shoot-ready plan.</h1>
        </div>
        <div className="rounded border border-line bg-surface px-4 py-3 font-sans text-sm text-muted">
          Usage: <span className="text-text">{usedLabel}</span>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded border border-line bg-surface p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Couple names" value={form.coupleNames} onChange={(value) => update("coupleNames", value)} required />
            <Input label="Wedding date" type="date" value={form.weddingDate} onChange={(value) => update("weddingDate", value)} />
            <Input label="Venue name" value={form.venueName} onChange={(value) => update("venueName", value)} />
            <Select label="Venue type" value={form.venueType} onChange={(value) => update("venueType", value)} options={["Church", "Outdoor Garden", "Ballroom/Hotel", "Barn/Rustic", "Beach", "Rooftop"]} />
            <Select label="Guest count" value={form.guestCount} onChange={(value) => update("guestCount", value)} options={["Under 50", "50-150", "150+"]} />
            <Select label="Photography style" value={form.photographyStyle} onChange={(value) => update("photographyStyle", value)} options={["Romantic/Editorial", "Documentary/Candid", "Fine Art/Moody", "Bright & Airy"]} />
            <Input label="Ceremony time" value={form.ceremonyTime} onChange={(value) => update("ceremonyTime", value)} />
            <Input label="Coverage hours" value={form.coverageHours} onChange={(value) => update("coverageHours", value)} />
          </div>
          <label className="mt-4 block">
            <span className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted">Special moments</span>
            <textarea value={form.specialMoments} onChange={(event) => update("specialMoments", event.target.value)} rows={5} className="input min-h-32 resize-y" placeholder="First look, private vows, tea ceremony, sparkler exit..." />
          </label>

          <div className="mt-5">
            <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted">Outputs to generate</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {tabs.map(([id, label]) => (
                <label key={id} className="flex items-center gap-3 rounded border border-line bg-obsidian p-3 font-sans text-sm text-text">
                  <input type="checkbox" checked={form.outputs.includes(id)} onChange={() => toggleOutput(id)} className="accent-[#C8A97E]" />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <button onClick={generate} disabled={loading || !form.coupleNames} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-gold px-4 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-obsidian transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
            {loading ? "Generating..." : "Generate"}
          </button>
        </section>

        <section className="rounded border border-line bg-surface">
          <div className="flex flex-col justify-between gap-4 border-b border-line p-5 md:flex-row md:items-center">
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">Results</p>
              <h2 className="mt-2 font-serif text-3xl text-text">{result ? form.coupleNames : "No wedding generated yet"}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={downloadPdf} disabled={!result} className="btn-outline"><Download size={16} /> Download PDF</button>
              <button onClick={saveWedding} disabled={!result} className="btn-outline"><Save size={16} /> Save Wedding</button>
              <button onClick={generate} disabled={!result || loading} className="btn-outline"><RefreshCcw size={16} /> Regenerate</button>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto border-b border-line p-3">
            {tabs.map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)} className={activeTab === id ? "tab-active" : "tab-idle"}>
                {label}
              </button>
            ))}
          </div>
          <div className="max-h-[720px] overflow-y-auto p-5">
            {result ? <ResultTab activeTab={activeTab} result={result} /> : <EmptyResults />}
          </div>
        </section>
      </div>
    </>
  );
}

function ResultTab({ activeTab, result }) {
  if (activeTab === "timeline") {
    return (
      <div className="space-y-3">
        {result.timeline?.map((item, index) => (
          <article key={`${item.time}-${index}`} className="grid gap-3 rounded border border-line bg-obsidian p-4 md:grid-cols-[96px_1fr_100px]">
            <span className="font-sans text-sm font-semibold text-gold">{item.time}</span>
            <div>
              <h3 className="font-serif text-xl text-text">{item.event}</h3>
              <p className="mt-1 font-sans text-sm leading-6 text-muted">{item.note}</p>
            </div>
            <span className="font-sans text-sm text-muted">{item.duration}</span>
          </article>
        ))}
      </div>
    );
  }

  if (activeTab === "secondShooterBrief") {
    return <LongText title="Second Shooter Brief" text={result.secondShooterBrief} />;
  }

  if (activeTab === "clientEmail") {
    return <LongText title="Client Prep Email" text={result.clientEmail} />;
  }

  return (
    <div className="space-y-5">
      {result.shotList?.map((category) => (
        <article key={category.category} className="rounded border border-line bg-obsidian p-4">
          <h3 className="font-serif text-2xl text-gold">{category.category}</h3>
          <ul className="mt-4 grid gap-2">
            {category.shots?.map((shot, index) => (
              <li key={`${shot}-${index}`} className="flex gap-3 border-t border-line pt-2 font-sans text-sm leading-6 text-text">
                <span className="text-muted">{index + 1}.</span>
                <span>{shot}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

function LongText({ title, text }) {
  return (
    <article className="rounded border border-line bg-obsidian p-5">
      <h3 className="font-serif text-2xl text-gold">{title}</h3>
      <p className="mt-4 whitespace-pre-line font-sans text-sm leading-7 text-text">{text}</p>
    </article>
  );
}

function EmptyResults() {
  return (
    <div className="grid min-h-80 place-items-center rounded border border-dashed border-line bg-obsidian p-8 text-center">
      <div>
        <p className="font-serif text-3xl text-text">Ready when you are.</p>
        <p className="mt-3 max-w-sm font-sans text-sm leading-6 text-muted">
          Generate a wedding pack to view the shot list, timeline, second shooter brief, and client email.
        </p>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required = false }) {
  return (
    <label className="block">
      <span className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</span>
      <input type={type} value={value} required={required} onChange={(event) => onChange(event.target.value)} className="input" />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="input">
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function PdfDocument({ title, activeTab, result }) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.kicker}>ShotlistAI</Text>
        <Text style={pdfStyles.title}>{title}</Text>
        <PdfContent activeTab={activeTab} result={result} />
      </Page>
    </Document>
  );
}

function PdfContent({ activeTab, result }) {
  if (activeTab === "timeline") {
    return result.timeline?.map((item, index) => (
      <Text key={index} style={pdfStyles.line}>{item.time} - {item.event} ({item.duration}){"\n"}{item.note}</Text>
    ));
  }

  if (activeTab === "secondShooterBrief") {
    return <Text style={pdfStyles.body}>{result.secondShooterBrief}</Text>;
  }

  if (activeTab === "clientEmail") {
    return <Text style={pdfStyles.body}>{result.clientEmail}</Text>;
  }

  return result.shotList?.map((category) => (
    <Text key={category.category} style={pdfStyles.line}>
      {category.category}{"\n"}{category.shots?.map((shot, index) => `${index + 1}. ${shot}`).join("\n")}
    </Text>
  ));
}

const pdfStyles = StyleSheet.create({
  page: { padding: 36, fontFamily: "Helvetica", color: "#1A1915" },
  kicker: { fontSize: 10, letterSpacing: 2, color: "#8F6A38", marginBottom: 10 },
  title: { fontSize: 24, marginBottom: 22 },
  line: { fontSize: 11, lineHeight: 1.45, marginBottom: 14 },
  body: { fontSize: 12, lineHeight: 1.55 }
});

function labelForTab(tab) {
  return tabs.find(([id]) => id === tab)?.[1] || "Output";
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
