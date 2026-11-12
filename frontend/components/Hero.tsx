"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useLiveData } from "./LiveDataProvider";
import { useDemoModal } from "./DemoModal";
import MapLoader from "./map/MapLoader";
import { SEVERITY_COLOR, SOURCE_LABEL, ago } from "@/lib/format";

export function Hero() {
  const { alerts, zones } = useLiveData();
  const { open } = useDemoModal();
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => v + 1), 5000);
    return () => clearInterval(t);
  }, []);
  const a = alerts.length ? alerts[i % alerts.length] : undefined;

  return (
    <section id="top" className="relative isolate overflow-hidden pt-[72px]">
      <div className="absolute inset-0 -z-10 opacity-75 [mask-image:linear-gradient(to_right,transparent_0%,transparent_22%,black_65%)]" aria-hidden>
        <MapLoader zones={zones} alerts={alerts} center={[43.4, 50.2]} zoom={5} interactive={false} />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-950/20 via-transparent to-ink-950" aria-hidden />

      <div className="section grid min-h-[680px] items-center gap-12 py-20 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <h1 className="font-display text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-[3.4rem]">
            CASGUARD <span className="text-gradient">Каспия</span>
          </h1>
          <p className="mt-6 max-w-lg text-xl font-semibold leading-snug text-white sm:text-2xl">
            ИИ-система раннего предупреждения для дельтовых и морских ООПТ
          </p>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-slate-400">
            Объединяем данные со спутников, датчиков и аудио, чтобы защитить уникальную природу Каспийского моря от
            браконьерства и загрязнений.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <button onClick={open} className="btn-primary">
              Запустить демо <ArrowRight size={16} />
            </button>
            <a href="#features" className="btn-ghost">Узнать больше</a>
          </div>
        </div>

        {a && (
          <button
            key={a.id}
            onClick={open}
            aria-live="polite"
            className="group w-full max-w-sm justify-self-start rounded-xl border border-white/10 bg-ink-950/85 p-5 text-left backdrop-blur-md [animation:slideIn_.5s_ease-out] hover:border-mint-400/40 lg:justify-self-end"
            style={{ borderLeft: `3px solid ${SEVERITY_COLOR[a.severity]}` }}
          >
            <p className="text-xs text-slate-400">
              {SOURCE_LABEL[a.source]} · {ago(a.created_at)}
            </p>
            <p className="mt-2 text-lg font-semibold leading-snug text-white">{a.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{a.description}</p>
            <p className="mt-4 text-sm font-medium text-mint-400 group-hover:underline">Разобрать в демо</p>
          </button>
        )}
      </div>
    </section>
  );
}
