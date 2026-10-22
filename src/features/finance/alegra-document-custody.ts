import type { AlegraWriteScope } from "./alegra-writer-contract";
import { createHash } from "node:crypto";

export type AlegraCustodyStorage = {
  locationKey: string;
  mode: "simulation" | "provider";
  putImmutable(path: string, bytes: Uint8Array): Promise<{ ref: string; revision: string }>;
  // Public refs are exact scoped logical paths. Provider IDs are resolved only
  // inside the authenticated adapter, never accepted as arbitrary read targets.
  read(ref: string): Promise<Uint8Array>;
};

export type AlegraAssetRole = "source_snapshot" | "native_pdf" | "original_xml" | "fiscal_response" | "original_photo" | "derived_preview";
type AttachmentState = "ALEGRA_ATTACH_PENDING" | "ALEGRA_ATTACH_OVER_LIMIT" | "ALEGRA_ATTACHMENT_UNSUPPORTED";
export type AlegraOriginalAsset = { role: AlegraAssetRole; mime: string; bytes: Uint8Array; sourceRef: string; parentSha256?: string };
export type AlegraPlannedAsset = { role: AlegraAssetRole; mime: string; path: string; sha256: string; sizeBytes: number; sourceRefs: string[]; parentSha256?: string; attachmentState: AttachmentState; bytes: Uint8Array };
export type AlegraCustodyPlan = { scopeKey: string; documentKey: string; state: "PREPARED"; externalUpload: false; assets: AlegraPlannedAsset[] };
type StoredAsset = Omit<AlegraPlannedAsset, "bytes"> & { storageRef: string; revision: string };
export type AlegraCustodyManifest = { scopeKey: string; documentKey: string; state: "INTEGRITY_VERIFIED" | "RESTORE_TESTED"; mode: "simulation" | "provider"; locationKey: string; assets: StoredAsset[]; manifestReceipt: { path: string; storageRef: string; sha256: string; revision: string } };
type CustodyInput = { scope: AlegraWriteScope; documentKey: string; assets: AlegraOriginalAsset[]; attachmentLimitBytes?: number };

