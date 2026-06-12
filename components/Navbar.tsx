"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { otherLocale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import Logo from "./Logo";

export default function Navbar({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const links = [
    { href: `/${locale}`, label: dict.nav.home },
    { href: `/${locale}/services`, label: dict.nav.services },
    { href: `/${locale}/about`, label: dict.nav.about },
    { href: `/${locale}/insights`, label: dict.nav.insights },
    { href: `/${locale}/contact`, label: dict.nav.contact },
  ];

  const switchHref = (() => {
    const target = otherLocale(locale);
    const rest = pathname.replace(new RegExp(`^/${locale}`), "");
    return `/${target}${rest}`;
  })();

  const isActive = (href: string) =>
    href === `/${locale}` ? pathname === href : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-teal-800/15 bg-cream">
      <div className="container-content flex h-24 items-center justify-between">
        <Link href={`/${locale}`} aria-label={dict.brand.name}>
          <Logo locale={locale} />
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-10 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors duration-300 ${
                isActive(link.href)
                  ? "font-medium text-teal-800"
                  : "text-ink-soft hover:text-teal-800"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex">
          <Link
            href={switchHref}
            className="text-sm text-ink-soft transition-colors duration-300 hover:text-teal-800"
          >
            {dict.nav.switchLocale}
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center text-teal-800 lg:hidden"
          aria-label="Menu"
          aria-expanded={open}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            {open ? (
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" d="M4 8h16M4 16h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-teal-800/15 bg-cream lg:hidden">
          <div className="container-content flex flex-col py-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`border-b border-teal-800/10 py-4 text-base ${
                  isActive(link.href) ? "font-medium text-teal-800" : "text-ink-soft"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={switchHref}
              className="mt-6 text-sm text-ink-soft"
            >
              {dict.nav.switchLocale}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
