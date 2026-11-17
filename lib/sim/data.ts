import { indexPath, type LatLng, type PathIndex } from "./geo.ts";

// All names, plates and coordinates are invented placeholders for the prototype
// (stop positions are approximate), not real operator data.

export type Stop = { id: string; name: string; bn?: string; lat: number; lng: number; radius: number; at: number };
export type Route = { id: string; code: string; from: string; to: string; stops: Stop[]; path: PathIndex };

type StopWaypoint = [lat: number, lng: number, id: string, name: string, bn?: string, radius?: number];
type Waypoint = [lat: number, lng: number] | StopWaypoint;
const isStop = (w: Waypoint): w is StopWaypoint => w.length > 2;

function makeRoute(id: string, code: string, waypoints: Waypoint[]): Route {
  const path = indexPath(waypoints.map((w) => [w[0], w[1]] as LatLng));
  const stops: Stop[] = [];
  waypoints.forEach((w, i) => {
    if (isStop(w)) stops.push({ id: w[2], name: w[3], bn: w[4], lat: w[0], lng: w[1], radius: w[5] ?? 100, at: path.cum[i] });
  });
  return { id, code, from: stops[0].name, to: stops[stops.length - 1].name, stops, path };
}

export const ROUTES: Record<string, Route> = {
  "24": makeRoute("24", "24", [
    [22.5839, 88.3426, "howrah", "Howrah Station", "হাওড়া স্টেশন", 150],
    [22.5826, 88.347],
    [22.581, 88.352, "bandhaghat", "Bandhaghat", "বান্ধাঘাট"],
    [22.575, 88.3535],
    [22.569, 88.352],
    [22.5645, 88.3515, "esplanade", "Esplanade", "এসপ্ল্যানেড", 150],
    [22.5655, 88.36],
    [22.567, 88.366],
    [22.5686, 88.37, "sealdah", "Sealdah", "শিয়ালদহ", 60],
    [22.57, 88.385],
    [22.572, 88.405],
    [22.5735, 88.42],
    [22.5725, 88.431, "saltlake", "Salt Lake Sec V", "সল্টলেক সেক্টর ৫"],
  ]),
  "45": makeRoute("45", "45", [
    [22.5645, 88.3515, "esplanade", "Esplanade", "এসপ্ল্যানেড", 150],
    [22.545, 88.351],
    [22.5206, 88.3463, "kalighat", "Kalighat", "কালীঘাট"],
    [22.505, 88.36],
    [22.499, 88.37, "jadavpur", "Jadavpur", "যাদবপুর"],
    [22.464, 88.387, "garia", "Garia", "গড়িয়া"],
  ]),
  "12": makeRoute("12", "12", [
    [22.7203, 88.48, "barasat", "Barasat", "বারাসাত"],
    [22.67, 88.43],
    [22.628, 88.39, "dumdum", "Dum Dum", "দমদম"],
    [22.5686, 88.37, "sealdah", "Sealdah", "শিয়ালদহ", 60],
    [22.5645, 88.3515, "dharmatala", "Dharmatala", "ধর্মতলা", 150],
  ]),
  "31": makeRoute("31", "31", [
    [22.7203, 88.48, "barasat", "Barasat", "বারাসাত"],
    [22.69, 88.45, "madhyamgram", "Madhyamgram", "মধ্যমগ্রাম"],
    [22.628, 88.39, "dumdum", "Dum Dum", "দমদম"],
    [22.5686, 88.37, "sealdah", "Sealdah", "শিয়ালদহ", 60],
  ]),
  "8": makeRoute("8", "8", [
    [22.5206, 88.3463, "kalighat", "Kalighat", "কালীঘাট"],
    [22.5645, 88.3515, "esplanade", "Esplanade", "এসপ্ল্যানেড", 150],
    [22.575, 88.347],
    [22.5839, 88.3426, "howrah", "Howrah Station", "হাওড়া স্টেশন", 150],
  ]),
  "17": makeRoute("17", "17", [
    [22.464, 88.387, "garia", "Garia", "গড়িয়া"],
    [22.5397, 88.3965, "sciencecity", "Science City", "সায়েন্স সিটি"],
    [22.6547, 88.4467, "airport", "Airport", "বিমানবন্দর"],
  ]),
  "S-12": makeRoute("S-12", "S-12", [
    [22.5686, 88.37, "sealdah", "Sealdah", "শিয়ালদহ", 60],
    [22.628, 88.39, "dumdum", "Dum Dum", "দমদম"],
    [22.7203, 88.48, "barasat", "Barasat", "বারাসাত"],
  ]),
};

