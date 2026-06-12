import type { Locale } from "@/lib/i18n";

/**
 * Wordmark with the directional arrow — knowledge transfer.
 * The arrow follows the reading direction; `on` selects the colorway.
 */
export default function Logo({
  locale,
  on = "light",
}: {
  locale: Locale;
  on?: "light" | "dark";
}) {
  const dark = on === "dark";
  return (
    <span className="flex items-center gap-3">
      <span
        className={`text-xl font-semibold tracking-tight ${
          dark ? "text-cream" : "text-teal-900"
        }`}
      >
        {locale === "ar" ? "دراية" : "Draya"}
      </span>
      <svg
        className={`h-4 w-4 rtl:-scale-x-100 ${dark ? "text-mint" : "text-teal-500"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18m0 0l-7-7m7 7l-7 7" />
      </svg>
    </span>
  );
}
