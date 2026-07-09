"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { CameraGlyphIcon } from "./icons";

/**
 * Maximized, solid-white QR view for presenting at a booth. There is no web
 * API to control a device's hardware screen brightness — a white background
 * is the practical equivalent (maximizes perceived brightness), and the
 * Wake Lock API keeps the screen from auto-dimming/sleeping while it's up.
 * True OS-level fullscreen (hiding browser chrome) only works where the
 * Fullscreen API is supported for arbitrary elements — notably not on iOS
 * Safari — so this still renders maximized even when that call fails.
 */
export function FullScreenQr({ value, onExit }: { value: string; onExit: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const [panelSize, setPanelSize] = useState(280);

  useEffect(() => {
    function updateSize() {
      const maxDim = Math.min(window.innerWidth, window.innerHeight) * 0.78;
      setPanelSize(Math.round(maxDim));
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function requestWakeLock() {
      if (!("wakeLock" in navigator) || cancelled) return;
      try {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      } catch {
        // Not fatal — just no anti-dim behavior on this device/browser.
      }
    }

    async function enter() {
      const el = containerRef.current;
      if (el?.requestFullscreen) {
        try {
          await el.requestFullscreen();
        } catch {
          // Not supported (e.g. iOS Safari) — the maximized white overlay
          // below still delivers the large/bright QR without OS fullscreen.
        }
      }
      await requestWakeLock();
    }

    enter();

    function handleVisibility() {
      if (document.visibilityState === "visible" && !wakeLockRef.current) {
        requestWakeLock();
      }
    }
    function handleFullscreenChange() {
      if (!document.fullscreenElement) onExit();
    }

    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [onExit]);

  function handleExitClick() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    onExit();
  }

  const padding = Math.round(panelSize * 0.06);
  const canvasSize = panelSize - padding * 2;
  const badgeSize = Math.round(panelSize * 0.27);
  const tileSize = Math.round(badgeSize * 0.77);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
    >
      <button
        type="button"
        onClick={handleExitClick}
        className="absolute right-5 top-5 rounded-full border border-black/15 px-4 py-2 font-mono text-[12px] text-black/70"
      >
        Exit
      </button>
      <div
        className="relative flex items-center justify-center rounded-[16px] bg-white"
        style={{ width: panelSize, height: panelSize, padding }}
      >
        <QRCodeCanvas
          value={value || " "}
          size={canvasSize}
          level="H"
          bgColor="#ffffff"
          fgColor="#0a0a0a"
        />
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl bg-white"
          style={{ width: badgeSize, height: badgeSize }}
        >
          <span
            className="flex items-center justify-center rounded-[22%] bg-[#1f2023]"
            style={{ width: tileSize, height: tileSize }}
          >
            <CameraGlyphIcon className="h-2/3 w-2/3 text-white" />
          </span>
        </span>
      </div>
    </div>
  );
}
