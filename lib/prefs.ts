"use client";

import { useSyncExternalStore } from "react";

// Small per-device preferences kept in localStorage. Off or empty by default.
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((f) => f());
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
};
const read = (key: string) => {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
};
const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable */
  }
  emit();
};

/** Voice alerts: off by default; turned on only by an explicit tap. */
export function useVoicePref(): [boolean, (on: boolean) => void] {
  const v = useSyncExternalStore(subscribe, () => read("sb:voice"), () => "");
  return [v === "1", (on) => write("sb:voice", on ? "1" : "0")];
}

export function useEmergencyContact(): [string, (v: string) => void] {
  const v = useSyncExternalStore(subscribe, () => read("sb:contact"), () => "");
  return [v, (x) => write("sb:contact", x)];
}

export function rememberLanguage(lang: string) {
  document.cookie = `sb-lang=${lang}; path=/; max-age=31536000; samesite=lax`;
}
