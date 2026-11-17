import { PhoneShell } from "@/components/phone-shell";

export default function DriverLayout({ children }: LayoutProps<"/[lang]/driver">) {
  return <PhoneShell>{children}</PhoneShell>;
}
