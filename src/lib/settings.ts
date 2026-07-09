import { Redis } from "@upstash/redis";

const SETTINGS_KEY = "axispoint:settings";

export interface CardSettings {
  /** Vercel Blob URL for the admin-uploaded headshot. */
  photoUrl?: string;
  /** The event Garrett is currently telling people he met them at. */
  currentEvent?: {
    label: string;
    date: string;
  };
}

// Vercel's Redis marketplace integration (successor to the deprecated Vercel
// KV) has used a couple of different env var namings across its rollout —
// check both rather than assume one.
function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function getSettings(): Promise<CardSettings> {
  const redis = getRedis();
  if (!redis) return {};
  try {
    return (await redis.get<CardSettings>(SETTINGS_KEY)) ?? {};
  } catch (error) {
    console.error("Failed to read settings from Redis", error);
    return {};
  }
}

export async function saveSettings(patch: CardSettings): Promise<CardSettings> {
  const redis = getRedis();
  if (!redis) {
    throw new Error(
      "Redis isn't configured (KV_REST_API_URL/KV_REST_API_TOKEN missing). Connect a Redis " +
        "store to this project in Vercel's Storage tab.",
    );
  }
  const current = (await redis.get<CardSettings>(SETTINGS_KEY)) ?? {};
  const next = { ...current, ...patch };
  await redis.set(SETTINGS_KEY, next);
  return next;
}
