"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckIcon, PlusIcon } from "./icons";

type SaveState = "idle" | "saving" | "saved";

function triggerDownload(href: string) {
  const a = document.createElement("a");
  a.href = href;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * iOS Safari (and iPadOS, which reports as "Macintosh" but is touch-capable)
 * also supports navigator.share/canShare with files, but sharing a
 * JS-constructed vCard File there opens the generic OS share sheet
 * (Messages/Mail/AirDrop/Save to Files/…) with no obvious "Add Contact"
 * option — confusing for a first-time scanner. A direct same-tab
 * navigation to the vcard URL is what makes Safari show its own native
 * "Add Contact" preview card instead, so iOS skips the share-sheet path
 * entirely and goes straight to triggerDownload.
 */
function isIOS(): boolean {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

/**
 * Sharing the .vcf as a file (rather than just downloading it) lets the
 * OS's native share sheet offer "Add to Contacts" as a direct target on
 * many Android versions — skipping the Downloads-folder detour Android
 * Chrome otherwise forces on a plain download.
 */
async function tryNativeShare(href: string): Promise<boolean> {
  if (isIOS()) return false;
  if (!navigator.canShare) return false;
  try {
    const res = await fetch(href);
    const blob = await res.blob();
    const file = new File([blob], "garrett.vcf", { type: "text/vcard" });
    if (!navigator.canShare({ files: [file] })) return false;
    await navigator.share({ files: [file] });
    return true;
  } catch (err) {
    // The user dismissing the share sheet is a completed interaction, not
    // a failure — don't also fall back to a download in that case.
    return err instanceof DOMException && err.name === "AbortError";
  }
}

export function SaveButton({ eventId }: { eventId?: string }) {
  const [state, setState] = useState<SaveState>("idle");
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setIsIOSDevice(isIOS());
  }, []);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function handleClick() {
    setState("saving");
    timers.current.push(
      setTimeout(() => setState("saved"), 900),
      setTimeout(() => setState("idle"), 3500),
    );

    // Concurrently with the animation (§5): try the native share sheet
    // first, falling back to a plain download if sharing isn't available.
    const href = eventId ? `/api/vcard?e=${encodeURIComponent(eventId)}` : "/api/vcard";
    tryNativeShare(href).then((shared) => {
      if (!shared) triggerDownload(href);
    });
  }

  return (
    <div className="px-6 pt-3.5 pb-6">
      <button
        type="button"
        onClick={handleClick}
        disabled={state !== "idle"}
        className={`relative flex w-full items-center justify-center gap-2 rounded-row bg-accent px-4 py-4 font-display text-[15px] font-bold text-black transition-transform duration-150 ${
          state !== "idle" ? "scale-[0.98]" : ""
        } ${state === "saved" ? "brightness-110" : ""}`}
      >
        {state === "saved" && (
          <span className="pointer-events-none absolute inset-0 rounded-row border-2 border-accent animate-save-ring" />
        )}
        <span key={state} className="flex animate-save-fade items-center gap-2">
          {state === "idle" && (
            <>
              <PlusIcon className="h-4 w-4" />
              Save to contacts
            </>
          )}
          {state === "saving" && (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
              Adding…
            </>
          )}
          {state === "saved" && (
            <>
              <CheckIcon className="h-4 w-4 save-check-path" />
              <span className="animate-save-pop">Added to contacts</span>
            </>
          )}
        </span>
      </button>
      {isIOSDevice && (
        <p className="mt-2.5 text-center font-mono text-[11px] text-text-muted">
          Opens a preview — tap the share icon, then &quot;Add to Contact&quot;
        </p>
      )}
      <p className="mt-3.5 text-center">
        <Link
          href={eventId ? `/connect?e=${encodeURIComponent(eventId)}` : "/connect"}
          className="font-mono text-[12.5px] font-semibold text-accent-brass underline decoration-accent-brass/40 underline-offset-2"
        >
          trade info? send me yours →
        </Link>
      </p>
    </div>
  );
}
