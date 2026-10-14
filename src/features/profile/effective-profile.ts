import "server-only";

import { createHash } from "node:crypto";

import messagePackData from "../../../data/toro_role_message_pack_v1.json";
import profileRegistryData from "../../../data/toro_verified_user_profiles_v1.json";

type BindingStatus = "verified" | "unverified" | "revoked" | "ambiguous";
type DeviceBindingStatus = "verified" | "not_applicable" | "unverified" | "revoked";
export type Subject =
  | { kind: "person"; key: string }
  | { kind: "shared_account"; key: string };

export type EffectiveProfileInput = {
  subject: Subject;
  binding: {
    subject: Subject;
    status: BindingStatus;
    channelAccountKey: string;
    organizationId: string | null;
    propertyIds: string[];
    verifiedAt: string;
    expiresAt: string;
    deviceKey: string | null;
    deviceStatus: DeviceBindingStatus;
    deviceExpiresAt: string | null;
  };
  authority: {
    subject: Subject;
    active: boolean;
    organizationId: string | null;
    propertyIds: string[];
    roleProfile: string;
    allowedDataScopes: string[];
    capabilityIds: string[];
    peopleAssistantAuthorized: boolean;
  };
  now: string;
};

export type EffectiveProfileFailure =
  | "invalid_timestamp"
  | "binding_not_verified"
  | "binding_expired"
  | "device_not_verified"
  | "device_binding_expired"
  | "inactive_authority"
  | "subject_mismatch"
  | "organization_required"
  | "organization_mismatch"
  | "property_scope_missing"
  | "property_scope_mismatch"
  | "unknown_subject"
  | "unknown_role_profile"
  | "role_profile_mismatch";

export type EffectiveProfile = {
  subject: Subject;
  addressName: string;
  nameConfirmationRequired: boolean;
  teamIdentity: boolean;
  privacyScope: string;
  roleProfile: string;
  communication: Record<string, unknown>;
  messages: Record<string, unknown>;
  allowedDataScopes: string[];
  capabilityIds: string[];
  peopleAssistantAllowed: boolean;
  receipt: {
    registryVersion: string;
    messagePackVersion: string;
    profileHash: string;
    subjectKind: Subject["kind"];
    subjectKey: string;
    channelAccountKey: string;
    deviceKey: string | null;
    organizationId: string | null;
    propertyIds: string[];
    roleProfile: string;
    bindingVerifiedAt: string;
    bindingExpiresAt: string;
    compiledAt: string;
  };
};

export type EffectiveProfileResult =
  | { ok: true; profile: EffectiveProfile }
  | { ok: false; reason: EffectiveProfileFailure };

type PersonRecord = (typeof profileRegistryData.people)[number];
type SharedAccountRecord = (typeof profileRegistryData.shared_accounts)[number];

function parseTimestamp(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function sortedUnique(values: string[]) {
  return [...new Set(values)].sort();
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, stableValue(child)]),
    );
  }
  return value;
}

function hashProfile(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(stableValue(value)))
    .digest("hex");
}

function findSubject(subject: Subject): PersonRecord | SharedAccountRecord | null {
  if (subject.kind === "person") {
    return profileRegistryData.people.find((person) => person.user_key === subject.key) ?? null;
  }
  return profileRegistryData.shared_accounts.find((account) => account.account_key === subject.key) ?? null;
}

