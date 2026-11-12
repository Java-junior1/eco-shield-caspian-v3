"use client";

import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { X } from "lucide-react";
import { Logo } from "./Logo";
import { AlertDetail } from "./AlertDetail";
import { useLiveData } from "./LiveDataProvider";
import MapLoader from "./map/MapLoader";
import { SEVERITY_COLOR, SOURCE_LABEL, ago } from "@/lib/format";
import type { Alert } from "@/lib/types";

/** Сценарии, которыми демо «оживляет» ленту, пока вы смотрите. */
const TEMPLATES: Omit<Alert, "id" | "lat" | "lon" | "created_at">[] = [
  { kind: "poacher_boat", severity: "warning", source: "acoustic", title: "Лодка с подвесным мотором у кромки заказника", description: "Класс «мотор лодки», ночью, в закрытой зоне.", zone_id: "dagestan", confidence: 0.88 },
  { kind: "illegal_net", severity: "critical", source: "satellite", title: "Линия поплавков в охранной зоне", description: "Похоже на ставные сети, вытянутые вдоль протоки.", zone_id: "volga-delta", confidence: 0.84 },
  { kind: "anomaly", severity: "info", source: "iot", title: "Солёность выросла на 2 ‰ за час", description: "Датчик у кромки зоны показал резкий скачок.", zone_id: "mangystau", confidence: 0.74 },
  { kind: "gunshot", severity: "critical", source: "acoustic", title: "Выстрел рядом с лежбищем тюленей", description: "Два импульса подряд в течение минуты.", zone_id: "mangystau", confidence: 0.94 },
];

const AUDIO_CLASSES = ["Фон", "Мотор лодки", "Выстрел", "Тюлень"];
const AUDIO_PROBS: Record<string, number[]> = {
  poacher_boat: [0.06, 0.87, 0.02, 0.05],
  gunshot: [0.03, 0.03, 0.93, 0.01],
};

function Spectrum({ active }: { active: boolean }) {
  const [bars, setBars] = useState<number[]>(() => Array(36).fill(8));
  useEffect(() => {
    if (!active) return setBars(Array(36).fill(6));
    const t = setInterval(() => setBars(Array.from({ length: 36 }, (_, i) => 10 + Math.random() * (i < 14 ? 90 : 35))), 140);
    return () => clearInterval(t);
  }, [active]);
  return (
    <div className="flex h-14 items-end gap-[2px]" aria-hidden>
      {bars.map((h, i) => <span key={i} className="flex-1 rounded-t-sm bg-mint-400/80 transition-all duration-150" style={{ height: `${h}%` }} />)}
    </div>
  );
}

