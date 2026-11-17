"use client";

import { useSyncExternalStore } from "react";
import { getNotes, getSnapshot, subscribe } from "./store.ts";
import type { Snapshot } from "./engine.ts";
import type { Note } from "./notify.ts";

const none = () => null;
const noNotes: Note[] = [];

/** The live world, updated every second. null on the server and for one tick after load. */
export function useSnapshot(): Snapshot | null {
  return useSyncExternalStore(subscribe, getSnapshot, none);
}

/** Alerts for the passenger's stop, newest first. */
export function useNotes(): Note[] {
  return useSyncExternalStore(subscribe, getNotes, () => noNotes);
}
