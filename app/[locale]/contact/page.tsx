import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import ContactForm from "@/components/ContactForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return { title: dict.nav.contact };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const info = dict.contact.info;

  const items = [
    { label: info.addressLabel, value: info.address },
    { label: info.emailLabel, value: info.email, ltr: true },
    { label: info.phoneLabel, value: info.phone, ltr: true },
    { label: info.hoursLabel, value: info.hours },
  ];

  return (
    <>
      {/* Title page */}
      <section className="pt-28 sm:pt-36">
        <div className="container-content border-b border-teal-800/15 pb-16 sm:pb-20">
          <span className="eyebrow">{dict.contact.eyebrow}</span>
          <h1 className="mt-8 max-w-4xl text-4xl font-medium leading-[1.2] text-teal-950 sm:text-5xl sm:leading-[1.18]">
            {dict.contact.title}
          </h1>
          <p className="mt-8 max-w-2xl text-lg font-light leading-9 text-ink-soft">
            {dict.contact.subtitle}
          </p>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="container-content grid gap-20 lg:grid-cols-12 lg:gap-16">
          {/* Directory */}
          <aside className="lg:col-span-4">
            <dl>
              {items.map((item, i) => (
                <div
                  key={item.label}
                  className={`py-7 ${i > 0 ? "border-t border-teal-800/15" : "pt-0"}`}
                >
                  <dt className="text-xs font-medium uppercase tracking-caps text-teal-600">
                    {item.label}
                  </dt>
                  <dd
                    className="mt-3 text-sm font-light leading-8 text-ink"
                    dir={item.ltr ? "ltr" : undefined}
                    style={item.ltr && locale === "ar" ? { textAlign: "right" } : undefined}
                  >
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>

          {/* Form */}
          <div className="lg:col-span-7 lg:col-start-6">
            <ContactForm dict={dict} />
          </div>
        </div>
      </section>
    </>
  );
}
