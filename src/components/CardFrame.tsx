export function CardFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[394px] rounded-outer bg-surface-outer p-2 shadow-outer-frame">
      <div className="overflow-hidden rounded-panel bg-surface-panel">{children}</div>
    </div>
  );
}
