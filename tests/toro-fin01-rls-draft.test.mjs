import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const inventory = JSON.parse(
  readFileSync(new URL("../data/toro_fin01_rls_inventory_2026_v1.json", import.meta.url), "utf8"),
);
const applySql = readFileSync(
  new URL("../supabase/drafts/20261015_fin01_server_only_rls_v1.sql", import.meta.url),
  "utf8",
);
const rollbackSql = readFileSync(
  new URL("../supabase/drafts/20261015_fin01_server_only_rls_v1_rollback.sql", import.meta.url),
  "utf8",
);

const targets = inventory.tables.map(({ relation }) => relation).sort();

function occurrences(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

function assertBalancedSqlEnvelope(sql) {
  assert.equal(occurrences(sql, /do \$preconditions\$/gi), 1);
  assert.equal(occurrences(sql, /\$preconditions\$;/gi), 1);
  assert.match(sql, /^--[\s\S]*\nbegin;/i);
  assert.match(sql, /commit;\s*$/i);
  assert.equal((sql.match(/\$/g) ?? []).length % 2, 0, "dollar quotes must be balanced");
  assert.doesNotMatch(
    sql,
    /\b(cascade|force row level security|grant\s+(all|select|insert|update|delete|truncate|references|trigger)|create policy|insert into|update\s+\w|delete from|truncate\s+table)\b/i,
  );
}

test("FIN-01 RLS inventory covers the exact 12 server-only relations", () => {
  assert.equal(inventory.status, "PREPARED_NOT_APPLIED");
  assert.equal(inventory.remoteMutationPerformed, false);
  assert.equal(targets.length, 12);
  assert.equal(new Set(targets).size, 12);
  assert.equal(inventory.decision.strategy, "ENABLE_RLS_WITHOUT_POLICIES");

  for (const table of inventory.tables) {
    assert.equal(table.currentRls, false, `${table.relation} baseline must be RLS off`);
    assert.deepEqual(table.currentPolicies, [], `${table.relation} must have zero policies`);
    assert.ok(table.owner.length > 0);
    assert.ok(table.documentedConsumer.length > 0);
    assert.match(table.positiveTest, /(service_role|postgres)/);
    assert.match(table.negativeTest, /anon/);
    assert.match(table.negativeTest, /authenticated/);
  }
});

test("review SQL is fail-closed, policy-free and reversible for all 12 relations", () => {
  assertBalancedSqlEnvelope(applySql);
  assertBalancedSqlEnvelope(rollbackSql);
  assert.match(applySql, /REVIEW ONLY \/ NOT APPLIED/);
  assert.match(rollbackSql, /REVIEW ONLY \/ NOT EXECUTED/);

  for (const relation of targets) {
    const escaped = relation.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    assert.equal(
      occurrences(applySql, new RegExp(`alter table ${escaped} enable row level security;`, "gi")),
      1,
      `${relation} must be enabled exactly once`,
    );
    assert.equal(
      occurrences(rollbackSql, new RegExp(`alter table ${escaped} disable row level security;`, "gi")),
      1,
      `${relation} must be disabled exactly once in rollback`,
    );
  }

  assert.equal(occurrences(applySql, /enable row level security;/gi), 12);
  assert.equal(occurrences(rollbackSql, /disable row level security;/gi), 12);
  assert.match(applySql, /public-role privilege drift/);
  assert.match(applySql, /role BYPASSRLS baseline changed/);
  assert.match(rollbackSql, /rollback refuses % unexpected policies/);
});

test("allow and deny behavior remains explicit in the isolated contract model", () => {
  for (const table of inventory.tables) {
    const allowed = new Set(table.effectiveConsumers);
    assert.equal(allowed.has("anon"), false, `${table.relation} must deny anon`);
    assert.equal(allowed.has("authenticated"), false, `${table.relation} must deny authenticated`);
    assert.equal(allowed.has("postgres"), true, `${table.relation} must retain postgres`);
    assert.equal(
      allowed.has("service_role"),
      table.relation.startsWith("finance."),
      `${table.relation} service_role baseline must remain exact`,
    );
  }
});
