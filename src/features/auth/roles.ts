export type ToroRole =
  | "FOUNDER"
  | "GERENCIA"
  | "RECEPCION"
  | "OPERACIONES"
  | "FINANZAS"
  | "GROWTH"
  | "SYSTEMS";

const TORO_ROLES = new Set<ToroRole>([
  "FOUNDER",
  "GERENCIA",
  "RECEPCION",
  "OPERACIONES",
  "FINANZAS",
  "GROWTH",
  "SYSTEMS",
]);

export type ToroRoleProfile = {
  explicitToroRole?: string | null;
  systemRoleCodes?: string[] | null;
};

export function resolveToroRole(profile: ToroRoleProfile): ToroRole | null {
  const explicit = profile.explicitToroRole?.trim().toUpperCase();
  if (explicit) {
    return TORO_ROLES.has(explicit as ToroRole) ? (explicit as ToroRole) : null;
  }

  const roleCodes = new Set(
    (profile.systemRoleCodes ?? []).map((value) => value.trim().toUpperCase()),
  );

  if (roleCodes.has("GERENCIA")) return "GERENCIA";
  if (roleCodes.has("CONTABILIDAD")) return "FINANZAS";

  return null;
}
