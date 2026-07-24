"use client";

import { useRouter } from "next/navigation";
import { ResultsView } from "./results-view";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import type { AssessmentResult, AssessmentAnswers } from "@/lib/assessment/types";

/** Renders a persisted assessment via the shared ResultsView. */
export function StoredResult({
  result,
  answers,
  locale,
  dict,
}: {
  result: AssessmentResult;
  answers: AssessmentAnswers;
  locale: Locale;
  dict: Dictionary;
}) {
  const router = useRouter();
  return (
    <ResultsView
      result={result}
      answers={answers}
      locale={locale}
      dict={dict}
      onRestart={() => router.push(`/${locale}/assessment`)}
    />
  );
}
