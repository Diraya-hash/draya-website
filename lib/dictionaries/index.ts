import type { Locale } from "../i18n";
import ar from "./ar";

export type Dictionary = typeof ar;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  if (locale === "en") {
    return (await import("./en")).default;
  }
  return ar;
}
