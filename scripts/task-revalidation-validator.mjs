import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const DISPOSITIONS = new Set(["KEEP", "MERGE", "CLOSE", "HOLD", "REWRITE"]);
const PROPOSED_FIELDS = [
  "proposed_status",
  "proposed_priority",
  "proposed_task_name",
  "proposed_description",
  "proposed_blocking_reason",
];

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validObservedTimestamp(value) {
  if (!hasText(value)) return false;
  const normalized = value
    .trim()
    .replace(/^(\d{4}-\d{2}-\d{2}) (\d{2}:)/, "$1T$2")
    .replace(/([+-]\d{2})$/, "$1:00")
    .replace(/(\.\d{3})\d+(?=(?:[+-]\d{2}:\d{2}|Z)$)/, "$1");
  return Number.isFinite(Date.parse(normalized));
}

function fail(index, taskKey, message) {
  throw new Error(`manifest entry ${index + 1} (${taskKey || "unknown"}): ${message}`);
}

export function validateManifest(entries, mode = "ready") {
  if (!Array.isArray(entries)) throw new Error("manifest must be an array");
  if (!["snapshot", "ready"].includes(mode)) throw new Error("mode must be snapshot or ready");

  const keys = new Set();
  for (const [index, entry] of entries.entries()) {
    if (!entry || typeof entry !== "object") fail(index, "", "entry must be an object");
    if (!hasText(entry.task_id)) fail(index, entry.task_key, "task_id is required");
    if (!hasText(entry.task_key)) fail(index, entry.task_key, "task_key is required");
    if (!validObservedTimestamp(entry.observed_updated_at)) {
      fail(index, entry.task_key, "observed_updated_at must be a valid timestamp");
    }
    if (keys.has(entry.task_key)) fail(index, entry.task_key, "duplicate task_key");
    keys.add(entry.task_key);

    if (entry.disposition == null) {
      if (mode === "ready") fail(index, entry.task_key, "disposition is required in ready mode");
      continue;
    }
    if (!DISPOSITIONS.has(entry.disposition)) {
      fail(index, entry.task_key, `invalid disposition ${entry.disposition}`);
    }

    const proposed = PROPOSED_FIELDS.filter((field) => entry[field] != null);

    if (entry.disposition === "KEEP") {
      if (proposed.length || entry.merge_target_task_key != null || entry.close_status != null) {
        fail(index, entry.task_key, "KEEP cannot alter proposed fields, merge target, or close status");
      }
    }

    if (entry.disposition === "MERGE") {
      if (!hasText(entry.merge_target_task_key)) {
        fail(index, entry.task_key, "MERGE requires merge_target_task_key");
      }
      if (entry.merge_target_task_key === entry.task_key) {
        fail(index, entry.task_key, "self-merge is not allowed");
      }
      if (!hasText(entry.reason)) fail(index, entry.task_key, "MERGE requires a reason");
    }

    if (entry.disposition === "CLOSE") {
      if (!["done", "archived"].includes(entry.close_status)) {
        fail(index, entry.task_key, "CLOSE requires close_status done or archived");
      }
      if (!hasText(entry.reason) || !hasText(entry.evidence_ref)) {
        fail(index, entry.task_key, "CLOSE requires review reason and evidence_ref");
      }
    }

    if (entry.disposition === "HOLD") {
      if (entry.close_status !== "archived") {
        fail(index, entry.task_key, "HOLD requires close_status archived");
      }
      if (!hasText(entry.reason)) fail(index, entry.task_key, "HOLD requires a reason");
    }

    if (entry.disposition === "REWRITE") {
      if (!proposed.length) {
        fail(index, entry.task_key, "REWRITE requires at least one proposed field");
      }
      if (!hasText(entry.reason)) fail(index, entry.task_key, "REWRITE requires a reason");
    }
  }

  return { count: entries.length, mode, valid: true };
}

function readArg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const file = readArg("--file");
    const mode = readArg("--mode") ?? "ready";
    if (!file) throw new Error("--file is required");
    const manifest = JSON.parse(readFileSync(file, "utf8"));
    const result = validateManifest(manifest, mode);
    process.stdout.write(`Validated ${result.count} task revalidation entries in ${result.mode} mode.\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
