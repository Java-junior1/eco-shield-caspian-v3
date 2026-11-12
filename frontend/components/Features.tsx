"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AudioLines, Droplets, Satellite } from "lucide-react";
import { useLiveData } from "./LiveDataProvider";
import MapLoader from "./map/MapLoader";
import { AlertDetail } from "./AlertDetail";

const ITEMS = [
  { icon: Satellite, src: "satellite", title: "Спутник", text: "Ищет на снимках линии поплавков и пятна на воде — то, что с катера не разглядеть." },
  { icon: AudioLines, src: "acoustic", title: "Акустические буи", text: "Слышат мотор и выстрел за километры и отличают их от шума волн и крика чаек." },
  { icon: Droplets, src: "iot", title: "Датчики воды", text: "Следят за уровнем и солёностью: резкий скачок часто значит сброс или аварию." },
] as const;

function StatusRing({ value }: { value: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <svg width="76" height="76" viewBox="0 0 76 76" role="img" aria-label={`Экологический статус ${value}%`}>
      <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
      <circle
        cx="38" cy="38" r={r} fill="none" stroke="#3EE6C8" strokeWidth="7" strokeLinecap="round"
        strokeDasharray={`${(c * value) / 100} ${c}`} transform="rotate(-90 38 38)"
      />
      <text x="38" y="43" textAnchor="middle" className="fill-white text-[17px] font-bold">{value}%</text>
    </svg>
  );
}

export function Features() {
  const { alerts, zones, status, forecast, live } = useLiveData();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // по умолчанию подсвечиваем самый свежий критичный алерт
  useEffect(() => {
    if (selectedId === "" || (selectedId && alerts.some((a) => a.id === selectedId))) return;
    const first = alerts.find((a) => a.severity === "critical") ?? alerts[0];
    setSelectedId(first?.id ?? null);
  }, [alerts, selectedId]);

  const selected = alerts.find((a) => a.id === selectedId);

  return (
    <section id="features" className="section scroll-mt-20 py-20">
      <div className="grid items-start gap-10 lg:grid-cols-[0.8fr_1.6fr]">
        <div>
          <p className="eyebrow">Три источника, одна карта</p>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-white">
            Дашборд инспектора с картой ООПТ
          </h2>
          <p className="mt-4 max-w-sm leading-relaxed text-slate-400">
            Нажмите на любую точку: система расскажет, что именно она услышала или увидела и насколько в этом уверена.
          </p>

          <ul className="mt-8 divide-y divide-white/10 border-y border-white/10">
            {ITEMS.map(({ icon: Icon, src, title, text }) => (
              <li key={title} className="flex gap-4 py-4">
                <Icon size={20} className="mt-0.5 shrink-0 text-mint-400" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    {title} <span className="ml-1 font-normal text-slate-500">сигналов: {alerts.filter((a) => a.source === src).length}</span>
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-400">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* превью дашборда инспектора */}
        <div className="glass overflow-hidden p-3 shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between px-2 pb-3 pt-1 text-sm">
            <span className="font-semibold text-white">Дашборд инспектора</span>
            <span className="flex items-center gap-2 text-xs text-slate-300">
              <span className={`h-2 w-2 rounded-full ${live ? "bg-mint-400" : "bg-slate-500"}`} />
              {live ? "Онлайн" : "Демо-данные"}
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-[1.6fr_1fr]">
            <div className="relative h-[340px] overflow-hidden rounded-xl md:h-[400px]">
              <MapLoader
                zones={zones}
                alerts={alerts}
                center={[45.2, 49.2]}
                zoom={6}
                interactive
                selectedId={selectedId}
                onSelect={(a) => setSelectedId(a.id)}
              />
              {selected && (
                <div className="absolute bottom-3 left-3 right-3 z-[500] sm:right-auto sm:w-72">
                  <AlertDetail
                    alert={selected}
                    zone={zones.find((z) => z.id === selected.zone_id)}
                    compact
                    onClose={() => setSelectedId("")}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="rounded-xl border border-white/10 bg-ink-900/70 p-4">
                <p className="text-xs text-slate-400">Экологический статус</p>
                <div className="mt-2 flex items-center gap-4">
                  <StatusRing value={status.score} />
                  <div>
                    <p className="font-semibold text-white">{status.label}</p>
                    <p className="text-xs text-mint-400">
                      {status.trend_pct >= 0 ? "↑" : "↓"} {status.trend_pct >= 0 ? "+" : ""}
                      {status.trend_pct}%
                    </p>
                  </div>
                </div>
                <div className="mt-2 h-14">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={status.series} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gStatus" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3EE6C8" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#3EE6C8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
                      <Area type="monotone" dataKey="score" stroke="#3EE6C8" strokeWidth={2} fill="url(#gStatus)" isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex-1 rounded-xl border border-white/10 bg-ink-900/70 p-4">
                <p className="text-xs text-slate-400">Прогноз на {forecast.horizon_days} дней</p>
                <div className="mt-2 h-[150px] md:h-[170px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecast.points} margin={{ top: 6, right: 4, left: -24, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gSpawn" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6D8BFF" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#6D8BFF" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gSeal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7C5CFF" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#7C5CFF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" tick={{ fill: "#8aa0bf", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: "#8aa0bf", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: "#081835", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, fontSize: 12 }}
                        labelStyle={{ color: "#fff" }}
                      />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      <Area type="monotone" name="Нерест рыб" dataKey="spawning" stroke="#6D8BFF" strokeWidth={2} fill="url(#gSpawn)" />
                      <Area type="monotone" name="Миграция тюленя" dataKey="seal_migration" stroke="#7C5CFF" strokeWidth={2} fill="url(#gSeal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
