import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import { getUser, displayName } from "@/lib/auth";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";
import { UserMenu } from "./user-menu";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export async function Navbar({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const user = await getUser();

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass border-b border-border/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo locale={locale} dict={dict} />

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href={`/${locale}`}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-mint hover:text-mint-foreground"
            >
              {dict.nav.home}
            </Link>
            <Link
              href={`/${locale}/assessment`}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-mint hover:text-mint-foreground"
            >
              {dict.nav.assessment}
            </Link>
            {user && (
              <Link
                href={`/${locale}/dashboard`}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-mint hover:text-mint-foreground"
              >
                {dict.nav.dashboard}
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <LocaleSwitcher locale={locale} label={dict.nav.language} />
            <ThemeToggle label={dict.nav.toggleTheme} />
            {user ? (
              <UserMenu
                name={displayName(user)}
                email={user.email ?? ""}
                locale={locale}
                labels={{ dashboard: dict.nav.dashboard, signOut: dict.nav.signOut }}
              />
            ) : (
              <>
                <Link
                  href={`/${locale}/sign-in`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "hidden sm:inline-flex")}
                >
                  {dict.nav.signIn}
                </Link>
                <Link
                  href={`/${locale}/assessment`}
                  className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex")}
                >
                  {dict.nav.start}
                  <ArrowRight className="size-4 rtl:rotate-180" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
