// Actual PostgreSQL execution in a local PGlite WASM instance. Synthetic data only.
// Supply the pinned, external QA runtime via TORO_SQL_TEST_PGLITE_MODULE (file: URL).
import assert from "node:assert/strict";
import { before, after, test } from "node:test";
import { readFileSync, writeFileSync } from "node:fs";
if (!process.env.TORO_SQL_TEST_PGLITE_MODULE?.startsWith("file:")) throw new Error("Local PGlite QA runtime required; no remote SQL execution supported.");
const { PGlite } = await import(process.env.TORO_SQL_TEST_PGLITE_MODULE);
const sql = name => readFileSync(new URL(name, import.meta.url), "utf8").replace(/\r\n/g, "\n");
const draft = sql("../supabase/drafts/20261011_portal_narrow_read_v1.sql");
const rollback = sql("../supabase/drafts/20261011_portal_narrow_read_v1_rollback.sql");
const db = new PGlite();
const orgA="11111111-1111-4111-8111-111111111111",orgB="22222222-2222-4222-8222-222222222222";
const userA="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",userB="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",userC="cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const roleAdmin="dddddddd-dddd-4ddd-8ddd-dddddddddddd",roleEmployee="eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const idA="77777777-7777-4777-8777-777777777777",idB="88888888-8888-4888-8888-888888888888";
const rpcNames=["toro_portal_brain_read_v1","toro_portal_owner_attention_read_v1"];
const resultPayloads={};
const report=[];
async function asUser(user,role="authenticated") {
  await db.exec("reset role"); await db.exec(`set role ${role}`);
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user]);
}
async function read(name,org=orgA,actor=userA) {return (await db.query(`select public.${name}($1::uuid,$2::uuid) as payload`,[org,actor])).rows[0].payload;}
async function denied(fn) { await assert.rejects(fn,error=>error.code==="42501"); }
before(async()=>{
  await db.exec(sql("fixtures/portal-narrow-read-baseline.sql"));
  await db.exec(`insert into public.roles values ('${roleAdmin}','ADMIN'),('${roleEmployee}','EMPLEADO');
    insert into public.user_roles values ('${orgA}','${userA}','${roleAdmin}','active',null),('${orgB}','${userB}','${roleAdmin}','active',null),('${orgA}','${userC}','${roleEmployee}','active',null);
    insert into public.organizations values ('${orgA}','Synthetic A','active',null),('${orgB}','Synthetic B','active',null);`);
  for (const [org,id,suffix] of [[orgA,idA,"A"],[orgB,idB,"B"]]) {
    await db.exec(`
      insert into operations.projects (id,org_id,project_name,status,priority,active,needs_revalidation,updated_at,notes) values ('${id}','${org}','Synthetic ${suffix}','NOW','P0',true,false,'2026-10-11T00:00:00Z','private-sentinel');
      insert into integrations.source_authority_rules (id,org_id,domain,official_source,human_approval_required,rule_status) values ('${id}','${org}','synthetic','Synthetic authority',false,'active');
      insert into integrations.domain_governance (id,org_id,domain,criticality) values ('${id}','${org}','synthetic','high');
      insert into integrations.kross_snapshot_health (id,org_id,source_name,snapshot_kind,observed_at,live_required,safe_for_current_state) values ('${id}','${org}','Synthetic snapshot','historical','2026-10-11T00:00:00Z',false,false);
      insert into operations.communication_followups (id,org_id,followup_key,subject,followup_state,priority,active,notes) values ('${id}','${org}','followup-${suffix}','Synthetic followup','pending','high',true,'private-sentinel');
      insert into operations.obligations (id,org_id,obligation_key,obligation_name,counterparty,status,active,current_amount,current_amount_currency) values ('${id}','${org}','obligation-${suffix}','Synthetic obligation','Synthetic party','pending',true,25,'CRC');
      insert into finance.invoices (id,org_id,invoice_key,issuer_name,total,currency,active,notes) values ('${id}','${org}','invoice-${suffix}','Synthetic issuer',10,'CRC',true,'private-sentinel');
    `);
  }
  await db.exec(draft);
});
after(async()=>{await db.close(); if(process.env.TORO_SQL_TEST_RECEIPT)writeFileSync(process.env.TORO_SQL_TEST_RECEIPT,JSON.stringify({engine:"PGlite PostgreSQL WASM 0.5.8",synthetic:true,remote_sql_executed:false,checks:report,payloads:resultPayloads},null,2));});
function check(name,fn) {test(name,async()=>{await fn();report.push(name);});}

