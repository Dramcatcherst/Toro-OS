import { RevenueDirectory } from "@/features/revenue/revenue-directory";
import { loadRevenueDirectory } from "@/features/revenue/server";

type RevenuePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ToroRevenuePage({ searchParams }: RevenuePageProps) {
  const params = await searchParams;
  const data = await loadRevenueDirectory({
    agencyKey: first(params.agency),
    roomNumber: first(params.room),
    stayDate: first(params.date),
    seasonCode: first(params.season),
  });

  return <RevenueDirectory data={data} />;
}
