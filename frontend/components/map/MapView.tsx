"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polygon, TileLayer, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { SEVERITY_COLOR } from "@/lib/format";
import type { Alert, Zone } from "@/lib/types";

interface Props {
  zones: Zone[];
  alerts: Alert[];
  center?: [number, number];
  zoom?: number;
  /** false — декоративная карта для hero: без зума и перетаскивания */
  interactive?: boolean;
  selectedId?: string | null;
  onSelect?: (alert: Alert) => void;
  className?: string;
}

const ESRI_IMAGERY = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

function markerIcon(alert: Alert, selected: boolean): L.DivIcon {
  const color = SEVERITY_COLOR[alert.severity];
  return L.divIcon({
    className: "",
    html: `<div class="eco-marker${selected ? " sel" : ""}" style="color:${color}"><i></i></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function FlyToSelected({ alert }: { alert?: Alert }) {
  const map = useMap();
  useEffect(() => {
    if (alert) map.flyTo([alert.lat, alert.lon], Math.max(map.getZoom(), 7), { duration: 0.8 });
  }, [alert, map]);
  return null;
}

export default function MapView({
  zones,
  alerts,
  center = [43.6, 50.4],
  zoom = 5,
  interactive = true,
  selectedId,
  onSelect,
  className,
}: Props) {
  const selected = useMemo(() => alerts.find((a) => a.id === selectedId), [alerts, selectedId]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
      style={{ height: "100%", width: "100%" }}
      zoomControl={interactive}
      dragging={interactive}
      scrollWheelZoom={false}
      doubleClickZoom={interactive}
      touchZoom={interactive}
      keyboard={interactive}
      attributionControl={interactive}
    >
      <TileLayer url={ESRI_IMAGERY} attribution="Tiles &copy; Esri" maxZoom={12} />

      {zones.map((z) => (
        <Polygon
          key={z.id}
          positions={z.polygon}
          pathOptions={{ color: "#3EE6C8", weight: 2, fillColor: "#3EE6C8", fillOpacity: 0.14 }}
        >
          {interactive && <Tooltip sticky>{z.name}</Tooltip>}
        </Polygon>
      ))}

      {alerts.map((a) => (
        <Marker
          key={a.id}
          position={[a.lat, a.lon]}
          icon={markerIcon(a, a.id === selectedId)}
          interactive={interactive}
          eventHandlers={{ click: () => onSelect?.(a) }}
        >
          {interactive && <Tooltip direction="top" offset={[0, -16]}>{a.title}</Tooltip>}
        </Marker>
      ))}

      {interactive && <FlyToSelected alert={selected} />}
    </MapContainer>
  );
}
