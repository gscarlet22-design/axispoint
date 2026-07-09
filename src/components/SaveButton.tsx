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
 * Sharing the .vcf as a file (rather than just downloading it) lets the
 * OS's native share sheet offer "Add to Contacts" as a direct target on
 * many Android and iOS versions — skipping the Downloads-folder detour
 * Android Chrome otherwise forces on a plain download.
 */
async function tryNativeShare(href: string): Promise<boolean> {
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
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

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
      <p className="mt-3.5 text-center">
        <Link
          href={eventId ? `/connect?e=${encodeURIComponent(eventId)}` : "/connect"}
          className="font-mono text-[11.5px] text-text-label underline decoration-border-strong underline-offset-2"
        >
          trade info? send me yours →
        </Link>
      </p>
    </div>
  );
}
