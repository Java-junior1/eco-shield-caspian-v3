"use client";

import { ArrowRight, Boxes, Database, Rocket, ScanSearch, Smartphone, Zap } from "lucide-react";
import { useDemoModal } from "./DemoModal";

const STACK = [
  { icon: Zap, name: "FastAPI" },
  { icon: Smartphone, name: "KMM" },
  { icon: Rocket, name: "Next.js" },
  { icon: Database, name: "PostgreSQL" },
  { icon: ScanSearch, name: "YOLOv8" },
  { icon: Boxes, name: "Docker" },
];

export function TechCta() {
  const { open } = useDemoModal();
  return (
    <section id="tech" className="section scroll-mt-20 pb-20">
      <div className="glass grid overflow-hidden lg:grid-cols-[1.2fr_1fr]">
        <div className="p-7">
          <h2 className="text-lg font-bold text-white">Технологии</h2>
          <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-4">
            {STACK.map(({ icon: Icon, name }) => (
              <li key={name} className="flex items-center gap-2.5 text-sm text-slate-200">
                <Icon size={22} className="text-mint-400" /> {name}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative border-t border-white/10 bg-gradient-to-br from-transparent to-mint-400/15 p-7 lg:border-l lg:border-t-0">
          <h2 className="text-xl font-bold text-white">Вместе мы можем больше для природы Каспия</h2>
          <p className="mt-2 text-sm text-slate-400">Присоединяйтесь к миссии по сохранению уникального моря.</p>
          <button onClick={open} className="btn-primary mt-5 !py-2.5">
            Запустить демо <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}
