"use client";

import { motion } from "framer-motion";
import {
  RotateCcw,
  TrendingUp,
  CalendarClock,
  Star,
  Trophy,
  Target,
  Clock,
  DollarSign,
  Award,
} from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import type { AssessmentResult, AssessmentAnswers, ScoredCertification, Priority } from "@/lib/assessment/types";
import { COMPETENCIES, type CompetencyKey } from "@/lib/assessment/competencies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { ReadinessGauge, SkillRadar } from "./charts";
import { SaveButton } from "./save-button";

function Section({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

const PRIORITY_STYLE: Record<Priority, { badge: "accent" | "default" | "muted"; ring: string }> = {
  now: { badge: "accent", ring: "ring-accent/40" },
  next: { badge: "default", ring: "ring-primary/25" },
  later: { badge: "muted", ring: "ring-border" },
};

export function ResultsView({
  result,
  answers,
  locale,
  dict,
  onRestart,
}: {
  result: AssessmentResult;
  answers: AssessmentAnswers;
  locale: Locale;
  dict: Dictionary;
  onRestart: () => void;
}) {
  const t = dict.results;
  const labels = Object.fromEntries(
    (Object.keys(COMPETENCIES) as CompetencyKey[]).map((k) => [k, COMPETENCIES[k].label[locale]])
  ) as Record<CompetencyKey, string>;

  const who = answers.name.trim() || t.anonymous;

  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-radial-mint" />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {/* Header */}
        <Section className="text-center">
          <Badge variant="mint" className="mb-4">
            <Award className="size-3.5" />
            {dict.brand.product}
          </Badge>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t.subtitle} <span className="font-semibold text-foreground">{who}</span>
          </p>
        </Section>

        {/* Readiness + DNA */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Section delay={0.05}>
            <Card className="flex h-full flex-col items-center justify-center p-8 text-center">
              <CardTitle className="mb-1">{t.readinessTitle}</CardTitle>
              <p className="mb-6 text-sm text-muted-foreground">{t.readinessSub}</p>
              <ReadinessGauge value={result.readinessIndex} bandLabel={t.bands[result.readinessBand]} />
            </Card>
          </Section>

          <Section delay={0.1}>
            <Card className={cn("relative h-full overflow-hidden bg-gradient-to-br p-0", result.archetype.gradient)}>
              <div className="p-8">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
                    <Icon name={result.archetype.icon} className="size-6" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t.dnaTitle}
                    </p>
                    <h3 className="text-xl font-bold text-foreground">{result.archetype.name[locale]}</h3>
                  </div>
                </div>
                <p className="text-sm font-medium text-foreground/90">{result.archetype.tagline[locale]}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {result.archetype.description[locale]}
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t.dnaStrengths}
                    </p>
                    <ul className="space-y-1">
                      {result.archetype.strengths.map((s) => (
                        <li key={s.en} className="flex items-start gap-1.5 text-sm text-foreground">
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                          {s[locale]}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t.dnaWatchouts}
                    </p>
                    <ul className="space-y-1">
                      {result.archetype.watchouts.map((s) => (
                        <li key={s.en} className="flex items-start gap-1.5 text-sm text-foreground">
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning" />
                          {s[locale]}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {result.archetype.futureRoles.map((r) => (
                    <Badge key={r.en} variant="outline">
                      {r[locale]}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          </Section>
        </div>

        {/* Stat row */}
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <Section delay={0.05}>
            <StatCard
              icon={<TrendingUp className="size-5" />}
              label={t.salaryTitle}
              value={`+${result.salaryGrowth}%`}
              sub={t.salarySub}
              accent
            />
          </Section>
          <Section delay={0.1}>
            <StatCard
              icon={<CalendarClock className="size-5" />}
              label={t.timelineTitle}
              value={`${result.estimatedMonths} ${t.months}`}
              sub={`${result.weeklyHours} ${t.hoursPerWeek}`}
            />
          </Section>
          <Section delay={0.15}>
            <StatCard
              icon={<Award className="size-5" />}
              label={t.recsTitle}
              value={`${result.recommendations.length}`}
              sub={t.recsSub}
            />
          </Section>
        </div>

        {/* Skill gaps */}
        <Section delay={0.05} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.gapsTitle}</CardTitle>
              <p className="text-sm text-muted-foreground">{t.gapsSub}</p>
            </CardHeader>
            <CardContent className="grid gap-8 lg:grid-cols-[320px_1fr] lg:items-center">
              <SkillRadar
                gaps={result.skillGaps}
                labels={labels}
                currentLabel={t.current}
                targetLabel={t.target}
              />
              <div className="space-y-4">
                {result.skillGaps.map((g, i) => (
                  <div key={g.key}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium text-foreground">
                        <Icon name={COMPETENCIES[g.key].icon} className="size-4 text-muted-foreground" />
                        {labels[g.key]}
                      </span>
                      <span className="tabular-nums text-muted-foreground">
                        {g.current} / {g.target}
                      </span>
                    </div>
                    <div className="relative h-2.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="absolute inset-y-0 w-0.5 bg-primary/60"
                        style={{ insetInlineStart: `${g.target}%` }}
                      />
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-accent to-primary"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${g.current}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* Strengths & focus */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <Section delay={0.05}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="size-5 text-accent" />
                  {t.strengthsTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.strengths.map((g) => (
                  <div key={g.key} className="flex items-center justify-between rounded-lg bg-mint/60 px-3.5 py-2.5">
                    <span className="text-sm font-medium text-foreground">{labels[g.key]}</span>
                    <span className="text-sm font-bold text-accent tabular-nums">{g.current}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </Section>
          <Section delay={0.1}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="size-5 text-warning" />
                  {t.focusTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.weaknesses.map((g) => (
                  <div key={g.key} className="flex items-center justify-between rounded-lg bg-muted px-3.5 py-2.5">
                    <span className="text-sm font-medium text-foreground">{labels[g.key]}</span>
                    <span className="text-sm font-bold text-warning tabular-nums">+{g.gap}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </Section>
        </div>

        {/* Recommendations */}
        <Section delay={0.05} className="mt-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{t.recsTitle}</h2>
            <p className="mt-1 text-muted-foreground">{t.recsSub}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {result.recommendations.map((rec, i) => (
              <RecommendationCard key={rec.cert.id} rec={rec} locale={locale} t={t} index={i} />
            ))}
          </div>
        </Section>

        {/* Roadmap */}
        <Section delay={0.05} className="mt-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{t.roadmapTitle}</h2>
            <p className="mt-1 text-muted-foreground">{t.roadmapSub}</p>
          </div>
          <Card className="p-6 sm:p-8">
            <ol className="relative space-y-6 border-s-2 border-dashed border-border ps-6">
              {result.roadmap.map((m, i) => (
                <motion.li
                  key={m.order}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="relative"
                >
                  <span
                    className={cn(
                      "absolute -start-[1.72rem] mt-1 flex size-5 items-center justify-center rounded-full ring-4 ring-card",
                      m.kind === "goal"
                        ? "bg-accent"
                        : m.kind === "role"
                          ? "bg-primary"
                          : m.kind === "certification"
                            ? "bg-secondary"
                            : "bg-muted-foreground"
                    )}
                  >
                    <span className="size-1.5 rounded-full bg-card" />
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t.month} {m.monthOffset}
                    </span>
                    {m.kind === "certification" && (
                      <Badge variant="outline" className="text-[0.65rem]">
                        <Award className="size-3" />
                      </Badge>
                    )}
                  </div>
                  <h4 className="mt-0.5 font-semibold text-foreground">{m.title[locale]}</h4>
                  <p className="text-sm text-muted-foreground">{m.detail[locale]}</p>
                </motion.li>
              ))}
            </ol>
          </Card>
        </Section>

        {/* Footer actions */}
        <Section delay={0.05} className="mt-10 text-center">
          <Button variant="outline" size="lg" onClick={onRestart}>
            <RotateCcw className="size-4" />
            {t.restart}
          </Button>
          <p className="mx-auto mt-6 max-w-2xl text-xs leading-relaxed text-muted-foreground">
            {t.disclaimer}
          </p>
        </Section>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <Card className={cn("h-full p-6", accent && "bg-primary text-primary-foreground")}>
      <div
        className={cn(
          "flex size-10 items-center justify-center rounded-xl",
          accent ? "bg-white/15 text-primary-foreground" : "bg-mint text-mint-foreground"
        )}
      >
        {icon}
      </div>
      <p className={cn("mt-4 text-sm", accent ? "text-primary-foreground/80" : "text-muted-foreground")}>
        {label}
      </p>
      <p className="mt-0.5 text-3xl font-bold tracking-tight tabular-nums">{value}</p>
      <p className={cn("mt-1 text-xs", accent ? "text-primary-foreground/70" : "text-muted-foreground")}>
        {sub}
      </p>
    </Card>
  );
}

function RecommendationCard({
  rec,
  locale,
  t,
  index,
}: {
  rec: ScoredCertification;
  locale: Locale;
  t: Dictionary["results"];
  index: number;
}) {
  const { cert } = rec;
  const style = PRIORITY_STYLE[rec.priority];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.45 }}
    >
      <Card className={cn("group h-full p-5 ring-1 ring-inset transition-shadow hover:shadow-lift", style.ring)}>
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
          <Badge variant={style.badge}>{t.priority[rec.priority]}</Badge>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={{ width: 0 }}
              whileInView={{ width: `${rec.match}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
            />
          </div>
          <span className="text-xs font-bold text-accent tabular-nums">
            {rec.match}% {t.match}
          </span>
        </div>

        <p className="mt-3 text-sm text-foreground/90">{rec.reason[locale]}</p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Star className="size-3.5 fill-warning text-warning" />
            {cert.rating.toFixed(1)}
          </span>
          <span className="inline-flex items-center gap-1">
            <TrendingUp className="size-3.5" />
            +{cert.salaryImpact}%
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {cert.durationWeeks}w
          </span>
          <span className="inline-flex items-center gap-1">
            <DollarSign className="size-3.5" />
            {cert.examCost}
          </span>
        </div>

        <div className="mt-4 flex justify-end border-t border-border pt-3">
          <SaveButton
            slug={cert.id}
            locale={locale}
            labels={{ save: t.save, saved: t.saved, signInToSave: t.signInToSave }}
          />
        </div>
      </Card>
    </motion.div>
  );
}
