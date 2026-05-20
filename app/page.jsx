"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Camera,
  Check,
  Clipboard,
  Clock3,
  Download,
  FileText,
  FolderOpen,
  Loader2,
  Printer,
  Sparkles,
  Wand2,
} from "lucide-react";

const STORAGE_KEY = "shotlistai.projects.v1";

const initialForm = {
  coupleNames: "Maya & Jordan",
  weddingDate: "",
  venueName: "",
  city: "",
  venueType: "Church ceremony + outdoor estate reception",
  guestCount: "100",
  coverageHours: "8",
  ceremonyTime: "4:00 PM",
  style: "Romantic editorial with natural candids",
  specialMoments: "Private first look, handwritten vows, sparkler exit",
  familyPriorities: "Grandparents, blended family portraits, siblings with partners",
  deliverables: ["shotList", "timeline", "secondShooter", "clientEmail"],
};

const emptyResult = {
  title: "No wedding generated yet",
  overview: "Complete the wedding brief and generate the first production-ready plan.",
  shotList: [],
  timeline: [],
  secondShooterBrief: "",
  clientPrepEmail: "",
  gearChecklist: [],
  dayOfRisks: [],
};

const sampleResult = {
  title: "Maya & Jordan Wedding Coverage Plan",
  overview:
    "A romantic editorial coverage plan built around a church ceremony, outdoor reception, emotional family moments, and a sparkler exit.",
  shotList: [
    {
      category: "Getting Ready",
      shots: [
        { shot: "Invitation suite with rings, vow books, shoes, perfume, and florals", priority: "High", note: "Use window light and a neutral surface." },
        { shot: "Bride final hair and makeup touch-ups", priority: "High", note: "Capture mirror reflection and natural reactions." },
        { shot: "Dress reveal with wedding party", priority: "Medium", note: "Keep the room uncluttered before the reveal." },
        { shot: "Groom adjusting tie, jacket, cufflinks, and boutonniere", priority: "High", note: "Photograph both wide and tight detail frames." },
      ],
    },
    {
      category: "Ceremony",
      shots: [
        { shot: "Wide church exterior and ceremony room before guest arrival", priority: "High", note: "Shoot clean establishing frames early." },
        { shot: "Partner reaction as processional begins", priority: "High", note: "Second shooter should cover this angle." },
        { shot: "Vows, ring exchange, first kiss, and recessional", priority: "High", note: "Stay ready for fast transitions." },
        { shot: "Parents and grandparents reacting during key moments", priority: "High", note: "Prioritize VIP reactions." },
      ],
    },
    {
      category: "Portraits",
      shots: [
        { shot: "Couple full-length editorial portrait at the venue entrance", priority: "High", note: "Use architecture for scale." },
        { shot: "Close romantic portraits with veil and bouquet movement", priority: "High", note: "Keep direction simple and fluid." },
        { shot: "Blended family portrait sets with grandparents seated first", priority: "High", note: "Build from smallest group to largest." },
        { shot: "Golden-hour walking sequence on the estate lawn", priority: "Medium", note: "Schedule a 10 minute sunset pullout." },
      ],
    },
    {
      category: "Reception",
      shots: [
        { shot: "Untouched reception room, tablescape, signage, cake, and bar details", priority: "High", note: "Photograph before guests enter." },
        { shot: "Grand entrance and first dance from wide and close angles", priority: "High", note: "Lead shoots couple, second shoots reactions." },
        { shot: "Toasts with speaker, couple, and parent reaction coverage", priority: "High", note: "Use long lens for reactions." },
        { shot: "Sparkler exit with full guest tunnel and tight celebration frames", priority: "High", note: "Confirm lighter timing with planner." },
      ],
    },
  ],
  timeline: [
    { time: "12:00 PM", event: "Details and getting ready", duration: "60 min", lead: "Lead", secondShooter: "Room candids", note: "Start flat lays while makeup finishes." },
    { time: "1:00 PM", event: "Solo portraits and wedding party prep", duration: "45 min", lead: "Lead", secondShooter: "Groom prep", note: "Keep one clean portrait corner." },
    { time: "1:45 PM", event: "First look and couple portraits", duration: "35 min", lead: "Lead", secondShooter: "Alternate angle", note: "Protect privacy and reactions." },
    { time: "2:30 PM", event: "Wedding party and family formals", duration: "60 min", lead: "Lead", secondShooter: "Family wrangler", note: "Photograph grandparents early." },
    { time: "4:00 PM", event: "Ceremony", duration: "45 min", lead: "Center aisle", secondShooter: "Partner/VIP reactions", note: "No flash in church unless approved." },
    { time: "5:00 PM", event: "Cocktail candids and reception details", duration: "45 min", lead: "Room details", secondShooter: "Guests", note: "Capture untouched room first." },
    { time: "6:30 PM", event: "Entrance, dinner, toasts, dances", duration: "150 min", lead: "Key events", secondShooter: "Guest reactions", note: "Stay split for reactions." },
    { time: "9:30 PM", event: "Sparkler exit", duration: "20 min", lead: "Couple close", secondShooter: "Wide tunnel", note: "Test exposure before the couple exits." },
  ],
  secondShooterBrief:
    "Cover groom prep, alternate ceremony angles, parent and grandparent reactions, and wide scene-setting frames throughout the day. During family formals, help identify blended family groupings and keep grandparents seated nearby. At the reception, prioritize guest reactions during entrances, toasts, first dances, and the sparkler exit while the lead photographer tracks the couple.",
  clientPrepEmail:
    "Hi Maya and Jordan,\n\nI am so excited for your wedding day. To keep portraits relaxed and efficient, please send a final family photo list with each person's first name, flag any sensitive family dynamics, and ask immediate family to stay nearby after the ceremony. Please also gather details like rings, vow books, shoes, invitation suite, perfume, jewelry, and any heirlooms in one place before coverage begins.\n\nFor the sparkler exit, confirm with your planner that lighters, a clear exit path, and a backup rain plan are ready. I will guide you through everything on the day, so the main goal is to stay present and enjoy it.",
  gearChecklist: ["Two camera bodies", "24-70mm", "70-200mm", "35mm or 50mm prime", "Flash kit", "Detail styling mat", "Clear umbrellas", "Extra batteries and cards"],
  dayOfRisks: [
    { risk: "Family portraits run long", prevention: "Pre-build a named list and photograph grandparents first." },
    { risk: "Reception room is opened before details are photographed", prevention: "Coordinate a 10 minute room hold with planner or venue captain." },
    { risk: "Sparkler exit is too dark or disorganized", prevention: "Set exposure early and assign planner to cue guests before couple exits." },
  ],
};

