"use client";

import { motion } from "framer-motion";
import type { CompetencyKey } from "@/lib/assessment/competencies";
import type { SkillGap } from "@/lib/assessment/types";

export function ReadinessGauge({
  value,
  bandLabel,
}: {
  value: number;
  bandLabel: string;
}) {
  const size = 220;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - value / 100);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--accent))" />
            <stop offset="100%" stopColor="hsl(var(--primary))" />
          </linearGradient>
        </defs>
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-5xl font-bold tracking-tight text-foreground tabular-nums"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          {value}
        </motion.span>
        <span className="mt-1 rounded-full bg-mint px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-mint-foreground">
          {bandLabel}
        </span>
      </div>
    </div>
  );
}

export function SkillRadar({
  gaps,
  labels,
  currentLabel,
  targetLabel,
}: {
  gaps: SkillGap[];
  labels: Record<CompetencyKey, string>;
  currentLabel: string;
  targetLabel: string;
}) {
  const size = 320;
  const center = size / 2;
  const radius = size / 2 - 54;
  const n = gaps.length;

  const angleFor = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, value: number) => {
    const a = angleFor(i);
    const rr = (value / 100) * radius;
    return [center + rr * Math.cos(a), center + rr * Math.sin(a)] as const;
  };
  const poly = (key: "current" | "target") =>
    gaps.map((g, i) => point(i, g[key]).join(",")).join(" ");

  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full">
        {/* grid rings */}
        {rings.map((ring) => (
          <polygon
            key={ring}
            points={gaps
              .map((_, i) => {
                const a = angleFor(i);
                const rr = ring * radius;
                return `${center + rr * Math.cos(a)},${center + rr * Math.sin(a)}`;
              })
              .join(" ")}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={1}
          />
        ))}
        {/* spokes + labels */}
        {gaps.map((g, i) => {
          const a = angleFor(i);
          const [lx, ly] = [center + (radius + 26) * Math.cos(a), center + (radius + 26) * Math.sin(a)];
          return (
            <g key={g.key}>
              <line
                x1={center}
                y1={center}
                x2={center + radius * Math.cos(a)}
                y2={center + radius * Math.sin(a)}
                stroke="hsl(var(--border))"
                strokeWidth={1}
              />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground text-[10px] font-medium"
              >
                {labels[g.key]}
              </text>
            </g>
          );
        })}
        {/* target */}
        <motion.polygon
          points={poly("target")}
          fill="hsl(var(--primary) / 0.08)"
          stroke="hsl(var(--primary) / 0.5)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        />
        {/* current */}
        <motion.polygon
          points={poly("current")}
          fill="hsl(var(--accent) / 0.22)"
          stroke="hsl(var(--accent))"
          strokeWidth={2}
          initial={{ scale: 0.2, opacity: 0, transformOrigin: "center" }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
      </svg>
      <div className="mt-2 flex items-center gap-5 text-xs">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-accent" />
          {currentLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-sm border border-dashed border-primary/60" />
          {targetLabel}
        </span>
      </div>
    </div>
  );
}
