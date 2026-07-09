"use client";

import { useState } from "react";
import type { CardSettings, StoredEvent } from "@/lib/settings";

const inputClass =
  "rounded-row-sm border border-border-strong bg-transparent px-3 py-2 text-[14px] text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function EventsSection({
  passphrase,
  settings,
  onChange,
}: {
  passphrase: string;
  settings: CardSettings;
  onChange: (settings: CardSettings) => void;
}) {
  const events = settings.events ?? [];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editDate, setEditDate] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newDate, setNewDate] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function request(url: string, options: RequestInit): Promise<CardSettings> {
    const res = await fetch(url, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Request failed");
    return data.settings as CardSettings;
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabel.trim()) return;
    setStatus(null);
    try {
      const next = await request("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase, label: newLabel.trim(), date: newDate.trim() }),
      });
      onChange(next);
      setNewLabel("");
      setNewDate("");
    } catch (err) {
      setStatus((err as Error).message);
    }
  }

  function startEdit(event: StoredEvent) {
    setEditingId(event.id);
    setEditLabel(event.label);
    setEditDate(event.date);
    setStatus(null);
  }

  async function handleSaveEdit(id: string) {
    setStatus(null);
    setBusyId(id);
    try {
      const next = await request(`/api/admin/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase, label: editLabel.trim(), date: editDate.trim() }),
      });
      onChange(next);
      setEditingId(null);
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this event?")) return;
    setStatus(null);
    setBusyId(id);
    try {
      const next = await request(`/api/admin/events/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase }),
      });
      onChange(next);
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleSetCurrent(id: string) {
    setStatus(null);
    setBusyId(id);
    try {
      const next = await request("/api/admin/current-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase, id }),
      });
      onChange(next);
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="mt-10">
      <h2 className="font-display text-[16px] font-bold text-text-primary">Events</h2>
      <p className="mt-1 text-[13px] text-text-secondary">
        The one marked <strong className="text-text-primary">current</strong> shows on your card
        and in the saved contact&apos;s note whenever a link doesn&apos;t carry its own event tag.
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {events.length === 0 && (
          <p className="text-[13px] text-text-muted">No events yet — add one below.</p>
        )}
        {events.map((event) => {
          const isCurrent = settings.currentEventId === event.id;
          const isBusy = busyId === event.id;

          if (editingId === event.id) {
            return (
              <div key={event.id} className="rounded-row-sm border border-border-strong px-3 py-3">
                <div className="flex flex-col gap-2">
                  <input
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className={inputClass}
                    autoFocus
                  />
                  <input value={editDate} onChange={(e) => setEditDate(e.target.value)} className={inputClass} />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(event.id)}
                      disabled={isBusy || !editLabel.trim()}
                      className="rounded-row-sm bg-accent px-3 py-1.5 font-display text-[13px] font-bold text-black disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-row-sm border border-border-strong px-3 py-1.5 font-display text-[13px] text-text-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={event.id}
              className={`flex items-center justify-between gap-3 rounded-row-sm border px-3 py-2.5 ${
                isCurrent ? "border-accent" : "border-border-strong"
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium text-text-primary">
                  {event.label}
                  {isCurrent && (
                    <span className="ml-2 font-mono text-[9px] uppercase tracking-[.1em] text-accent">
                      Current
                    </span>
                  )}
                </p>
                <p className="text-[12px] text-text-muted">{event.date || "No date"}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                {!isCurrent && (
                  <button
                    type="button"
                    onClick={() => handleSetCurrent(event.id)}
                    disabled={isBusy}
                    className="rounded-row-sm border border-border-strong px-2.5 py-1 font-mono text-[10px] uppercase tracking-[.06em] text-text-secondary disabled:opacity-50"
                  >
                    Set current
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => startEdit(event)}
                  className="rounded-row-sm border border-border-strong px-2.5 py-1 font-mono text-[10px] uppercase tracking-[.06em] text-text-secondary"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(event.id)}
                  disabled={isBusy}
                  className="rounded-row-sm border border-border-strong px-2.5 py-1 font-mono text-[10px] uppercase tracking-[.06em] text-red-400 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {status && <p className="mt-2 text-[12.5px] text-red-400">{status}</p>}

      <form onSubmit={handleAdd} className="mt-5 flex flex-col gap-2 border-t border-border-hairline pt-5">
        <p className="font-mono text-[10px] uppercase tracking-[.12em] text-text-label">Add event</p>
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Label — e.g. ISC West"
          className={inputClass}
        />
        <input
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          placeholder="Date — e.g. March 2027"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={!newLabel.trim()}
          className="mt-1 rounded-row bg-accent px-4 py-3 font-display text-[15px] font-bold text-black disabled:opacity-50"
        >
          Add event
        </button>
      </form>
    </section>
  );
}
