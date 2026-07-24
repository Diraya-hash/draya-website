import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, Award, BookmarkCheck, CheckCircle2, Clock, History } from "lucide-react";
import { isLocale, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { getUser, displayName } from "@/lib/auth";
import { getLatestAssessment, getAssessmentHistory } from "@/lib/data/assessments";
import { getSavedCertifications } from "@/lib/data/saved";
import { getArchetypes } from "@/lib/data/archetypes";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ReadinessGauge } from "@/components/results/charts";
import { SavedCard } from "@/components/dashboard/saved-card";
import { cn } from "@/lib/utils";

type Band = "emerging" | "developing" | "proficient" | "advanced";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return { title: dict.dashboard.title };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  const t = dict.dashboard;

  const user = await getUser();
  if (!user) redirect(`/${locale}/sign-in`);

  const [latest, history, saved, archetypes] = await Promise.all([
    getLatestAssessment(),
    getAssessmentHistory(),
    getSavedCertifications(),
    getArchetypes(),
  ]);

  const archetypeName = (slug: string | null) =>
    slug ? (archetypes.find((a) => a.id === slug)?.name[locale] ?? "") : "";

  const completed = saved.filter((s) => s.status === "completed").length;
  const totalHours = saved.reduce((sum, s) => sum + s.hoursLogged, 0);
  const dateFmt = new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const stats = [
    { icon: <History className="size-5" />, label: t.statsAssessments, value: history.length },
    { icon: <BookmarkCheck className="size-5" />, label: t.statsSaved, value: saved.length },
    { icon: <CheckCircle2 className="size-5" />, label: t.statsCompleted, value: completed },
    { icon: <Clock className="size-5" />, label: t.statsHours, value: totalHours },
  ];

  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-radial-mint" />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t.title}</h1>
          <p className="text-muted-foreground">
            {t.welcome.replace("{name}", displayName(user))}
          </p>
        </div>

        {/* Readiness + stats */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <Card className="flex flex-col items-center justify-center p-8 text-center">
            {latest ? (
              <>
                <p className="mb-1 font-semibold text-foreground">{t.readinessTitle}</p>
                <p className="mb-5 text-sm text-muted-foreground">{t.readinessSub}</p>
                <ReadinessGauge
                  value={latest.readiness_index}
                  bandLabel={dict.results.bands[latest.readiness_band as Band] ?? ""}
                />
                {archetypeName(latest.archetype_slug) && (
                  <Badge variant="mint" className="mt-4">
                    <Award className="size-3.5" />
                    {archetypeName(latest.archetype_slug)}
                  </Badge>
                )}
                <Link
                  href={`/${locale}/assessment`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-5")}
                >
                  {t.retake}
                </Link>
              </>
            ) : (
              <>
                <div className="flex size-14 items-center justify-center rounded-2xl bg-mint text-mint-foreground">
                  <Award className="size-7" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-foreground">{t.noAssessmentTitle}</h2>
                <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">{t.noAssessmentBody}</p>
                <Link
                  href={`/${locale}/assessment`}
                  className={cn(buttonVariants({ size: "sm" }), "mt-5")}
                >
                  {t.takeAssessment}
                  <ArrowRight className="size-4 rtl:rotate-180" />
                </Link>
              </>
            )}
          </Card>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
            {stats.map((s) => (
              <Card key={s.label} className="p-6">
                <div className="flex size-10 items-center justify-center rounded-xl bg-mint text-mint-foreground">
                  {s.icon}
                </div>
                <p className="mt-4 text-3xl font-bold tracking-tight text-foreground tabular-nums">
                  {s.value}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">{s.label}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Saved certifications */}
        <section className="mt-12">
          <h2 className="mb-5 text-xl font-bold tracking-tight text-foreground">{t.savedTitle}</h2>
          {saved.length ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {saved.map((item) => (
                <SavedCard
                  key={item.cert.id}
                  item={item}
                  locale={locale as Locale}
                  labels={{
                    status: t.status,
                    markStatus: t.markStatus,
                    progressLabel: t.progressLabel,
                    hoursLabel: t.hoursLabel,
                    remove: t.remove,
                  }}
                />
              ))}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center p-10 text-center">
              <p className="text-muted-foreground">{t.savedEmpty}</p>
              <Link
                href={`/${locale}/assessment`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
              >
                {t.browseCerts}
              </Link>
            </Card>
          )}
        </section>

        {/* Assessment history */}
        <section className="mt-12">
          <h2 className="mb-5 text-xl font-bold tracking-tight text-foreground">{t.historyTitle}</h2>
          {history.length ? (
            <Card className="divide-y divide-border">
              {history.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-4 p-4 sm:p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl bg-mint text-mint-foreground">
                      <span className="text-lg font-bold leading-none tabular-nums">
                        {a.readiness_index}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">
                        {archetypeName(a.archetype_slug) || dict.results.readinessTitle}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {dateFmt.format(new Date(a.created_at))}
                        {a.target_role ? ` · ${a.target_role}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="mint" className="hidden sm:inline-flex">
                      {dict.results.bands[a.readiness_band as Band] ?? ""}
                    </Badge>
                    <Link
                      href={`/${locale}/dashboard/assessments/${a.id}`}
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                    >
                      {t.viewResult}
                      <ArrowRight className="size-4 rtl:rotate-180" />
                    </Link>
                  </div>
                </div>
              ))}
            </Card>
          ) : (
            <Card className="flex items-center justify-center p-10 text-center">
              <p className="text-muted-foreground">{t.historyEmpty}</p>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
