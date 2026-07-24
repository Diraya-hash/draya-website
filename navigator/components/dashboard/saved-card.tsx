"use client";

import * as React from "react";
import { Trash2, Star, Clock, TrendingUp } from "lucide-react";
import {
  updateSavedStatus,
  updateSavedProgress,
  removeSaved,
} from "@/lib/actions/saved";
import type { Locale } from "@/lib/i18n";
import type { SavedCertification, SavedStatus } from "@/lib/data/saved";
import { cn } from "@/lib/utils";

const STATUSES: SavedStatus[] = ["wishlist", "in_progress", "completed"];

export function SavedCard({
  item,
  locale,
  labels,
}: {
  item: SavedCertification;
  locale: Locale;
  labels: {
    status: Record<SavedStatus, string>;
    markStatus: string;
    progressLabel: string;
    hoursLabel: string;
    remove: string;
  };
}) {
  const { cert } = item;
  const [status, setStatus] = React.useState<SavedStatus>(item.status);
  const [progress, setProgress] = React.useState(item.progressPercent);
  const [hours, setHours] = React.useState(item.hoursLogged);
  const [pending, startTransition] = React.useTransition();
  const [removed, setRemoved] = React.useState(false);

  function changeStatus(next: SavedStatus) {
    setStatus(next);
    if (next === "completed") setProgress(100);
    startTransition(async () => {
      await updateSavedStatus(cert.id, next, locale);
    });
  }

  function commitProgress(nextProgress: number, nextHours: number) {
    startTransition(async () => {
      await updateSavedProgress(cert.id, nextProgress, nextHours, locale);
    });
  }

  function onRemove() {
    setRemoved(true);
    startTransition(async () => {
      await removeSaved(cert.id, locale);
    });
  }

  if (removed) return null;

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5", pending && "opacity-70")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
            {cert.abbr.slice(0, 3).toUpperCase()}
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-semibold leading-tight text-foreground">{cert.name}</h3>
            <p className="text-xs text-muted-foreground">{cert.provider}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={labels.remove}
          title={labels.remove}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {/* Status */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => changeStatus(s)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              status === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-mint hover:text-mint-foreground"
            )}
          >
            {labels.status[s]}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>{labels.progressLabel}</span>
          <span className="font-semibold text-foreground tabular-nums">{progress}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          onMouseUp={() => commitProgress(progress, hours)}
          onTouchEnd={() => commitProgress(progress, hours)}
          className="skill-range w-full"
          style={{
            background: `linear-gradient(to right, hsl(var(--accent)) ${progress}%, hsl(var(--muted)) ${progress}%)`,
          }}
        />
      </div>

      {/* Meta row */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <label className="flex items-center gap-1.5">
          <Clock className="size-3.5" />
          <input
            type="number"
            min={0}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            onBlur={() => commitProgress(progress, hours)}
            className="w-14 rounded-md border border-input bg-card px-2 py-1 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {labels.hoursLabel}
        </label>
        <span className="inline-flex items-center gap-1">
          <Star className="size-3.5 fill-warning text-warning" />
          {cert.rating.toFixed(1)}
        </span>
        <span className="inline-flex items-center gap-1">
          <TrendingUp className="size-3.5" />
          +{cert.salaryImpact}%
        </span>
      </div>
    </div>
  );
}
