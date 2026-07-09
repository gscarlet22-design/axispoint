"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { card, events, resolveEvent } from "@/config/card";
import { buildCardVcard } from "@/lib/vcard";
import { CardFrame } from "@/components/CardFrame";
import { SegmentedControl } from "@/components/SegmentedControl";
import { BackToCardLink } from "@/components/BackToCardLink";
import { CameraGlyphIcon } from "@/components/icons";

type QrMode = "online" | "offline";

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
  const event = resolveEvent(eventId);

  const [mode, setMode] = useState<QrMode>("online");
  const [isOnline, setIsOnline] = useState(true);
  const [origin, setOrigin] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const namedEvents = Object.entries(events).filter(([id]) => id !== "default");

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10">
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

          <div className="mt-6 flex items-center gap-[3px] rounded-full border border-border-hairline bg-white/[.04] p-1">
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

          {namedEvents.length > 0 && (
            <div className="mt-5 flex w-full flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => selectEvent(null)}
                className={`rounded-full border px-3 py-1 font-mono text-[10.5px] uppercase tracking-[.08em] ${
                  !eventId
                    ? "border-accent text-accent"
                    : "border-border-strong text-text-muted"
                }`}
              >
                No tag
              </button>
              {namedEvents.map(([id, entry]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => selectEvent(id)}
                  className={`rounded-full border px-3 py-1 font-mono text-[10.5px] uppercase tracking-[.08em] ${
                    eventId === id
                      ? "border-accent text-accent"
                      : "border-border-strong text-text-muted"
                  }`}
                >
                  {entry.label}
                </button>
              ))}
            </div>
          )}

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
