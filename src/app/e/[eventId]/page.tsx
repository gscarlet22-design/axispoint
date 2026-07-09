import { Card } from "@/components/Card";

export default async function EventCardPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return <Card eventId={eventId} />;
}
