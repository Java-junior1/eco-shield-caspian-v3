export type Severity = "critical" | "warning" | "info";
export type Source = "satellite" | "acoustic" | "iot";

export interface Alert {
  id: string;
  kind: string;
  severity: Severity;
  source: Source;
  title: string;
  description: string;
  lat: number;
  lon: number;
  zone_id: string;
  confidence: number;
  created_at: string;
}

export interface Zone {
  id: string;
  name: string;
  region: string;
  polygon: [number, number][];
}

export interface Sensor {
  id: string;
  kind: string;
  label: string;
  value: number;
  unit: string;
  lat: number;
  lon: number;
}

export interface EcoStatus {
  score: number;
  label: string;
  trend_pct: number;
  series: { t: string; score: number }[];
  sensors: Sensor[];
  active_alerts: number;
  updated_at: string;
}

export interface Forecast {
  horizon_days: number;
  model: string;
  points: { day: string; spawning: number; seal_migration: number }[];
  generated_at: string;
}

export interface DemoRequestPayload {
  name: string;
  email: string;
  organization?: string;
  message?: string;
}
