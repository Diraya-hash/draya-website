import type { Locale } from "../i18n";
import en from "./en";

export type Dictionary = typeof en;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  if (locale === "ar") {
    return (await import("./ar")).default;
  }
  return en;
}
