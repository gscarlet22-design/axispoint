import { useId, type SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 2 6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function EmailIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function LinkedInIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7.5 10v6M7.5 7.5v.01M11 16v-4a2 2 0 0 1 4 0v4M11 12v4" />
    </svg>
  );
}

export function MapIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function YoutubeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="6" width="18" height="12" rx="3" />
      <path d="m11 10 4 2-4 2v-4Z" />
    </svg>
  );
}

export function GraduationIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m2 9 10-4 10 4-10 4-10-4Z" />
      <path d="M6 11v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12l5 5L19 7" pathLength={1} />
    </svg>
  );
}

/**
 * The Axis camera glyph used elsewhere in Axis software (present-mode QR
 * badge, §"Assets" in the design handoff). Built as a mask so the shape
 * (including the lens hole, corner square, and neck notch) is true
 * transparency — it reads correctly filled with `currentColor` on any
 * background, not just the dark badge tile it's currently placed on.
 */
export function CameraGlyphIcon(props: IconProps) {
  const maskId = useId();
  return (
    <svg viewBox="0 0 200 200" {...props}>
      <mask id={maskId} maskUnits="userSpaceOnUse">
        <rect width="200" height="200" fill="black" />
        <g fill="white">
          <path d="M82,24 L82,14 Q82,4 92,4 L108,4 Q118,4 118,14 L118,24 Z" />
          <rect x="38" y="20" width="124" height="130" rx="28" />
          <circle cx="44" cy="80" r="21" />
          <circle cx="156" cy="80" r="21" />
          <rect x="82" y="150" width="36" height="40" />
          <rect x="64" y="190" width="72" height="18" rx="4" />
        </g>
        <g fill="black">
          <circle cx="100" cy="92" r="28" />
          <rect x="132" y="42" width="16" height="16" rx="3" />
          <rect x="76" y="168" width="48" height="8" />
        </g>
      </mask>
      <rect width="200" height="200" fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  );
}
