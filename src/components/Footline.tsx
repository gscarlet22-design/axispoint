import type { EventEntry } from "@/lib/settings";

export function Footline({ event }: { event: EventEntry }) {
  if (!event.label) return null;

  return (
    <div className="flex items-center justify-between border-t border-border-hairline px-6 py-3.5 font-mono text-[11px] text-text-label">
      <span>
        Met at <span className="font-medium text-text-secondary">{event.label}</span>
      </span>
      <span>{event.date}</span>
    </div>
  );
}
