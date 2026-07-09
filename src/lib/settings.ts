import { Redis } from "@upstash/redis";

const SETTINGS_KEY = "axispoint:settings";

export interface StoredEvent {
  id: string;
  label: string;
  date: string;
}

export interface CardSettings {
  /** Vercel Blob URL for the admin-uploaded headshot. */
  photoUrl?: string;
  /** Admin-managed list of events — fully replaces any hardcoded list. */
  events?: StoredEvent[];
  /** Which event (by id) is shown when a visit carries no `?e=` tag. */
  currentEventId?: string | null;
}

export interface EventEntry {
  label: string;
  date: string;
  note: string;
}

// Seeds a fresh deployment (empty Redis) with the one real event this app
// launched with. Only used until the admin list is saved for the first time
// — after that, Redis is the sole source of truth, including an explicit
// empty list.
const SEED_EVENTS: StoredEvent[] = [
  { id: "gpha-annual-meeting", label: "GPHA Annual Meeting", date: "July 2026" },
];
const SEED_CURRENT_EVENT_ID = "gpha-annual-meeting";

// Vercel's Redis marketplace integration (successor to the deprecated Vercel
// KV) has used a couple of different env var namings across its rollout —
// check both rather than assume one.
function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function withSeedFallback(stored: CardSettings): CardSettings {
  return {
    photoUrl: stored.photoUrl,
    events: "events" in stored ? stored.events : SEED_EVENTS,
    currentEventId: "currentEventId" in stored ? stored.currentEventId : SEED_CURRENT_EVENT_ID,
  };
}

export async function getSettings(): Promise<CardSettings> {
  const redis = getRedis();
  if (!redis) return withSeedFallback({});
  try {
    const stored = (await redis.get<CardSettings>(SETTINGS_KEY)) ?? {};
    return withSeedFallback(stored);
  } catch (error) {
    console.error("Failed to read settings from Redis", error);
    return withSeedFallback({});
  }
}

async function readRawSettings(redis: Redis): Promise<CardSettings> {
  return (await redis.get<CardSettings>(SETTINGS_KEY)) ?? {};
}

function requireRedis(): Redis {
  const redis = getRedis();
  if (!redis) {
    throw new Error(
      "Redis isn't configured (KV_REST_API_URL/KV_REST_API_TOKEN missing). Connect a Redis " +
        "store to this project in Vercel's Storage tab.",
    );
  }
  return redis;
}

export async function saveSettings(patch: CardSettings): Promise<CardSettings> {
  const redis = requireRedis();
  const current = withSeedFallback(await readRawSettings(redis));
  const next = { ...current, ...patch };
  await redis.set(SETTINGS_KEY, next);
  return next;
}

function slugify(label: string, existingIds: string[]): string {
  const base =
    label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "event";
  if (!existingIds.includes(base)) return base;
  let i = 2;
  while (existingIds.includes(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

export async function addEvent(label: string, date: string): Promise<CardSettings> {
  const redis = requireRedis();
  const current = withSeedFallback(await readRawSettings(redis));
  const events = current.events ?? [];
  const id = slugify(label, events.map((e) => e.id));
  const next: CardSettings = { ...current, events: [...events, { id, label, date }] };
  await redis.set(SETTINGS_KEY, next);
  return next;
}

export async function updateEvent(id: string, label: string, date: string): Promise<CardSettings> {
  const redis = requireRedis();
  const current = withSeedFallback(await readRawSettings(redis));
  const events = current.events ?? [];
  if (!events.some((e) => e.id === id)) {
    throw new Error(`No event with id "${id}"`);
  }
  const next: CardSettings = {
    ...current,
    events: events.map((e) => (e.id === id ? { ...e, label, date } : e)),
  };
  await redis.set(SETTINGS_KEY, next);
  return next;
}

export async function deleteEvent(id: string): Promise<CardSettings> {
  const redis = requireRedis();
  const current = withSeedFallback(await readRawSettings(redis));
  const events = (current.events ?? []).filter((e) => e.id !== id);
  const next: CardSettings = {
    ...current,
    events,
    currentEventId: current.currentEventId === id ? null : current.currentEventId,
  };
  await redis.set(SETTINGS_KEY, next);
  return next;
}

export async function setCurrentEvent(id: string | null): Promise<CardSettings> {
  const redis = requireRedis();
  const current = withSeedFallback(await readRawSettings(redis));
  const next: CardSettings = { ...current, currentEventId: id };
  await redis.set(SETTINGS_KEY, next);
  return next;
}

/**
 * Resolves the effective event for a page view: an explicit `?e=<id>` tag
 * wins if it matches a known event; otherwise falls back to whichever event
 * is marked current. No match either way → a blank/empty event, so an
 * untagged visit never fabricates one (§4/§14 of the build spec).
 */
export function resolveEvent(settings: CardSettings, eventId?: string | null): EventEntry {
  const events = settings.events ?? [];
  const targetId = eventId || settings.currentEventId;
  const found = targetId ? events.find((e) => e.id === targetId) : undefined;
  if (found) {
    return { label: found.label, date: found.date, note: `Met at ${found.label}` };
  }
  return { label: "", date: "", note: "" };
}
