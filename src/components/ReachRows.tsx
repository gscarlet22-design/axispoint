import { reachLinks } from "@/config/card";
import { EmailIcon, MapIcon, PhoneIcon } from "./icons";

const ICONS = { phone: PhoneIcon, email: EmailIcon, address: MapIcon } as const;
const LABELS = { phone: "Mobile", email: "Email", address: "Address" } as const;

function hrefFor(link: (typeof reachLinks)[number]): string {
  switch (link.kind) {
    case "phone":
      return `tel:${link.value}`;
    case "email":
      return `mailto:${link.value}`;
    case "address":
      return link.value; // already an absolute maps URL
  }
}

export function ReachRows() {
  return (
    <div className="px-6">
      {reachLinks.map((link, i) => {
        const Icon = ICONS[link.kind];
        const href = hrefFor(link);
        const display = "display" in link ? link.display : link.value;
        return (
          <a
            key={link.kind}
            href={href}
            target={link.kind === "address" ? "_blank" : undefined}
            rel={link.kind === "address" ? "noopener noreferrer" : undefined}
            className={`flex items-center gap-3 rounded-row-sm px-[10px] py-3 ${
              i > 0 ? "border-t border-border-row" : ""
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
