import Link from "next/link";
import { getSettings, resolveEvent } from "@/lib/settings";
import { CardFrame } from "./CardFrame";
import { SegmentedControl } from "./SegmentedControl";
import { StatusStrip } from "./StatusStrip";
import { HeroRow } from "./HeroRow";
import { ReachRows } from "./ReachRows";
import { SaveButton } from "./SaveButton";
import { ResourcesDirectory } from "./ResourcesDirectory";
import { Footline } from "./Footline";

export async function Card({ eventId }: { eventId?: string }) {
  const settings = await getSettings();
  const event = resolveEvent(settings, eventId);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <SegmentedControl eventId={eventId} />
      <CardFrame>
        <StatusStrip />
        <HeroRow hasPhoto={!!settings.photoUrl} />
        <ReachRows />
        <SaveButton eventId={eventId} />
        <ResourcesDirectory />
        <Footline event={event} />
      </CardFrame>
      <Link
        href="/help"
        className="mt-4 font-mono text-[10.5px] uppercase tracking-[.1em] text-text-label underline decoration-border-strong underline-offset-2"
      >
        Install &amp; offline help
      </Link>
    </div>
  );
}
