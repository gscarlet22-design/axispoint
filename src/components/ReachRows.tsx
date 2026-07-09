import { reachLinks } from "@/config/card";
import { EmailIcon, PhoneIcon } from "./icons";

const ICONS = { phone: PhoneIcon, email: EmailIcon } as const;
const LABELS = { phone: "Mobile", email: "Email" } as const;

export function ReachRows() {
  return (
    <div className="px-6">
      {reachLinks.map((link, i) => {
        const Icon = ICONS[link.kind];
        const href = link.kind === "phone" ? `tel:${link.value}` : `mailto:${link.value}`;
        const display = "display" in link ? link.display : link.value;
        return (
          <a
            key={link.kind}
            href={href}
            className={`flex items-center gap-3 rounded-row-sm px-[10px] py-3 ${
              i === 1 ? "border-t border-border-row" : ""
            }`}
          >
            <span className="h-[18px] w-[3px] rounded-[2px] bg-accent" />
            <Icon className="h-[18px] w-[18px] text-text-muted" />
            <span className="flex flex-col">
              <span className="font-mono text-[9.5px] uppercase tracking-[.14em] text-text-label">
                {LABELS[link.kind]}
              </span>
              <span className="font-mono text-[13.5px] font-medium text-text-primary">
                {display}
              </span>
            </span>
          </a>
        );
      })}
    </div>
  );
}
