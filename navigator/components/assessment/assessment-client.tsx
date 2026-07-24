"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COMPETENCY_LIST } from "@/lib/assessment/competencies";
import {
  INDUSTRIES,
  EXPERIENCE_LEVELS,
  EDUCATION_LEVELS,
  LEARNING_STYLES,
  LEARNING_METHODS,
  BUDGET_BANDS,
  STUDY_TIME_BANDS,
  INTERESTS,
} from "@/lib/assessment/questions";
import { generateAssessment } from "@/lib/assessment/engine";
import type { AssessmentAnswers, AssessmentResult } from "@/lib/assessment/types";
import { FieldLabel, OptionGrid, Segmented, MultiSelect, SkillSlider } from "./controls";
import { ResultsView } from "@/components/results/results-view";

const STEP_KEYS = ["about", "goals", "skills", "learning", "interests"] as const;
type StepKey = (typeof STEP_KEYS)[number];

const DEFAULT_ANSWERS: AssessmentAnswers = {
  name: "",
  currentRole: "",
  industry: "",
  experience: "",
  education: "",
  targetRole: "",
  targetIndustry: "",
  timeframeMonths: 12,
  salaryGoal: 20,
  skills: { leadership: 2, technical: 2, business: 2, aiData: 1, communication: 3, project: 2 },
  learningStyle: "",
  learningMethod: "",
  budget: "",
  studyTime: "",
  interests: [],
};

