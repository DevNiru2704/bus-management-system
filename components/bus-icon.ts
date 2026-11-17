import L from "leaflet";
import type { BusStatus } from "@/lib/sim/engine.ts";

const css = (v: string) => `var(--color-${v})`;
const core: Record<BusStatus, string> = {
  active: css("taxi"),
  delayed: css("st-delayed"),
  inactive: css("st-inactive"),
  completed: css("st-inactive"),
  breakdown: css("st-breakdown"),
  emergency: css("st-emergency"),
};

// One icon object per look. Re-using it lets Leaflet move the marker instead of rebuilding it every second,
// which is what makes buses glide.
const cache = new Map<string, L.DivIcon>();

export function busIcon(status: BusStatus, size: number, label: string): L.DivIcon {
  const key = `${status}:${size}:${label}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const ink = status === "active" ? "#12315e" : "#fff";
  const html = `<svg viewBox="0 0 56 56" width="${size}" height="${size}" role="img" aria-label="${label}">
    <circle cx="28" cy="28" r="27" fill="${core[status]}" opacity="0.28"/>
    <circle cx="28" cy="28" r="20" fill="${core[status]}" stroke="#fff" stroke-width="3"/>
    <g fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="translate(8 8)">
      <path d="M13 12H27Q29 12 29 14V27Q29 29 27 29H13Q11 29 11 27V14Q11 12 13 12Z"/><path d="M11 20H29"/><path d="M16 32V33.5M24 32V33.5"/>
    </g></svg>`;
  const icon = L.divIcon({ html, className: "sb-bus", iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
  cache.set(key, icon);
  return icon;
}
