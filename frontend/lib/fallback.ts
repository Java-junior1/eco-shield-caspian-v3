import type { Alert, EcoStatus, Forecast, Zone } from "./types";

/**
 * Статические данные: лендинг остаётся рабочим и красивым,
 * даже если бэкенд недоступен (например, превью на Vercel без API).
 */

export const FALLBACK_ZONES: Zone[] = [
  {
    id: "volga-delta",
    name: "Дельта Волги (Астраханский заповедник)",
    region: "Астраханская область, РФ",
    polygon: [[46.35, 47.95], [46.3, 48.65], [45.8, 48.85], [45.6, 48.25], [45.85, 47.9]],
  },
  {
    id: "dagestan",
    name: "Дагестанский заповедник",
    region: "Республика Дагестан, РФ",
    polygon: [[43.1, 47.55], [43.05, 47.8], [42.8, 47.85], [42.78, 47.6]],
  },
  {
    id: "mangystau",
    name: "Мангистауская прибрежная зона",
    region: "Мангистауская область, КЗ",
    polygon: [[44.75, 50.55], [44.7, 51.05], [44.35, 51.1], [44.3, 50.6]],
  },
  {
    id: "gilan",
    name: "Прибрежная зона Гилян",
    region: "Остан Гилян, ИР",
    polygon: [[37.45, 49.6], [37.4, 50.05], [37.15, 50.1], [37.12, 49.65]],
  },
];

const iso = (minAgo: number) => new Date(Date.now() - minAgo * 60_000).toISOString();

export const FALLBACK_ALERTS: Alert[] = [
  {
    id: "fb-1", kind: "illegal_net", severity: "critical", source: "satellite",
    title: "Незаконные сети в охранной зоне",
    description: "YOLOv8 обнаружил линию плавучих объектов, характерную для ставных сетей.",
    lat: 46.02, lon: 48.3, zone_id: "volga-delta", confidence: 0.91, created_at: iso(3),
  },
  {
    id: "fb-2", kind: "poacher_boat", severity: "warning", source: "acoustic",
    title: "Браконьерская лодка обнаружена",
    description: "YAMNet классифицировал звук подвесного мотора.",
    lat: 42.95, lon: 47.7, zone_id: "dagestan", confidence: 0.87, created_at: iso(20),
  },
  {
    id: "fb-3", kind: "gunshot", severity: "critical", source: "acoustic",
    title: "Зафиксирован выстрел",
    description: "Акустический буй зарегистрировал импульсный сигнал класса gunshot.",
    lat: 44.52, lon: 50.82, zone_id: "mangystau", confidence: 0.93, created_at: iso(41),
  },
  {
    id: "fb-4", kind: "anomaly", severity: "info", source: "iot",
    title: "Аномалия активности вблизи дельты Волги",
    description: "Подозрительная активность по совокупности датчиков.",
    lat: 46.2, lon: 48.6, zone_id: "volga-delta", confidence: 0.78, created_at: iso(58),
  },
  {
    id: "fb-5", kind: "discharge", severity: "warning", source: "satellite",
    title: "Подозрение на сброс",
    description: "Спектральный индекс показал аномальный слик на поверхности воды.",
    lat: 37.27, lon: 49.85, zone_id: "gilan", confidence: 0.82, created_at: iso(75),
  },
];

export const FALLBACK_STATUS: EcoStatus = {
  score: 92,
  label: "В норме",
  trend_pct: 2,
  series: [88, 89, 88.5, 90, 89.4, 90.8, 91, 90.2, 91.6, 92, 91.4, 92].map((score, i) => ({
    t: `${String(i * 2).padStart(2, "0")}:00`,
    score,
  })),
  sensors: [],
  active_alerts: 2,
  updated_at: new Date().toISOString(),
};

export const FALLBACK_FORECAST: Forecast = {
  horizon_days: 7,
  model: "demo-baseline",
  generated_at: new Date().toISOString(),
  points: [
    ["Пн", 45, 38], ["Вт", 50, 46], ["Ср", 55, 55], ["Чт", 59, 61],
    ["Пт", 66, 63], ["Сб", 71, 66], ["Вс", 76, 72],
  ].map(([day, spawning, seal_migration]) => ({
    day: day as string,
    spawning: spawning as number,
    seal_migration: seal_migration as number,
  })),
};
