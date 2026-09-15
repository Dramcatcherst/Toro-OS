const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(value) {
  if (!ISO_DATE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day;
}

export function normalizeRevenueFilters(input = {}) {
  const agencyValue = String(input.agencyKey ?? "").trim();
  const roomValue = String(input.roomNumber ?? "").trim();
  const dateValue = String(input.stayDate ?? "").trim();
  const seasonValue = String(input.seasonCode ?? "").trim();

  let roomNumber = null;
  if (roomValue) {
    roomNumber = Number(roomValue);
    if (!Number.isInteger(roomNumber) || roomNumber < 1 || roomNumber > 999) {
      throw new Error("Room number must be an integer between 1 and 999.");
    }
  }

  let stayDate = null;
  if (dateValue) {
    if (!isValidIsoDate(dateValue)) {
      throw new Error("Stay date must be a valid ISO date (YYYY-MM-DD).");
    }
    stayDate = dateValue;
  }

  return {
    agencyKey: agencyValue ? agencyValue.toLowerCase() : null,
    roomNumber,
    stayDate,
    seasonCode: seasonValue ? seasonValue.toUpperCase() : null,
  };
}

export function buildRevenueRpcBody(input = {}) {
  const filters = normalizeRevenueFilters(input);
  return {
    p_agency_key: filters.agencyKey,
    p_room_number: filters.roomNumber,
    p_stay_date: filters.stayDate,
    p_season_code: filters.seasonCode,
  };
}
