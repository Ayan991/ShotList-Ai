"use client";

export function Toast({ message, type = "info", onClose }) {
  if (!message) return null;

  return (
    <div className="fixed right-4 top-4 z-50 max-w-sm rounded border border-line bg-surface p-4 shadow-editorial">
      <div className="flex gap-4">
        <p className={type === "error" ? "font-sans text-sm text-clay" : "font-sans text-sm text-text"}>
          {message}
        </p>
        <button className="text-muted hover:text-gold" onClick={onClose} aria-label="Close toast">
          ×
        </button>
      </div>
    </div>
  );
}
