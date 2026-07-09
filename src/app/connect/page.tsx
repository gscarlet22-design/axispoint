"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { resolveEvent } from "@/config/card";
import { CardFrame } from "@/components/CardFrame";
import { BackToCardLink } from "@/components/BackToCardLink";

function ConnectForm() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("e") ?? undefined;
  const event = resolveEvent(eventId);

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const form = formEvent.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();

    if (!name || (!email && !phone)) {
      setError("Enter your name and at least an email or phone number.");
      return;
    }
    setError(null);

    // Fire-and-forget: don't await the send, so a slow/failed relay never
    // stalls the confirmation the person sees (§10.2).
    void fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email: email || undefined,
        phone: phone || undefined,
        company: String(data.get("company") ?? "").trim() || undefined,
        note: String(data.get("note") ?? "").trim() || undefined,
        eventId,
        website: String(data.get("website") ?? ""),
      }),
    }).catch(() => {
      // Intentionally ignored — see fire-and-forget note above.
    });

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center px-7 py-12 text-center">
        <p className="font-display text-[19px] font-bold text-text-primary">
          Got it, thanks!
        </p>
        <p className="mt-2 text-[13px] text-text-secondary">
          Your info is on its way to Garrett.
        </p>
        <div className="mt-8">
          <BackToCardLink eventId={eventId} />
        </div>
      </div>
    );
  }

  return (
    <div className="px-7 py-8">
      <p className="font-mono text-[10.5px] uppercase tracking-[.14em] text-text-label">
        Trade info
      </p>
      <h1 className="mt-2 font-display text-[21px] font-bold text-text-primary">
        Send me your info
      </h1>
      <p className="mt-1 text-[13px] text-text-secondary">
        I&apos;ll get it by email and add you to my contacts.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Field label="Name" name="name" required autoComplete="name" />
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field label="Phone" name="phone" type="tel" autoComplete="tel" />
        <Field label="Company" name="company" autoComplete="organization" />
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="note"
            className="font-mono text-[9.5px] uppercase tracking-[.14em] text-text-label"
          >
            Note
          </label>
          <textarea
            id="note"
            name="note"
            rows={2}
            defaultValue={event.note}
            className="rounded-row-sm border border-border-strong bg-transparent px-3 py-2 text-[14px] text-text-primary focus:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
        </div>

        {/* Honeypot — hidden from real users, catches simple bots (§10.1). */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden"
        />

        {error && <p className="text-[12.5px] text-red-400">{error}</p>}

        <button
          type="submit"
          className="mt-2 w-full rounded-row bg-accent px-4 py-4 font-display text-[15px] font-bold text-black"
        >
          Send my info
        </button>
      </form>

      <div className="mt-6 flex justify-center">
        <BackToCardLink eventId={eventId} />
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="font-mono text-[9.5px] uppercase tracking-[.14em] text-text-label"
      >
        {label}
        {required ? " *" : ""}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="rounded-row-sm border border-border-strong bg-transparent px-3 py-2 text-[14px] text-text-primary focus:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      />
    </div>
  );
}

export default function ConnectPage() {
  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10">
      <CardFrame>
        <Suspense fallback={null}>
          <ConnectForm />
        </Suspense>
      </CardFrame>
    </div>
  );
}
