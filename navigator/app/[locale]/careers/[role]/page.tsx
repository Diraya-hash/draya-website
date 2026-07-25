import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Star, Clock, DollarSign, TrendingUp, Briefcase } from "lucide-react";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { getRoleGraph, getAllRoleSlugs } from "@/lib/graph/queries";
import { COMPETENCIES, type CompetencyKey } from "@/lib/assessment/competencies";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

type Level = "entry" | "mid" | "senior" | "lead" | "executive";

export function generateStaticParams() {
  const slugs = getAllRoleSlugs();
  return locales.flatMap((locale) => slugs.map((role) => ({ locale, role })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; role: string }> }) {
  const { locale, role } = await params;
  if (!isLocale(locale)) return {};
  const graph = await getRoleGraph(role, locale);
  return { title: graph?.title ?? "Role" };
}

export default async function RolePage({ params }: { params: Promise<{ locale: string; role: string }> }) {
  const { locale, role } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  const t = dict.careers;
  const g = await getRoleGraph(role, locale as Locale);
  if (!g) notFound();

  const compLabel = (key: string) =>
    COMPETENCIES[key as CompetencyKey]?.label[locale as Locale] ?? key;

  const stats = [
    { icon: <DollarSign className="size-4" />, label: t.salaryTitle, value: `$${(g.salary.median / 1000).toFixed(0)}k` },
    { icon: <TrendingUp className="size-4" />, label: t.saudiDemand, value: `${g.demand.saudi}` },
    { icon: <TrendingUp className="size-4" />, label: t.globalDemand, value: `${g.demand.global}` },
    { icon: <TrendingUp className="size-4" />, label: t.futureDemand, value: `${g.demand.future}` },
  ];

  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-radial-mint" />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link
          href={`/${locale}/careers`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t.backToCareers}
        </Link>

        {/* Header */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="mint">{t.levels[g.level as Level] ?? g.level}</Badge>
          {g.family && <Badge variant="muted">{g.family.name}</Badge>}
          <span className="text-xs text-muted-foreground">
            {g.experienceYears}+ {t.yearsExp}
          </span>
        </div>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          <Briefcase className="size-7 text-accent" />
          {g.title}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{g.summary}</p>

        {/* Stat row */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s, i) => (
            <Card key={i} className="p-4">
              <div className="flex size-8 items-center justify-center rounded-lg bg-mint text-mint-foreground">
                {s.icon}
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </Card>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Responsibilities */}
          {g.responsibilities.length > 0 && (
            <Card className="p-6">
              <h2 className="font-semibold text-foreground">{t.responsibilitiesTitle}</h2>
              <ul className="mt-3 space-y-2">
                {g.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                    {r}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Required skills grouped by competency */}
          <Card className="p-6">
            <h2 className="font-semibold text-foreground">{t.requiredSkillsTitle}</h2>
            <div className="mt-3 space-y-4">
              {g.skillsByCompetency.map((group) => (
                <div key={group.competency}>
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Icon name={COMPETENCIES[group.competency as CompetencyKey]?.icon} className="size-3.5" />
                    {compLabel(group.competency)}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.skills.map((s) => (
                      <span key={s.slug} className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recommended certifications */}
        {g.recommendedCerts.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 text-xl font-bold tracking-tight text-foreground">{t.recommendedCertsTitle}</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {g.recommendedCerts.map((c) => (
                <Card key={c.slug} className="flex items-center gap-3 p-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground">
                    {c.abbr.slice(0, 3).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-foreground">{c.name}</h3>
                    <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Clock className="size-3" />{c.weeks}w</span>
                      <span className="inline-flex items-center gap-1"><DollarSign className="size-3" />{c.cost}</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-accent">
                    <Star className="size-3.5 fill-accent" />
                    {Math.round(c.strength * 100)}% {t.matchStrength}
                  </span>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Promotion paths */}
        {g.promotions.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-bold tracking-tight text-foreground">{t.promotionsTitle}</h2>
            <p className="mb-4 text-sm text-muted-foreground">{t.promotionsSub}</p>
            <div className="flex flex-wrap gap-3">
              {g.promotions.map((p) => (
                <Link
                  key={p.slug}
                  href={`/${locale}/careers/${p.slug}`}
                  className={cn(
                    "group inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3",
                    "transition-colors hover:border-accent/50 hover:bg-mint/40"
                  )}
                >
                  <span className="flex flex-col">
                    <span className="text-xs text-muted-foreground">{t.levels[p.level as Level] ?? p.level}</span>
                    <span className="font-semibold text-foreground">{p.title}</span>
                  </span>
                  <ArrowUpRight className="size-4 text-accent transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
