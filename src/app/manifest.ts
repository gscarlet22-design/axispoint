import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Garrett Scarlett — Contact",
    short_name: "My Card",
    start_url: "/present?src=home",
    display: "standalone",
    background_color: "#08080a",
    theme_color: "#08080a",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Show my QR", short_name: "QR", url: "/present?src=shortcut" },
      { name: "Save my vCard", url: "/api/vcard" },
    ],
  };
}
