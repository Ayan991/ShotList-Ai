"use client";

import { useState } from "react";

const tabs = [
  ["shotList", "Shot List"],
  ["timeline", "Timeline"],
  ["secondShooterBrief", "Second Shooter Brief"],
  ["clientEmail", "Client Email"]
];

export function SavedWeddingViewer({ result }) {
  const [activeTab, setActiveTab] = useState("shotList");

  return (
    <section className="rounded border border-line bg-surface">
      <div className="flex gap-2 overflow-x-auto border-b border-line p-3">
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} className={activeTab === id ? "tab-active" : "tab-idle"}>
            {label}
          </button>
        ))}
      </div>
      <div className="p-5">
        {activeTab === "timeline" && (
          <div className="space-y-3">
            {result.timeline?.map((item, index) => (
              <article key={index} className="rounded border border-line bg-obsidian p-4">
                <p className="font-sans text-sm text-gold">{item.time} · {item.duration}</p>
                <h3 className="mt-2 font-serif text-2xl text-text">{item.event}</h3>
                <p className="mt-2 font-sans text-sm leading-6 text-muted">{item.note}</p>
              </article>
            ))}
          </div>
        )}
        {activeTab === "secondShooterBrief" && <LongText title="Second Shooter Brief" text={result.secondShooterBrief} />}
        {activeTab === "clientEmail" && <LongText title="Client Email" text={result.clientEmail} />}
        {activeTab === "shotList" && (
          <div className="space-y-5">
            {result.shotList?.map((category) => (
              <article key={category.category} className="rounded border border-line bg-obsidian p-4">
                <h3 className="font-serif text-2xl text-gold">{category.category}</h3>
                <ul className="mt-4 space-y-2">
                  {category.shots?.map((shot, index) => (
                    <li key={index} className="font-sans text-sm leading-6 text-text">{index + 1}. {shot}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
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