function digest(bytes: Uint8Array | string) { return createHash("sha256").update(bytes).digest("hex"); }
function scopeKey(scope: AlegraWriteScope) {
  if (!scope.tenantId?.trim() || !scope.orgId?.trim() || !scope.legalEntityKey?.trim() || scope.scopeConflict) throw new Error("CUSTODY_SCOPE_INVALID");
  return digest(JSON.stringify([scope.tenantId.trim(), scope.orgId.trim(), scope.legalEntityKey.trim(), scope.propertyId?.trim() || null, scope.projectId?.trim() || null]));
}
function hasSecret(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasSecret);
  return Boolean(value && typeof value === "object" && Object.entries(value).some(([key, item]) => /authorization|token|password|secret|api.?key/i.test(key) || hasSecret(item)));
}
function extension(asset: AlegraOriginalAsset) {
  const bytes = Buffer.from(asset.bytes);
  if (bytes.length === 0) throw new Error("CUSTODY_EMPTY_ASSET");
  const text = () => new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  if (asset.mime === "application/json") {
    if (hasSecret(JSON.parse(text()))) throw new Error("CUSTODY_SECRET_FIELD_REJECTED");
    if (asset.role !== "source_snapshot") throw new Error("CUSTODY_ROLE_MIME_MISMATCH");
    return "json";
  }
  if (asset.mime === "application/pdf" && bytes.subarray(0, 5).toString() === "%PDF-" && bytes.subarray(-32).toString().includes("%%EOF")) {
    if (asset.role !== "native_pdf" && asset.role !== "derived_preview") throw new Error("CUSTODY_ROLE_MIME_MISMATCH");
    return "pdf";
  }
  if ((asset.mime === "application/xml" || asset.mime === "text/xml") && text().trim().startsWith("<") && text().trim().endsWith(">")) {
    if (asset.role !== "original_xml" && asset.role !== "fiscal_response") throw new Error("CUSTODY_ROLE_MIME_MISMATCH");
    return "xml";
  }
  const image = asset.role === "original_photo" || asset.role === "derived_preview";
  if (image && asset.mime === "image/png" && bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return "png";
  if (image && asset.mime === "image/jpeg" && bytes[0] === 255 && bytes[1] === 216 && bytes.at(-2) === 255 && bytes.at(-1) === 217) return "jpg";
  throw new Error("CUSTODY_FORMAT_UNSUPPORTED_OR_INVALID");
}

function validateProvenance(assets: Pick<AlegraPlannedAsset, "role" | "sha256" | "sourceRefs" | "parentSha256">[]) {
  for (const asset of assets) {
    if (!Array.isArray(asset.sourceRefs) || !asset.sourceRefs.length || [...asset.sourceRefs].some(ref => typeof ref !== "string" || !ref.trim())) throw new Error("CUSTODY_SOURCE_REQUIRED");
    if (asset.role === "derived_preview" && !asset.parentSha256) throw new Error("CUSTODY_DERIVATIVE_PARENT_REQUIRED");
    if (asset.parentSha256 && !assets.some(parent => parent.sha256 === asset.parentSha256 && parent.role !== "derived_preview")) throw new Error("CUSTODY_PARENT_NOT_IN_PACKAGE");
  }
}

export function prepareAlegraDocumentCustody(input: CustodyInput): AlegraCustodyPlan {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(input.documentKey)) throw new Error("CUSTODY_DOCUMENT_KEY_INVALID");
  const scoped = scopeKey(input.scope);
  if (!input.assets.length) throw new Error("CUSTODY_ASSETS_REQUIRED");
  if (input.attachmentLimitBytes !== undefined && (!Number.isSafeInteger(input.attachmentLimitBytes) || input.attachmentLimitBytes <= 0)) throw new Error("CUSTODY_ATTACHMENT_LIMIT_INVALID");
  const assets: AlegraPlannedAsset[] = [];
  for (const original of input.assets) {
    if (!original.sourceRef.trim()) throw new Error("CUSTODY_SOURCE_REQUIRED");
    const ext = extension(original);
    if (original.role === "derived_preview" && !original.parentSha256) throw new Error("CUSTODY_DERIVATIVE_PARENT_REQUIRED");
    const hash = digest(original.bytes);
    const duplicate = assets.find(a => a.sha256 === hash && a.role === original.role && a.mime === original.mime);
    if (duplicate) {
      // Identical preview bytes can be derived from distinct fiscal/source
      // documents. Merging them would silently discard one parent hash and
      // invent lineage for the combined source references. Refuse the ambiguous
      // collision until the explicit one-to-many provenance contract exists.
      if (duplicate.parentSha256 !== original.parentSha256) {
        throw new Error("CUSTODY_DERIVATIVE_PARENT_CONFLICT");
      }
      duplicate.sourceRefs = [...new Set([...duplicate.sourceRefs, original.sourceRef.trim()])].sort();
      continue;
    }
    assets.push({ role: original.role, mime: original.mime, sha256: hash, sizeBytes: original.bytes.byteLength,
      sourceRefs: [original.sourceRef.trim()], parentSha256: original.parentSha256,
      path: `${scoped}/${input.documentKey}/${original.role}/${hash}.${ext}`,
      attachmentState: input.attachmentLimitBytes === undefined ? "ALEGRA_ATTACHMENT_UNSUPPORTED"
        : original.bytes.byteLength > input.attachmentLimitBytes ? "ALEGRA_ATTACH_OVER_LIMIT" : "ALEGRA_ATTACH_PENDING",
      bytes: new Uint8Array(original.bytes) });
  }
  validateProvenance(assets);
  return { scopeKey: scoped, documentKey: input.documentKey, state: "PREPARED", externalUpload: false, assets };
}

function validateScopeAndPaths(value: AlegraCustodyPlan | AlegraCustodyManifest, expectedScope: AlegraWriteScope) {
  if (scopeKey(expectedScope) !== value.scopeKey) throw new Error("CUSTODY_SCOPE_MISMATCH");
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(value.documentKey) || !value.assets.length) throw new Error("CUSTODY_MANIFEST_INVALID");
  for (const asset of value.assets) {
    const formats: Record<AlegraAssetRole, Record<string, string>> = {
      source_snapshot: { "application/json": "json" }, native_pdf: { "application/pdf": "pdf" },
      original_xml: { "application/xml": "xml", "text/xml": "xml" }, fiscal_response: { "application/xml": "xml", "text/xml": "xml" },
      original_photo: { "image/png": "png", "image/jpeg": "jpg" }, derived_preview: { "application/pdf": "pdf", "image/png": "png", "image/jpeg": "jpg" },
    };
    const ext = formats[asset.role]?.[asset.mime];
    if (!ext || !/^[a-f0-9]{64}$/.test(asset.sha256) || asset.path !== `${value.scopeKey}/${value.documentKey}/${asset.role}/${asset.sha256}.${ext}` || !Number.isSafeInteger(asset.sizeBytes) || asset.sizeBytes <= 0) throw new Error("CUSTODY_MANIFEST_INVALID");
  }
  validateProvenance(value.assets);
}

function manifestBytes(manifest: Omit<AlegraCustodyManifest, "manifestReceipt">) {
  return Buffer.from(JSON.stringify({ scopeKey: manifest.scopeKey, documentKey: manifest.documentKey, state: "INTEGRITY_VERIFIED", mode: manifest.mode, locationKey: manifest.locationKey, assets: manifest.assets }));
}

