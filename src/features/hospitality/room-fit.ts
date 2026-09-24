export type RoomFitPurpose =
  | "couple"
  | "honeymoon"
  | "family"
  | "friends"
  | "group"
  | "long_stay"
  | "remote_work"
  | "privacy";

export type RoomFitTierPreference = "any" | "premium";

export type RoomFitInput = {
  guests: number;
  purpose: RoomFitPurpose;
  kitchen: boolean;
  tier: RoomFitTierPreference;
};

export type RoomFitCandidate = {
  key: string;
  kind: "room" | "villa";
  label: string;
  capacity: number;
  bestFor: string[];
  kitchenType?: string | null;
  premiumTier?: string | null;
  verified: boolean;
};

export type RoomFitRecommendation = {
  candidate: RoomFitCandidate;
  score: number;
  reasons: string[];
};

const PURPOSE_TERMS: Record<RoomFitPurpose, string[]> = {
  couple: ["couples", "romance", "honeymoon", "privacy"],
  honeymoon: ["honeymoon", "romance", "couples", "premium", "privacy"],
  family: ["families", "kids"],
  friends: ["friends", "groups"],
  group: ["groups", "retreats", "special events"],
  long_stay: ["long stay", "families", "groups"],
  remote_work: ["remote work", "digital nomads", "long stay"],
  privacy: ["privacy", "romance", "couples"],
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function capacityFitScore(candidate: RoomFitCandidate, guests: number) {
  if (candidate.capacity < guests) return Number.NEGATIVE_INFINITY;

  const excess = candidate.capacity - guests;
  if (candidate.kind === "villa") {
    if (guests < 8) return -30 - excess;
    return 8 - Math.min(excess, 12) * 0.25;
  }

  return 8 - excess * 1.5;
}

export function recommendRoomFit(
  candidates: RoomFitCandidate[],
  input: RoomFitInput,
  limit = 3,
): RoomFitRecommendation[] {
  if (!Number.isInteger(input.guests) || input.guests < 1) return [];

  const terms = PURPOSE_TERMS[input.purpose];

  return candidates
    .filter((candidate) => candidate.verified && candidate.capacity >= input.guests)
    .map((candidate) => {
      let score = capacityFitScore(candidate, input.guests);
      const reasons: string[] = [];

      const normalizedBestFor = candidate.bestFor.map(normalize);
      const matched = terms.filter((term) =>
        normalizedBestFor.some((value) => value === term),
      );

      if (matched.length) {
        score += matched.length * 5;
        reasons.push("Encaja con el tipo de viaje");
      }

      if (input.kitchen) {
        const kitchen = normalize(candidate.kitchenType ?? "");
        if (kitchen === "private") {
          score += 7;
          reasons.push("Cocina privada");
        } else if (kitchen === "shared") {
          score += 3;
          reasons.push("Cocina compartida");
        } else {
          score -= 8;
        }
      }

      if (input.tier === "premium") {
        const tier = normalize(candidate.premiumTier ?? "");
        if (tier === "signature") {
          score += 6;
          reasons.push("Nivel Signature");
        } else if (tier === "premium") {
          score += 4;
          reasons.push("Nivel Premium");
        } else {
          score -= 3;
        }
      }

      const excess = candidate.capacity - input.guests;
      if (excess <= 1) reasons.push("Capacidad muy ajustada al grupo");

      if (!reasons.length) reasons.push("Capacidad compatible");

      return { candidate, score, reasons };
    })
    .filter((result) => Number.isFinite(result.score))
    .sort((a, b) => b.score - a.score || a.candidate.capacity - b.candidate.capacity)
    .slice(0, Math.max(1, limit));
}
