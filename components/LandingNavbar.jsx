"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClickOutside(event) {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function close() {
    setIsOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-obsidian/88 backdrop-blur" ref={menuRef}>
      <nav className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
        <Link href="/" className="font-serif text-2xl text-text">ShotlistAI</Link>
        <div className="hidden items-center gap-8 font-sans text-sm text-muted md:flex">
          <a href="#features" className="transition hover:text-gold">Features</a>
          <a href="#pricing" className="transition hover:text-gold">Pricing</a>
          <Link href="/login" className="transition hover:text-gold">Login</Link>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/signup" className="hidden rounded-sm bg-gold px-4 py-3 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-obsidian transition hover:opacity-90 md:inline-flex">
            Start Free Trial
          </Link>
          <button onClick={() => setIsOpen((v) => !v)} className="btn-outline md:hidden" aria-label="Open menu">
            <Menu size={18} />
          </button>
        </div>
      </nav>
      <div className={`md:hidden transition-all duration-200 ${isOpen ? "opacity-100 translate-y-0" : "pointer-events-none -translate-y-2 opacity-0"}`}>
        <div className="border-t border-line bg-surface px-5 py-4">
          <div className="grid gap-3 font-sans text-sm text-muted">
            <a href="#features" onClick={close} className="transition hover:text-gold">Features</a>
            <a href="#pricing" onClick={close} className="transition hover:text-gold">Pricing</a>
            <Link href="/login" onClick={close} className="transition hover:text-gold">Login</Link>
            <Link href="/signup" onClick={close} className="primary-button inline-flex justify-center">
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
