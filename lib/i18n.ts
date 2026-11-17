export const locales = ["en", "bn", "hi"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

export const localeNames: Record<Locale, string> = {
  en: "English",
  bn: "বাংলা",
  hi: "हिन्दी",
};

/** Picks a locale from an Accept-Language header such as "bn-IN,bn;q=0.9,en;q=0.8". */
export function pickLocale(header: string | null | undefined): Locale {
  if (!header) return defaultLocale;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of ranked) if (hasLocale(tag)) return tag;
  return defaultLocale;
}

/** Fills {slots} in a whole translated sentence. Sentences are never built from fragments. */
export function format(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? `{${key}}`));
}

/** Reads "a.b.c" out of a nested dictionary. */
export function lookup(dict: unknown, path: string): string {
  let node: unknown = dict;
  for (const key of path.split(".")) {
    if (node && typeof node === "object" && key in node) node = (node as Record<string, unknown>)[key];
    else return path;
  }
  return typeof node === "string" ? node : path;
}

/** Builds a t("a.b", {slots}) function from one dictionary. Works on server and client. */
export function makeT(dict: unknown) {
  return (path: string, params?: Record<string, string | number>) => format(lookup(dict, path), params);
}
