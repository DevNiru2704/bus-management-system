import Link from "next/link";
import { notFound } from "next/navigation";
import { BusMark, ChevronIcon } from "@/components/icons";
import { PhoneShell } from "@/components/phone-shell";
import { hasLocale, makeT } from "@/lib/i18n";
import { getDictionary } from "../dictionaries";

const roles = [
  { key: "passenger", bg: "bg-brand-tint" },
  { key: "driver", bg: "bg-taxi-tint" },
  { key: "admin", bg: "bg-card border border-line" },
] as const;

export default async function RolesPage({ params }: PageProps<"/[lang]/roles">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = makeT(await getDictionary(lang));
  return (
    <PhoneShell className="gap-4 px-4 pt-[72px] pb-8">
      <BusMark size={64} />
      <h1 className="t-display-l">{t("roles.title")}</h1>
      <div className="mt-2 flex flex-col gap-3">
        {roles.map((r) => (
          <Link key={r.key} href={`/${lang}/${r.key}`} className={`flex items-center gap-3 rounded-md p-4 transition duration-150 ease-out hover:brightness-95 ${r.bg}`}>
            <span className="flex flex-1 flex-col gap-0.5">
              <span className="t-title">{t(`roles.${r.key}.name`)}</span>
              <span className="t-secondary text-ink-2">{t(`roles.${r.key}.desc`)}</span>
            </span>
            <ChevronIcon className="text-brand" size={20} />
          </Link>
        ))}
      </div>
    </PhoneShell>
  );
}
