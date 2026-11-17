"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type Snap = "peek" | "half" | "full";
const order: Snap[] = ["peek", "half", "full"];
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** A sheet that rests at three heights. Drag the handle, or press it to step through them. */
export function BottomSheet({ snap, onSnap, handleLabel, children }: { snap: Snap; onSnap: (s: Snap) => void; handleLabel: string; children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [H, setH] = useState(640);
  const [drag, setDrag] = useState<number | null>(null);
  const g = useRef({ startY: 0, startVis: 0, moved: 0, lastY: 0, lastT: 0, v: 0 });

  useLayoutEffect(() => {
    const parent = root.current?.parentElement;
    if (!parent) return;
    const measure = () => setH(Math.min(parent.clientHeight - 112, 760));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  const vis: Record<Snap, number> = { peek: Math.min(180, H), half: Math.min(Math.round(H * 0.68), 540), full: H };
  const shown = drag ?? vis[snap];

  const onDown = (e: React.PointerEvent) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* capture is a nicety; dragging still works without it */
    }
    g.current = { startY: e.clientY, startVis: vis[snap], moved: 0, lastY: e.clientY, lastT: e.timeStamp, v: 0 };
    setDrag(vis[snap]);
  };
  const onMove = (e: React.PointerEvent) => {
    if (drag === null) return;
    const s = g.current;
    s.moved = Math.max(s.moved, Math.abs(e.clientY - s.startY));
    s.v = (e.clientY - s.lastY) / Math.max(1, e.timeStamp - s.lastT);
    s.lastY = e.clientY;
    s.lastT = e.timeStamp;
    setDrag(clamp(s.startVis - (e.clientY - s.startY), vis.peek, H));
  };
  const onUp = () => {
    if (drag === null) return;
    const s = g.current;
    if (s.moved < 6) return void step(1);
    let target = order.reduce((a, b) => (Math.abs(vis[b] - drag) < Math.abs(vis[a] - drag) ? b : a));
    if (Math.abs(s.v) > 0.5) {
      const i = order.indexOf(snap) + (s.v < 0 ? 1 : -1); // dragging up (negative velocity) opens the sheet
      target = order[clamp(i, 0, 2)];
    }
    setDrag(null);
    onSnap(target);
  };
  const step = (dir: 1 | -1) => {
    setDrag(null);
    onSnap(order[(order.indexOf(snap) + dir + 3) % 3]);
  };

  return (
    <div
      ref={root}
      className="absolute inset-x-0 bottom-0 z-10 flex flex-col rounded-t-lg bg-card shadow-sheet"
      style={{ height: H, transform: `translateY(${H - shown}px)`, transition: drag === null ? "transform var(--d-200) var(--ease-out)" : "none" }}
    >
      <button
        type="button"
        aria-label={handleLabel}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => setDrag(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            step(1);
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            step(-1);
          }
        }}
        className={cn("flex min-h-8 w-full shrink-0 touch-none items-center justify-center rounded-t-lg")}
      >
        <span className="h-1 w-10 rounded-sm bg-line-strong" />
      </button>
      <div className={cn("flex-1 px-4 pb-6", snap === "full" ? "overflow-y-auto" : "overflow-hidden")}>{children}</div>
    </div>
  );
}
