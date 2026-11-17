export type LatLng = [number, number];

const EARTH_M = 6371008.8;
const rad = (d: number) => (d * Math.PI) / 180;

/** Great-circle distance in metres (haversine). */
export function distM(a: LatLng, b: LatLng): number {
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export type PathIndex = { points: LatLng[]; cum: number[]; length: number };

/** Cumulative distance along a polyline, so "distance travelled" maps to a point and back. */
export function indexPath(points: LatLng[]): PathIndex {
  const cum = [0];
  for (let i = 1; i < points.length; i++) cum.push(cum[i - 1] + distM(points[i - 1], points[i]));
  return { points, cum, length: cum[cum.length - 1] };
}

/** The point `d` metres along the path, clamped to its ends. */
export function pointAt(path: PathIndex, d: number): LatLng {
  const { points, cum, length } = path;
  if (d <= 0) return points[0];
  if (d >= length) return points[points.length - 1];
  let i = 1;
  while (cum[i] < d) i++;
  const f = (d - cum[i - 1]) / (cum[i] - cum[i - 1]);
  return [points[i - 1][0] + (points[i][0] - points[i - 1][0]) * f, points[i - 1][1] + (points[i][1] - points[i - 1][1]) * f];
}
