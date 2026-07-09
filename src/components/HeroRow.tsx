import { card } from "@/config/card";

function Avatar({ hasPhoto }: { hasPhoto?: boolean }) {
  // The admin-uploaded photo lives in private Blob storage, so the browser
  // can't fetch its raw URL directly — /api/photo proxies it with the SDK's
  // authenticated access.
  const src = hasPhoto ? "/api/photo" : card.photoBase64 ? `data:image/jpeg;base64,${card.photoBase64}` : null;

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- data: URI / remote Blob URL, next/image can't optimize either
      <img
        src={src}
        alt={card.fullName}
        className="h-[74px] w-[74px] shrink-0 rounded-avatar object-cover"
      />
    );
  }
  return (
    <div
      className="flex h-[74px] w-[74px] shrink-0 items-center justify-center rounded-avatar border border-[#333]"
      style={{ background: "radial-gradient(circle at 30% 30%, #2a2a30, #171c1e)" }}
    >
      <span className="font-mono text-[8.5px] uppercase tracking-[.1em] text-text-label">
        Add photo
      </span>
    </div>
  );
}

export function HeroRow({ hasPhoto }: { hasPhoto?: boolean }) {
  return (
    <div className="flex gap-4 p-6">
      <Avatar hasPhoto={hasPhoto} />
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-[25px] font-bold leading-[1.08] tracking-[-0.01em] text-text-primary">
          {card.fullName}
        </h1>
        <p className="mt-1 text-[13px] leading-[1.35] text-text-secondary">{card.title}</p>
        <p className="text-[13px] font-medium leading-[1.35] text-text-primary">{card.org}</p>
      </div>
    </div>
  );
}
