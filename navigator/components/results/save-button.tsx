"use client";

import * as React from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { toggleSaved } from "@/lib/actions/saved";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function SaveButton({
  slug,
  locale,
  labels,
}: {
  slug: string;
  locale: Locale;
  labels: { save: string; saved: string; signInToSave: string };
}) {
  const [saved, setSaved] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [needsAuth, setNeedsAuth] = React.useState(false);

  async function onClick() {
    setPending(true);
    const res = await toggleSaved(slug, locale);
    setPending(false);
    if (res.ok) {
      setSaved(Boolean(res.saved));
      setNeedsAuth(false);
    } else if (res.error === "unauthenticated" || res.error === "unconfigured") {
      setNeedsAuth(true);
    }
  }

  if (needsAuth) {
    return (
      <Link
        href={`/${locale}/sign-in`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
      >
        <Bookmark className="size-3.5" />
        {labels.signInToSave}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
        saved
          ? "border-accent bg-mint text-mint-foreground"
          : "border-border text-muted-foreground hover:border-accent/50 hover:text-foreground"
      )}
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : saved ? (
        <BookmarkCheck className="size-3.5" />
      ) : (
        <Bookmark className="size-3.5" />
      )}
      {saved ? labels.saved : labels.save}
    </button>
  );
}
