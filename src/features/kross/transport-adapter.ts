import type { KrossReservationCandidate } from "./normalize-reservation";

export type KrossSourceValuePath = string;

export type KrossReservationFieldMap = {
  externalReservationId: KrossSourceValuePath;
  reservationKey?: KrossSourceValuePath;
  roomId?: KrossSourceValuePath;
  roomCodeRaw?: KrossSourceValuePath;
  checkIn: KrossSourceValuePath;
  checkOut: KrossSourceValuePath;
  status: KrossSourceValuePath;
  guestsCount?: KrossSourceValuePath;
  adults?: KrossSourceValuePath;
  children?: KrossSourceValuePath;
  channel?: KrossSourceValuePath;
  breakfastIncluded?: KrossSourceValuePath;
};

export type KrossReservationAdapterConfig = {
  orgId: string;
  propertyId: string;
  fieldMap: KrossReservationFieldMap;
};

export type KrossAdapterIssue = {
  code:
    | "invalid_payload"
    | "missing_required_mapping"
    | "mapped_value_missing"
    | "invalid_numeric_value"
    | "invalid_boolean_value";
  field?: keyof KrossReservationFieldMap;
  message: string;
};

export type KrossAdapterResult = {
  candidate: KrossReservationCandidate | null;
  issues: KrossAdapterIssue[];
};

function clean(value: unknown) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text ? text : null;
}

function getPathValue(payload: Record<string, unknown>, path: string) {
  const parts = path.split(".").map((part) => part.trim()).filter(Boolean);
  let current: unknown = payload;

  for (const part of parts) {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

function mappedText(
  payload: Record<string, unknown>,
  field: keyof KrossReservationFieldMap,
  path: string | undefined,
  required: boolean,
  issues: KrossAdapterIssue[],
) {
  if (!path) {
    if (required) {
      issues.push({
        code: "missing_required_mapping",
        field,
        message: `Required mapping for ${field} is missing.`,
      });
    }
    return null;
  }

  const value = clean(getPathValue(payload, path));
  if (!value && required) {
    issues.push({
      code: "mapped_value_missing",
      field,
      message: `Mapped source value for ${field} is missing.`,
    });
  }
  return value;
}

function mappedInteger(
  payload: Record<string, unknown>,
  field: keyof KrossReservationFieldMap,
  path: string | undefined,
  issues: KrossAdapterIssue[],
) {
  if (!path) return null;
  const raw = getPathValue(payload, path);
  if (raw === null || raw === undefined || raw === "") return null;

  const value =
    typeof raw === "number"
      ? raw
      : typeof raw === "string"
        ? Number(raw.trim())
        : Number.NaN;

  if (!Number.isInteger(value) || value < 0) {
    issues.push({
      code: "invalid_numeric_value",
      field,
      message: `Mapped source value for ${field} is not a non-negative integer.`,
    });
    return null;
  }
  return value;
}

function mappedBoolean(
  payload: Record<string, unknown>,
  field: keyof KrossReservationFieldMap,
  path: string | undefined,
  issues: KrossAdapterIssue[],
) {
  if (!path) return null;
  const raw = getPathValue(payload, path);
  if (raw === null || raw === undefined || raw === "") return null;
  if (typeof raw === "boolean") return raw;

  if (typeof raw === "string") {
    const normalized = raw.trim().toLowerCase();
    if (["true", "1", "yes", "y", "si", "sí"].includes(normalized)) return true;
    if (["false", "0", "no", "n"].includes(normalized)) return false;
  }

  issues.push({
    code: "invalid_boolean_value",
    field,
    message: `Mapped source value for ${field} is not a recognized boolean.`,
  });
  return null;
}

export function adaptKrossReservationPayload(
  payload: unknown,
  config: KrossReservationAdapterConfig,
): KrossAdapterResult {
  const issues: KrossAdapterIssue[] = [];

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      candidate: null,
      issues: [
        {
          code: "invalid_payload",
          message: "Kross reservation payload must be an object.",
        },
      ],
    };
  }

  const source = payload as Record<string, unknown>;
  const map = config.fieldMap;

  const externalReservationId = mappedText(
    source,
    "externalReservationId",
    map.externalReservationId,
    true,
    issues,
  );
  const checkIn = mappedText(source, "checkIn", map.checkIn, true, issues);
  const checkOut = mappedText(source, "checkOut", map.checkOut, true, issues);
  const status = mappedText(source, "status", map.status, true, issues);

  if (!externalReservationId || !checkIn || !checkOut || !status) {
    return { candidate: null, issues };
  }

  return {
    candidate: {
      orgId: config.orgId,
      propertyId: config.propertyId,
      externalReservationId,
      reservationKey: mappedText(
        source,
        "reservationKey",
        map.reservationKey,
        false,
        issues,
      ),
      roomId: mappedText(source, "roomId", map.roomId, false, issues),
      roomCodeRaw: mappedText(
        source,
        "roomCodeRaw",
        map.roomCodeRaw,
        false,
        issues,
      ),
      checkIn,
      checkOut,
      status,
      guestsCount: mappedInteger(
        source,
        "guestsCount",
        map.guestsCount,
        issues,
      ),
      adults: mappedInteger(source, "adults", map.adults, issues),
      children: mappedInteger(source, "children", map.children, issues),
      channel: mappedText(source, "channel", map.channel, false, issues),
      breakfastIncluded: mappedBoolean(
        source,
        "breakfastIncluded",
        map.breakfastIncluded,
        issues,
      ),
    },
    issues,
  };
}
