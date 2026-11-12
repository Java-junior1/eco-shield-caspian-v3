import { CircleCheck } from "lucide-react";

/** Декоративная акустическая спектрограмма: детерминированные «полосы», без картинок. */
function Spectrogram() {
  const cols = 28;
  const rows = 14;
  const cells = Array.from({ length: cols * rows }, (_, i) => {
    const x = i % cols;
    const y = Math.floor(i / cols);
    const band = Math.exp(-Math.pow((y - (rows * 0.62 + Math.sin(x / 3) * 2)) / 2.4, 2));
    const burst = x > 17 && x < 22 ? Math.exp(-Math.pow((y - 4) / 3, 2)) : 0;
    return Math.min(1, band * 0.9 + burst * 0.9 + ((x * 7 + y * 13) % 10) / 90);
  });
  return (
    <div className="grid h-full w-full gap-px" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }} aria-hidden>
      {cells.map((v, i) => (
        <span
          key={i}
          style={{ background: `hsl(${240 - v * 220} 90% ${12 + v * 48}%)` }}
        />
      ))}
    </div>
  );
}

const CARDS = [
  {
    title: "Аудиоанализ",
    text: "Распознавание лодок и выстрелов",
    visual: (
      <div className="h-full overflow-hidden rounded-lg">
        <Spectrogram />
      </div>
    ),
  },
  {
    title: "Computer Vision",
    text: "Поиск сетей и сбросов",
    visual: (
      <div className="relative h-full overflow-hidden rounded-lg bg-[radial-gradient(circle_at_40%_60%,#1d4a52,#0a1f2e)]">
        <div className="absolute left-[38%] top-[30%] h-[34%] w-[34%] rounded border-2 border-alert-red/90 shadow-[0_0_12px_rgba(255,90,79,.6)]" />
        <span className="absolute left-[38%] top-[20%] rounded bg-alert-red px-1 text-[9px] font-bold text-white">net 0.91</span>
      </div>
    ),
  },
  {
    title: "Предиктивная аналитика",
    text: "Прогноз миграции тюленя и нереста",
    visual: (
      <svg viewBox="0 0 120 60" className="h-full w-full rounded-lg bg-ink-900" preserveAspectRatio="none" aria-hidden>
        <polyline fill="none" stroke="#6D8BFF" strokeWidth="2.5" points="4,50 22,36 40,42 60,24 80,30 100,12 116,8" />
        <polyline fill="none" stroke="#6D8BFF" strokeWidth="1.5" strokeDasharray="3 3" opacity=".5" points="4,54 22,44 40,48 60,36 80,38 100,24 116,20" />
      </svg>
    ),
  },
];

export function AiSection() {
  return (
    <section id="ai" className="section scroll-mt-20 py-6">
      <div className="glass grid gap-6 overflow-hidden p-4 lg:grid-cols-[1fr_1.1fr_2.2fr] lg:items-center">
        {/* «лодка обнаружена» */}
        <div className="relative min-h-[200px] overflow-hidden rounded-xl bg-gradient-to-b from-sea-500/30 via-ink-800 to-ink-900">
          <svg viewBox="0 0 240 140" className="absolute inset-0 h-full w-full" aria-hidden>
            <path d="M0 95h240v45H0z" fill="rgba(42,125,225,.25)" />
            <path d="M70 88h70l12-14H92l-8-14H72z" fill="#e8eef7" opacity=".9" />
            <path d="M58 88h100l-10 12H70z" fill="#1c2b44" />
            <g stroke="#3EE6C8" strokeWidth="2" strokeLinecap="round" opacity=".9">
              {[170, 178, 186, 194, 202, 210, 218].map((x, i) => (
                <line key={x} x1={x} x2={x} y1={70 - [6, 14, 22, 10, 18, 8, 4][i]} y2={70 + [6, 14, 22, 10, 18, 8, 4][i]} />
              ))}
            </g>
          </svg>
          <div className="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-xl border border-white/10 bg-ink-950/80 p-3 backdrop-blur">
            <CircleCheck className="shrink-0 text-mint-400" size={28} />
            <p className="text-xs font-semibold leading-tight text-white">
              Браконьерская лодка
              <br />
              <span className="font-normal text-slate-400">обнаружена</span>
            </p>
          </div>
        </div>

        <div>
          <p className="eyebrow">ИИ-аналитика</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-white">
            Умные алгоритмы
            <br />
            для реальной защиты
          </h2>
          <p className="mt-3 text-sm text-slate-400">Нейросети анализируют данные и выявляют угрозы в режиме реального времени.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {CARDS.map((c) => (
            <article key={c.title} className="rounded-xl border border-white/10 bg-ink-900/60 p-3">
              <div className="h-24">{c.visual}</div>
              <h3 className="mt-3 text-sm font-semibold text-white">{c.title}</h3>
              <p className="mt-1 text-xs text-slate-400">{c.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