check("functions are invoker, authenticated-only and have an empty search path",async()=>{
  await db.exec("reset role");
  const r=await db.query("select p.proname,p.prosecdef,p.proconfig,has_function_privilege('anon',p.oid,'EXECUTE') as anon,has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated,has_function_privilege('service_role',p.oid,'EXECUTE') as service from pg_proc p where p.proname=any($1::text[])",[rpcNames]);
  assert.equal(r.rows.length,2);for(const x of r.rows){assert.equal(x.prosecdef,false);assert.equal(x.anon,false);assert.equal(x.service,false);assert.equal(x.authenticated,true);assert.ok(x.proconfig.some(c=>c.startsWith('search_path=')));}
});
check("organization A receives only its bounded Brain and Finance columns",async()=>{
  await asUser(userA);
  for(const name of rpcNames){const p=await read(name);assert.equal(p.actorId,userA);assert.equal(p.orgId,orgA);
    for(const source of Object.values(p.sources)){assert.ok(source.rows.length<=source.limit);for(const row of source.rows)assert.equal(row.org_id??row.id,orgA);}
    assert.ok(!JSON.stringify(p).includes('private-sentinel'));assert.ok(!JSON.stringify(p).includes(orgB));resultPayloads[name]=p;
  }
});
check("organization B has its own view and cannot choose A",async()=>{
  await asUser(userB);
  for(const name of rpcNames){await denied(()=>read(name,orgA,userB));const p=await read(name,orgB,userB);assert.equal(p.orgId,orgB);assert.ok(!JSON.stringify(p).includes(orgA));}
});
check("forged actor is rejected even inside an allowed organization",async()=>{await asUser(userA);for(const name of rpcNames)await denied(()=>read(name,orgA,userB));});
check("ordinary employee cannot read executive Brain or financial attention",async()=>{await asUser(userC);for(const name of rpcNames)await denied(()=>read(name,orgA,userC));});
check("anonymous callers cannot execute either projection",async()=>{await asUser("","anon");for(const name of rpcNames)await denied(()=>read(name));});
check("revocation is enforced on the next read",async()=>{
  await db.exec("reset role");await db.query("update public.user_roles set revoked_at=now() where user_id=$1::uuid",[userA]);await asUser(userA);for(const name of rpcNames)await denied(()=>read(name));
  await db.exec("reset role");await db.query("update public.user_roles set revoked_at=null where user_id=$1::uuid",[userA]);
});
check("missing SELECT fails instead of becoming an empty financial success",async()=>{
  await db.exec("reset role");const cols="org_id,invoice_key,issuer_name,document_number,due_date,currency,total,payment_status,obligation_key,mailbox,source_url,active,id";
  await db.exec(`revoke select (${cols}) on finance.invoices from authenticated`);await asUser(userA);await denied(()=>read(rpcNames[1]));
  await db.exec("reset role");await db.exec(`grant select (${cols}) on finance.invoices to authenticated`);
});
check("column grants cannot read private notes or mutate invoices",async()=>{
  await asUser(userA);await denied(()=>db.query("select notes from finance.invoices"));await denied(()=>db.query("update finance.invoices set total=999"));await denied(()=>db.query("select notes from operations.communication_followups"));
});
check("Kross RLS protects direct reads as well as RPC",async()=>{await asUser(userA);const r=await db.query("select org_id from integrations.kross_snapshot_health");assert.deepEqual(r.rows,[{org_id:orgA}]);});
check("SQL uses finite row caps under an oversized source",async()=>{
  await db.exec("reset role");await db.query("insert into operations.projects (id,org_id,project_name,active,needs_revalidation,updated_at) select md5(n::text)::uuid,$1::uuid,'Synthetic overflow',true,false,now() from generate_series(1,30) n",[orgA]);
  await asUser(userA);assert.equal((await read(rpcNames[0])).sources.projects.rows.length,25);
});
check("financial reads enforce all three row caps under oversized sources",async()=>{
  await db.exec("reset role");await db.query("insert into finance.invoices (id,org_id,invoice_key,issuer_name,total,currency,active) select md5(n::text)::uuid,$1::uuid,'synthetic-'||n,'Synthetic issuer',1,'CRC',true from generate_series(1,210) n",[orgA]);
  await db.query("insert into operations.communication_followups (id,org_id,followup_key,subject,followup_state,priority,active) select md5(n::text)::uuid,$1::uuid,'synthetic-'||n,'Synthetic followup','pending','high',true from generate_series(1,110) n",[orgA]);
  await db.query("insert into operations.obligations (id,org_id,obligation_key,obligation_name,counterparty,status,active) select md5(n::text)::uuid,$1::uuid,'synthetic-'||n,'Synthetic obligation','Synthetic party','pending',true from generate_series(1,160) n",[orgA]);
  await asUser(userA);const p=await read(rpcNames[1]);assert.deepEqual([p.sources.followups,p.sources.obligations,p.sources.invoices].map(s=>s.rows.length),[100,150,200]);
});
check("a second application fails closed without changing grants",async()=>{
  await db.exec("reset role");await assert.rejects(()=>db.exec(draft),/baseline changed|RLS drift|policy drift/);await db.exec("rollback");
  assert.equal((await db.query("select has_schema_privilege('authenticated','finance','USAGE') as yes")).rows[0].yes,true);
});
check("functional rollback removes new access but keeps Kross protected",async()=>{
  await db.exec("reset role");await db.exec(rollback);
  assert.equal((await db.query("select count(*)::int as n from pg_proc where proname=any($1::text[])",[rpcNames])).rows[0].n,0);
  assert.equal((await db.query("select has_schema_privilege('authenticated','finance','USAGE') as yes")).rows[0].yes,false);
  assert.equal((await db.query("select relrowsecurity as yes from pg_class where oid='integrations.kross_snapshot_health'::regclass")).rows[0].yes,true);
  await asUser(userA);await denied(()=>db.query("select invoice_key from finance.invoices"));await denied(()=>db.query("select subject from operations.communication_followups"));
  assert.deepEqual((await db.query("select org_id from integrations.kross_snapshot_health")).rows,[{org_id:orgA}]);
});
check("proposal aborts before USAGE can activate unrelated financial privileges",async()=>{
  const isolated = new PGlite();
  try {
    await isolated.exec(sql("fixtures/portal-narrow-read-baseline.sql"));
    await isolated.exec("create table finance.unrelated_fixture (id integer); grant select on finance.unrelated_fixture to authenticated;");
    await assert.rejects(()=>isolated.exec(draft),/Finance latent privileges changed/);
    await isolated.exec("rollback");
    assert.equal((await isolated.query("select has_schema_privilege('authenticated','finance','USAGE') as yes")).rows[0].yes,false);
  } finally {await isolated.close();}
});
