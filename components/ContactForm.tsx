"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/dictionaries";

const labelClasses =
  "mb-1 block text-xs font-medium uppercase tracking-caps text-ink-mute";

export default function ContactForm({ dict }: { dict: Dictionary }) {
  const f = dict.contact.form;
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    // Placeholder submission — wire up to an API route or email service later
    setTimeout(() => setStatus("sent"), 900);
  }

  if (status === "sent") {
    return (
      <div className="flex h-full min-h-[20rem] flex-col items-center justify-center bg-mint p-12 text-center">
        <svg
          className="h-8 w-8 text-teal-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <p className="mt-6 max-w-sm text-base font-light leading-8 text-teal-900">
          {f.success}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
      <div>
        <label htmlFor="name" className={labelClasses}>
          {f.name} *
        </label>
        <input id="name" name="name" type="text" required placeholder={f.namePlaceholder} className="input-line" />
      </div>

      <div>
        <label htmlFor="email" className={labelClasses}>
          {f.email} *
        </label>
        <input id="email" name="email" type="email" required placeholder={f.emailPlaceholder} className="input-line" dir="ltr" />
      </div>

      <div>
        <label htmlFor="phone" className={labelClasses}>
          {f.phone}
        </label>
        <input id="phone" name="phone" type="tel" placeholder={f.phonePlaceholder} className="input-line" dir="ltr" />
      </div>

      <div>
        <label htmlFor="organization" className={labelClasses}>
          {f.organization}
        </label>
        <input id="organization" name="organization" type="text" placeholder={f.organizationPlaceholder} className="input-line" />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="service" className={labelClasses}>
          {f.service}
        </label>
        <select id="service" name="service" defaultValue="" className="input-line">
          <option value="" disabled>
            {f.servicePlaceholder}
          </option>
          {dict.services.map((service) => (
            <option key={service.slug} value={service.slug}>
              {service.title}
            </option>
          ))}
          <option value="other">{f.serviceOther}</option>
        </select>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="message" className={labelClasses}>
          {f.message} *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder={f.messagePlaceholder}
          className="input-line resize-none"
        />
      </div>

      <div className="sm:col-span-2 pt-2">
        <button
          type="submit"
          disabled={status === "sending"}
          className="btn-primary disabled:opacity-60"
        >
          {status === "sending" ? f.sending : f.submit}
        </button>
      </div>
    </form>
  );
}
