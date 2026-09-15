export type RevenueFilterInput = {
  agencyKey?: string | null;
  roomNumber?: string | number | null;
  stayDate?: string | null;
  seasonCode?: string | null;
};

export type NormalizedRevenueFilters = {
  agencyKey: string | null;
  roomNumber: number | null;
  stayDate: string | null;
  seasonCode: string | null;
};

export function normalizeRevenueFilters(input?: RevenueFilterInput): NormalizedRevenueFilters;
export function buildRevenueRpcBody(input?: RevenueFilterInput): {
  p_agency_key: string | null;
  p_room_number: number | null;
  p_stay_date: string | null;
  p_season_code: string | null;
};
