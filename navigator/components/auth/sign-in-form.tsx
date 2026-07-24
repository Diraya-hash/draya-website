"use client";

import * as React from "react";
import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";

export function SignInForm({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.auth;
  const configured = isSupabaseConfigured();
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured || !email.trim()) return;
    setStatus("sending");
    try {
      const supabase = createClient();
      const next = encodeURIComponent(`/${locale}/dashboard`);
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${next}` },
      });
      setStatus(error ? "error" : "sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-mint text-accent">
          <CheckCircle2 className="size-7" />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground">
          {t.checkEmailTitle}
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
          {t.checkEmailBody.replace("{email}", email)}
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-medium text-accent hover:underline"
        >
          {t.resend}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
        <Mail className="size-7" />
      </div>
      <h1 className="mt-5 text-center text-2xl font-bold tracking-tight text-foreground">
        {t.title}
      </h1>
      <p className="mx-auto mt-2 max-w-sm text-center text-muted-foreground">{t.subtitle}</p>

      {!configured && (
        <div className="mt-6 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-foreground">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning" />
          <span>{t.notConfigured}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
            {t.emailLabel}
          </label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
            disabled={!configured || status === "sending"}
          />
        </div>
        {status === "error" && <p className="text-sm text-destructive">{t.error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={!configured || status === "sending"}>
          {status === "sending" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {t.sending}
            </>
          ) : (
            t.sendLink
          )}
        </Button>
      </form>
    </div>
  );
}
