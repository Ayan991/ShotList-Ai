"use client";

import { useMemo, useState } from "react";
import { Clipboard, Download, Loader2, Mail, RefreshCcw, Save, Wand2 } from "lucide-react";
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
  const [pdfLoading, setPdfLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [sendToEmail, setSendToEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(!profile?.onboarded);

  const isUnlimited = profile?.plan === "pro" || profile?.plan === "studio";
  const usedCount = usage?.count || 0;
  const usagePct = Math.min(100, Math.round((usedCount / 1) * 100));
  const nextResetDate = useMemo(() => {
    const d = new Date();
    const nextMonth = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
    return nextMonth.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  }, []);
  const shotCount = result?.shotList?.reduce((a, c) => a + c.shots.length, 0) ?? 0;
  const timelineCount = result?.timeline?.length ?? 0;

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
      setShowEmailForm(false);
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

  async function handleUpgrade(plan = "pro") {
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
    }
  }

  async function completeOnboarding() {
    setShowOnboarding(false);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboarded: true })
      });
      if (!response.ok) throw new Error("Could not save onboarding state.");
    } catch (error) {
      console.warn("[ShotlistAI] Onboarding state save failed:", error);
    }
  }

  async function sendClientEmail() {
    if (!weddingId || !sendToEmail || !result?.clientEmail) return;
    setSendingEmail(true);
    try {
      const response = await fetch("/api/send-client-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weddingId, to: sendToEmail, content: result.clientEmail })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Email failed.");
      setToast({ type: "success", message: `Email sent to ${sendToEmail}` });
      setShowEmailForm(false);
      setSendToEmail("");
    } catch (error) {
      setToast({ type: "error", message: error.message });
    } finally {
      setSendingEmail(false);
    }
  }

  async function downloadPdf() {
    if (!result) return;
    setPdfLoading(true);
    try {
      const { pdf, Document, Page, Text, StyleSheet } = await import("@react-pdf/renderer");
      const styles = StyleSheet.create({
        page: { padding: 36, fontFamily: "Helvetica", color: "#1A1915" },
        kicker: { fontSize: 10, letterSpacing: 2, color: "#8F6A38", marginBottom: 10 },
        title: { fontSize: 24, marginBottom: 22 },
        line: { fontSize: 11, lineHeight: 1.45, marginBottom: 14 },
        body: { fontSize: 12, lineHeight: 1.55 }
      });
      const blob = await pdf(
        <Document>
          <Page size="A4" style={styles.page}>
            <Text style={styles.kicker}>ShotlistAI</Text>
            <Text style={styles.title}>{`${form.coupleNames || "Wedding"} - ${labelForTab(activeTab)}`}</Text>
            <PdfContent activeTab={activeTab} result={result} styles={styles} Text={Text} />
          </Page>
        </Document>
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${slugify(form.coupleNames || "wedding")}-${activeTab}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setToast({ type: "error", message: error.message || "PDF generation failed." });
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      {showOnboarding && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-obsidian/80 p-4">
          <div className="w-full max-w-xl rounded border border-gold bg-surface p-6">
            <h2 className="font-serif text-4xl text-text">Welcome to ShotlistAI</h2>
            <ul className="mt-5 grid gap-3 font-sans text-sm leading-6 text-muted">
              <li>Fill in your wedding details in under 60 seconds.</li>
              <li>Generate your shot list, timeline, brief, and client email.</li>
              <li>Save each wedding and export polished PDFs for your team.</li>
            </ul>
            <button onClick={completeOnboarding} className="primary-button mt-6">
              Generate My First Shot List →
            </button>
          </div>
        </div>
      )}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">New Wedding</p>
          <h1 className="mt-3 font-serif text-4xl text-text md:text-5xl">Generate a shoot-ready plan.</h1>
        </div>
        <div className="rounded border border-line bg-surface px-4 py-3">
          {isUnlimited ? (
            <div className="flex items-center gap-3">
              <span className="inline-flex rounded-sm bg-green-700 px-2 py-1 font-sans text-xs text-white">Unlimited plan</span>
              <span className="font-sans text-sm text-muted">{usedCount} weddings generated</span>
            </div>
          ) : (
            <div>
              <p className="font-sans text-sm text-text">{usedCount} of 1 weddings used this month</p>
              <div className="mt-2 h-[6px] w-56 rounded bg-obsidian">
                <div className="h-[6px] rounded bg-gold" style={{ width: `${usagePct}%` }} />
              </div>
              <p className="mt-2 font-sans text-xs text-muted">Resets on {nextResetDate}</p>
            </div>
          )}
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
              {result ? (
                <p className="mt-1 font-sans text-xs text-muted">{shotCount} shots · {timelineCount} timeline blocks</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={downloadPdf} disabled={!result || pdfLoading} className="btn-outline">
                {pdfLoading ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />} Download PDF
              </button>
              {activeTab === "clientEmail" && result ? (
                <button onClick={() => setShowEmailForm((v) => !v)} className="btn-outline">
                  <Mail size={16} /> Send to Client
                </button>
              ) : null}
              <button onClick={saveWedding} disabled={!result} className="btn-outline"><Save size={16} /> Save Wedding</button>
              <button onClick={generate} disabled={!result || loading} className="btn-outline"><RefreshCcw size={16} /> Regenerate</button>
            </div>
          </div>
          {showEmailForm && activeTab === "clientEmail" && result ? (
            <div className="border-b border-line p-4">
              <div className="flex flex-col gap-2 md:flex-row">
                <input
                  type="email"
                  value={sendToEmail}
                  onChange={(e) => setSendToEmail(e.target.value)}
                  placeholder="Client email address"
                  className="input"
                />
                <button onClick={sendClientEmail} disabled={sendingEmail || !sendToEmail} className="primary-button">
                  {sendingEmail ? <Loader2 className="animate-spin" size={16} /> : "Send"}
                </button>
              </div>
            </div>
          ) : null}
          <div className="flex gap-2 overflow-x-auto border-b border-line p-3">
            {tabs.map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)} className={activeTab === id ? "tab-active" : "tab-idle"}>
                {label}
              </button>
            ))}
          </div>
          <div className="max-h-[720px] overflow-y-auto p-5">
            {result ? (
              <ResultTab
                activeTab={activeTab}
                result={result}
                profile={profile}
                handleUpgrade={handleUpgrade}
              />
            ) : (
              <EmptyResults />
            )}
          </div>
        </section>
      </div>
    </>
  );
}

