import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import Logo from "./Logo";

export default function Footer({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const quickLinks = [
    { href: `/${locale}`, label: dict.nav.home },
    { href: `/${locale}/services`, label: dict.nav.services },
    { href: `/${locale}/about`, label: dict.nav.about },
    { href: `/${locale}/insights`, label: dict.nav.insights },
    { href: `/${locale}/contact`, label: dict.nav.contact },
  ];

  return (
    <footer className="bg-teal-800 text-cream">
      <div className="container-content grid gap-14 py-20 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo locale={locale} on="dark" />
          <p className="mt-6 max-w-xs text-sm font-light leading-7 text-cream/60">
            {dict.footer.tagline}
          </p>
        </div>

        <div>
          <h3 className="text-xs font-medium uppercase tracking-caps text-cream/50">
            {dict.footer.quickLinksTitle}
          </h3>
          <ul className="mt-6 space-y-3.5">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-cream/75 transition-colors duration-300 hover:text-mint"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-medium uppercase tracking-caps text-cream/50">
            {dict.footer.servicesTitle}
          </h3>
          <ul className="mt-6 space-y-3.5">
            {dict.services.map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/${locale}/services#${service.slug}`}
                  className="text-sm text-cream/75 transition-colors duration-300 hover:text-mint"
                >
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-medium uppercase tracking-caps text-cream/50">
            {dict.footer.contactTitle}
          </h3>
          <ul className="mt-6 space-y-3.5 text-sm font-light text-cream/75">
            <li>{dict.contact.info.address}</li>
            <li>
              <a
                href={`mailto:${dict.contact.info.email}`}
                className="transition-colors duration-300 hover:text-mint"
                dir="ltr"
              >
                {dict.contact.info.email}
              </a>
            </li>
            <li dir="ltr" className={locale === "ar" ? "text-right" : ""}>
              {dict.contact.info.phone}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-mint/10">
        <div className="container-content py-7">
          <p className="text-center text-xs text-cream/40">{dict.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
