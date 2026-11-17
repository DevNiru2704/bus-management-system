"use client";

import { useRouter } from "next/navigation";
import { Button } from "./button";
import { useI18n } from "./i18n-provider";
import { cn } from "@/lib/cn";
import { localeNames, locales, type Locale } from "@/lib/i18n";
import { rememberLanguage } from "@/lib/prefs";

/** Choose English, Bengali or Hindi. The choice is remembered and the page redraws in that language. */
export function LanguagePicker({ continueHref, here }: { continueHref?: string; here: string }) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const choose = (l: Locale) => {
    rememberLanguage(l);
    router.replace(here.replace(`/${lang}`, `/${l}`));
  };
  return (
    <>
      <div role="radiogroup" aria-label={t("common.language")} className="flex flex-col gap-3">
        {locales.map((l) => {
          const on = l === lang;
          return (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={on}
              lang={l}
              onClick={() => choose(l)}
              className={cn("flex flex-col gap-1 rounded-md bg-card p-4 text-left transition-colors duration-150 ease-out", on ? "border-2 border-brand" : "border border-line")}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="t-display-m">{localeNames[l]}</span>
                <span className={cn("size-[22px] rounded-full border-2", on ? "border-brand bg-taxi" : "border-line-strong bg-card")} />
              </span>
              <span className="t-secondary text-ink-2">{t(`language.sample.${l}`)}</span>
            </button>
          );
        })}
      </div>
      {continueHref ? (
        <div className="mt-auto pt-6">
          <Button href={continueHref} full>{t("common.continue")}</Button>
        </div>
      ) : null}
    </>
  );
}
