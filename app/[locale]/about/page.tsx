import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import SectionHeading from "@/components/SectionHeading";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return { title: dict.nav.about };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <>
      {/* Title page */}
      <section className="pt-28 sm:pt-36">
        <div className="container-content border-b border-teal-800/15 pb-16 sm:pb-20">
          <span className="eyebrow">{dict.about.eyebrow}</span>
          <h1 className="mt-8 max-w-4xl text-4xl font-medium leading-[1.2] text-teal-950 sm:text-5xl sm:leading-[1.18]">
            {dict.about.title}
          </h1>
          <p className="mt-8 max-w-2xl text-lg font-light leading-9 text-ink-soft">
            {dict.about.intro}
          </p>
        </div>
      </section>

      {/* Mission & vision */}
      <section className="py-24 sm:py-32">
        <div className="container-content grid gap-x-16 gap-y-14 lg:grid-cols-2">
          <div>
            <h2 className="eyebrow">{dict.about.mission.title}</h2>
            <p className="mt-7 text-xl font-light leading-10 text-teal-950 sm:text-2xl sm:leading-[1.8]">
              {dict.about.mission.text}
            </p>
          </div>
          <div>
            <h2 className="eyebrow">{dict.about.vision.title}</h2>
            <p className="mt-7 text-xl font-light leading-10 text-teal-950 sm:text-2xl sm:leading-[1.8]">
              {dict.about.vision.text}
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-mint py-24 sm:py-32">
        <div className="container-content">
          <SectionHeading eyebrow={dict.about.eyebrow} title={dict.about.valuesTitle} />
          <div className="mt-16 grid gap-x-12 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {dict.about.values.map((value, i) => (
              <div key={value.title} className="border-t border-teal-800/20 pt-7">
                <span className="text-sm font-medium text-teal-500" dir="ltr">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-lg font-medium text-teal-950">{value.title}</h3>
                <p className="mt-3 text-sm font-light leading-7 text-ink-soft">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="py-24 sm:py-32">
        <div className="container-content">
          <SectionHeading
            eyebrow={dict.about.eyebrow}
            title={dict.about.approachTitle}
            subtitle={dict.about.approachSubtitle}
          />
          <ol className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-5">
            {dict.about.approach.map((stage) => (
              <li key={stage.step} className="border-t border-teal-800/20 pt-7">
                <span className="text-sm font-medium text-teal-500" dir="ltr">
                  {stage.step}
                </span>
                <h3 className="mt-4 text-lg font-medium text-teal-950">{stage.title}</h3>
                <p className="mt-3 text-sm font-light leading-7 text-ink-soft">
                  {stage.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Closing statement */}
      <section className="bg-teal-800 py-24 text-cream sm:py-28">
        <div className="container-content max-w-3xl text-center">
          <h2 className="text-2xl font-medium leading-snug sm:text-3xl">
            {dict.homeCta.title}
          </h2>
          <div className="mt-10">
            <Link href={`/${locale}/contact`} className="btn-light">
              {dict.homeCta.button}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
