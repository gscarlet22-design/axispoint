import { Card } from "@/components/Card";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  const { e } = await searchParams;
  return <Card eventId={e} />;
}
