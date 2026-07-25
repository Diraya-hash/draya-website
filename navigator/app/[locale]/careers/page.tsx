import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Layers } from "lucide-react";
import { isLocale, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { getFamiliesWithRoles, getSkillTree } from "@/lib/graph/queries";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/reveal";
import { SkillTree } from "@/components/careers/skill-tree";

type Level = "entry" | "mid" | "senior" | "lead" | "executive";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return { title: dict.careers.title };
}

export default async function CareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  const t = dict.careers;

  const [families, skillTree] = await Promise.all([
    getFamiliesWithRoles(locale as Locale),
    Promise.resolve(getSkillTree(locale as Locale)),
  ]);

  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-radial-mint" />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <Reveal>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t.title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t.subtitle}</p>
        </Reveal>

        {/* Job families → roles */}
        <section className="mt-10 space-y-8">
          {families.map((group, gi) => (
            <Reveal key={group.family.slug} delay={gi * 0.04}>
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground">{group.family.name}</h2>
                  <Badge variant="muted">{group.roles.length}</Badge>
                </div>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {group.roles.map((role) => (
                    <Link key={role.slug} href={`/${locale}/careers/${role.slug}`} className="group">
                      <Card className="h-full p-5 transition-shadow group-hover:shadow-lift">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="mint">{t.levels[role.level as Level] ?? role.level}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {role.experienceYears}+ {t.yearsExp}
                          </span>
                        </div>
                        <h3 className="mt-3 font-semibold leading-tight text-foreground">{role.title}</h3>
                        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{role.summary}</p>
                        <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent">
                          {t.viewRole}
                          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
                        </span>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </section>

        {/* Skills ontology */}
        <section className="mt-14">
          <Reveal>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-mint text-mint-foreground">
                <Layers className="size-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-foreground">{t.ontologyTitle}</h2>
                <p className="text-sm text-muted-foreground">{t.ontologySub}</p>
              </div>
            </div>
            <SkillTree roots={skillTree} />
          </Reveal>
        </section>
      </div>
    </div>
  );
}
