"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { Circle, CircleMarker, MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import { ROUTES } from "@/lib/sim/data.ts";
import { busIcon } from "./bus-icon";
import { useMapReady } from "./use-map-ready";
import type { BusView } from "@/lib/sim/engine.ts";

const youIcon = L.divIcon({
  html: `<span style="display:block;width:34px;height:34px;border-radius:9999px;background:rgb(18 49 94 / .15);position:relative"><span style="position:absolute;inset:9px;border-radius:9999px;background:#12315e;border:3px solid #fff"></span></span>`,
  className: "sb-bus",
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

function Fit({ bounds, padBottom }: { bounds: L.LatLngBoundsExpression; padBottom: number }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { paddingTopLeft: [28, 96], paddingBottomRight: [28, padBottom + 24], animate: false });
  }, [map, bounds, padBottom]);
  return null;
}

/** Route, stops, the passenger's stop ring and the buses, on OpenStreetMap tiles. */
export default function LiveMap({
  routeId,
  buses,
  stopId,
  padBottom = 0,
  label,
  className,
}: {
  routeId: string;
  buses: BusView[];
  stopId?: string;
  padBottom?: number;
  label: string;
  className?: string;
}) {
  const live = useMapReady();
  const route = ROUTES[routeId];
  const line = route.path.points;
  const stop = stopId ? route.stops.find((s) => s.id === stopId) : undefined;
  return (
    <div role="img" aria-label={label} className={className} style={{ isolation: "isolate" }}>
      {live && <MapContainer bounds={line} zoomControl={false} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" maxZoom={19} />
        <Fit bounds={line} padBottom={padBottom} />
        <Polyline positions={line} pathOptions={{ color: "#ffffff", weight: 12, lineCap: "round", lineJoin: "round" }} />
        <Polyline positions={line} pathOptions={{ color: "#12315e", weight: 5, lineCap: "round", lineJoin: "round" }} />
        {route.stops.map((s) => (
          <CircleMarker key={s.id} center={[s.lat, s.lng]} radius={6} pathOptions={{ color: "#12315e", weight: 3, fillColor: "#ffffff", fillOpacity: 1 }} />
        ))}
        {stop ? (
          <>
            <Circle center={[stop.lat, stop.lng]} radius={stop.radius} pathOptions={{ color: "#ffc20e", weight: 2, dashArray: "6 4", fillColor: "#ffc20e", fillOpacity: 0.22 }} />
            <Marker position={[stop.lat, stop.lng]} icon={youIcon} interactive={false} />
          </>
        ) : null}
        {buses.map((b) => (
          <Marker key={b.def.id} position={b.pos} icon={busIcon(b.status, 52, b.def.label)} zIndexOffset={1000} />
        ))}
      </MapContainer>}
    </div>
  );
}
