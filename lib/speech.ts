import type { Locale } from "./i18n";

const tags: Record<Locale, string> = { en: "en", bn: "bn", hi: "hi" };

function voiceFor(lang: Locale): SpeechSynthesisVoice | undefined {
  if (typeof speechSynthesis === "undefined") return undefined;
  return speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith(tags[lang]));
}

/** Does this phone or browser have a voice for the language? Voices come from the device, not from us. */
export const canSpeak = (lang: Locale) => !!voiceFor(lang);

/** Speaks a short message. Returns false (and says nothing) when there is no voice for the language. */
export function speak(text: string, lang: Locale): boolean {
  const voice = voiceFor(lang);
  if (!voice) return false;
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice;
  u.lang = voice.lang;
  speechSynthesis.speak(u);
  return true;
}