export type Driver = { id: string; name: string; licence: string; phone: string };
export const DRIVERS: Record<string, Driver> = {
  subrata: { id: "subrata", name: "Subrata Das", licence: "WB-0420110012345", phone: "+91 98300 11122" },
  imran: { id: "imran", name: "Imran Sheikh", licence: "WB-0220090034567", phone: "+91 98310 22233" },
  pradip: { id: "pradip", name: "Pradip Roy", licence: "WB-0420150045678", phone: "+91 98320 33344" },
  meera: { id: "meera", name: "Meera Ghosh", licence: "WB-1120170056789", phone: "+91 98330 44455" },
  ravi: { id: "ravi", name: "Ravi Kumar", licence: "WB-0620120067890", phone: "+91 98340 55566" },
  kabir: { id: "kabir", name: "Kabir Hossain", licence: "WB-0720130089012", phone: "+91 98360 77788" },
  anita: { id: "anita", name: "Anita Mondal", licence: "WB-1920190078901", phone: "+91 98350 66677" },
};

/** How a bus behaves: driven by events (a driver app), looping on its own, or parked. */
export type Profile = "events" | "loop" | "completed" | "inactive";
export type BusDef = {
  id: string;
  label: string;
  plate: string;
  routeId: string;
  driverId: string | null;
  seats: number | null;
  speed: number; // metres per second at cruise
  profile: Profile;
  baseDelaySec?: number; // constant lateness for looping buses
  loopOffsetSec?: number;
};

export const FLEET: BusDef[] = [
  { id: "24", label: "Bus 24", plate: "WB 06 F 4417", routeId: "24", driverId: "subrata", seats: 52, speed: 6.5, profile: "events" },
  { id: "24B", label: "Bus 24B", plate: "WB 06 F 4418", routeId: "24", driverId: "anita", seats: 52, speed: 6.5, profile: "events" },
  { id: "45", label: "Bus 45", plate: "WB 02 K 9031", routeId: "45", driverId: "imran", seats: 48, speed: 6, profile: "events" },
  { id: "12", label: "Bus 12", plate: "WB 04 B 2250", routeId: "12", driverId: "pradip", seats: 52, speed: 6, profile: "loop", baseDelaySec: 14 * 60, loopOffsetSec: 400 },
  { id: "31", label: "Bus 31", plate: "WB 23 C 7718", routeId: "31", driverId: "kabir", seats: 40, speed: 6.5, profile: "events" },
  { id: "8", label: "Bus 8", plate: "WB 11 A 1304", routeId: "8", driverId: "meera", seats: 52, speed: 6.5, profile: "loop", loopOffsetSec: 120 },
  { id: "17", label: "Bus 17", plate: "WB 06 H 3395", routeId: "17", driverId: "ravi", seats: 48, speed: 6, profile: "completed" },
  { id: "S-12", label: "S-12", plate: "WB 19 D 6682", routeId: "S-12", driverId: null, seats: null, speed: 6, profile: "inactive" },
];

export const BUS_BY_ID: Record<string, BusDef> = Object.fromEntries(FLEET.map((b) => [b.id, b]));

/** The passenger demo: waiting at Esplanade for Bus 24. */
export const DEMO = { busId: "24", stopId: "esplanade", driverBusId: "24" } as const;
