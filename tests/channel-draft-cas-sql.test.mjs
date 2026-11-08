import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { readFileSync } from "node:fs";

if (!process.env.TORO_SQL_TEST_PGLITE_MODULE?.startsWith("file:")) {
  throw new Error("Pinned local PGlite QA runtime required; no remote SQL execution.");
}
const { PGlite } = await import(process.env.TORO_SQL_TEST_PGLITE_MODULE);
const sql = name => readFileSync(new URL(name, import.meta.url), "utf8");
const apply = () => sql("../supabase/drafts/20261108_toro_channel_draft_cas_v1.sql");
const rollback = () => sql("../supabase/drafts/20261108_toro_channel_draft_cas_v1_rollback.sql");
const db = new PGlite();
const org="595801ce-2895-4d91-81ae-e8d1d5cc8593";
const user="11111111-1111-4111-8111-111111111111";
const binding="22222222-2222-4222-8222-222222222222";
const args=[org,user,"account-hotel","hotel-operations","chat-fixture-001","case-fixture-001","shift-fixture-001",binding];
const rpc="public.toro_channel_draft_cas_v1($1::uuid,$2::uuid,$3,$4,$5,$6,$7,$8::uuid,$9,$10::bigint,$11,$12,$13::jsonb)";
const attachments=JSON.stringify([{evidenceRef:"dropbox/media/fixture-001",state:"ready"}]);

before(async()=>{
  await db.exec(`create schema integrations; create role anon; create role authenticated; create role service_role;
    create table public.user_roles(
      id uuid primary key,org_id uuid not null,user_id uuid not null,status text not null,revoked_at timestamptz);
    insert into public.user_roles values
      ('33333333-3333-4333-8333-333333333333','${org}','${user}','active',null);
    create table integrations.communication_channel_bindings(
      id uuid primary key,org_id uuid not null,active boolean not null,draft_enabled boolean not null,
      auth_status text not null,verification_status text not null,provider_account_ref text not null);
    insert into integrations.communication_channel_bindings values
      ('${binding}','${org}',true,true,'connected','verified','account-hotel');`);
  await db.exec(apply());
});
after(async()=>db.close());

test("allows exactly one CAS, reads it back and replays by operation key",async()=>{
  const call=await db.query(`select ${rpc} as applied`,[...args,"draft-op-001",0,"Synthetic draft","live_transport",attachments]);
  assert.equal(call.rows[0].applied,true);
  const stale=await db.query(`select ${rpc} as applied`,[...args,"draft-op-002",0,"Stale edit","live_transport",attachments]);
  assert.equal(stale.rows[0].applied,false);
  const read=(await db.query("select public.toro_channel_draft_read_v1($1::uuid,$2::uuid,$3,$4,$5,$6,$7,$8::uuid) as row",args)).rows[0].row;
  const replay=(await db.query("select public.toro_channel_draft_find_v1($1::uuid,$2::uuid,$3,$4,$5,$6,$7,$8::uuid,$9) as row",[...args,"draft-op-001"])).rows[0].row;
  assert.equal(read.version,1); assert.deepEqual(replay,read);
  assert.equal((await db.query("select count(*)::int as n from integrations.communication_channel_drafts")).rows[0].n,1);
});

test("denies unverified destinations, historical writes and malformed or duplicate attachments",async()=>{
  await db.query("update integrations.communication_channel_bindings set verification_status='partial' where id=$1::uuid",[binding]);
  assert.equal((await db.query(`select ${rpc} as applied`,[...args,"draft-op-003",1,"Blocked","live_transport",attachments])).rows[0].applied,false);
  await db.query("update integrations.communication_channel_bindings set verification_status='verified' where id=$1::uuid",[binding]);
  await assert.rejects(()=>db.query(`select ${rpc}`, [...args,"draft-op-004",1,"Blocked","historical_import",attachments]));
  const duplicate=JSON.stringify([{evidenceRef:"dropbox/media/x",state:"ready"},{evidenceRef:"dropbox/media/x",state:"ready"}]);
  await assert.rejects(()=>db.query(`select ${rpc}`, [...args,"draft-op-005",1,"Blocked","live_transport",duplicate]));
});

