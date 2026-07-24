import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { isLocale, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { getUser } from "@/lib/auth";
import { getAssessmentById } from "@/lib/data/assessments";
import { StoredResult } from "@/components/results/stored-result";

export default async function StoredAssessmentPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);

  const user = await getUser();
  if (!user) redirect(`/${locale}/sign-in`);

  const data = await getAssessmentById(id);
  if (!data) redirect(`/${locale}/dashboard`);

  return (
    <div>
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <Link
          href={`/${locale}/dashboard`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {dict.dashboard.title}
        </Link>
      </div>
      <StoredResult
        result={data.result}
        answers={data.answers}
        locale={locale as Locale}
        dict={dict}
      />
    </div>
  );
}
