import Link from "next/link";
import { Clock, Download, FileText, Mail, MapPin, Sparkles, Users } from "lucide-react";
import { PricingToggle } from "@/components/PricingToggle";
import { LandingNavbar } from "@/components/LandingNavbar";

const features = [
  ["Shot List Generator", "10+ clean categories with priority moments, details, family, ceremony, reception, and exits.", FileText],
  ["Day-Of Timeline", "A realistic coverage schedule with buffers, transition time, and second shooter ownership.", Clock],
  ["Second Shooter Brief", "Clear responsibilities, angles, VIP priorities, and reception coverage notes.", Users],
  ["Client Prep Email", "A warm email that tells couples exactly what to prepare before coverage begins.", Mail],
  ["PDF Export", "Download polished documents your team can print, share, or bring on the wedding day.", Download],
  ["Venue-Specific Mode", "Shot lists adapt to churches, gardens, ballrooms, barns, beaches, and rooftops.", MapPin]
];

const painPoints = [
  "2-4 hours building timelines per wedding",
  "Second shooter briefs written from memory",
  "Generic shot lists that miss venue-specific moments"
];

const testimonials = [
  {
    name: "Elena Brooks",
    role: "Editorial wedding photographer",
    quote: "ShotlistAI took a prep workflow I used to dread and turned it into a 10-minute review.",
    initials: "EB"
  },
  {
    name: "Marcus Vale",
    role: "Documentary photographer",
    quote: "The second shooter brief alone saved my team from three separate planning calls.",
    initials: "MV"
  },
  {
    name: "Priya Shah",
    role: "Fine art photographer",
    quote: "It feels built by someone who understands wedding days, not another generic AI wrapper.",
    initials: "PS"
  }
];

const faqs = [
  ["Does ShotlistAI replace my creative direction?", "No. It gives you a complete planning draft so you can spend your energy refining the vision instead of starting from zero."],
  ["Can I use it for different venue types?", "Yes. The form captures venue type, guest count, style, timing, and special moments so the output is tailored to the day."],
  ["Is the free plan actually useful?", "Yes. Free users can generate one shot list per month, which is enough to test the workflow before upgrading."],
  ["Do clients see the AI output?", "Only if you share it. You can copy, export, or edit the output before sending anything to a couple or second shooter."],
  ["Are API keys exposed to users?", "No. AI generation, billing operations, Supabase admin operations, and email sending happen server-side."]
];

