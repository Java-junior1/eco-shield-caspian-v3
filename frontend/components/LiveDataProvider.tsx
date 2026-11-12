"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import {
  FALLBACK_ALERTS,
  FALLBACK_FORECAST,
  FALLBACK_STATUS,
  FALLBACK_ZONES,
} from "@/lib/fallback";
import type { Alert, EcoStatus, Forecast, Zone } from "@/lib/types";

interface LiveData {
  alerts: Alert[];
  status: EcoStatus;
  forecast: Forecast;
  zones: Zone[];
  /** true — данные идут с бэкенда, false — показываем встроенные демо-данные */
  live: boolean;
}

const LiveDataContext = createContext<LiveData | null>(null);

export function useLiveData(): LiveData {
  const ctx = useContext(LiveDataContext);
  if (!ctx) throw new Error("useLiveData must be used inside <LiveDataProvider>");
  return ctx;
}

const MAX_ALERTS = 20;

export function LiveDataProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>(FALLBACK_ALERTS);
  const [status, setStatus] = useState<EcoStatus>(FALLBACK_STATUS);
  const [forecast, setForecast] = useState<Forecast>(FALLBACK_FORECAST);
  const [zones, setZones] = useState<Zone[]>(FALLBACK_ZONES);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    let es: EventSource | null = null;
    let statusTimer: ReturnType<typeof setInterval> | undefined;

    async function boot() {
      try {
        const [a, s, f, z] = await Promise.all([
          api.alerts(ctrl.signal),
          api.status(ctrl.signal),
          api.forecast(ctrl.signal),
          api.zones(ctrl.signal),
        ]);
        if (ctrl.signal.aborted) return;
        setAlerts(a);
        setStatus(s);
        setForecast(f);
        setZones(z);
        setLive(true);

        es = new EventSource(api.streamUrl);
        es.addEventListener("alert", (ev) => {
          const alert = JSON.parse((ev as MessageEvent<string>).data) as Alert;
          setAlerts((prev) => [alert, ...prev.filter((x) => x.id !== alert.id)].slice(0, MAX_ALERTS));
          api.status().then(setStatus).catch(() => undefined);
        });
        es.onerror = () => setLive(false);
        es.onopen = () => setLive(true);

        statusTimer = setInterval(() => {
          api.status().then(setStatus).catch(() => undefined);
        }, 60_000);
      } catch {
        // бэкенд недоступен — остаёмся на демо-данных
        if (!ctrl.signal.aborted) setLive(false);
      }
    }

    boot();
    return () => {
      ctrl.abort();
      es?.close();
      if (statusTimer) clearInterval(statusTimer);
    };
  }, []);

  const value = useMemo(
    () => ({ alerts, status, forecast, zones, live }),
    [alerts, status, forecast, zones, live],
  );

  return <LiveDataContext.Provider value={value}>{children}</LiveDataContext.Provider>;
}
