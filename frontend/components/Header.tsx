"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import clsx from "clsx";
import { Logo } from "./Logo";
import { useDemoModal } from "./DemoModal";

const NAV = [
  { href: "#features", label: "Решение" },
  { href: "#ai", label: "Возможности" },
  { href: "#tech", label: "Технологии" },
  { href: "#why", label: "О проекте" },
];

export function Header() {
  const { open } = useDemoModal();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 transition",
        scrolled || menu ? "border-b border-white/10 bg-ink-950/80 backdrop-blur-lg" : "bg-transparent",
      )}
    >
      <div className="section flex h-[72px] items-center justify-between">
        <Logo />

        <nav className="hidden gap-9 md:flex" aria-label="Основная навигация">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="text-sm text-slate-300 transition hover:text-white">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={open} className="btn-primary hidden !px-5 !py-2.5 sm:inline-flex">
            Запустить демо <ArrowRight size={15} />
          </button>
          <button
            className="rounded-lg p-2 text-white md:hidden"
            aria-label={menu ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menu}
            onClick={() => setMenu((v) => !v)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {menu && (
        <nav className="section flex flex-col gap-1 pb-5 md:hidden" aria-label="Мобильная навигация">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} onClick={() => setMenu(false)} className="rounded-lg px-2 py-3 text-slate-200 hover:bg-white/5">
              {n.label}
            </a>
          ))}
          <button onClick={() => { setMenu(false); open(); }} className="btn-primary mt-2">
            Запустить демо <ArrowRight size={15} />
          </button>
        </nav>
      )}
    </header>
  );
}
