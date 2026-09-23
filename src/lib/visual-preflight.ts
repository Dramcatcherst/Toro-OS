import type { PolicyDecision } from "./policy-engine";

export type VisualPreflightDecision = PolicyDecision & {
  status: "blocked" | "draft_ready_for_review";
  policyVersion: "visual-preflight/v1";
  reasons: string[];
  nextOwner: "TORO Assets" | "TORO Governance" | "TORO Operations";
  executionAllowed: false;
  publishAllowed: false;
  externalWrite: false;
};

const conservativeTransforms = new Set([
  "exposure", "white_balance", "straighten", "crop", "resize", "compress",
  "moderate_sharpen", "moderate_denoise", "natural_color",
]);

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null
    ? value as Record<string, unknown> : {};
}

function text(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 512;
}

function hash(value: unknown): value is string {
  return typeof value === "string" && /^[a-f\d]{64}$/i.test(value);
}

function timestamp(value: unknown): number {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value)) return NaN;
  const parsed = Date.parse(value);
  // Reject normalized invalid calendar dates (for example February 30).
  return Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0, 19) === value.slice(0, 19) ? parsed : NaN;
}

function validWindow(start: unknown, end: unknown, now: number): boolean {
  const a = timestamp(start), b = timestamp(end);
  return Number.isFinite(a) && Number.isFinite(b) && a <= now && now < b;
}

function nonnegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

/**
 * Pure preparation diagnostic, NOT an authentication or publication authority.
 * `evidence` must be assembled by trusted server adapters from existing policy,
 * identity, asset and rights records; never take it from a client or LLM output.
 * No adapters/endpoints are installed by this module. Metadata agreement is not
 * visual truth: a separate before/after review is still mandatory. No returned
 * value authorizes editing, upload, publication, billing or an external write.
 */
export function evaluateVisualPreflight(
  request: unknown, evidence: unknown, nowMs: number,
): VisualPreflightDecision {
  const req = record(request), ctx = record(evidence);
  const reasons: string[] = [];
  const add = (reason: string) => { if (!reasons.includes(reason)) reasons.push(reason); };
  const transforms = req.transforms;
  const recipeValid = Array.isArray(transforms) && transforms.length > 0 && transforms.length <= 20 && transforms.every(text);

  if (!text(req.assetKey) || !text(req.scopeId) || !text(req.channel) || !recipeValid) add("invalid_request");
  if (!Number.isFinite(nowMs) || nowMs <= 0) add("invalid_clock");
  if (!text(ctx.scopeId) || !text(ctx.assetKey) || !text(ctx.actorId)) add("invalid_evidence");
  if (!text(ctx.scopeId) || req.scopeId !== ctx.scopeId) add("scope_mismatch");
  if (!text(ctx.assetKey) || req.assetKey !== ctx.assetKey) add("asset_mismatch");

  const base = record(ctx.basePolicy);
  if (base.allowed !== true || !["None", "Human review", "Owner approval"].includes(String(base.approval))) add("base_policy_blocked");

  const grant = record(ctx.grant);
  if (grant.action !== "prepare_visual" || !text(ctx.actorId) || grant.actorId !== ctx.actorId || !text(ctx.scopeId) || grant.scopeId !== ctx.scopeId || !text(ctx.assetKey) || grant.assetKey !== ctx.assetKey) add("authorization_required");
  if (!validWindow(grant.checkedAt, grant.expiresAt, nowMs)) add("authorization_stale");

  const source = record(ctx.source);
  if (source.resolved !== true) add("source_unresolved");
  if (source.kind !== "original") add("source_not_original");
  if (!text(source.revision)) add("source_revision_missing");
  if (!hash(source.expectedSha256) || !hash(source.observedSha256) || source.expectedSha256.toLowerCase() !== source.observedSha256.toLowerCase()) add("source_hash_mismatch");
  if (ctx.identityVerified !== true) add("identity_unverified");
  for (const field of ["rights", "privacy"] as const) {
    const clearance = record(ctx[field]);
    if (clearance.status !== "cleared" || !text(clearance.evidenceRef)) add(`${field}_unverified`);
  }
  if (ctx.currentAppearance === "physical_issue") add("physical_issue");
  else if (ctx.currentAppearance !== "verified") add("appearance_unverified");

  const channelPolicy = record(ctx.channelPolicy);
  if (!text(channelPolicy.reference) || !Array.isArray(channelPolicy.allowedTransforms) || channelPolicy.allowedTransforms.length === 0 || channelPolicy.allowedTransforms.length > 100 || !channelPolicy.allowedTransforms.every(text)) add("policy_unverified");
  if (!text(channelPolicy.channel) || channelPolicy.channel !== req.channel) add("channel_not_approved");
  if (!validWindow(channelPolicy.reviewedAt, channelPolicy.expiresAt, nowMs)) add("policy_stale");
  if (recipeValid) {
    for (const transform of transforms) {
      if (!conservativeTransforms.has(transform)) add("forbidden_transform");
      if (!Array.isArray(channelPolicy.allowedTransforms) || !channelPolicy.allowedTransforms.includes(transform)) add("transform_not_approved");
    }
  }

  const budget = record(ctx.budget);
  if (!nonnegativeInteger(budget.remainingCents) || !nonnegativeInteger(budget.estimatedCents) || !nonnegativeInteger(budget.remainingSteps) || budget.remainingSteps < 1 || budget.estimatedCents > budget.remainingCents) add("budget_unavailable");

  const allowed = reasons.length === 0;
  return {
    allowed,
    approval: !allowed ? "Blocked" : base.approval === "Owner approval" ? "Owner approval" : "Human review",
    status: allowed ? "draft_ready_for_review" : "blocked",
    policyVersion: "visual-preflight/v1",
    reasons,
    reason: allowed
      ? "Metadata prerequisites support a preparation draft; independent visual review and channel approval remain required. No execution is authorized."
      : "Preparation is blocked until the listed evidence or policy conditions are resolved. No editing or external write occurred.",
    nextOwner: reasons.includes("physical_issue") ? "TORO Operations"
      : reasons.some(r => ["scope_mismatch", "authorization_required", "authorization_stale", "rights_unverified", "privacy_unverified", "base_policy_blocked"].includes(r)) ? "TORO Governance" : "TORO Assets",
    executionAllowed: false,
    publishAllowed: false,
    externalWrite: false,
  };
}
