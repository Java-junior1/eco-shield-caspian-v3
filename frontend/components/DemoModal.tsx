"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { DemoDashboard } from "./DemoDashboard";

const DemoContext = createContext<{ open: () => void } | null>(null);

export function useDemoModal() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemoModal must be used inside <DemoModalProvider>");
  return ctx;
}

/** «Запустить демо» открывает рабочий дашборд инспектора на весь экран. */
export function DemoModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, close]);

  return (
    <DemoContext.Provider value={{ open }}>
      {children}
      {isOpen && <DemoDashboard onClose={close} />}
    </DemoContext.Provider>
  );
}