const deliverableOptions = [
  { id: "shotList", label: "Shot list" },
  { id: "timeline", label: "Timeline" },
  { id: "secondShooter", label: "Second shooter" },
  { id: "clientEmail", label: "Client email" },
];

export default function Home() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(emptyResult);
  const [activeView, setActiveView] = useState("shots");
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setProjects(JSON.parse(raw));
      } catch {
        setProjects([]);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const shotCount = useMemo(
    () => result.shotList.reduce((total, category) => total + category.shots.length, 0),
    [result],
  );

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleDeliverable = (id) => {
    setForm((current) => {
      const exists = current.deliverables.includes(id);
      return {
        ...current,
        deliverables: exists
          ? current.deliverables.filter((item) => item !== id)
          : [...current.deliverables, id],
      };
    });
  };

  const generate = async () => {
    setIsGenerating(true);
    setError("");
    setStatus("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wedding: form }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed.");
      }

      setResult(data.result);
      setActiveView("shots");
      setStatus(`Generated with ${data.provider.name} (${data.provider.model}).`);
    } catch (generationError) {
      setError(generationError.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const loadSample = () => {
    setResult(sampleResult);
    setActiveView("shots");
    setError("");
    setStatus("Loaded sample output so you can inspect the product without an API key.");
  };

  const saveProject = () => {
    const id = selectedProjectId || crypto.randomUUID();
    const nextProject = {
      id,
      name: form.coupleNames || "Untitled wedding",
      updatedAt: new Date().toISOString(),
      form,
      result,
    };
    setProjects((current) => [nextProject, ...current.filter((item) => item.id !== id)].slice(0, 12));
    setSelectedProjectId(id);
    setStatus("Project saved in this browser.");
  };

  const loadProject = (project) => {
    setSelectedProjectId(project.id);
    setForm(project.form);
    setResult(project.result);
    setActiveView("shots");
    setError("");
    setStatus(`Loaded ${project.name}.`);
  };

  const copyActiveOutput = async () => {
    const text = formatOutputForCopy(result, activeView);
    await navigator.clipboard.writeText(text);
    setStatus("Copied current output.");
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify({ form, result }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slugify(form.coupleNames || "shotlistai-wedding")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main>
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark"><Camera size={20} /></div>
          <div>
            <strong>ShotlistAI</strong>
            <span>Wedding workflow MVP</span>
          </div>
        </div>

        <nav className="side-nav" aria-label="Product sections">
          <a className="active" href="#generator"><Wand2 size={16} /> Generator</a>
          <a href="#projects"><FolderOpen size={16} /> Saved weddings</a>
          <a href="#setup"><Sparkles size={16} /> AI setup</a>
        </nav>

        <section id="projects" className="saved-panel">
          <div className="section-heading">
            <span>Saved weddings</span>
            <strong>{projects.length}</strong>
          </div>
          {projects.length === 0 ? (
            <p>No saved weddings yet. Generate a plan, then save it here.</p>
          ) : (
            <div className="project-list">
              {projects.map((project) => (
                <button key={project.id} className={selectedProjectId === project.id ? "selected" : ""} onClick={() => loadProject(project)}>
                  <span>{project.name}</span>
                  <small>{new Date(project.updatedAt).toLocaleDateString()}</small>
                </button>
              ))}
            </div>
          )}
        </section>
      </aside>

      <section className="workspace" id="generator">
        <header className="topbar">
          <div>
            <p>AI wedding production assistant</p>
            <h1>Build a client-ready shot list in minutes.</h1>
          </div>
          <div className="topbar-actions">
            <button className="ghost-btn" onClick={loadSample}><Sparkles size={16} /> Load sample</button>
            <button className="ghost-btn" onClick={saveProject}><Check size={16} /> Save</button>
          </div>
        </header>

        <div className="content-grid">
          <section className="brief-panel">
            <div className="panel-heading">
              <div>
                <p>Wedding brief</p>
                <h2>Inputs</h2>
              </div>
              <span>Free-tier AI ready</span>
            </div>

            <div className="form-grid">
              <Field label="Couple names">
                <input value={form.coupleNames} onChange={(event) => updateField("coupleNames", event.target.value)} />
              </Field>
              <Field label="Wedding date">
                <input type="date" value={form.weddingDate} onChange={(event) => updateField("weddingDate", event.target.value)} />
              </Field>
              <Field label="Venue name">
                <input placeholder="The Ivy Estate" value={form.venueName} onChange={(event) => updateField("venueName", event.target.value)} />
              </Field>
              <Field label="City / region">
                <input placeholder="Asheville, NC" value={form.city} onChange={(event) => updateField("city", event.target.value)} />
              </Field>
              <Field label="Venue type">
                <input value={form.venueType} onChange={(event) => updateField("venueType", event.target.value)} />
              </Field>
              <Field label="Guest count">
                <input inputMode="numeric" value={form.guestCount} onChange={(event) => updateField("guestCount", event.target.value)} />
              </Field>
              <Field label="Coverage hours">
                <input inputMode="numeric" value={form.coverageHours} onChange={(event) => updateField("coverageHours", event.target.value)} />
              </Field>
              <Field label="Ceremony time">
                <input value={form.ceremonyTime} onChange={(event) => updateField("ceremonyTime", event.target.value)} />
              </Field>
            </div>

            <Field label="Photography style">
              <textarea value={form.style} onChange={(event) => updateField("style", event.target.value)} />
            </Field>
            <Field label="Special moments">
              <textarea value={form.specialMoments} onChange={(event) => updateField("specialMoments", event.target.value)} />
            </Field>
            <Field label="Family priorities">
              <textarea value={form.familyPriorities} onChange={(event) => updateField("familyPriorities", event.target.value)} />
            </Field>

            <div className="deliverables">
              <span>Deliverables</span>
              <div>
                {deliverableOptions.map((item) => (
                  <button key={item.id} className={form.deliverables.includes(item.id) ? "active" : ""} onClick={() => toggleDeliverable(item.id)}>
                    {form.deliverables.includes(item.id) && <Check size={14} />}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <button className="primary-btn" onClick={generate} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="spin" size={18} /> : <Wand2 size={18} />}
              {isGenerating ? "Generating wedding plan..." : "Generate wedding plan"}
            </button>

            {error && <div className="notice error">{error}</div>}
            {status && <div className="notice success">{status}</div>}
          </section>

          <section className="output-panel">
            <div className="output-header">
              <div>
                <p>Generated plan</p>
                <h2>{result.title}</h2>
              </div>
              <div className="output-actions">
                <button title="Copy active output" onClick={copyActiveOutput}><Clipboard size={16} /></button>
                <button title="Download JSON" onClick={downloadJson}><Download size={16} /></button>
                <button title="Print" onClick={() => window.print()}><Printer size={16} /></button>
              </div>
            </div>

            <div className="metric-strip">
              <Metric icon={<Camera size={16} />} label="Shots" value={shotCount} />
              <Metric icon={<Clock3 size={16} />} label="Timeline blocks" value={result.timeline.length} />
              <Metric icon={<CalendarDays size={16} />} label="Coverage" value={`${form.coverageHours || 0} hr`} />
            </div>

            <p className="overview">{result.overview}</p>

            <div className="tabs">
              {[
                ["shots", "Shot list"],
                ["timeline", "Timeline"],
                ["brief", "Shooter brief"],
                ["email", "Client email"],
                ["ops", "Ops"],
              ].map(([id, label]) => (
                <button key={id} className={activeView === id ? "active" : ""} onClick={() => setActiveView(id)}>
                  {label}
                </button>
              ))}
            </div>

            <div className="output-scroll">
              {activeView === "shots" && <ShotList result={result} />}
              {activeView === "timeline" && <Timeline result={result} />}
              {activeView === "brief" && <Longform title="Second shooter brief" body={result.secondShooterBrief} />}
              {activeView === "email" && <Longform title="Client prep email" body={result.clientPrepEmail} preserve />}
              {activeView === "ops" && <Operations result={result} />}
            </div>
          </section>
        </div>

        <section id="setup" className="setup-panel">
          <div>
            <p>AI provider</p>
            <h2>Gemini free-tier setup</h2>
          </div>
          <ol>
            <li>Create a free Gemini API key in Google AI Studio.</li>
            <li>Copy <code>.env.example</code> to <code>.env.local</code>.</li>
            <li>Set <code>GEMINI_API_KEY</code>, then restart the dev server.</li>
          </ol>
          <p>
            The API route keeps the key server-side. Free tier limits are lower than paid tiers, so real launch still needs auth, rate limits, and usage caps.
          </p>
        </section>
      </section>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="metric">
      {icon}
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function ShotList({ result }) {
  if (!result.shotList.length) {
    return <EmptyState />;
  }

  return (
    <div className="shot-list">
      {result.shotList.map((category) => (
        <article key={category.category} className="shot-category">
          <h3>{category.category}</h3>
          <div>
            {category.shots.map((item, index) => (
              <div key={`${category.category}-${item.shot}-${index}`} className="shot-row">
                <span>{index + 1}</span>
                <div>
                  <strong>{item.shot}</strong>
                  <p>{item.note}</p>
                </div>
                <em>{item.priority}</em>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function Timeline({ result }) {
  if (!result.timeline.length) {
    return <EmptyState />;
  }

  return (
    <div className="timeline">
      {result.timeline.map((item, index) => (
        <article key={`${item.time}-${item.event}-${index}`}>
          <div className="time-block">
            <strong>{item.time}</strong>
            <span>{item.duration}</span>
          </div>
          <div>
            <h3>{item.event}</h3>
            <p>{item.note}</p>
            <small>Lead: {item.lead || "Lead photographer"} / Second: {item.secondShooter || "Support coverage"}</small>
          </div>
        </article>
      ))}
    </div>
  );
}

function Longform({ title, body, preserve = false }) {
  if (!body) {
    return <EmptyState />;
  }

  return (
    <article className="longform">
      <div className="longform-icon"><FileText size={18} /></div>
      <h3>{title}</h3>
      <p className={preserve ? "preline" : ""}>{body}</p>
    </article>
  );
}

function Operations({ result }) {
  if (!result.gearChecklist.length && !result.dayOfRisks.length) {
    return <EmptyState />;
  }

  return (
    <div className="ops-grid">
      <article>
        <h3>Gear checklist</h3>
        {result.gearChecklist.map((item) => (
          <div key={item} className="check-row"><Check size={15} /> {item}</div>
        ))}
      </article>
      <article>
        <h3>Day-of risks</h3>
        {result.dayOfRisks.map((item) => (
          <div key={item.risk} className="risk-item">
            <strong>{item.risk}</strong>
            <p>{item.prevention}</p>
          </div>
        ))}
      </article>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="empty-state">
      <Sparkles size={26} />
      <strong>Ready for generation</strong>
      <p>Add the wedding details and generate a production-ready plan.</p>
    </div>
  );
}

function formatOutputForCopy(result, activeView) {
  if (activeView === "timeline") {
    return result.timeline.map((item) => `${item.time} - ${item.event} (${item.duration})\n${item.note}`).join("\n\n");
  }

  if (activeView === "brief") {
    return result.secondShooterBrief;
  }

  if (activeView === "email") {
    return result.clientPrepEmail;
  }

  if (activeView === "ops") {
    const gear = result.gearChecklist.map((item) => `- ${item}`).join("\n");
    const risks = result.dayOfRisks.map((item) => `- ${item.risk}: ${item.prevention}`).join("\n");
    return `Gear checklist\n${gear}\n\nDay-of risks\n${risks}`;
  }

  return result.shotList
    .map((category) => `${category.category}\n${category.shots.map((item) => `- ${item.shot} (${item.priority}): ${item.note}`).join("\n")}`)
    .join("\n\n");
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "shotlistai-wedding";
}
