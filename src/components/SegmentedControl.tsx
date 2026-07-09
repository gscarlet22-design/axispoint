"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SegmentedControl({ eventId }: { eventId?: string }) {
  const pathname = usePathname();
  const suffix = eventId ? `?e=${encodeURIComponent(eventId)}` : "";
  const isPresent = pathname === "/present";

  const tabClass = (active: boolean) =>
    `rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[.06em] transition-colors ${
      active ? "bg-accent font-semibold text-black" : "text-text-muted"
    }`;

  return (
    <div className="mx-auto mb-4 flex w-fit items-center gap-[3px] rounded-full border border-border-hairline bg-white/[.04] p-1">
      <Link href={`/${suffix}`} className={tabClass(!isPresent)}>
        Card
      </Link>
      <Link href={`/present${suffix}`} className={tabClass(isPresent)}>
        Present
      </Link>
    </div>
  );
}
