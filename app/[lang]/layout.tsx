import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import {
  Bricolage_Grotesque,
  Doto,
  Instrument_Sans,
  Noto_Sans_Bengali,
  Noto_Sans_Devanagari,
} from "next/font/google";
import "../globals.css";
import { I18nProvider } from "@/components/i18n-provider";
import { hasLocale, locales } from "@/lib/i18n";
import { getDictionary } from "./dictionaries";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--f-display", display: "swap" });
const ui = Instrument_Sans({ subsets: ["latin"], variable: "--f-ui", display: "swap" });
const board = Doto({ subsets: ["latin"], variable: "--f-board", display: "swap" });
const bengali = Noto_Sans_Bengali({ subsets: ["bengali"], variable: "--f-bengali", display: "swap" });
const devanagari = Noto_Sans_Devanagari({ subsets: ["devanagari"], variable: "--f-devanagari", display: "swap" });

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#12315e",
};

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: { default: dict.common.appName, template: `%s · ${dict.common.appName}` }, description: dict.splash.tagline };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const fonts = [display, ui, board, bengali, devanagari].map((f) => f.variable).join(" ");
  return (
    <html lang={lang} className={fonts}>
      <body>
        <I18nProvider lang={lang} dict={dict}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
