"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "./i18n-provider";
import { Switch } from "./switch";
import { cn } from "@/lib/cn";
import { localeNames, locales, type Locale } from "@/lib/i18n";
import { rememberLanguage, useEmergencyContact, useVoicePref } from "@/lib/prefs";
import { speak } from "@/lib/speech";

export function SettingsScreen() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const path = usePathname();
  const [voice, setVoice] = useVoicePref();
  const [contact, setContact] = useEmergencyContact();
  const choose = (l: Locale) => (rememberLanguage(l), router.replace(path.replace(`/${lang}`, `/${l}`)));
  const toggle = (on: boolean) => {
    setVoice(on);
    if (on && !speak(t("settings.voiceTest"), lang)) alert(t("settings.voiceMissing"));
  };
  const card = "flex flex-col gap-3 rounded-md border border-line bg-card p-4";
  return (
    <main className="flex flex-col gap-4 px-4 pt-14 pb-6">
      <h1 className="t-display-l">{t("settings.title")}</h1>
      <section className={card}>
        <h2 className="t-label text-ink-2" id="lang-h">{t("common.language")}</h2>
        <div role="radiogroup" aria-labelledby="lang-h" className="flex gap-1 rounded-md bg-sunken p-1">
          {locales.map((l) => (
            <button key={l} type="button" role="radio" aria-checked={l === lang} lang={l} onClick={() => choose(l)} className={cn("t-body-m min-h-11 flex-1 rounded-[12px] transition duration-150 ease-out", l === lang ? "bg-card shadow-raised" : "text-ink-2")}>
              {localeNames[l]}
            </button>
          ))}
        </div>
      </section>
      <section className={card}>
        <label className="flex items-center gap-3">
          <span className="t-body-m flex-1">{t("settings.voice")}</span>
          <Switch on={voice} onChange={toggle} label={t("settings.voice")} />
        </label>
        <p className="t-secondary text-ink-2">{t("settings.voiceHelp")}</p>
      </section>
      <section className={card}>
        <label htmlFor="contact" className="t-label text-ink-2">{t("settings.emergency")}</label>
        <input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder={t("settings.emergencyValue")} autoComplete="off" className="t-body min-h-12 rounded-md border border-line-strong bg-page px-4 outline-none focus:border-brand" />
        <p className="t-secondary text-ink-2">{t("settings.emergencyHelp")}</p>
      </section>
      <section className={card}>
        <h2 className="t-label text-ink-2">{t("settings.delivery")}</h2>
        <p className="t-body">{t("settings.deliveryValue")}</p>
      </section>
      <Link href={`/${lang}/demo`} className="t-secondary-m min-h-11 self-start py-2 text-brand underline underline-offset-4">{t("common.demo")}</Link>
    </main>
  );
}