function requireScopedRef(ref: string, path: string) {
  if (ref !== path) throw new Error("CUSTODY_STORAGE_REFERENCE_INVALID");
}

export async function materializeAlegraDocumentCustody(plan: AlegraCustodyPlan, expectedScope: AlegraWriteScope, storage: AlegraCustodyStorage): Promise<AlegraCustodyManifest> {
  plan = structuredClone(plan);
  validateScopeAndPaths(plan, expectedScope);
  // Validate the complete package before any side effect, including caller mutation.
  for (const asset of plan.assets) {
    if (asset.bytes.byteLength !== asset.sizeBytes || digest(asset.bytes) !== asset.sha256) throw new Error("CUSTODY_INTEGRITY_MISMATCH");
    extension({ ...asset, sourceRef: asset.sourceRefs[0] });
  }
  const stored: StoredAsset[] = [];
  for (const asset of plan.assets) {
    const uploaded = await storage.putImmutable(asset.path, new Uint8Array(asset.bytes));
    if (!uploaded.ref || !uploaded.revision) throw new Error("CUSTODY_STORAGE_RECEIPT_REQUIRED");
    requireScopedRef(uploaded.ref, asset.path);
    const observed = await storage.read(uploaded.ref);
    if (observed.byteLength !== asset.sizeBytes || digest(observed) !== asset.sha256) throw new Error("CUSTODY_INTEGRITY_MISMATCH");
    stored.push({ role: asset.role, mime: asset.mime, path: asset.path, sha256: asset.sha256,
      sizeBytes: asset.sizeBytes, sourceRefs: [...asset.sourceRefs], parentSha256: asset.parentSha256,
      attachmentState: asset.attachmentState, storageRef: uploaded.ref, revision: uploaded.revision });
  }
  const manifest = { scopeKey: plan.scopeKey, documentKey: plan.documentKey, state: "INTEGRITY_VERIFIED" as const, mode: storage.mode, locationKey: storage.locationKey, assets: stored };
  const bytes = manifestBytes(manifest);
  const hash = digest(bytes);
  const path = `${plan.scopeKey}/${plan.documentKey}/manifests/${hash}.json`;
  const saved = await storage.putImmutable(path, bytes);
  if (!saved.revision) throw new Error("CUSTODY_STORAGE_RECEIPT_REQUIRED");
  requireScopedRef(saved.ref, path);
  if (digest(await storage.read(saved.ref)) !== hash) throw new Error("CUSTODY_INTEGRITY_MISMATCH");
  return { ...manifest, manifestReceipt: { path, storageRef: saved.ref, sha256: hash, revision: saved.revision } };
}

export async function restoreAlegraDocumentCustody(manifest: AlegraCustodyManifest, expectedScope: AlegraWriteScope, source: AlegraCustodyStorage, destination: AlegraCustodyStorage): Promise<AlegraCustodyManifest> {
  manifest = structuredClone(manifest);
  validateScopeAndPaths(manifest, expectedScope);
  for (const asset of manifest.assets) requireScopedRef(asset.storageRef, asset.path);
  const saved = manifest.manifestReceipt;
  const expectedHash = digest(manifestBytes(manifest));
  const expectedPath = `${manifest.scopeKey}/${manifest.documentKey}/manifests/${expectedHash}.json`;
  if (!saved || saved.sha256 !== expectedHash || saved.path !== expectedPath || !saved.revision) throw new Error("CUSTODY_MANIFEST_INVALID");
  requireScopedRef(saved.storageRef, expectedPath);
  if (manifest.locationKey !== source.locationKey || source.locationKey === destination.locationKey) throw new Error("CUSTODY_RESTORE_DESTINATION_NOT_ISOLATED");
  if (manifest.mode !== source.mode || source.mode !== destination.mode) throw new Error("CUSTODY_STORAGE_MODE_MISMATCH");
  if (digest(await source.read(saved.storageRef)) !== expectedHash) throw new Error("CUSTODY_INTEGRITY_MISMATCH");
  const originals: AlegraPlannedAsset[] = [];
  for (const asset of manifest.assets) {
    const bytes = await source.read(asset.storageRef);
    if (bytes.byteLength !== asset.sizeBytes || digest(bytes) !== asset.sha256) throw new Error("CUSTODY_INTEGRITY_MISMATCH");
    originals.push({ ...asset, bytes });
  }
  const recovered = await materializeAlegraDocumentCustody({ scopeKey: manifest.scopeKey, documentKey: manifest.documentKey, state: "PREPARED", externalUpload: false, assets: originals }, expectedScope, destination);
  return { ...recovered, state: "RESTORE_TESTED" };
}