export function DemoDashboard({ onClose }: { onClose: () => void }) {
  const { alerts: initial, zones, forecast } = useLiveData();
  const [alerts, setAlerts] = useState<Alert[]>(initial);
  const [selectedId, setSelectedId] = useState<string | null>(initial[0]?.id ?? null);
  const [n, setN] = useState(0);

  // каждые 9 секунд «приходит» новый сигнал, карта летит к нему
  useEffect(() => {
    const t = setInterval(() => {
      setN((k) => {
        const tpl = TEMPLATES[k % TEMPLATES.length];
        const z = zones.find((x) => x.id === tpl.zone_id) ?? zones[0];
        const lat = z.polygon.reduce((s, p) => s + p[0], 0) / z.polygon.length + (Math.random() - 0.5) * 0.15;
        const lon = z.polygon.reduce((s, p) => s + p[1], 0) / z.polygon.length + (Math.random() - 0.5) * 0.2;
        const a: Alert = { ...tpl, id: `sim-${crypto.randomUUID()}`, lat, lon, created_at: new Date().toISOString() };
        setAlerts((prev) => [a, ...prev].slice(0, 12));
        setSelectedId(a.id);
        return k + 1;
      });
    }, 9000);
    return () => clearInterval(t);
  }, [zones]);

  const selected = alerts.find((a) => a.id === selectedId);
  const crit = alerts.filter((a) => a.severity === "critical").length;
  const score = Math.max(40, 98 - crit * 5 - alerts.filter((a) => a.severity === "warning").length * 2);
  const probs = useMemo(() => (selected ? AUDIO_PROBS[selected.kind] : undefined), [selected]);

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col bg-ink-950" role="dialog" aria-modal="true" aria-label="Демо: дашборд инспектора">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4">
        <div className="flex items-center gap-4">
          <Logo />
          <span className="hidden text-sm text-slate-400 sm:inline">Дашборд инспектора · демо-данные</span>
        </div>
        <div className="flex items-center gap-5 text-sm">
          <span className="text-slate-300">Состояние зон: <b className="text-mint-400">{score}%</b></span>
          <span className="text-slate-300">Сигналов: <b className="text-white">{alerts.length}</b></span>
          <button onClick={onClose} aria-label="Закрыть демо" className="rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-white"><X size={18} /></button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[300px_1fr_340px]">
        <aside className="order-2 min-h-0 overflow-y-auto border-white/10 lg:order-1 lg:border-r" aria-label="Лента сигналов">
          <ul>
            {alerts.map((a) => (
              <li key={a.id}>
                <button
                  onClick={() => setSelectedId(a.id)}
                  className={`block w-full border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/5 ${a.id === selectedId ? "bg-white/[0.06]" : ""}`}
                  style={{ borderLeft: `3px solid ${SEVERITY_COLOR[a.severity]}` }}
                >
                  <span className="block text-sm font-medium leading-snug text-white">{a.title}</span>
                  <span className="mt-1 block text-xs text-slate-500">{SOURCE_LABEL[a.source]} · {ago(a.created_at)}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="relative order-1 min-h-[320px] lg:order-2">
          <MapLoader zones={zones} alerts={alerts} center={[44.2, 49.6]} zoom={6} interactive selectedId={selectedId} onSelect={(a) => setSelectedId(a.id)} />
        </div>

        <aside className="order-3 min-h-0 space-y-4 overflow-y-auto border-white/10 p-4 lg:border-l">
          {selected && <AlertDetail alert={selected} zone={zones.find((z) => z.id === selected.zone_id)} />}

          <section className="rounded-xl border border-white/10 bg-ink-900/70 p-4">
            <h3 className="text-sm font-semibold text-white">Что слышит буй</h3>
            <div className="mt-3"><Spectrum active={!!probs} /></div>
            {probs ? (
              <ul className="mt-3 space-y-1.5 text-xs">
                {AUDIO_CLASSES.map((c, i) => (
                  <li key={c} className="flex items-center gap-3">
                    <span className="w-24 text-slate-400">{c}</span>
                    <span className="h-1.5 flex-1 rounded-full bg-white/10"><span className="block h-full rounded-full bg-mint-400" style={{ width: `${probs[i] * 100}%` }} /></span>
                    <span className="w-8 text-right text-slate-300">{Math.round(probs[i] * 100)}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-3 text-xs text-slate-500">У этого сигнала нет аудиозаписи — выберите сигнал буя.</p>}
          </section>

          <section className="rounded-xl border border-white/10 bg-ink-900/70 p-4">
            <h3 className="text-sm font-semibold text-white">Куда ехать патрулю на этой неделе</h3>
            <div className="mt-2 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast.points} margin={{ top: 6, right: 4, left: -24, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fill: "#7C8DA3", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#7C8DA3", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#050E1F", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" name="Нерест осетровых" dataKey="spawning" stroke="#E6BE5A" fill="#E6BE5A" fillOpacity={0.15} strokeWidth={2} />
                  <Area type="monotone" name="Миграция тюленя" dataKey="seal_migration" stroke="#7C5CFF" fill="#7C5CFF" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-1 text-xs text-slate-500"><span className="text-gold-400">●</span> нерест · <span className="text-violet-500">●</span> тюлень. Чем выше линия, тем важнее патруль.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
