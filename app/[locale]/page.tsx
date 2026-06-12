import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import SectionHeading from "@/components/SectionHeading";
import ArrowIcon from "@/components/ArrowIcon";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <>
      {/* Hero — typography only */}
      <section className="pt-28 sm:pt-36 lg:pt-44">
        <div className="container-content">
          <span className="eyebrow">{dict.hero.eyebrow}</span>
          <h1 className="mt-8 max-w-4xl text-4xl font-medium leading-[1.2] text-teal-950 sm:text-6xl sm:leading-[1.15] lg:text-7xl lg:leading-[1.12]">
            {dict.hero.title}
          </h1>
          <p className="mt-10 max-w-2xl text-lg font-light leading-9 text-ink-soft sm:text-xl sm:leading-10">
            {dict.hero.subtitle}
          </p>
          <div className="mt-14 flex flex-wrap items-center gap-8">
            <Link href={`/${locale}/services`} className="btn-primary">
              {dict.hero.ctaPrimary}
            </Link>
            <Link href={`/${locale}/contact`} className="text-link">
              {dict.hero.ctaSecondary}
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* Institutional record */}
      <section className="pt-28 sm:pt-36">
        <div className="container-content">
          <div className="grid grid-cols-2 gap-x-10 gap-y-14 border-t border-teal-800/15 pt-14 lg:grid-cols-4">
            {dict.stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-light text-teal-800 sm:text-5xl" dir="ltr">
                  {stat.value}
                </p>
                <p className="mt-4 text-sm leading-6 text-ink-mute">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services — table of contents */}
      <section className="pt-28 sm:pt-36">
        <div className="container-content">
          <SectionHeading
            eyebrow={dict.servicesPreview.eyebrow}
            title={dict.servicesPreview.title}
            subtitle={dict.servicesPreview.subtitle}
          />

          <div className="mt-20">
            {dict.services.map((service, i) => (
              <Link
                key={service.slug}
                href={`/${locale}/services#${service.slug}`}
                className={`group grid gap-3 border-t border-teal-800/15 py-10 lg:grid-cols-12 lg:items-baseline lg:gap-8 ${
                  i === dict.services.length - 1 ? "border-b" : ""
                }`}
              >
                <span className="text-sm font-medium text-teal-500 lg:col-span-1" dir="ltr">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-xl font-medium text-teal-950 transition-colors duration-300 group-hover:text-teal-600 sm:text-2xl lg:col-span-4">
                  {service.title}
                </h3>
                <p className="text-sm font-light leading-7 text-ink-soft lg:col-span-6">
                  {service.short}
                </p>
                <span className="hidden text-teal-500 lg:col-span-1 lg:flex lg:justify-self-end">
                  <ArrowIcon />
                </span>
              </Link>
            ))}
          </div>

          <Link href={`/${locale}/services`} className="text-link mt-12">
            {dict.servicesPreview.viewAll}
            <ArrowIcon />
          </Link>
        </div>
      </section>

      {/* Why us */}
      <section className="mt-28 bg-mint py-28 sm:mt-36 sm:py-36">
        <div className="container-content">
          <SectionHeading eyebrow={dict.whyUs.eyebrow} title={dict.whyUs.title} />
          <div className="mt-20 grid gap-x-16 gap-y-16 sm:grid-cols-2">
            {dict.whyUs.items.map((item, i) => (
              <div key={item.title} className="border-t border-teal-800/20 pt-8">
                <span className="text-sm font-medium text-teal-500" dir="ltr">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-xl font-medium text-teal-950">{item.title}</h3>
                <p className="mt-4 max-w-md text-sm font-light leading-8 text-ink-soft">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing statement */}
      <section className="bg-teal-800 py-28 text-cream sm:py-36">
        <div className="container-content max-w-3xl text-center">
          <h2 className="text-3xl font-medium leading-snug sm:text-4xl">
            {dict.homeCta.title}
          </h2>
          <p className="mx-auto mt-7 max-w-xl text-base font-light leading-9 text-cream/65">
            {dict.homeCta.subtitle}
          </p>
          <div className="mt-12">
            <Link href={`/${locale}/contact`} className="btn-light">
              {dict.homeCta.button}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
