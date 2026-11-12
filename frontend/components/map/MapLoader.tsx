"use client";

import dynamic from "next/dynamic";

/** Leaflet работает только в браузере, поэтому грузим без SSR. */
const MapLoader = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-ink-900 text-sm text-slate-400">
      Загрузка карты…
    </div>
  ),
});

export default MapLoader;
