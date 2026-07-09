import { card } from "@/config/card";

export function StatusStrip() {
  return (
    <div className="flex items-center justify-between border-b border-border-hairline px-6 py-[13px] font-mono text-[10.5px] uppercase tracking-[.1em] text-text-label">
      <div className="flex items-center gap-2">
        <span
          className={`inline-block h-[7px] w-[7px] rounded-full ${
            card.available ? "bg-success animate-status-pulse" : "bg-text-label"
          }`}
        />
        <span>{card.available ? "Available" : "Unavailable"}</span>
      </div>
      <div>{card.location}</div>
    </div>
  );
}
