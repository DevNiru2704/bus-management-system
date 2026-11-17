import { notFound } from "next/navigation";
import { BusMark } from "@/components/icons";
import { Button } from "@/components/button";
import { hasLocale, makeT } from "@/lib/i18n";
import { getDictionary } from "./dictionaries";

const STOPS = [0, 100, 200, 300];

export default async function Splash({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = makeT(await getDictionary(lang));
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-[430px] flex-col overflow-hidden bg-brand px-6 pt-24 pb-8 text-white">
      <div aria-hidden className="relative mx-auto mt-28 h-16 w-[300px]" style={{ "--hero-w": "300px" } as React.CSSProperties}>
        <div className="hero-route absolute top-[29px] left-0 h-1.5 w-full rounded-sm bg-taxi" />
        {STOPS.map((x, i) => (
          <span key={x} className="fade-up absolute top-[25px] size-3.5 rounded-full border-[3px] border-taxi bg-brand" style={{ left: x - 7, animationDelay: `${i * 200}ms` }} />
        ))}
        <div className="hero-bus absolute top-0 -left-8">
          <BusMark size={64} />
        </div>
      </div>
      <div className="mt-auto flex flex-col gap-3">
        <h1 className="t-display-l fade-up text-taxi" style={{ animationDelay: "600ms" }}>{t("common.appName")}</h1>
        <p className="t-title fade-up max-w-[20rem]" style={{ animationDelay: "700ms" }}>{t("splash.tagline")}</p>
        <div className="fade-up mt-6" style={{ animationDelay: "900ms" }}>
          <Button href={`/${lang}/language`} full>{t("common.continue")}</Button>
        </div>
      </div>
    </main>
  );
}
