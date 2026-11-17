import type { BusStatus } from "@/lib/sim/engine.ts";

type P = { className?: string; size?: number };
const base = (size: number) => ({ width: size, height: size, fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true });

export function BusMark({ size = 40, core = "var(--color-taxi)", ink = "var(--color-brand)", className }: { size?: number; core?: string; ink?: string; className?: string }) {
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} className={className} aria-hidden>
      <circle cx="28" cy="28" r="20" fill={core} stroke="var(--color-card)" strokeWidth="3" />
      <g fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="translate(8 8)">
        <path d="M13 12 H27 Q29 12 29 14 V27 Q29 29 27 29 H13 Q11 29 11 27 V14 Q11 12 13 12 Z" />
        <path d="M11 20 H29" />
        <path d="M16 32 V33.5 M24 32 V33.5" />
      </g>
    </svg>
  );
}

export const BackIcon = ({ className, size = 20 }: P) => (
  <svg viewBox="0 0 20 20" {...base(size)} strokeWidth={2} className={className}><path d="M12.5 4 L6.5 10 L12.5 16" /></svg>
);
export const ChevronIcon = ({ className, size = 16 }: P) => (
  <svg viewBox="0 0 16 16" {...base(size)} className={className}><path d="M6 3 L11 8 L6 13" /></svg>
);
export const CheckIcon = ({ className, size = 20 }: P) => (
  <svg viewBox="0 0 20 20" {...base(size)} strokeWidth={2.4} className={className}><path d="M4 10.5 L8.5 15 L16.5 5.5" /></svg>
);
export const SpeakerIcon = ({ className, size = 20 }: P) => (
  <svg viewBox="0 0 20 20" {...base(size)} className={className}><path d="M4 8 H7 L11 5 V15 L7 12 H4 Z" /><path d="M14 7.5 Q16 10 14 12.5" /></svg>
);
export const SearchIcon = ({ className, size = 20 }: P) => (
  <svg viewBox="0 0 20 20" {...base(size)} className={className}><circle cx="9" cy="9" r="5.5" /><path d="M13 13 L17 17" /></svg>
);
export const HomeIcon = ({ className, size = 22 }: P) => (
  <svg viewBox="0 0 20 20" {...base(size)} className={className}><path d="M3 10 L10 4 L17 10 V16 H12 V12 H8 V16 H3 Z" /></svg>
);
export const BellIcon = ({ className, size = 22 }: P) => (
  <svg viewBox="0 0 20 20" {...base(size)} className={className}><path d="M5 14 V9.5 Q5 5 10 5 Q15 5 15 9.5 V14 L16.5 15.5 H3.5 Z M8.5 18 H11.5" /></svg>
);
export const SlidersIcon = ({ className, size = 22 }: P) => (
  <svg viewBox="0 0 20 20" {...base(size)} className={className}><path d="M4 6 H16 M4 14 H16 M8 3.5 V8.5 M13 11.5 V16.5" /></svg>
);

/** One icon per status, so colour is never the only signal. */
export function StatusIcon({ status, size = 16 }: { status: BusStatus; size?: number }) {
  const b = { viewBox: "0 0 16 16", ...base(size), strokeWidth: 1.8 };
  switch (status) {
    case "active":
      return <svg {...b}><path d="M3 8.5 L6.5 12 L13 4.5" /></svg>;
    case "delayed":
      return <svg {...b}><circle cx="8" cy="8" r="6.2" /><path d="M8 4.5 V8 L11 9.8" /></svg>;
    case "breakdown":
      return <svg {...b}><path d="M4.5 4.5 L11.5 11.5 M11.5 4.5 L4.5 11.5" /></svg>;
    case "inactive":
      return <svg {...b}><path d="M4 8 H12" /></svg>;
    case "completed":
      return <svg {...b} fill="currentColor"><path d="M4.5 4.5 H11.5 V11.5 H4.5 Z" /></svg>;
    case "emergency":
      return <svg {...b}><path d="M8 2.5 L14 13 H2 Z" /><path d="M8 6.5 V9.5" /></svg>;
  }
}
