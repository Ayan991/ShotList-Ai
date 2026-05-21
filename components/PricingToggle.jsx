"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  ["Free", 0, "1 wedding/month, shot list only", ["1 wedding/month", "Shot list only", "Saved history"]],
  ["Pro", 29, "Unlimited weddings, all outputs, PDF export", ["Unlimited weddings", "Shot list, timeline, briefs, emails", "PDF export"]],
  ["Studio", 59, "Everything + white-label PDFs + team seats", ["Everything in Pro", "White-label PDFs", "Team seats"]]
];

export function PricingToggle() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="mx-auto w-full max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.22em] text-gold">Pricing</p>
          <h2 className="font-serif text-4xl text-text md:text-5xl">Start free. Upgrade when it saves the day.</h2>
        </div>
        <button
          onClick={() => setAnnual((current) => !current)}
          className="rounded-full border border-line bg-surface p-1 font-sans text-xs text-muted"
          aria-pressed={annual}
        >
          <span className={!annual ? "inline-block rounded-full bg-gold px-4 py-2 font-semibold text-obsidian" : "inline-block px-4 py-2"}>
            Monthly
          </span>
          <span className={annual ? "inline-block rounded-full bg-gold px-4 py-2 font-semibold text-obsidian" : "inline-block px-4 py-2"}>
            Annual saves 20%
          </span>
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map(([name, monthlyPrice, body, items]) => {
          const price = annual && monthlyPrice ? Math.round(monthlyPrice * 0.8) : monthlyPrice;
          return (
            <article key={name} className="rounded border border-line bg-surface p-6">
              <h3 className="font-serif text-3xl text-text">{name}</h3>
              <p className="mt-3 font-serif text-4xl text-gold">
                {price === 0 ? "$0" : `$${price}/mo`}
              </p>
              {annual && price > 0 && <p className="mt-1 font-sans text-xs text-muted">Billed annually after 20% discount</p>}
              <p className="mt-3 min-h-12 font-sans text-sm leading-6 text-muted">{body}</p>
              <ul className="mt-6 space-y-3">
                {items.map((item) => (
                  <li key={item} className="flex gap-3 font-sans text-sm text-text">
                    <Check size={16} className="mt-0.5 shrink-0 text-gold" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="mt-7 inline-flex min-h-11 w-full items-center justify-center rounded-sm border border-gold px-4 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-gold transition hover:bg-gold hover:text-obsidian">
                {name === "Free" ? "Start Free" : "Choose Plan"}
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
