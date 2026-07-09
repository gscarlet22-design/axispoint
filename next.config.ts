import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Service workers are only spec-required to re-check for updates at
        // least once every 24h — within that window, ordinary HTTP caching
        // could serve a stale sw.js and delay a fix like this one from ever
        // reaching a returning visitor. Force every load to re-validate.
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache" }],
      },
    ];
  },
};

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
});

export default withSerwist(nextConfig);
