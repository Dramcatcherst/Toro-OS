import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

import { validateManifest } from "./task-revalidation-validator.mjs";

const APPLY_REQUEST_ID = "TORO-R1-A-20260928";
const RECOVERY_REQUEST_ID = "TORO-R1-A-20260928-RECOVERY";

function sqlLiteral(value) {
  if (value == null) return "null";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function arrayLiteral(values) {
  return `array[${values.map(sqlLiteral).join(", ")}]::text[]`;
}

function appendNoteExpression(marker) {
  return `concat_ws(E'\\n', nullif(completion_notes, ''), ${sqlLiteral(marker)})`;
}

function applyChanges(entry) {
  const changes = new Map();
  const changedKeys = [];

  function set(key, expression) {
    changes.set(key, expression);
    if (!changedKeys.includes(key)) changedKeys.push(key);
  }

  if (entry.disposition === "KEEP") {
    set("needs_revalidation", "false");
  } else if (entry.disposition === "HOLD") {
    set("status", "'archived'");
    set("active", "false");
    set("needs_revalidation", "false");
    set("completion_notes", appendNoteExpression(`[TORO-R1-A HOLD] ${entry.reason}`));
  } else if (entry.disposition === "MERGE") {
    set("status", "'archived'");
    set("active", "false");
    set("needs_revalidation", "false");
    set(
      "completion_notes",
      appendNoteExpression(
        `[TORO-R1-A MERGE -> ${entry.merge_target_task_key}] ${entry.reason}`,
      ),
    );
  } else if (entry.disposition === "CLOSE") {
    set("status", sqlLiteral(entry.close_status));
    set("active", "false");
    set("needs_revalidation", "false");
    set(
      "completion_notes",
      appendNoteExpression(
        `[TORO-R1-A CLOSE] ${entry.reason} | evidence: ${entry.evidence_ref ?? "none"}`,
      ),
    );
  } else if (entry.disposition === "REWRITE") {
    const proposed = {
      status: entry.proposed_status,
      priority: entry.proposed_priority,
      task_name: entry.proposed_task_name,
      description: entry.proposed_description,
      blocking_reason: entry.proposed_blocking_reason,
    };
    for (const [key, value] of Object.entries(proposed)) {
      if (value != null) set(key, sqlLiteral(value));
    }
    set("needs_revalidation", "false");
  } else {
    throw new Error(`Unsupported disposition for ${entry.task_key}: ${entry.disposition}`);
  }

  changes.set("updated_at", "now()");
  return { changes, changedKeys };
}

function expectedPostConditions(entry) {
  const parts = ["needs_revalidation = false"];

  if (entry.disposition === "HOLD" || entry.disposition === "MERGE") {
    parts.push("status = 'archived'", "active = false");
  }
  if (entry.disposition === "CLOSE") {
    parts.push(`status = ${sqlLiteral(entry.close_status)}`, "active = false");
  }
  if (entry.disposition === "REWRITE") {
    const proposed = {
      status: entry.proposed_status,
      priority: entry.proposed_priority,
      task_name: entry.proposed_task_name,
      description: entry.proposed_description,
      blocking_reason: entry.proposed_blocking_reason,
    };
    for (const [key, value] of Object.entries(proposed)) {
      if (value != null) parts.push(`${key} is not distinct from ${sqlLiteral(value)}`);
    }
  }

  return parts;
}

function recoveryAssignments(entry) {
  const assignments = ["needs_revalidation = true"];

  if (entry.disposition === "HOLD" || entry.disposition === "MERGE" || entry.disposition === "CLOSE") {
    assignments.push(
      `status = ${sqlLiteral(entry.status)}`,
      "active = true",
      `completion_notes = ${sqlLiteral(entry.observed_completion_notes ?? null)}`,
    );
  }

  if (entry.disposition === "REWRITE") {
    if (entry.proposed_status != null) assignments.push(`status = ${sqlLiteral(entry.status)}`);
    if (entry.proposed_priority != null) assignments.push(`priority = ${sqlLiteral(entry.priority)}`);
    if (entry.proposed_task_name != null) assignments.push(`task_name = ${sqlLiteral(entry.task_name)}`);
    if (entry.proposed_description != null) assignments.push(`description = ${sqlLiteral(entry.description)}`);
    if (entry.proposed_blocking_reason != null) {
      assignments.push(`blocking_reason = ${sqlLiteral(entry.blocking_reason)}`);
    }
  }

  assignments.push("updated_at = now()");
  return assignments;
}

function applyBlock(entry, index) {
  const { changes, changedKeys } = applyChanges(entry);
  const assignments = [...changes.entries()].map(([key, value]) => `${key} = ${value}`);
  const reason = `[${entry.disposition}] ${entry.reason ?? ""} | evidence: ${entry.evidence_ref ?? "none"}`;
  const tag = `r1_apply_${index + 1}`;

  return `do $${tag}$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    ${assignments.join(",\n    ")}
  where id = ${sqlLiteral(entry.task_id)}::uuid
    and task_key = ${sqlLiteral(entry.task_key)}
    and updated_at = ${sqlLiteral(entry.observed_updated_at)}::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: ${entry.task_key}';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    ${arrayLiteral(changedKeys)},
    left(${sqlLiteral(reason)}, 1000),
    '${APPLY_REQUEST_ID}',
    now()
  );
end
$${tag}$;`;
}

function recoveryBlock(entry, index) {
  const expected = expectedPostConditions(entry);
  const assignments = recoveryAssignments(entry);
  const tag = `r1_recovery_${index + 1}`;

  return `do $${tag}$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = ${sqlLiteral(entry.task_id)}::uuid
    and t.task_key = ${sqlLiteral(entry.task_key)}
    and ${expected.join("\n    and ")}
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = '${APPLY_REQUEST_ID}'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for ${entry.task_key}';
  end if;

  update operations.tasks
  set
    ${assignments.join(",\n    ")}
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    ${arrayLiteral(["needs_revalidation", "status", "active", "priority", "task_name", "description", "blocking_reason", "completion_notes"])},
    ${sqlLiteral(`Recovery of TORO R1-A disposition ${entry.disposition} for ${entry.task_key}`)},
    '${RECOVERY_REQUEST_ID}',
    now()
  );
end
$${tag}$;`;
}

export function generateRevalidationSql(entries) {
  validateManifest(entries, "ready");

  const actionable = entries.filter((entry) => entry.needs_revalidation !== false);
  const noOps = entries.filter((entry) => entry.needs_revalidation === false);

  const apply = [
    "-- Generated TORO R1-A guarded backlog reconciliation.",
    "-- No DELETE statements. Every mutation requires id + task_key + observed_updated_at + needs_revalidation=true.",
    "begin;",
    ...actionable.map(applyBlock),
    "commit;",
    "",
  ].join("\n");

  const recovery = [
    "-- Generated TORO R1-A guarded recovery.",
    "-- Refuses recovery when the task no longer matches the exact R1 post-state/audit receipt.",
    "begin;",
    ...actionable.map(recoveryBlock),
    "commit;",
    "",
  ].join("\n");

  const summary = [
    `TOTAL ${entries.length}`,
    `ACTIONABLE ${actionable.length}`,
    `NO_OP_CONCURRENT ${noOps.length}`,
    ...noOps.map((entry) => `${entry.task_key} | NO_OP_CONCURRENT | ${entry.disposition}`),
  ].join("\n");

  return { apply, recovery, summary };
}

function readArg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = readArg("--file");
  if (!file) throw new Error("--file is required");

  const entries = JSON.parse(readFileSync(file, "utf8"));
  const generated = generateRevalidationSql(entries);
  const applyPath = readArg("--apply");
  const recoveryPath = readArg("--recovery");
  const summaryPath = readArg("--summary");

  if (applyPath) writeFileSync(applyPath, generated.apply, "utf8");
  if (recoveryPath) writeFileSync(recoveryPath, generated.recovery, "utf8");
  if (summaryPath) writeFileSync(summaryPath, `${generated.summary}\n`, "utf8");

  if (!applyPath && !recoveryPath && !summaryPath) {
    process.stdout.write(`${generated.summary}\n`);
  }
}
