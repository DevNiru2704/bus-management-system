import { notFound } from "next/navigation";
import { LanguagePicker } from "@/components/language-picker";
import { PhoneShell } from "@/components/phone-shell";
import { hasLocale, makeT } from "@/lib/i18n";
import { getDictionary } from "../dictionaries";

export default async function LanguagePage({ params }: PageProps<"/[lang]/language">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = makeT(await getDictionary(lang));
  return (
    <PhoneShell className="gap-4 px-4 pt-[72px] pb-8">
      <h1 className="t-display-m">{t("language.title")}</h1>
      <p className="t-secondary text-ink-2">{t("language.sub")}</p>
      <LanguagePicker here={`/${lang}/language`} continueHref={`/${lang}/roles`} />
    </PhoneShell>
  );
}
