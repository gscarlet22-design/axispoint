// Single source of truth for identity/content. Editing this file *is* the
// edit flow for this single-user deployment (no CMS, no admin UI).

export const card = {
  first: "Garrett",
  last: "Scarlett",
  fullName: "Garrett Scarlett",
  title: "Regional Sales Manager - Western Plains",
  org: "Axis Communications",
  location: "Kansas City, KS", // territory tagline — Garrett's own city, not the mailing address below
  // Delivery/mailing address (a box in KCMO — different from the KS tagline
  // above, which is Garrett's own city within the Western Plains territory).
  // Feeds the vCard's ADR field and the on-page "Address" row.
  mailingAddress: {
    street: "4741 Central St",
    suite: "Suite 310",
    city: "Kansas City",
    state: "MO",
    postalCode: "64112",
    country: "USA",
    display: "4741 Central St, Suite 310, Kansas City, MO 64112",
    mapsUrl: "https://maps.google.com/?q=4741+Central+St+Suite+310+Kansas+City+MO+64112",
  },
  phone: "+17856405961", // E.164, for TEL
  phoneDisplay: "+1 (785) 640-5961",
  email: "garrett.scarlett@axis.com",
  url: "https://axispoint.vercel.app",
  linkedIn: "https://www.linkedin.com/in/garrettscarlett/",
  siteDesigner: "https://sitedesigner.axis.com",
  youtube: "https://www.youtube.com/axiscommunications",
  training: "https://www.axis.com/en-us/learning",
  photoBase64: "", // 400x400 JPEG base64, no `data:` prefix (§6.3) — supply headshot to enable
  available: true,
  accent: "#ffd200",
} as const;

// Events are fully admin-managed (`/admin`, stored in Redis) rather than a
// static list here — see `src/lib/settings.ts` for the data model and
// `resolveEvent()` for how a page view picks the effective event.

// Mirrored into the vCard AND shown on the page (§4.1). Keep this short — 2-3 max.
export const reachLinks = [
  { kind: "phone", value: card.phone, display: card.phoneDisplay },
  { kind: "email", value: card.email },
  { kind: "address", value: card.mailingAddress.mapsUrl, display: card.mailingAddress.display },
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
