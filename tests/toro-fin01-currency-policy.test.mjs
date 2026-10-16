import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const policy = JSON.parse(
  readFileSync(new URL("../data/toro_fin01_currency_policy_2026_v1.json", import.meta.url), "utf8"),
);
const actionPlan = JSON.parse(
  readFileSync(new URL("../data/toro_fin01_action_plan_2026_v1.json", import.meta.url), "utf8"),
);
const document = readFileSync(
  new URL("../docs/product/TORO_FIN01_CURRENCY_AND_FX_POLICY_2026-10-15.md", import.meta.url),
  "utf8",
);

test("FIN-01 currency matrix has one bounded, non-writing decision", () => {
  assert.equal(policy.taskId, "FIN01-P0-CUR-01");
  assert.equal(policy.status, "MATRIX_READY_FOR_ACCOUNTANT_REVIEW");
  assert.equal(policy.operationalState, "PREPARED_NOT_APPLIED");
  assert.equal(policy.externalWritesEnabled, false);
  assert.equal(policy.remoteMutationPerformed, false);
  assert.equal(policy.companyCurrencyDecision.baseCurrency, "CRC");
  assert.deepEqual(policy.companyCurrencyDecision.additionalCurrencies, ["USD"]);
  assert.equal(policy.companyCurrencyDecision.currentEndpointIdentityRevalidated, undefined);
  assert.equal(policy.scope.currentEndpointIdentityRevalidated, false);
  assert.equal(policy.singleNextTaskId, "FIN01-P0-SCOPE-01");
});

test("all 18 Alegra accounts are documented without promoting missing currency to fact", () => {
  const accounts = policy.accountInventory.accounts;
  assert.equal(accounts.length, 18);
  assert.equal(new Set(accounts.map((account) => account.alegraId)).size, 18);

  const explicitUsd = accounts.filter((account) => account.currencyEvidence === "NATIVE_EXPLICIT");
  const missingNative = accounts.filter((account) => account.currencyEvidence === "MISSING_NATIVE_FIELD");
  assert.equal(explicitUsd.length, 9);
  assert.equal(missingNative.length, 9);
  assert.ok(explicitUsd.every((account) => account.nativeCurrency === "USD"));
  assert.ok(missingNative.every((account) => account.nativeCurrency === null));
  assert.ok(missingNative.every((account) => account.status === "PENDING_EVIDENCE"));
  assert.ok(missingNative.every((account) => account.candidateCurrency === "CRC"));

  assert.equal(accounts.filter((account) => account.type === "bank").length, 12);
  assert.equal(accounts.filter((account) => account.type === "cash").length, 2);
  assert.equal(accounts.filter((account) => account.type === "credit-card").length, 4);
});

test("rate 500 is historical evidence, never an implicit fallback", () => {
  assert.equal(policy.configuredRate500.value, 500);
  assert.equal(policy.configuredRate500.allowedAsImplicitFallback, false);
  assert.equal(policy.configuredRate500.autoUpdate, false);
  assert.equal(policy.configuredRate500.state, "HISTORICAL_CONFIG_OBSERVATION_ONLY");
  assert.ok(policy.prohibitedActions.includes("implicit_fx_500"));
  assert.ok(policy.prohibitedActions.includes("historical_rate_rewrite"));
  assert.match(document, /no es una tasa fiscal, bancaria, comercial ni gerencial universal/i);
});

test("every financial event preserves originals and has explicit FX semantics", () => {
  assert.equal(policy.fxQuoteConvention, "to_currency_units_per_1_from_currency_unit");
  assert.equal(policy.eventPolicies.length, 7);
  assert.ok(policy.eventPolicies.every((event) => event.preserveOriginal === true));

  for (const field of [
    "original_amount",
    "original_currency",
    "fx_purpose",
    "fx_rate",
    "fx_quote_convention",
    "fx_date",
    "fx_source",
  ]) {
    assert.ok(policy.requiredEventFields.includes(field), `${field} must be required`);
  }

  assert.equal(policy.supabaseReadOnlyFindings.decision, "NO_DDL_NO_BACKFILL");
  assert.match(
    policy.eventPolicies.find((event) => event.eventType === "UNKNOWN_CURRENCY_OR_RATE").rule,
    /do not convert/i,
  );
});

test("official fiscal authority and action-plan handoff remain explicit", () => {
  const law = policy.officialSources.find((source) => source.authority === "Costa Rica PGR/SINALEVI");
  assert.ok(law.url.includes("nValor2=32526"));
  assert.match(law.use, /article 15/i);
  assert.match(document, /artículo 15 de la Ley 6826/i);

  const currencyTask = actionPlan.tasks.find((task) => task.id === "FIN01-P0-CUR-01");
  const nextTask = actionPlan.tasks.find((task) => task.id === "FIN01-P0-SCOPE-01");
  assert.equal(currencyTask.state, "DONE");
  assert.equal(nextTask.state, "NEXT");
  assert.equal(actionPlan.singleNextTaskId, nextTask.id);
});
