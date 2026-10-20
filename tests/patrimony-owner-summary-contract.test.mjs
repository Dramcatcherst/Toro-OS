import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (name) => readFileSync(new URL(name, import.meta.url), "utf8").replace(/\r\n/g, "\n");
const draft = read("../supabase/drafts/20261020_patrimony_owner_summary_v1.sql");
const rollback = read("../supabase/drafts/20261020_patrimony_owner_summary_v1_rollback.sql");

test("draft is preparation-only and additive", () => {
  assert.match(draft, /REVIEW ONLY\. NOT APPLIED/);
  assert.match(draft, /create function public\.toro_patrimony_owner_summary_v1/);
  assert.doesNotMatch(draft, /create table|alter table|drop table|insert into|update patrimony|delete from/i);
});

test("authorization requires the exact actor, FOUNDER and active ADMIN", () => {
  assert.match(draft, /p_actor_id is distinct from auth\.uid\(\)/);
  assert.match(draft, /toro_role',''\) <> 'FOUNDER'/);
  assert.match(draft, /toro_patrimony_has_active_org_role\(p_org_id,array\['ADMIN'\]::text\[\]\)/);
  assert.match(draft, /current_user <> 'authenticated'/);
});

test("RPC remains invoker-only and excludes public identities", () => {
  assert.match(draft, /security invoker/);
  assert.match(draft, /set search_path = ''/);
  assert.match(draft, /revoke all on function[\s\S]*from public,anon,authenticated,service_role/);
  assert.match(draft, /grant execute on function[\s\S]*to authenticated/);
  assert.doesNotMatch(draft, /grant execute[\s\S]*to (anon|public|service_role)/);
});

test("payload is aggregate and omits sensitive registry fields", () => {
  for (const allowed of ["matrixVersion","observedAt","verifiedAt","legalEntities","vehicles","conflicts"]) {
    assert.ok(draft.includes(`'${allowed}'`));
  }
  for (const blocked of ["legal_id","registered_name","folio","plan_number","plate","amount_crc","amount_usd","artifact_sha256","details"]) {
    assert.ok(!draft.includes(`'${blocked}'`));
  }
});

test("reapplication and unsafe rollback fail closed", () => {
  assert.match(draft, /already exists: do not reapply/);
  assert.match(rollback, /md5\(replace\(prosrc,E'\\r\\n',E'\\n'\)\) = '[0-9a-f]{32}'/);
  assert.match(rollback, /Rollback function drift/);
  assert.match(rollback, /Rollback ACL drift/);
  assert.match(rollback, /drop function public\.toro_patrimony_owner_summary_v1/);
});
