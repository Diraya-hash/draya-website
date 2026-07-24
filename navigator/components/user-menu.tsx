"use client";

import * as React from "react";
import Link from "next/link";
import { LayoutDashboard, LogOut } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function UserMenu({
  name,
  email,
  locale,
  labels,
}: {
  name: string;
  email: string;
  locale: Locale;
  labels: { dashboard: string; signOut: string };
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const initial = (name || email || "?").charAt(0).toUpperCase();

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground",
          "transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-popover shadow-lift"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold text-foreground">{name}</p>
            <p className="truncate text-xs text-muted-foreground" dir="ltr">
              {email}
            </p>
          </div>
          <Link
            href={`/${locale}/dashboard`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-mint hover:text-mint-foreground"
          >
            <LayoutDashboard className="size-4" />
            {labels.dashboard}
          </Link>
          <form action={signOut.bind(null, locale)}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-mint hover:text-mint-foreground"
            >
              <LogOut className="size-4 rtl:rotate-180" />
              {labels.signOut}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
