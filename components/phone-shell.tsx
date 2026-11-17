import { cn } from "@/lib/cn";

/** Passenger and driver screens are phone-first: a centred column on large screens. */
export function PhoneShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-page", className)}>{children}</div>;
}
