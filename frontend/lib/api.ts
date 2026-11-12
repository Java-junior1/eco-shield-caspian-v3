import type { Alert, DemoRequestPayload, EcoStatus, Forecast, Zone } from "./types";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { signal, cache: "no-store" });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return (await res.json()) as T;
}

export const api = {
  alerts: (signal?: AbortSignal) => get<Alert[]>("/api/alerts?limit=20", signal),
  status: (signal?: AbortSignal) => get<EcoStatus>("/api/status", signal),
  forecast: (signal?: AbortSignal) => get<Forecast>("/api/forecast", signal),
  zones: (signal?: AbortSignal) => get<Zone[]>("/api/zones", signal),
  streamUrl: `${API_URL}/api/stream`,
  async demoRequest(payload: DemoRequestPayload): Promise<void> {
    const res = await fetch(`${API_URL}/api/demo-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`demo-request: ${res.status}`);
  },
};