export default function LandingPage() {
  return (
    <main className="luxury-shell min-h-screen overflow-hidden">
      <LandingNavbar />
      <section className="mx-auto grid w-full max-w-7xl gap-14 px-5 pb-24 pt-16 md:grid-cols-[0.95fr_1.05fr] md:px-8 md:pt-24">
        <div className="flex flex-col justify-center">
          <p className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.24em] text-gold">
            AI planning assistant for wedding photographers
          </p>
          <h1 className="font-serif text-5xl leading-[0.95] text-text md:text-7xl">
            Stop building shot lists from scratch.
          </h1>
          <p className="mt-7 max-w-xl font-sans text-lg leading-8 text-muted">
            Generate complete wedding shot lists, day-of timelines, second shooter briefs, and client prep emails from one 60-second form.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="inline-flex min-h-12 items-center justify-center rounded-sm bg-gold px-6 font-sans text-sm font-semibold uppercase tracking-[0.16em] text-obsidian transition hover:opacity-90">
              Generate Your First Shot List Free
            </Link>
          </div>
        </div>
        <AppMockup />
      </section>

      <Section id="features" kicker="The Problem" title="Wedding prep should not consume your editing day.">
        <div className="grid gap-4 md:grid-cols-3">
          {painPoints.map((point) => (
            <article key={point} className="rounded border border-line bg-surface p-6">
              <div className="mb-5 h-px w-12 bg-gold" />
              <h3 className="font-serif text-2xl leading-tight text-text">{point}</h3>
            </article>
          ))}
        </div>
      </Section>

      <Section kicker="How It Works" title="From brief to shoot-ready documents in three steps.">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["01", "Fill a 60-second form", "Add venue, timing, style, coverage, and the moments that matter."],
            ["02", "AI generates your full pack", "Shot list, timeline, second shooter brief, and client email are created together."],
            ["03", "Download, share, shoot", "Save the wedding, export the right tab, and walk in with a plan."]
          ].map(([step, title, body]) => (
            <article key={step} className="rounded border border-line bg-[#141310] p-6">
              <span className="font-serif text-4xl text-gold">{step}</span>
              <h3 className="mt-5 font-serif text-2xl text-text">{title}</h3>
              <p className="mt-3 font-sans text-sm leading-6 text-muted">{body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section kicker="Features" title="Built for the details photographers actually need.">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map(([title, body, Icon]) => (
            <article key={title} className="rounded border border-line bg-surface p-6">
              <Icon className="mb-5 text-gold" size={24} />
              <h3 className="font-serif text-2xl text-text">{title}</h3>
              <p className="mt-3 font-sans text-sm leading-6 text-muted">{body}</p>
            </article>
          ))}
        </div>
      </Section>

      <PricingToggle />

      <Section kicker="Testimonials" title="Photographers want time back before the wedding day.">
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="rounded border border-line bg-surface p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-gold font-serif text-lg text-obsidian">{item.initials}</div>
                <div>
                  <h3 className="font-sans text-sm font-semibold text-text">{item.name}</h3>
                  <p className="font-sans text-xs text-muted">{item.role}</p>
                </div>
              </div>
              <p className="font-serif text-xl leading-8 text-text">&ldquo;{item.quote}&rdquo;</p>
            </article>
          ))}
        </div>
      </Section>

      <Section kicker="FAQ" title="The practical details.">
        <div className="mx-auto grid max-w-4xl gap-3">
          {faqs.map(([question, answer]) => (
            <details key={question} className="group rounded border border-line bg-surface p-5">
              <summary className="cursor-pointer list-none font-serif text-xl text-text">{question}</summary>
              <p className="mt-3 font-sans text-sm leading-6 text-muted">{answer}</p>
            </details>
          ))}
        </div>
      </Section>

      <Footer />
    </main>
  );
}

function AppMockup() {
  return (
    <div className="gold-ring relative rounded-lg border border-line bg-surface p-4 md:p-6">
      <div className="rounded border border-line bg-obsidian">
        <div className="flex items-center justify-between border-b border-line p-4">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold">Generated pack</p>
            <h2 className="mt-1 font-serif text-2xl text-text">Maya & Jordan</h2>
          </div>
          <div className="rounded-sm bg-gold px-3 py-2 font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-obsidian">PDF</div>
        </div>
        <div className="grid gap-4 p-4 md:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            {["Getting Ready", "Ceremony", "Family Formals", "Golden Hour", "Reception"].map((label) => (
              <div key={label} className="rounded border border-line bg-[#141310] p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles size={14} className="text-gold" />
                  <span className="font-sans text-xs font-semibold text-text">{label}</span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 rounded bg-[#3A352D]" />
                  <div className="h-2 w-4/5 rounded bg-[#3A352D]" />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded border border-line bg-[#141310] p-4">
            <h3 className="font-serif text-xl text-text">Day Timeline</h3>
            <div className="mt-5 space-y-4">
              {["12:00 Details", "2:15 First look", "4:00 Ceremony", "6:30 Toasts"].map((time) => (
                <div key={time} className="grid grid-cols-[74px_1fr] gap-3 border-b border-line pb-3 last:border-0">
                  <span className="font-sans text-xs text-gold">{time.split(" ")[0]}</span>
                  <div>
                    <p className="font-sans text-sm text-text">{time.slice(6)}</p>
                    <p className="mt-1 font-sans text-xs text-muted">Lead and second shooter notes included.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ id, kicker, title, children }) {
  return (
    <section id={id} className="mx-auto w-full max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <div className="mb-10 max-w-3xl">
        <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.22em] text-gold">{kicker}</p>
        <h2 className="font-serif text-4xl leading-tight text-text md:text-5xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line px-5 py-10 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <p className="font-serif text-2xl text-text">ShotlistAI</p>
          <p className="mt-1 font-sans text-sm text-muted">AI planning tools for wedding photographers.</p>
        </div>
        <div className="flex flex-wrap gap-5 font-sans text-sm text-muted">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <Link href="/login">Login</Link>
          <span>© {new Date().getFullYear()} ShotlistAI</span>
        </div>
      </div>
    </footer>
  );
}
