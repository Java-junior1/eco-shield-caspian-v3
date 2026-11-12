import type { Alert, Severity, Source } from "./types";

export function timeHHMM(iso: string): string {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export function ago(iso: string): string {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return "только что";
  if (m < 60) return `${m} мин назад`;
  return `${Math.floor(m / 60)} ч ${m % 60} мин назад`;
}

export const SEVERITY_COLOR: Record<Severity, string> = {
  critical: "#FF7A59",
  warning: "#E6BE5A",
  info: "#6D8BFF",
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  critical: "Критично",
  warning: "Внимание",
  info: "К сведению",
};

export const SOURCE_LABEL: Record<Source, string> = {
  satellite: "Спутник Sentinel-2",
  acoustic: "Акустический буй",
  iot: "Датчик воды",
};

/** Понятное человеку «что именно увидела модель» — для карточки алерта. */
export function evidence(a: Alert): string {
  switch (a.kind) {
    case "poacher_boat": return "Звук подвесного мотора в закрытой зоне, где судоходство запрещено.";
    case "gunshot": return "Короткий импульс, похожий на выстрел. Буй слышал его дважды за минуту.";
    case "illegal_net": return "Цепочка поплавков на снимке — так выглядят ставные сети.";
    case "discharge": return "Пятно на воде с аномальным спектром: возможен сброс.";
    default: return "Несколько датчиков одновременно показали отклонение от нормы.";
  }
}

export function patrolEta(id: string): number {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 997;
  return 9 + (h % 22);
}
