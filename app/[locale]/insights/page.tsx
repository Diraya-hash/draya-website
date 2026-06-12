import type { Metadata } from "next";
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
  return { title: dict.nav.insights };
}

export default async function InsightsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  const [featured, ...rest] = dict.insights;

  return (
    <>
      {/* Title page */}
      <section className="pt-28 sm:pt-36">
        <div className="container-content border-b border-teal-800/15 pb-16 sm:pb-20">
          <span className="eyebrow">{dict.insightsPage.eyebrow}</span>
          <h1 className="mt-8 max-w-4xl text-4xl font-medium leading-[1.2] text-teal-950 sm:text-5xl sm:leading-[1.18]">
            {dict.insightsPage.title}
          </h1>
          <p className="mt-8 max-w-2xl text-lg font-light leading-9 text-ink-soft">
            {dict.insightsPage.subtitle}
          </p>
        </div>
      </section>

      {/* Lead essay */}
      <section className="py-20 sm:py-24">
        <div className="container-content">
          <article className="group cursor-pointer">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
              <span className="font-medium uppercase tracking-caps text-teal-600">
                {featured.category}
              </span>
              <span className="text-ink-mute">{featured.date}</span>
              <span className="text-ink-mute">
                {featured.readTime} {dict.insightsPage.minutes}
              </span>
            </div>
            <h2 className="mt-7 max-w-3xl text-3xl font-medium leading-[1.3] text-teal-950 transition-colors duration-300 group-hover:text-teal-600 sm:text-4xl sm:leading-[1.25]">
              {featured.title}
            </h2>
            <p className="mt-7 max-w-2xl text-base font-light leading-9 text-ink-soft sm:text-lg">
              {featured.excerpt}
            </p>
            <span className="text-link mt-9">
              {dict.insightsPage.readMore}
              <ArrowIcon />
            </span>
          </article>
        </div>
      </section>

      {/* Index of essays */}
      <section className="pb-28 sm:pb-36">
        <div className="container-content">
          {rest.map((article, i) => (
            <article
              key={article.title}
              className={`group grid cursor-pointer gap-4 border-t border-teal-800/15 py-12 lg:grid-cols-12 lg:gap-10 ${
                i === rest.length - 1 ? "border-b" : ""
              }`}
            >
              <div className="text-xs lg:col-span-3">
                <p className="font-medium uppercase tracking-caps text-teal-600">
                  {article.category}
                </p>
                <p className="mt-2.5 text-ink-mute">{article.date}</p>
                <p className="mt-1 text-ink-mute">
                  {article.readTime} {dict.insightsPage.minutes}
                </p>
              </div>
              <div className="lg:col-span-8">
                <h2 className="text-xl font-medium leading-relaxed text-teal-950 transition-colors duration-300 group-hover:text-teal-600 sm:text-2xl">
                  {article.title}
                </h2>
                <p className="mt-4 max-w-2xl text-sm font-light leading-8 text-ink-soft">
                  {article.excerpt}
                </p>
              </div>
              <span className="hidden text-teal-500 lg:col-span-1 lg:flex lg:justify-self-end lg:pt-2">
                <ArrowIcon />
              </span>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
