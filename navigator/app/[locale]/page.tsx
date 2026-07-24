import Link from "next/link";
import { ArrowRight, Sparkles, Gauge, Fingerprint, Map, TrendingUp, Globe2 } from "lucide-react";
import { isLocale, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getCertificationCount } from "@/lib/data/certifications";
import { getArchetypeCount } from "@/lib/data/archetypes";
import { Reveal } from "@/components/reveal";

const FEATURE_ICONS = [Gauge, Sparkles, Fingerprint, Map, TrendingUp, Globe2];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  const t = dict.home;

  const [certCount, archetypeCount] = await Promise.all([
    getCertificationCount(),
    getArchetypeCount(),
  ]);

  const stats = [
    { value: `${certCount * 40}+`, label: t.stat1 },
    { value: `${archetypeCount}`, label: t.stat2 },
    { value: "4", label: t.stat3 },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-radial-mint" />
        <div className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-grid" />
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pt-28">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-mint px-4 py-1.5 text-sm font-medium text-mint-foreground">
              <Sparkles className="size-4" />
              {t.eyebrow}
            </span>
            <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-6xl">
              {t.title}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
              {t.subtitle}
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={`/${locale}/assessment`}
                className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
              >
                {t.ctaPrimary}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
              <Link
                href="#how"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}
              >
                {t.ctaSecondary}
              </Link>
            </div>
          </Reveal>

          <Reveal
            delay={0.15}
            className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-4 sm:gap-8"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                  {s.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</div>
              </div>
            ))}
          </Reveal>
          <p className="mt-10 text-center text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {t.trustedBy}
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t.howTitle}
          </h2>
          <p className="mt-4 text-muted-foreground">{t.howSubtitle}</p>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {t.steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.1}>
              <Card className="h-full p-7">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t.featuresTitle}
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {t.features.map((f, i) => {
              const IconCmp = FEATURE_ICONS[i] ?? Sparkles;
              return (
                <Reveal key={f.title} delay={(i % 3) * 0.08}>
                  <Card className="group h-full p-6 transition-shadow hover:shadow-lift">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-mint text-mint-foreground transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                      <IconCmp className="size-5" />
                    </div>
                    <h3 className="mt-5 font-semibold text-foreground">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center shadow-lift sm:px-16">
            <div className="absolute inset-0 -z-0 opacity-40 bg-grid" />
            <div className="relative z-10 mx-auto max-w-2xl">
              <h2 className="text-balance text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                {t.finalCtaTitle}
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-primary-foreground/80">{t.finalCtaBody}</p>
              <Link
                href={`/${locale}/assessment`}
                className={cn(buttonVariants({ variant: "accent", size: "lg" }), "mt-8")}
              >
                {t.ctaPrimary}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <span>
            © {new Date().getFullYear()} {dict.brand.name} · {dict.brand.product}
          </span>
          <span>{dict.brand.tagline}</span>
        </div>
      </footer>
    </>
  );
}