export function AssessmentClient({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const reduce = useReducedMotion();
  const [answers, setAnswers] = React.useState<AssessmentAnswers>(DEFAULT_ANSWERS);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [showErrors, setShowErrors] = React.useState(false);
  const [phase, setPhase] = React.useState<"form" | "analysing" | "results">("form");
  const [result, setResult] = React.useState<AssessmentResult | null>(null);
  const topRef = React.useRef<HTMLDivElement>(null);

  const t = dict.assessment;
  const stepKey: StepKey = STEP_KEYS[stepIndex];

  function set<K extends keyof AssessmentAnswers>(key: K, value: AssessmentAnswers[K]) {
    setAnswers((a) => ({ ...a, [key]: value }));
  }

  function isStepValid(key: StepKey): boolean {
    switch (key) {
      case "about":
        return Boolean(answers.currentRole.trim() && answers.industry && answers.experience && answers.education);
      case "goals":
        return Boolean(answers.targetRole.trim() && answers.targetIndustry);
      case "skills":
        return true;
      case "learning":
        return Boolean(answers.learningStyle && answers.learningMethod && answers.budget && answers.studyTime);
      case "interests":
        return answers.interests.length > 0;
    }
  }

  function scrollTop() {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function next() {
    if (!isStepValid(stepKey)) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    if (stepIndex < STEP_KEYS.length - 1) {
      setStepIndex((i) => i + 1);
      scrollTop();
    } else {
      finish();
    }
  }

  function back() {
    setShowErrors(false);
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
      scrollTop();
    }
  }

  function finish() {
    setPhase("analysing");
    // Brief analysis animation, then compute deterministically.
    window.setTimeout(() => {
      setResult(generateAssessment(answers, locale));
      setPhase("results");
      scrollTop();
    }, 1500);
  }

  function restart() {
    setAnswers(DEFAULT_ANSWERS);
    setStepIndex(0);
    setResult(null);
    setShowErrors(false);
    setPhase("form");
    scrollTop();
  }

  const toggleInterest = (v: string) =>
    set(
      "interests",
      answers.interests.includes(v)
        ? answers.interests.filter((x) => x !== v)
        : [...answers.interests, v]
    );

  if (phase === "results" && result) {
    return (
      <div ref={topRef} className="scroll-mt-24">
        <ResultsView result={result} answers={answers} locale={locale} dict={dict} onRestart={restart} />
      </div>
    );
  }

  if (phase === "analysing") {
    return <Analysing label={t.analysing} />;
  }

  const progress = ((stepIndex + (isStepValid(stepKey) ? 1 : 0)) / STEP_KEYS.length) * 100;
  const invalid = showErrors && !isStepValid(stepKey);

  return (
    <div ref={topRef} className="mx-auto max-w-3xl scroll-mt-24 px-4 py-10 sm:px-6 sm:py-14">
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">
            {t.step} {stepIndex + 1} <span className="text-muted-foreground">{t.of} {STEP_KEYS.length}</span>
          </span>
          <div className="hidden items-center gap-1.5 sm:flex">
            {STEP_KEYS.map((k, i) => (
              <span
                key={k}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i < stepIndex ? "w-6 bg-accent" : i === stepIndex ? "w-8 bg-primary" : "w-6 bg-muted"
                )}
              />
            ))}
          </div>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-accent to-primary"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
      </div>

      {/* Step header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t.steps[stepKey].title}
        </h1>
        <p className="mt-1.5 text-muted-foreground">{t.steps[stepKey].desc}</p>
      </div>

      {/* Step body — keyed so each step remounts and replays its enter animation. */}
      <div>
        <motion.div
          key={stepKey}
          initial={reduce ? false : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          {stepKey === "about" && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <FieldLabel>{t.fields.name}</FieldLabel>
                  <Input
                    value={answers.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder={t.fields.namePlaceholder}
                  />
                </div>
                <div>
                  <FieldLabel error={invalid && !answers.currentRole.trim()}>
                    {t.fields.currentRole}
                  </FieldLabel>
                  <Input
                    value={answers.currentRole}
                    onChange={(e) => set("currentRole", e.target.value)}
                    placeholder={t.fields.currentRolePlaceholder}
                    aria-invalid={invalid && !answers.currentRole.trim()}
                    className={cn(invalid && !answers.currentRole.trim() && "border-destructive")}
                  />
                </div>
              </div>
              <div>
                <FieldLabel error={invalid && !answers.industry}>{t.fields.industry}</FieldLabel>
                <OptionGrid
                  options={INDUSTRIES}
                  value={answers.industry}
                  onChange={(v) => set("industry", v as AssessmentAnswers["industry"])}
                  locale={locale}
                  columns={2}
                  invalid={invalid && !answers.industry}
                />
              </div>
              <div>
                <FieldLabel error={invalid && !answers.experience}>{t.fields.experience}</FieldLabel>
                <OptionGrid
                  options={EXPERIENCE_LEVELS}
                  value={answers.experience}
                  onChange={(v) => set("experience", v as AssessmentAnswers["experience"])}
                  locale={locale}
                  columns={3}
                  invalid={invalid && !answers.experience}
                />
              </div>
              <div>
                <FieldLabel error={invalid && !answers.education}>{t.fields.education}</FieldLabel>
                <Segmented
                  options={EDUCATION_LEVELS}
                  value={answers.education}
                  onChange={(v) => set("education", v as AssessmentAnswers["education"])}
                  locale={locale}
                  invalid={invalid && !answers.education}
                />
              </div>
            </>
          )}

          {stepKey === "goals" && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <FieldLabel error={invalid && !answers.targetRole.trim()}>
                    {t.fields.targetRole}
                  </FieldLabel>
                  <Input
                    value={answers.targetRole}
                    onChange={(e) => set("targetRole", e.target.value)}
                    placeholder={t.fields.targetRolePlaceholder}
                    className={cn(invalid && !answers.targetRole.trim() && "border-destructive")}
                  />
                </div>
              </div>
              <div>
                <FieldLabel error={invalid && !answers.targetIndustry}>
                  {t.fields.targetIndustry}
                </FieldLabel>
                <OptionGrid
                  options={INDUSTRIES}
                  value={answers.targetIndustry}
                  onChange={(v) => set("targetIndustry", v as AssessmentAnswers["targetIndustry"])}
                  locale={locale}
                  columns={2}
                  invalid={invalid && !answers.targetIndustry}
                />
              </div>
              <RangeField
                label={t.fields.timeframe}
                value={answers.timeframeMonths}
                min={3}
                max={36}
                step={3}
                suffix={t.fields.timeframeValue}
                onChange={(v) => set("timeframeMonths", v)}
              />
              <RangeField
                label={t.fields.salaryGoal}
                value={answers.salaryGoal}
                min={5}
                max={60}
                step={5}
                suffix="%"
                onChange={(v) => set("salaryGoal", v)}
              />
            </>
          )}

          {stepKey === "skills" && (
            <>
              <p className="text-sm text-muted-foreground">{t.fields.skillsHint}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {COMPETENCY_LIST.map((c) => (
                  <SkillSlider
                    key={c.key}
                    label={c.label[locale]}
                    description={c.description[locale]}
                    icon={c.icon}
                    value={answers.skills[c.key]}
                    onChange={(v) => set("skills", { ...answers.skills, [c.key]: v })}
                  />
                ))}
              </div>
            </>
          )}

          {stepKey === "learning" && (
            <>
              <div>
                <FieldLabel error={invalid && !answers.learningStyle}>
                  {t.fields.learningStyle}
                </FieldLabel>
                <OptionGrid
                  options={LEARNING_STYLES}
                  value={answers.learningStyle}
                  onChange={(v) => set("learningStyle", v as AssessmentAnswers["learningStyle"])}
                  locale={locale}
                  columns={4}
                  invalid={invalid && !answers.learningStyle}
                />
              </div>
              <div>
                <FieldLabel error={invalid && !answers.learningMethod}>
                  {t.fields.learningMethod}
                </FieldLabel>
                <OptionGrid
                  options={LEARNING_METHODS}
                  value={answers.learningMethod}
                  onChange={(v) => set("learningMethod", v as AssessmentAnswers["learningMethod"])}
                  locale={locale}
                  columns={4}
                  invalid={invalid && !answers.learningMethod}
                />
              </div>
              <div>
                <FieldLabel error={invalid && !answers.budget}>{t.fields.budget}</FieldLabel>
                <Segmented
                  options={BUDGET_BANDS}
                  value={answers.budget}
                  onChange={(v) => set("budget", v as AssessmentAnswers["budget"])}
                  locale={locale}
                  invalid={invalid && !answers.budget}
                />
              </div>
              <div>
                <FieldLabel error={invalid && !answers.studyTime}>{t.fields.studyTime}</FieldLabel>
                <Segmented
                  options={STUDY_TIME_BANDS}
                  value={answers.studyTime}
                  onChange={(v) => set("studyTime", v as AssessmentAnswers["studyTime"])}
                  locale={locale}
                  invalid={invalid && !answers.studyTime}
                />
              </div>
            </>
          )}

          {stepKey === "interests" && (
            <>
              <FieldLabel hint={t.fields.interestsHint} error={invalid}>
                {t.fields.interests}
              </FieldLabel>
              <MultiSelect
                options={INTERESTS}
                values={answers.interests}
                onToggle={toggleInterest}
                locale={locale}
                max={5}
              />
            </>
          )}
        </motion.div>
      </div>

      {invalid && (
        <p className="mt-5 text-sm font-medium text-destructive">{t.validation.required}</p>
      )}

      {/* Nav */}
      <div className="mt-9 flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={back} disabled={stepIndex === 0} className={cn(stepIndex === 0 && "invisible")}>
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t.back}
        </Button>
        <Button onClick={next} size="lg">
          {stepIndex === STEP_KEYS.length - 1 ? (
            <>
              {t.finish}
              <Check className="size-4" />
            </>
          ) : (
            <>
              {t.next}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <FieldLabel>{label}</FieldLabel>
        <span className="rounded-md bg-primary px-2.5 py-1 text-sm font-bold text-primary-foreground tabular-nums">
          {value} {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="skill-range mt-2 w-full"
        style={{
          background: `linear-gradient(to right, hsl(var(--accent)) ${pct}%, hsl(var(--muted)) ${pct}%)`,
        }}
        aria-label={label}
      />
    </div>
  );
}

function Analysing({ label }: { label: string }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="relative flex size-20 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-accent/20" />
        <span className="flex size-20 items-center justify-center rounded-full bg-mint">
          <Loader2 className="size-8 animate-spin text-accent" />
        </span>
      </div>
      <p className="mt-6 text-lg font-semibold text-foreground">{label}</p>
      <div className="mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full w-1/2 rounded-full bg-accent"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
