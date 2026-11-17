import { deriveState, seedEvents, type SimEvent, type Snapshot } from "./engine.ts";
import { logNotes, proximityNotes, type Note } from "./notify.ts";
import { DEMO } from "./data.ts";

// The browser-side home of the simulation. The event log lives in localStorage and is announced over a
// BroadcastChannel, so a driver tab, a passenger tab and an admin tab all see the same world.
// Everything else (positions, ETAs, statuses) is derived from the log by deriveState().

const LOG_KEY = "sb:log:v1";
const EPOCH_KEY = "sb:epoch:v1";
const NOTES_KEY = "sb:close-alerts:v1";
const CHANNEL = "sb-sim";

type NewEvent = SimEvent extends infer E ? (E extends SimEvent ? Omit<E, "id" | "t"> : never) : never;

let epoch = 0;
let log: SimEvent[] = [];
let closeAlerts: Note[] = []; // "bus is 5 minutes away" alerts, kept so they are sent once and survive a reload
let snap: Snapshot | null = null;
let notes: Note[] = [];
let timer: ReturnType<typeof setInterval> | null = null;
let channel: BroadcastChannel | null = null;
const subs = new Set<() => void>();

function readStorage(): boolean {
  try {
    const e = Number(localStorage.getItem(EPOCH_KEY));
    const l = JSON.parse(localStorage.getItem(LOG_KEY) ?? "null");
    const n = JSON.parse(localStorage.getItem(NOTES_KEY) ?? "[]");
    if (e && Array.isArray(l)) {
      epoch = e;
      log = l;
      closeAlerts = Array.isArray(n) ? n : [];
      return true;
    }
  } catch {
    /* private mode or corrupted data: start fresh */
  }
  return false;
}

function writeStorage() {
  try {
    localStorage.setItem(EPOCH_KEY, String(epoch));
    localStorage.setItem(LOG_KEY, JSON.stringify(log));
    localStorage.setItem(NOTES_KEY, JSON.stringify(closeAlerts));
  } catch {
    /* storage unavailable: this tab still works on its own */
  }
}

function recompute() {
  const now = Date.now();
  snap = deriveState(log, now, epoch);
  const fresh = proximityNotes(snap, DEMO.stopId, new Set(closeAlerts.map((n) => n.id)), [DEMO.busId]);
  if (fresh.length) {
    closeAlerts = [...closeAlerts, ...fresh];
    writeStorage();
    channel?.postMessage("log");
  }
  notes = [...logNotes(log, epoch, now, DEMO.stopId), ...closeAlerts].sort((a, b) => b.t - a.t);
}

function emit() {
  recompute();
  subs.forEach((f) => f());
}

function onStorage(e: StorageEvent) {
  if ((e.key === LOG_KEY || e.key === EPOCH_KEY || e.key === NOTES_KEY) && readStorage()) emit();
}

function start() {
  if (!readStorage()) reset(false);
  try {
    channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = () => {
      if (readStorage()) emit();
    };
  } catch {
    channel = null;
  }
  window.addEventListener("storage", onStorage);
  timer = setInterval(emit, 1000);
  emit();
}

function stop() {
  if (timer) clearInterval(timer);
  timer = null;
  channel?.close();
  channel = null;
  window.removeEventListener("storage", onStorage);
}

export function subscribe(cb: () => void) {
  if (subs.size === 0) start();
  subs.add(cb);
  return () => {
    subs.delete(cb);
    if (subs.size === 0) stop();
  };
}

export const getSnapshot = () => snap;
export const getNotes = () => notes;

/** Adds one event to the shared log and tells every open tab. */
export function dispatch(ev: NewEvent) {
  log = [...log, { ...ev, id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, t: Date.now() } as SimEvent];
  writeStorage();
  channel?.postMessage("log");
  emit();
}

/** Starts the demo over: fresh clock, seeded buses, no remembered alerts. */
export function reset(announce = true) {
  epoch = Date.now();
  log = seedEvents(epoch);
  closeAlerts = [];
  writeStorage();
  if (announce) {
    channel?.postMessage("log");
    emit();
  }
}
