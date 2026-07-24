import Link from "next/link";
import { Compass } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";

export function Logo({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <Link
      href={`/${locale}`}
      className="group inline-flex items-center gap-2.5 focus-visible:outline-none"
    >
      <span className="relative flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft transition-transform group-hover:scale-105">
        <Compass className="size-5" />
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-base font-bold tracking-tight text-foreground">
          {dict.brand.name}
        </span>
        <span className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {dict.brand.product}
        </span>
      </span>
    </Link>
  );
}
