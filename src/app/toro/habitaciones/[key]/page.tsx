import { Room360View } from "@/features/rooms/room-360-view";
import { loadRoom360FromAirtable } from "@/lib/server/room-360";

export default async function ToroRoom360Page({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const roomKey = decodeURIComponent(key).trim().slice(0, 80);
  const result = await loadRoom360FromAirtable(roomKey);

  return <Room360View result={result} />;
}
