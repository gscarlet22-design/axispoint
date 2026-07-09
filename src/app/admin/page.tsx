"use client";

import { useEffect, useState } from "react";
import { BackToCardLink } from "@/components/BackToCardLink";
import type { CardSettings } from "@/lib/settings";
import { EventsSection } from "./EventsSection";

const STORAGE_KEY = "axispoint_admin_passphrase";

export default function AdminPage() {
  const [passphrase, setPassphrase] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setChecking(false);
      return;
    }
    verify(stored).then((ok) => {
      if (ok) {
        setPassphrase(stored);
        setUnlocked(true);
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
      setChecking(false);
    });
  }, []);

  async function verify(value: string): Promise<boolean> {
    const res = await fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passphrase: value }),
    });
    return res.ok;
  }

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const ok = await verify(passphrase);
    if (!ok) {
      setError("Incorrect passphrase.");
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, passphrase);
    setUnlocked(true);
  }

  if (checking) return null;

  if (!unlocked) {
    return (
      <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col items-center justify-center px-6 py-10">
        <p className="font-mono text-[10.5px] uppercase tracking-[.14em] text-text-label">
          Admin
        </p>
        <h1 className="mt-2 font-display text-[22px] font-bold text-text-primary">
          Enter passphrase
        </h1>
        <form onSubmit={handleUnlock} className="mt-6 flex w-full flex-col gap-3">
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className="rounded-row-sm border border-border-strong bg-transparent px-3 py-2 text-[14px] text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            autoFocus
          />
          {error && <p className="text-[12.5px] text-red-400">{error}</p>}
          <button
            type="submit"
            className="rounded-row bg-accent px-4 py-3 font-display text-[15px] font-bold text-black"
          >
            Unlock
          </button>
        </form>
      </div>
    );
  }

  return <AdminEditor passphrase={passphrase} />;
}

function AdminEditor({ passphrase }: { passphrase: string }) {
  const [settings, setSettings] = useState<CardSettings>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoStatus, setPhotoStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then(setSettings);
  }, []);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    setPhotoStatus(null);
    if (file) setPhotoPreview(URL.createObjectURL(file));
  }

  async function handlePhotoUpload() {
    if (!photoFile) return;
    setUploading(true);
    setPhotoStatus(null);
    const formData = new FormData();
    formData.append("passphrase", passphrase);
    formData.append("photo", photoFile);
    const res = await fetch("/api/admin/photo", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      setPhotoStatus(data.error ?? "Upload failed.");
      return;
    }
    setSettings(data.settings);
    setPhotoStatus("Photo updated.");
  }

  return (
    <div className="mx-auto w-full max-w-[480px] px-6 py-10">
      <BackToCardLink />

      <h1 className="mt-6 font-display text-[24px] font-bold text-text-primary">
        Edit your card
      </h1>

      <section className="mt-8">
        <h2 className="font-display text-[16px] font-bold text-text-primary">Headshot</h2>
        <p className="mt-1 text-[13px] text-text-secondary">
          Any photo works — it&apos;s resized and compressed automatically.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <div className="h-[74px] w-[74px] shrink-0 overflow-hidden rounded-avatar border border-border-strong bg-surface-panel">
            {(photoPreview ?? settings.photoUrl) && (
              // eslint-disable-next-line @next/next/no-img-element -- preview of an uploaded/remote file
              <img
                src={photoPreview ?? "/api/photo"}
                alt="Headshot preview"
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="text-[13px] text-text-secondary" />
            <button
              type="button"
              onClick={handlePhotoUpload}
              disabled={!photoFile || uploading}
              className="rounded-row-sm bg-accent px-3 py-1.5 font-display text-[13px] font-bold text-black disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Upload"}
            </button>
          </div>
        </div>
        {photoStatus && <p className="mt-2 text-[12.5px] text-text-secondary">{photoStatus}</p>}
      </section>

      <EventsSection passphrase={passphrase} settings={settings} onChange={setSettings} />
    </div>
  );
}
