"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { Circle, CircleMarker, MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import { busIcon } from "./bus-icon";
import { useMapReady } from "./use-map-ready";
import { ROUTES } from "@/lib/sim/data.ts";
import type { LatLng } from "@/lib/sim/geo.ts";
import type { BusView } from "@/lib/sim/engine.ts";

function Fit({ bounds, focus, zoom, padRight }: { bounds: L.LatLngBoundsExpression; focus?: LatLng; zoom: number; padRight: number }) {
  const map = useMap();
  useEffect(() => {
    if (focus) map.setView(focus, zoom, { animate: false });
    else map.fitBounds(bounds, { paddingTopLeft: [24, 96], paddingBottomRight: [padRight + 24, 24], animate: false });
    // Fit once per focus target; buses moving must not re-centre the map under the administrator.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, focus?.[0], focus?.[1], zoom, padRight]);
  return null;
}

/** Every route and every bus, coloured by status. With `focus`, zooms in on one place. */
export default function FleetMap({
  buses,
  focus,
  zoom = 14,
  routeId,
  geofences,
  padRight = 0,
  label,
  className,
}: {
  buses: BusView[];
  focus?: LatLng;
  zoom?: number;
  routeId?: string;
  geofences?: { id: string; pos: LatLng; radius: number; on?: boolean }[];
  padRight?: number;
  label: string;
  className?: string;
}) {
  const live = useMapReady();
  const routes = routeId ? [ROUTES[routeId]] : Object.values(ROUTES);
  const all: LatLng[] = routes.flatMap((r) => r.path.points);
  return (
    <div role="img" aria-label={label} className={className} style={{ isolation: "isolate" }}>
      {live && <MapContainer bounds={all} zoomControl={false} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" maxZoom={19} />
        <Fit bounds={all} focus={focus} zoom={zoom} padRight={padRight} />
        {routes.map((r) => (
          <span key={r.id}>
            <Polyline positions={r.path.points} pathOptions={{ color: "#ffffff", weight: 9, lineCap: "round", lineJoin: "round" }} />
            <Polyline positions={r.path.points} pathOptions={{ color: "#12315e", weight: 4, opacity: 0.85, lineCap: "round", lineJoin: "round" }} />
            {routeId ? r.stops.map((s) => <CircleMarker key={s.id} center={[s.lat, s.lng]} radius={7} pathOptions={{ color: "#12315e", weight: 3.5, fillColor: "#ffffff", fillOpacity: 1 }} />) : null}
          </span>
        ))}
        {geofences?.map((g) => (
          <Circle key={g.id} center={g.pos} radius={g.radius} pathOptions={{ color: "#ffc20e", weight: g.on ? 3 : 2, dashArray: "6 4", fillColor: "#ffc20e", fillOpacity: g.on ? 0.28 : 0.14 }} />
        ))}
        {buses.filter((b) => b.status === "emergency").map((b) => (
          <Circle key={`pulse-${b.def.id}`} center={b.pos} radius={320} pathOptions={{ color: "#991b1b", weight: 1.5, opacity: 0.55, fillColor: "#991b1b", fillOpacity: 0.12 }} />
        ))}
        {buses.filter((b) => b.status !== "inactive" || routeId).map((b) => (
          <Marker key={b.def.id} position={b.pos} icon={busIcon(b.status, b.status === "emergency" ? 64 : 48, b.def.label)} zIndexOffset={b.status === "emergency" ? 2000 : 1000} />
        ))}
      </MapContainer>}
    </div>
  );
}