export function compileEffectiveProfile(input: EffectiveProfileInput): EffectiveProfileResult {
  const now = parseTimestamp(input.now);
  const verifiedAt = parseTimestamp(input.binding.verifiedAt);
  const expiresAt = parseTimestamp(input.binding.expiresAt);
  const deviceExpiresAt = input.binding.deviceExpiresAt
    ? parseTimestamp(input.binding.deviceExpiresAt)
    : null;

  if (now === null || verifiedAt === null || expiresAt === null ||
      (input.binding.deviceExpiresAt && deviceExpiresAt === null)) {
    return { ok: false, reason: "invalid_timestamp" };
  }
  if (input.binding.status !== "verified") return { ok: false, reason: "binding_not_verified" };
  if (verifiedAt > now || expiresAt <= now) return { ok: false, reason: "binding_expired" };
  if (input.binding.deviceKey && input.binding.deviceStatus !== "verified") {
    return { ok: false, reason: "device_not_verified" };
  }
  if (input.binding.deviceKey && deviceExpiresAt !== null && deviceExpiresAt <= now) {
    return { ok: false, reason: "device_binding_expired" };
  }
  if (!input.authority.active) return { ok: false, reason: "inactive_authority" };
  if (input.binding.subject.kind !== input.subject.kind ||
      input.binding.subject.key !== input.subject.key ||
      input.authority.subject.kind !== input.subject.kind ||
      input.authority.subject.key !== input.subject.key) {
    return { ok: false, reason: "subject_mismatch" };
  }
  if (input.authority.roleProfile !== "personal" &&
      (!input.binding.organizationId || !input.authority.organizationId)) {
    return { ok: false, reason: "organization_required" };
  }
  if (input.binding.organizationId !== input.authority.organizationId) {
    return { ok: false, reason: "organization_mismatch" };
  }
  if (input.authority.organizationId && input.binding.propertyIds.length === 0) {
    return { ok: false, reason: "property_scope_missing" };
  }
  const authoritativePropertyIds = new Set(input.authority.propertyIds);
  if (input.binding.propertyIds.some((propertyId) => !authoritativePropertyIds.has(propertyId))) {
    return { ok: false, reason: "property_scope_mismatch" };
  }

  const record = findSubject(input.subject);
  if (!record) return { ok: false, reason: "unknown_subject" };

  const messages = (messagePackData.profiles as Record<string, Record<string, unknown>>)[input.authority.roleProfile];
  if (!messages) return { ok: false, reason: "unknown_role_profile" };

  const roleMatches = input.subject.kind === "person"
    ? (record as PersonRecord).role_contexts.includes(input.authority.roleProfile)
    : (record as SharedAccountRecord).role_context === input.authority.roleProfile;
  if (!roleMatches) return { ok: false, reason: "role_profile_mismatch" };

  const person = input.subject.kind === "person" ? record as PersonRecord : null;
  const shared = input.subject.kind === "shared_account" ? record as SharedAccountRecord : null;
  const allowedDataScopes = sortedUnique(input.authority.allowedDataScopes);
  const capabilityIds = sortedUnique(input.authority.capabilityIds);
  const peopleAssistantAllowed = Boolean(
    person?.people_assistant_eligible &&
    profileRegistryData.people_assistant_gate.allowed_user_keys.includes(person.user_key) &&
    input.authority.peopleAssistantAuthorized,
  );
  const communication = person
    ? person.communication as Record<string, unknown>
    : { language: "es", style: "calido_claro_paso_a_paso" };
  const addressName = person?.preferred_address ?? person?.presentation_name ?? shared!.team_label;
  const nameConfirmationRequired = Boolean(person?.communication.name_confirmation_required);
  const privacyScope = person?.privacy_scope ?? shared!.privacy_scope;
  const propertyIds = sortedUnique(input.binding.propertyIds);

  const profileHash = hashProfile({
    registryVersion: profileRegistryData.version,
    messagePackVersion: messagePackData.version,
    subject: input.subject,
    addressName,
    nameConfirmationRequired,
    privacyScope,
    roleProfile: input.authority.roleProfile,
    communication,
    messages,
    allowedDataScopes,
    capabilityIds,
    peopleAssistantAllowed,
    organizationId: input.authority.organizationId,
    propertyIds,
  });

  return {
    ok: true,
    profile: {
      subject: input.subject,
      addressName,
      nameConfirmationRequired,
      teamIdentity: input.subject.kind === "shared_account",
      privacyScope,
      roleProfile: input.authority.roleProfile,
      communication,
      messages,
      allowedDataScopes,
      capabilityIds,
      peopleAssistantAllowed,
      receipt: {
        registryVersion: profileRegistryData.version,
        messagePackVersion: messagePackData.version,
        profileHash,
        subjectKind: input.subject.kind,
        subjectKey: input.subject.key,
        channelAccountKey: input.binding.channelAccountKey,
        deviceKey: input.binding.deviceKey,
        organizationId: input.binding.organizationId,
        propertyIds,
        roleProfile: input.authority.roleProfile,
        bindingVerifiedAt: input.binding.verifiedAt,
        bindingExpiresAt: input.binding.expiresAt,
        compiledAt: input.now,
      },
    },
  };
}

export type ProfileSurface = "portal" | "openclaw" | "whatsapp";

export function compareEffectiveProfileReceipts(
  receipts: Array<{ surface: ProfileSurface; receipt: EffectiveProfile["receipt"] }>,
) {
  const expected = new Set<ProfileSurface>(["portal", "openclaw", "whatsapp"]);
  const seen = new Set<ProfileSurface>();
  const duplicates = new Set<ProfileSurface>();
  for (const item of receipts) {
    if (seen.has(item.surface)) duplicates.add(item.surface);
    seen.add(item.surface);
  }
  const missing = [...expected].filter((surface) => !seen.has(surface));
  const baseline = receipts[0]?.receipt;
  const matching = baseline
    ? receipts.every(({ receipt }) =>
        receipt.registryVersion === baseline.registryVersion &&
        receipt.messagePackVersion === baseline.messagePackVersion &&
        receipt.profileHash === baseline.profileHash &&
        receipt.subjectKind === baseline.subjectKind &&
        receipt.subjectKey === baseline.subjectKey &&
        receipt.roleProfile === baseline.roleProfile)
    : false;

  return {
    deployedConsistently: missing.length === 0 && duplicates.size === 0 && receipts.length === 3 && matching,
    missing,
    duplicates: [...duplicates].sort(),
    matching,
  };
}
