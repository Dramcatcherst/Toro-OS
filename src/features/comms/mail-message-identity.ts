import { createHash } from "node:crypto";

/** Stable provider mailbox identity, shared by its aliases; never a connector/session ID or body value. */
export type ToroMailMessageIdentity = {
  provider: "gmail";
  physicalAccountRef: string;
  providerMessageId: string;
};

export function isMailReference(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 256 &&
    /^[A-Za-z0-9._:-]+$/.test(value);
}

/** A native message has one identity even if its classification or thread changes. */
export function toroMailMessageKey(identity: ToroMailMessageIdentity): string | null {
  if (!identity || identity.provider !== "gmail" ||
      !isMailReference(identity.physicalAccountRef) || !isMailReference(identity.providerMessageId)) return null;
  return "mail-message-v1:" + createHash("sha256").update(JSON.stringify([
    identity.provider, identity.physicalAccountRef, identity.providerMessageId,
  ])).digest("hex");
}

/** Conservative parser for exactly one mailbox. This is NOT sender authentication. */
export function parseSingleMailAddress(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 512 || /[\r\n,;]/.test(value)) return null;
  const match = value.trim().match(/^(?:[^<>]*<([^<>]+)>|([^<>]+))$/);
  const address = (match?.[1] ?? match?.[2] ?? "").trim();
  const at = address.lastIndexOf("@");
  const normalized = address.slice(0, at) + "@" + address.slice(at + 1).toLowerCase();
  return /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/i.test(address) &&
    !address.includes("..") && address.length <= 320 ? normalized : null;
}
