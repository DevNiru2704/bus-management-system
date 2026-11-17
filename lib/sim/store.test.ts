import { test } from "node:test";
import assert from "node:assert/strict";
import { seedEvents } from "./engine.ts";

// A tiny localStorage stand-in, so the store can run under Node.
function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => (data.has(k) ? (data.get(k) as string) : null),
    setItem: (k: string, v: string) => void data.set(k, String(v)),
    removeItem: (k: string) => void data.delete(k),
    dump: () => data,
  };
}

test("store: sending from a page that never subscribed keeps the shared log (it used to wipe it)", async () => {
  const epoch = Date.now() - 60_000;
  const seeded = seedEvents(epoch);
  const ls = fakeStorage({ "sb:epoch:v1": String(epoch), "sb:log:v1": JSON.stringify(seeded), "sb:close-alerts:v1": "[]" });
  (globalThis as unknown as { localStorage: unknown }).localStorage = ls;
  const url = "./store.ts?never-subscribed"; // a fresh copy of the module, as a newly opened page would have
  const store = await import(url);
  store.dispatch({ type: "issue.report", busId: "24", reason: "traffic" });
  const saved = JSON.parse(ls.getItem("sb:log:v1") as string);
  assert.equal(saved.length, seeded.length + 1);
  assert.equal(saved[saved.length - 1].type, "issue.report");
  assert.equal(Number(ls.getItem("sb:epoch:v1")), epoch); // the clock was not reset either
});

test("store: with nothing saved yet, the first event starts from the seeded demo, not an empty log", async () => {
  const ls = fakeStorage();
  (globalThis as unknown as { localStorage: unknown }).localStorage = ls;
  const url = "./store.ts?empty-storage";
  const store = await import(url);
  store.dispatch({ type: "issue.report", busId: "24", reason: "flatTyre" });
  const saved = JSON.parse(ls.getItem("sb:log:v1") as string);
  assert.equal(saved.length, 7); // 6 seeded events + the new one
  assert.ok(Number(ls.getItem("sb:epoch:v1")) > 0);
});
