import { resourceLinks } from "@/config/card";
import { GraduationIcon, LinkedInIcon, MapIcon, YoutubeIcon } from "./icons";

const ICONS = {
  linkedin: LinkedInIcon,
  map: MapIcon,
  youtube: YoutubeIcon,
  graduation: GraduationIcon,
} as const;

export function ResourcesDirectory() {
  return (
    <div className="px-6 pb-2">
      <div className="mb-1 flex items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[.16em] text-text-label">
          Resources
        </span>
        <span className="h-px flex-1 bg-border-hairline" />
      </div>
      {resourceLinks.map((r) => {
        const Icon = ICONS[r.icon as keyof typeof ICONS];
        return (
          <a
            key={r.title}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-row-sm px-3 py-[13px]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-tile border border-tile-border bg-tile-fill text-accent">
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-bold text-text-primary">{r.title}</span>
              <span className="block truncate text-[12px] text-text-muted">{r.desc}</span>
            </span>
          </a>
        );
      })}
    </div>
  );
}
