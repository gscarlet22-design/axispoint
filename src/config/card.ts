// Single source of truth for identity/content. Editing this file *is* the
// edit flow for this single-user deployment (no CMS, no admin UI).

export const card = {
  first: "Garrett",
  last: "Scarlett",
  fullName: "Garrett Scarlett",
  title: "Regional Sales Manager - Western Plains",
  org: "Axis Communications",
  city: "Kansas City",
  state: "KS",
  location: "Kansas City, KS",
  phone: "+17856405961", // E.164, for TEL
  phoneDisplay: "+1 (785) 640-5961",
  email: "garrett.scarlett@axis.com",
  url: "https://garrettscarlett.vercel.app",
  linkedIn: "https://www.linkedin.com/in/garrettscarlett/",
  siteDesigner: "https://sitedesigner.axis.com",
  youtube: "https://www.youtube.com/axiscommunications",
  training: "https://www.axis.com/en-us/learning",
  photoBase64: "", // 400x400 JPEG base64, no `data:` prefix (§6.3) — supply headshot to enable
  available: true,
  accent: "#ffd200",
} as const;

export type EventEntry = {
  label: string;
  note: string;
  date: string;
};

export const events: Record<string, EventEntry> = {
  // Per spec §4/§14: no `?e=` must resolve to an empty label/note/date, so an
  // untagged visit never fabricates an event. The NFC tag / QR for the July
  // 2026 GPHA launch should bake in `?e=gpha-annual-meeting` (spec §13) rather
  // than relying on this default.
  default: { label: "", note: "", date: "" },
  "gpha-annual-meeting": {
    label: "GPHA Annual Meeting",
    note: "Met at GPHA Annual Meeting",
    date: "July 2026",
  },
};

export function resolveEvent(eventId?: string | null): EventEntry {
  if (eventId && events[eventId]) return events[eventId];
  return events.default;
}

// Mirrored into the vCard AND shown on the page (§4.1). Keep this short — 2-3 max.
export const reachLinks = [
  { kind: "phone", value: card.phone, display: card.phoneDisplay },
  { kind: "email", value: card.email },
] as const;

// Page-only (§4.1/§5.1). Never touches the saved vCard.
export const resourceLinks = [
  {
    icon: "linkedin",
    title: "LinkedIn",
    desc: "Connect with me professionally",
    url: card.linkedIn,
  },
  {
    icon: "map",
    title: "Axis Site Designer",
    desc: "Plan camera coverage for your site, free tool",
    url: card.siteDesigner,
  },
  {
    icon: "youtube",
    title: "Axis YouTube",
    desc: "Product demos, webinars & training clips",
    url: card.youtube,
  },
  {
    icon: "graduation",
    title: "Training & Certification",
    desc: "Axis Communications learning portal",
    url: card.training,
  },
] as const;
