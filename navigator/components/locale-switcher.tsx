"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import { locales, otherLocale, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname() || `/${locale}`;
  const target = otherLocale(locale);

  const segments = pathname.split("/");
  if (locales.includes(segments[1] as Locale)) {
    segments[1] = target;
  } else {
    segments.splice(1, 0, target);
  }
  const href = segments.join("/") || `/${target}`;

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-full border border-border px-3.5",
        "bg-card/60 text-sm font-medium text-foreground transition-colors",
        "hover:bg-mint hover:text-mint-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      <Languages className="size-4" />
      {label}
    </Link>
  );
}
