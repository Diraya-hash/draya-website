"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/icon";
import { Check } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { Option } from "@/lib/assessment/questions";

export function FieldLabel({
  children,
  hint,
  error,
}: {
  children: React.ReactNode;
  hint?: string;
  error?: boolean;
}) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-2">
      <label className={cn("text-sm font-medium", error ? "text-destructive" : "text-foreground")}>
        {children}
      </label>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

/** Single-select grid of rich option cards. */
export function OptionGrid({
  options,
  value,
  onChange,
  locale,
  columns = 2,
  invalid,
}: {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  locale: Locale;
  columns?: 2 | 3 | 4;
  invalid?: boolean;
}) {
  const cols =
    columns === 4
      ? "sm:grid-cols-2 md:grid-cols-4"
      : columns === 3
        ? "sm:grid-cols-3"
        : "sm:grid-cols-2";
  return (
    <div className={cn("grid grid-cols-1 gap-3", cols)}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "group relative flex items-start gap-3 rounded-xl border p-4 text-start transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "border-accent bg-mint shadow-soft"
                : invalid
                  ? "border-destructive/40 bg-card hover:border-accent/50"
                  : "border-border bg-card hover:border-accent/50 hover:bg-mint/40"
            )}
          >
            {opt.icon ? (
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                  selected
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground group-hover:bg-accent/15 group-hover:text-accent"
                )}
              >
                <Icon name={opt.icon} className="size-4.5" />
              </span>
            ) : null}
            <span className="flex min-w-0 flex-col">
              <span className="text-sm font-medium text-foreground">{opt.label[locale]}</span>
              {opt.hint ? (
                <span className="text-xs text-muted-foreground">{opt.hint[locale]}</span>
              ) : null}
            </span>
            {selected ? (
              <Check className="absolute end-3 top-3 size-4 text-accent" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/** Compact segmented pill selector for short option lists. */
export function Segmented({
  options,
  value,
  onChange,
  locale,
  invalid,
}: {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  locale: Locale;
  invalid?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 rounded-xl border p-1.5",
        invalid ? "border-destructive/40" : "border-border"
      )}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:bg-mint hover:text-mint-foreground"
            )}
          >
            {opt.label[locale]}
          </button>
        );
      })}
    </div>
  );
}

/** Multi-select chips. */
export function MultiSelect({
  options,
  values,
  onToggle,
  locale,
  max,
}: {
  options: Option[];
  values: string[];
  onToggle: (v: string) => void;
  locale: Locale;
  max?: number;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((opt) => {
        const selected = values.includes(opt.value);
        const disabled = !selected && max != null && values.length >= max;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(opt.value)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "border-accent bg-accent text-accent-foreground shadow-soft"
                : "border-border bg-card text-foreground hover:border-accent/50 hover:bg-mint/50",
              disabled && "cursor-not-allowed opacity-40"
            )}
          >
            {opt.icon ? <Icon name={opt.icon} className="size-4" /> : null}
            {opt.label[locale]}
            {selected ? <Check className="size-3.5" /> : null}
          </button>
        );
      })}
    </div>
  );
}

/** 0–5 competency slider with live value. */
export function SkillSlider({
  label,
  description,
  icon,
  value,
  onChange,
}: {
  label: string;
  description: string;
  icon: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-mint text-mint-foreground">
          <Icon name={icon} className="size-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-foreground">{label}</span>
            <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground tabular-nums">
              {value}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="skill-range mt-4 w-full"
        style={{
          background: `linear-gradient(to right, hsl(var(--accent)) ${(value / 5) * 100}%, hsl(var(--muted)) ${(value / 5) * 100}%)`,
        }}
        aria-label={label}
      />
      <div className="mt-1 flex justify-between px-0.5 text-[0.65rem] text-muted-foreground">
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
    </div>
  );
}
