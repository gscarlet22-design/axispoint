"use client";

import { useEffect, useState } from "react";
import { useSerwist } from "@serwist/next/react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

export function PwaStatus() {
  const { serwist } = useSerwist();
  const [offlineReady, setOfflineReady] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (!serwist) return;
    const onInstalled = (event: { isUpdate?: boolean }) => {
      if (event.isUpdate) return;
      setOfflineReady(true);
      const timer = setTimeout(() => setOfflineReady(false), 4000);
      return () => clearTimeout(timer);
    };
    serwist.addEventListener("installed", onInstalled);
    return () => serwist.removeEventListener("installed", onInstalled);
  }, [serwist]);

  useEffect(() => {
    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  async function handleInstall() {
    if (!installEvent) return;
    await installEvent.prompt();
    setInstallEvent(null);
  }

  if (!offlineReady && !installEvent) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
      {offlineReady && (
        <div className="pointer-events-auto rounded-full border border-border-hairline bg-surface-panel px-4 py-2 font-mono text-[11px] text-text-secondary shadow-outer-frame">
          Offline ready — this card now works with no signal
        </div>
      )}
      {installEvent && (
        <button
          type="button"
          onClick={handleInstall}
          className="pointer-events-auto rounded-full bg-accent px-4 py-2 font-display text-[13px] font-bold text-black shadow-outer-frame"
        >
          Install app
        </button>
      )}
    </div>
  );
}
