import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import ArrowIcon from "@/components/ArrowIcon";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return { title: dict.nav.services };
}

export default async function ServicesPage({
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
          <span className="eyebrow">{dict.servicesPage.eyebrow}</span>
          <h1 className="mt-8 max-w-4xl text-4xl font-medium leading-[1.2] text-teal-950 sm:text-5xl sm:leading-[1.18]">
            {dict.servicesPage.title}
          </h1>
          <p className="mt-8 max-w-2xl text-lg font-light leading-9 text-ink-soft">
            {dict.servicesPage.subtitle}
          </p>
        </div>
      </section>

      {/* Chapters */}
      <section className="pb-28 sm:pb-36">
        <div className="container-content">
          {dict.services.map((service, i) => (
            <article
              key={service.slug}
              id={service.slug}
              className={`grid scroll-mt-32 gap-12 py-20 sm:py-24 lg:grid-cols-12 lg:gap-16 ${
                i > 0 ? "border-t border-teal-800/15" : ""
              }`}
            >
              <div className="lg:col-span-7">
                <span className="text-sm font-medium text-teal-500" dir="ltr">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-5 text-2xl font-medium leading-snug text-teal-950 sm:text-3xl">
                  {service.title}
                </h2>
                <p className="mt-7 max-w-xl text-base font-light leading-9 text-ink-soft">
                  {service.description}
                </p>
                <Link href={`/${locale}/contact`} className="text-link mt-10">
                  {dict.hero.ctaSecondary}
                  <ArrowIcon />
                </Link>
              </div>

              <div className="lg:col-span-5">
                <h3 className="text-xs font-medium uppercase tracking-caps text-teal-600">
                  {dict.servicesPage.deliverablesTitle}
                </h3>
                <ul className="mt-4">
                  {service.points.map((point) => (
                    <li
                      key={point}
                      className="border-b border-teal-800/15 py-4 text-sm font-light leading-7 text-ink"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
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
