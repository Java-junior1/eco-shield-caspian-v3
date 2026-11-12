import { ArrowRight, Leaf, ShieldCheck, Sprout } from "lucide-react";

const POINTS = [
  { icon: Leaf, text: "Защита каспийского тюленя и осетровых" },
  { icon: ShieldCheck, text: "Предотвращение загрязнений" },
  { icon: Sprout, text: "Сохранение биоразнообразия региона" },
];

export function WhySection() {
  return (
    <section id="why" className="relative mt-16 scroll-mt-20 overflow-hidden py-20">
      {/* Положите фото в public/images/seal.jpg — оно подставится автоматически */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-[position:70%_center] opacity-70"
        style={{ backgroundImage: "url(/images/seal.jpg)" }}
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950 via-ink-950/70 to-sea-500/20" aria-hidden />
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-ink-900 to-sea-500/30" aria-hidden />

      <div className="section grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="eyebrow">Почему это важно</p>
          <h2 className="mt-3 text-4xl font-bold leading-tight text-white sm:text-5xl">
            Сохраняем
            <br />
            уникальную природу
            <br />
            Каспийского региона
          </h2>
          <p className="mt-5 max-w-md text-slate-300">
            Эко-Щит Каспия помогает оперативно предотвращать угрозы, сохраняя редкие виды и экосистему моря.
          </p>
          <a href="#tech" className="btn-ghost mt-8 !border-mint-400/50 !text-mint-300">
            Узнать больше о проекте <ArrowRight size={15} />
          </a>
        </div>

        <ul className="space-y-4 lg:justify-self-end">
          {POINTS.map(({ icon: Icon, text }) => (
            <li key={text} className="glass flex items-center gap-4 p-4 lg:w-[340px]">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-mint-400/10 text-mint-400 ring-1 ring-mint-400/30">
                <Icon size={22} />
              </span>
              <span className="text-sm font-medium text-white">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