function ResultTab({ activeTab, result, profile, handleUpgrade }) {
  const isLocked = profile?.plan === "free" && ["timeline", "secondShooterBrief", "clientEmail"].includes(activeTab);
  const tabLabel = labelForTab(activeTab);
  if (isLocked && result) {
    return (
      <div className="grid min-h-64 place-items-center rounded border border-dashed border-gold/30 bg-obsidian p-8 text-center">
        <div>
          <p className="font-serif text-3xl text-text">Unlock {tabLabel}</p>
          <p className="mt-3 max-w-sm font-sans text-sm leading-6 text-muted">
            Upgrade to Pro to access timelines, second shooter briefs, and client prep emails.
          </p>
          <button onClick={() => handleUpgrade("pro")} className="primary-button mt-6">
            Upgrade to Pro — $29/mo →
          </button>
        </div>
      </div>
    );
  }

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
  const [copied, setCopied] = useState(false);

  async function copyText() {
    await navigator.clipboard.writeText(text || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <article className="rounded border border-line bg-obsidian p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-2xl text-gold">{title}</h3>
        <button onClick={copyText} className="btn-outline">
          <Clipboard size={16} /> {copied ? "Copied!" : "Copy"}
        </button>
      </div>
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

function PdfContent({ activeTab, result, styles, Text }) {
  if (activeTab === "timeline") {
    return result.timeline?.map((item, index) => (
      <Text key={index} style={styles.line}>{item.time} - {item.event} ({item.duration}){"\n"}{item.note}</Text>
    ));
  }

  if (activeTab === "secondShooterBrief") {
    return <Text style={styles.body}>{result.secondShooterBrief}</Text>;
  }

  if (activeTab === "clientEmail") {
    return <Text style={styles.body}>{result.clientEmail}</Text>;
  }

  return result.shotList?.map((category) => (
    <Text key={category.category} style={styles.line}>
      {category.category}{"\n"}{category.shots?.map((shot, index) => `${index + 1}. ${shot}`).join("\n")}
    </Text>
  ));
}

function labelForTab(tab) {
  return tabs.find(([id]) => id === tab)?.[1] || "Output";
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
