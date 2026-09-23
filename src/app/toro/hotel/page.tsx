import { HotelDirectory } from "@/features/hotel/hotel-directory";
import { loadHotelDirectory } from "@/features/hotel/server";

export default async function ToroHotelPage() {
  const data = await loadHotelDirectory();
  return <HotelDirectory data={data} />;
}
