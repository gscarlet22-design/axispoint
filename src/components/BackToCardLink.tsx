import Link from "next/link";

export function BackToCardLink({ eventId }: { eventId?: string }) {
  const suffix = eventId ? `?e=${encodeURIComponent(eventId)}` : "";
  return (
    <Link
      href={`/${suffix}`}
      className="rounded-full border border-border-strong px-4 py-2 font-mono text-[12px] text-text-muted"
    >
      ‹ Back to card
    </Link>
  );
}