test("denies a caller-supplied account scope that does not match the locked binding",async()=>{
  const shadowArgs=[...args]; shadowArgs[2]="account-shadow";
  const call=await db.query(`select ${rpc} as applied`,[...shadowArgs,"draft-op-shadow",1,"Blocked","live_transport",attachments]);
  assert.equal(call.rows[0].applied,false);
  assert.equal((await db.query("select count(*)::int as n from integrations.communication_channel_drafts")).rows[0].n,1);
});

test("denies an actor without a current organization membership",async()=>{
  await db.query("update public.user_roles set status='revoked',revoked_at=now() where user_id=$1::uuid",[user]);
  const call=await db.query(`select ${rpc} as applied`,[...args,"draft-op-revoked",1,"Blocked","live_transport",attachments]);
  assert.equal(call.rows[0].applied,false);
  assert.equal((await db.query("select count(*)::int as n from integrations.communication_channel_drafts")).rows[0].n,1);
  await db.query("update public.user_roles set status='active',revoked_at=null where user_id=$1::uuid",[user]);
});

test("hides persisted drafts after membership or destination authorization is revoked",async()=>{
  const readSql="select public.toro_channel_draft_read_v1($1::uuid,$2::uuid,$3,$4,$5,$6,$7,$8::uuid) as row";
  const findSql="select public.toro_channel_draft_find_v1($1::uuid,$2::uuid,$3,$4,$5,$6,$7,$8::uuid,$9) as row";
  await db.query("update public.user_roles set status='revoked',revoked_at=now() where user_id=$1::uuid",[user]);
  assert.equal((await db.query(readSql,args)).rows[0].row,null);
  assert.equal((await db.query(findSql,[...args,"draft-op-001"])).rows[0].row,null);
  await db.query("update public.user_roles set status='active',revoked_at=null where user_id=$1::uuid",[user]);
  await db.query("update integrations.communication_channel_bindings set verification_status='partial' where id=$1::uuid",[binding]);
  assert.equal((await db.query(readSql,args)).rows[0].row,null);
  assert.equal((await db.query(findSql,[...args,"draft-op-001"])).rows[0].row,null);
  await db.query("update integrations.communication_channel_bindings set verification_status='verified' where id=$1::uuid",[binding]);
});

test("keeps table and RPCs server-only and uses invoker security",async()=>{
  const rows=(await db.query(`select proname,prosecdef,has_function_privilege('anon',oid,'execute') as anon,
    has_function_privilege('authenticated',oid,'execute') as authenticated,
    has_function_privilege('service_role',oid,'execute') as service
    from pg_proc where proname like 'toro_channel_draft_%_v1' order by proname`)).rows;
  assert.equal(rows.length,3);
  for(const row of rows) assert.deepEqual({definer:row.prosecdef,anon:row.anon,authenticated:row.authenticated,service:row.service},{definer:false,anon:false,authenticated:false,service:true});
  assert.equal((await db.query("select relrowsecurity from pg_class where oid='integrations.communication_channel_drafts'::regclass")).rows[0].relrowsecurity,true);
  assert.equal((await db.query("select has_table_privilege('authenticated','integrations.communication_channel_drafts','select,insert,update,delete') as allowed")).rows[0].allowed,false);
});

test("rollback refuses durable rows and succeeds only after the test row is removed",async()=>{
  await assert.rejects(()=>db.exec(rollback())); await db.exec("rollback");
  await db.exec("delete from integrations.communication_channel_drafts");
  await db.exec("alter function public.toro_channel_draft_read_v1(uuid,uuid,text,text,text,text,text,uuid) volatile");
  await assert.rejects(()=>db.exec(rollback())); await db.exec("rollback");
  await db.exec("alter function public.toro_channel_draft_read_v1(uuid,uuid,text,text,text,text,text,uuid) stable");
  await db.exec(rollback());
  assert.equal((await db.query("select to_regclass('integrations.communication_channel_drafts') as object")).rows[0].object,null);
});
