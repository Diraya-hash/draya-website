import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { getUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { SignInForm } from "@/components/auth/sign-in-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return { title: dict.auth.title };
}

export default async function SignInPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);

  // Already signed in → straight to the dashboard.
  const user = await getUser();
  if (user) redirect(`/${locale}/dashboard`);

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-radial-mint" />
      <div className="w-full max-w-md">
        <Card className="p-8 shadow-lift">
          <SignInForm locale={locale as Locale} dict={dict} />
        </Card>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href={`/${locale}`} className="hover:text-foreground hover:underline">
            {dict.auth.backHome}
          </Link>
        </p>
      </div>
    </div>
  );
}
