"use client";

import { useEffect, useState } from "react";
import { Check, Send, X } from "lucide-react";
import { SEVERITY_COLOR, SEVERITY_LABEL, SOURCE_LABEL, ago, evidence, patrolEta } from "@/lib/format";
import type { Alert, Zone } from "@/lib/types";

interface Props {
  alert: Alert;
  zone?: Zone;
  /** compact — короткая карточка поверх карты, детали раскрываются по «Подробнее» */
  compact?: boolean;
  onClose?: () => void;
}

export function AlertDetail({ alert, zone, compact, onClose }: Props) {
  const [more, setMore] = useState(!compact);
  const [sent, setSent] = useState(false);
  useEffect(() => { setMore(!compact); setSent(false); }, [alert.id, compact]);

  const color = SEVERITY_COLOR[alert.severity];
  const pct = Math.round(alert.confidence * 100);

  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/95 p-4 shadow-xl backdrop-blur-md" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold" style={{ color }}>
          {SEVERITY_LABEL[alert.severity]} · {ago(alert.created_at)}
        </p>
        {onClose && (
          <button onClick={onClose} aria-label="Закрыть карточку" className="-m-1 rounded p-1 text-slate-400 hover:text-white">
            <X size={14} />
          </button>
        )}
      </div>
      <h3 className="mt-1 text-[15px] font-semibold leading-snug text-white">{alert.title}</h3>

      <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
        <span className="shrink-0">Уверенность {pct}%</span>
        <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
          <span className="block h-full rounded-full bg-mint-400" style={{ width: `${pct}%` }} />
        </span>
      </div>

      {!more && (
        <button onClick={() => setMore(true)} className="mt-3 text-xs font-medium text-mint-400 hover:underline">
          Подробнее
        </button>
      )}

      {more && (
        <div className="mt-3 space-y-3 border-t border-white/10 pt-3 text-[13px] leading-relaxed">
          <p className="text-slate-300">{evidence(alert)}</p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
            <dt className="text-slate-500">Источник</dt><dd className="text-slate-200">{SOURCE_LABEL[alert.source]}</dd>
            <dt className="text-slate-500">Зона</dt><dd className="text-slate-200">{zone?.name ?? alert.zone_id}</dd>
            <dt className="text-slate-500">Координаты</dt><dd className="text-slate-200">{alert.lat.toFixed(3)}° с. ш., {alert.lon.toFixed(3)}° в. д.</dd>
          </dl>
          <button
            onClick={() => setSent(true)}
            disabled={sent}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
              sent ? "bg-mint-400/15 text-mint-300" : "bg-mint-400 text-ink-950 hover:bg-mint-300"
            }`}
          >
            {sent ? <><Check size={14} /> Патруль выехал, будет через {patrolEta(alert.id)} мин</> : <><Send size={14} /> Отправить ближайший патруль</>}
          </button>
        </div>
      )}
    </div>
  );
}
