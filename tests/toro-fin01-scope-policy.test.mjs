import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const matrix = JSON.parse(
  readFileSync(new URL("../data/toro_fin01_scope_matrix_2026_v1.json", import.meta.url), "utf8"),
);
const pack = JSON.parse(
  readFileSync(new URL("../data/toro_fin01_scope_control_pack_50_v1.json", import.meta.url), "utf8"),
);
const plan = JSON.parse(
  readFileSync(new URL("../data/toro_fin01_action_plan_2026_v1.json", import.meta.url), "utf8"),
);

test("FIN-01 scope contract covers all native centers without external mutation", () => {
  assert.equal(matrix.taskId, "FIN01-P0-SCOPE-01");
  assert.equal(matrix.externalWritesEnabled, false);
  assert.equal(matrix.remoteMutationPerformed, false);
  assert.equal(matrix.identityLayers.alegraCurrentCompany.providerCompanyId, "2087288");
  assert.equal(matrix.identityLayers.alegraCurrentCompany.connectorAliasesObserved, 2);
  assert.equal(matrix.identityLayers.alegraHistoricalCompany.providerCompanyId, "1254496");
  assert.equal(matrix.identityLayers.alegraHistoricalCompany.state, "HISTORICAL_ISOLATED");

  const inventory = matrix.costCenterInventory;
  assert.equal(inventory.expected, 11);
  assert.equal(inventory.observed, 11);
  assert.equal(inventory.active, 11);
  assert.equal(inventory.mappedOrQuarantined, 11);
  assert.equal(inventory.automaticallyIncludedInDreamcatcher, 0);
  assert.equal(inventory.nativeCodesPopulated, 0);
  assert.equal(inventory.stableNativeKeyRule, "alegra_company_id + cost_center_id");
  assert.equal(inventory.centers.length, 11);
  assert.equal(new Set(inventory.centers.map((center) => center.alegraCostCenterId)).size, 11);

  const hotelCandidate = inventory.centers.find((center) => center.alegraCostCenterId === "1");
  assert.equal(hotelCandidate.eligibleForDreamcatcherReview, true);
  assert.equal(hotelCandidate.includeInDreamcatcherReports, null);
  assert.match(hotelCandidate.mappingState, /TRANSACTION_EVIDENCE_REQUIRED/);

  const privateCenters = inventory.centers.filter((center) =>
    ["7", "8", "9", "10"].includes(center.alegraCostCenterId),
  );
  assert.equal(privateCenters.length, 4);
  for (const center of privateCenters) {
    assert.match(center.name, /^PRIVATE_PERSON_RELATED_/);
    assert.equal(center.mappingState, "QUARANTINED_PRIVATE");
    assert.equal(center.includeInDreamcatcherReports, false);
  }

  const restaurant = inventory.centers.find((center) => center.alegraCostCenterId === "11");
  assert.equal(restaurant.includeInDreamcatcherReports, null);
  assert.equal(restaurant.mappingState, "QUARANTINED_PENDING_OWNER_ACCOUNTANT");
  assert.equal(matrix.transactionMappingCoverage.state, "NOT_MEASURED_IN_THIS_UNIT");
  assert.equal(matrix.singleNextTaskId, "FIN01-P0-BANK-01");
});

test("FIN-01 has exactly 50 applied scope controls and zero external mutations", () => {
  assert.equal(pack.controlCount, 50);
  assert.equal(pack.controls.length, 50);
  assert.equal(pack.externalMutations, 0);
  assert.equal(new Set(pack.controls.map((control) => control.id)).size, 50);

  const expectedIds = Array.from({ length: 50 }, (_, index) =>
    `SCP-${String(index + 1).padStart(2, "0")}`,
  );
  assert.deepEqual(pack.controls.map((control) => control.id), expectedIds);
  for (const control of pack.controls) {
    assert.equal(control.state, "APPLIED_TO_GOVERNANCE_CONTRACT");
    assert.equal(control.externalMutation, false);
  }
});

test("action plan advances from catalog scope to bank reconciliation only", () => {
  const scope = plan.tasks.find((task) => task.id === "FIN01-P0-SCOPE-01");
  const bank = plan.tasks.find((task) => task.id === "FIN01-P0-BANK-01");
  assert.equal(scope.state, "DONE");
  assert.match(scope.completionScope, /DOCUMENTED_CATALOG_SCOPE_CONTRACT_ONLY/);
  assert.equal(bank.state, "NEXT");
  assert.equal(plan.singleNextTaskId, bank.id);
  assert.equal(plan.externalWritesEnabled, false);
});
