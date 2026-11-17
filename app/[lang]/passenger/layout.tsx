import { PhoneShell } from "@/components/phone-shell";
import { VoiceAnnouncer } from "@/components/voice-announcer";

export default function PassengerLayout({ children }: LayoutProps<"/[lang]/passenger">) {
  return (
    <PhoneShell>
      <VoiceAnnouncer />
      {children}
    </PhoneShell>
  );
}
