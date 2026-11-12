import { Github, Send, Youtube } from "lucide-react";
import { Logo } from "./Logo";

const LINKS = [
  { href: "#why", label: "О проекте" },
  { href: "#features", label: "Возможности" },
  { href: "#tech", label: "Технологии" },
  { href: "#top", label: "Контакты" },
];

const SOCIAL = [
  { href: "https://t.me/", label: "Telegram", icon: Send },
  { href: "https://github.com/", label: "GitHub", icon: Github },
  { href: "https://youtube.com/", label: "YouTube", icon: Youtube },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink-950/80">
      <div className="section flex flex-col items-start justify-between gap-6 py-8 lg:flex-row lg:items-center">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          <Logo />
          <p className="text-xs text-slate-400">Технологии на страже природы</p>
        </div>

        <nav aria-label="Футер" className="flex flex-wrap gap-x-8 gap-y-2 text-xs text-slate-300">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} className="hover:text-white">{l.label}</a>
          ))}
        </nav>

        <div className="flex gap-3">
          {SOCIAL.map(({ href, label, icon: Icon }) => (
            <a
              key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-slate-200 ring-1 ring-white/10 transition hover:bg-mint-400/15 hover:text-mint-300"
            >
              <Icon size={16} />
            </a>
          ))}
        </div>
      </div>
      <p className="pb-6 text-center text-[11px] text-slate-600">© {new Date().getFullYear()} Эко-Щит Каспия</p>
    </footer>
  );
}
