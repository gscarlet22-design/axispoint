"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { card } from "@/config/card";
import { buildCardVcard } from "@/lib/vcard";
import { resolveEvent, type CardSettings } from "@/lib/settings";
import { CardFrame } from "@/components/CardFrame";
import { SegmentedControl } from "@/components/SegmentedControl";
import { BackToCardLink } from "@/components/BackToCardLink";
import { CameraGlyphIcon } from "@/components/icons";
import { FullScreenQr } from "@/components/FullScreenQr";

type QrMode = "online" | "offline";

// Present mode's event pill is a per-device override of which event tag
// this phone is currently showing/embedding — distinct from the admin's
// server-side "current event" default, which applies to *other* people's
// untagged visits. The installed PWA's start_url never carries an `e`
// param, so without this the pill silently fell back to that unrelated
// admin default on every app kill/restart instead of remembering what was
// last picked here.
const PRESENT_EVENT_STORAGE_KEY = "axispoint:present-event";

function CornerBrackets() {
  const common = "absolute h-6 w-6 border-accent";
  return (
    <>
      <span className={`${common} left-0 top-0 rounded-tl-lg border-l-2 border-t-2`} />
      <span className={`${common} right-0 top-0 rounded-tr-lg border-r-2 border-t-2`} />
      <span className={`${common} bottom-0 left-0 rounded-bl-lg border-b-2 border-l-2`} />
      <span className={`${common} bottom-0 right-0 rounded-br-lg border-b-2 border-r-2`} />
    </>
  );
}

function PresentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("e") ?? undefined;

  const [settings, setSettings] = useState<CardSettings>({});
  const event = resolveEvent(settings, eventId);

  const [mode, setMode] = useState<QrMode>("online");
  const [isOnline, setIsOnline] = useState(true);
  const [origin, setOrigin] = useState("");
  const [fullScreen, setFullScreen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then(setSettings)
      .catch(() => {});
  }, []);

  // Restore the last pill picked on this device when launching with no
  // explicit `e` param (a fresh PWA open, not a specific shared/scanned
  // link — those should keep winning over whatever was picked before).
  useEffect(() => {
    if (eventId) return;
    const stored = window.localStorage.getItem(PRESENT_EVENT_STORAGE_KEY);
    if (!stored) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("e", stored);
    router.replace(`/present?${params.toString()}`);
  }, [eventId, searchParams, router]);

  useEffect(() => {
    setOrigin(window.location.origin);
    setIsOnline(navigator.onLine);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const qrValue = useMemo(() => {
    if (mode === "offline") {
      return buildCardVcard(event, { includePhoto: false });
    }
    const url = new URL(origin || "http://localhost");
    url.pathname = "/";
    url.search = "";
    if (eventId) url.searchParams.set("e", eventId);
    return url.toString();
  }, [mode, event, eventId, origin]);

  function selectEvent(id: string | null) {
    if (id) {
      window.localStorage.setItem(PRESENT_EVENT_STORAGE_KEY, id);
    } else {
      window.localStorage.removeItem(PRESENT_EVENT_STORAGE_KEY);
    }
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set("e", id);
    } else {
      params.delete("e");
    }
    router.push(`/present${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function downloadQr() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "garrett-scarlett-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  const eventsList = settings.events ?? [];
  // currentEventId always points at one of these events once set, so a
  // separate "No tag" pill would just duplicate it — only show "No tag" as
  // its own option when there's genuinely no current event configured.
  const hasCurrentInList = eventsList.some((e) => e.id === settings.currentEventId);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      {fullScreen && <FullScreenQr value={qrValue} onExit={() => setFullScreen(false)} />}
      <SegmentedControl eventId={eventId} />
      <CardFrame>
        <div className="flex flex-col items-center px-7 pb-7 pt-[34px] text-center">
          <p className="font-mono text-[10.5px] uppercase tracking-[.14em] text-text-label">
            Out of cards? Point a camera
          </p>
          <h1 className="mt-3 font-display text-[23px] font-bold text-text-primary">
            {card.fullName}
          </h1>
          <p className="mt-1 text-[13px] text-text-secondary">
            {card.org} · {card.location}
          </p>

          <div className="relative mt-7 h-[216px] w-[216px]">
            <CornerBrackets />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="relative flex items-center justify-center rounded-[8px] bg-white"
                style={{ width: 188, height: 188, padding: 8 }}
              >
                <QRCodeCanvas
                  ref={canvasRef}
                  value={qrValue || " "}
                  size={172}
                  level="H"
                  bgColor="#ffffff"
                  fgColor="#0a0a0a"
                />
                <span className="pointer-events-none absolute left-1/2 top-1/2 flex h-[52px] w-[52px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl bg-white">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#1f2023]">
                    <CameraGlyphIcon className="h-6 w-6 text-white" />
                  </span>
                </span>
                <span className="pointer-events-none absolute inset-2 overflow-hidden rounded-[4px]">
                  <span className="absolute left-0 right-0 h-0.5 animate-scan-line bg-gradient-to-r from-transparent via-accent to-transparent shadow-[0_0_8px_2px_rgba(255,210,0,0.6)]" />
                </span>
              </div>
            </div>
          </div>

          <p className="mt-6 text-[14.5px] font-semibold text-text-primary">
            Scan to save my contact
          </p>
          <p className="font-mono text-[11.5px] text-text-muted">
            no app · one tap · always current
          </p>

          <button
            type="button"
            onClick={() => setFullScreen(true)}
            className="mt-5 rounded-row bg-accent px-5 py-2.5 font-display text-[14px] font-bold text-black"
          >
            Full screen
          </button>

          <div className="mt-5 flex items-center gap-[3px] rounded-full border border-border-hairline bg-white/[.04] p-1">
            {(["online", "offline"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[.06em] ${
                  mode === m ? "bg-accent font-semibold text-black" : "text-text-muted"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[.1em] text-text-label">
            {isOnline ? "You appear online" : "You appear offline"} · forcing {mode}
          </p>

          <div className="mt-5 flex w-full flex-wrap justify-center gap-2">
            {!hasCurrentInList && (
              <button
                type="button"
                onClick={() => selectEvent(null)}
                className={`rounded-full border px-3 py-1 font-mono text-[10.5px] uppercase tracking-[.08em] ${
                  !eventId ? "border-accent text-accent" : "border-border-strong text-text-muted"
                }`}
              >
                No tag
              </button>
            )}
            {eventsList.map((e) => {
              const isDefault = e.id === settings.currentEventId;
              const isActive = eventId === e.id || (!eventId && isDefault);
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => selectEvent(e.id)}
                  className={`rounded-full border px-3 py-1 font-mono text-[10.5px] uppercase tracking-[.08em] ${
                    isActive ? "border-accent text-accent" : "border-border-strong text-text-muted"
                  }`}
                >
                  {e.label}
                  {isDefault && <span className="ml-1">•</span>}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={downloadQr}
            className="mt-5 font-mono text-[11.5px] text-text-label underline decoration-border-strong underline-offset-2"
          >
            Download printable QR
          </button>

          <div className="mt-6">
            <BackToCardLink eventId={eventId} />
          </div>
        </div>
      </CardFrame>
    </div>
  );
}

export default function PresentPage() {
  return (
    <Suspense fallback={null}>
      <PresentContent />
    </Suspense>
  );
}
