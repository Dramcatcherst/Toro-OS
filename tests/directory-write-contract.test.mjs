// Executes the shipped SQL in PostgreSQL WASM, using synthetic data only.
// Break caught: a direct writer can save candidate.* in contractual entries,
// making the entire authenticated catalogue fail on its next read.
import assert from "node:assert/strict";
import { before, beforeEach, after, test } from "node:test";
import { readFileSync } from "node:fs";

if (!process.env.TORO_SQL_TEST_PGLITE_MODULE?.startsWith("file:")) {
  throw new Error("Pinned local PGlite QA runtime required; no remote SQL execution.");
}
const { PGlite } = await import(process.env.TORO_SQL_TEST_PGLITE_MODULE);
const sql = name => readFileSync(new URL(name, import.meta.url), "utf8");
const apply = () => sql("../supabase/drafts/dreamcatcher_tool_directory_write_guard_v1.sql");
const rollback = () => sql("../supabase/drafts/dreamcatcher_tool_directory_write_guard_v1_rollback.sql");
const db = new PGlite();
const id = "50df0e7d-1aed-489a-a942-274715734dd0";
const org = "595801ce-2895-4d91-81ae-e8d1d5cc8593";
const property = "7ac9e46e-3b56-44d6-96f9-9d0b63bc943b";
const key = "dreamcatcher_system_database_directory_v1";
const entry = n => ({ id:`LINK-${String(n).padStart(3,"0")}`, name:`Synthetic ${n}`,
  url:"", purpose:"Synthetic navigation", project:"Synthetic hotel", category:"Tools",
  provider:"example.test", state:"registrado", lifecycle:"operativo", priority:"P2",
  link_type:"administration", scope:"Synthetic hotel", home_eligible:false, visibility:"internal" });
const source = () => ({ unrelated:{kept:true}, link_directory:{ version:"synthetic",
  entries:Array.from({length:244},(_,i)=>entry(i+1)),
  candidate_entries:[{id:"candidate.synthetic", notes:"Not a contractual destination"}] } });
const write = payload => db.query("update operations.knowledge_items set structured_content=$1::jsonb where id=$2::uuid",[JSON.stringify(payload),id]);
const read = async () => (await db.query("select structured_content from operations.knowledge_items where id=$1::uuid",[id])).rows[0].structured_content;

before(async()=>{
  await db.exec(`create schema operations; create schema private;
    create role anon; create role authenticated; create role service_role;
    create table operations.knowledge_items (id uuid primary key,org_id uuid,property_id uuid,
      knowledge_key text,structured_content jsonb,notes text);
    alter table operations.knowledge_items enable row level security;
    grant usage on schema operations to authenticated;
    grant select,insert,update on operations.knowledge_items to authenticated;
    create policy synthetic_writer on operations.knowledge_items to authenticated
      using (org_id='${org}'::uuid) with check (org_id='${org}'::uuid);`);
  await db.query("insert into operations.knowledge_items values ($1,$2,$3,$4,$5,'human note')",[id,org,property,key,JSON.stringify(source())]);
  await db.exec(apply());
});
beforeEach(async()=>{ await db.exec("reset role"); await write(source()); });
after(async()=>{await db.close();});

test("rejects candidate entries atomically and preserves both canonical data and proposals",async()=>{
  const bad=source(); bad.link_directory.entries.push({id:"candidate.synthetic"});
  await assert.rejects(()=>write(bad),e=>e.code==="23514" && !e.message.includes("Not a contractual"));
  assert.deepEqual(await read(),source());
});

test("allows a valid write without changing order, metadata, URL, account or proposals",async()=>{
  const next=source(); next.link_directory.entries[0].name="Updated synthetic title";
  next.link_directory.entries[1].scope="Separate account";
  next.link_directory.entries[1].url="https://example.test/account-two";
  await write(next); assert.deepEqual(await read(),next);
});

test("rejects duplicate IDs, malformed fields and invalid directory containers",async()=>{
  const invalid=[];
  const duplicate=source(); duplicate.link_directory.entries[1].id="LINK-001"; invalid.push(duplicate);
  for(const [field,value] of [["name",null],["url",false],["home_eligible","true"],["visibility","public"],["id",null]]) {
    const payload=source(); payload.link_directory.entries[0][field]=value; invalid.push(payload);
  }
  for(const value of [null,{},[],"not an array"]) {const payload=source();payload.link_directory.entries=value;invalid.push(payload);}
  for(const payload of invalid) await assert.rejects(()=>write(payload),e=>e.code==="23514");
  assert.deepEqual(await read(),source());
});

test("validates inserts and scope-changing updates rather than only normal edits",async()=>{
  const bad=source(); bad.link_directory.entries.push({id:"candidate.synthetic"});
  await assert.rejects(()=>db.query("insert into operations.knowledge_items values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',$1,$2,$3,$4,null)",[org,property,key,JSON.stringify(bad)]),e=>e.code==="23514");
  await db.query("insert into operations.knowledge_items values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',$1,$2,'other',$3,null)",[org,property,JSON.stringify(bad)]);
  await assert.rejects(()=>db.query("update operations.knowledge_items set knowledge_key=$1 where id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'",[key]),e=>e.code==="23514");
});

test("leaves other knowledge, organizations and properties unchanged",async()=>{
  const payload={not_a_directory:true};
  for(const [n,targetOrg,targetProperty,targetKey] of [
    [1,org,property,"another_key"],[2,"11111111-1111-4111-8111-111111111111",property,key],
    [3,org,"22222222-2222-4222-8222-222222222222",key]]) {
    await db.query("insert into operations.knowledge_items values ($1,$2,$3,$4,$5,null)",[`00000000-0000-4000-8000-00000000000${n}`,targetOrg,targetProperty,targetKey,JSON.stringify(payload)]);
  }
  assert.equal((await db.query("select count(*)::int as n from operations.knowledge_items where structured_content=$1::jsonb",[JSON.stringify(payload)])).rows[0].n,3);
});

test("does not pin the current inventory size or prohibit blank destination URLs",async()=>{
  for(const count of [1,245,1000]) {
    const payload=source();payload.link_directory.entries=Array.from({length:count},(_,i)=>entry(i+1));
    await write(payload);assert.equal((await read()).link_directory.entries.length,count);
  }
  const oversized=source();oversized.link_directory.entries=Array.from({length:1001},(_,i)=>entry(i+1));
  await assert.rejects(()=>write(oversized),e=>e.code==="23514");
});

test("preserves writer permissions and RLS without exposing a callable privileged function",async()=>{
  const before=(await db.query("select relrowsecurity,relacl::text from pg_class where oid='operations.knowledge_items'::regclass")).rows[0];
  const permissions=(await db.query("select prosecdef,has_function_privilege('authenticated',oid,'execute') as authenticated,has_function_privilege('anon',oid,'execute') as anon,has_function_privilege('service_role',oid,'execute') as service from pg_proc where oid='private.dreamcatcher_tool_directory_write_guard_v1()'::regprocedure")).rows[0];
  assert.deepEqual(permissions,{prosecdef:false,authenticated:false,anon:false,service:false});
  await db.exec("set role authenticated");
  const good=source();good.link_directory.entries[0].name="Authorized synthetic edit";
  await write(good); assert.deepEqual(await read(),good);
  const bad=source();bad.link_directory.entries.push({id:"candidate.synthetic"});
  await assert.rejects(()=>write(bad),e=>e.code==="23514");
  await db.exec("reset role");
  assert.deepEqual((await db.query("select relrowsecurity,relacl::text from pg_class where oid='operations.knowledge_items'::regclass")).rows[0],before);
});

test("refuses reapplication without replacing an existing guard",async()=>{
  await assert.rejects(()=>db.exec(apply()));await db.exec("rollback");
  const bad=source();bad.link_directory.entries.push({id:"candidate.synthetic"});
  await assert.rejects(()=>write(bad),e=>e.code==="23514");
});

test("rollback preserves functions changed through configuration, attributes, permissions or ownership",async()=>{
  const original=(await db.query("select pg_get_functiondef('private.dreamcatcher_tool_directory_write_guard_v1()'::regprocedure) as ddl")).rows[0].ddl;
  const states=()=>db.query("select pg_get_functiondef(oid) as ddl,proowner,proacl::text from pg_proc where oid='private.dreamcatcher_tool_directory_write_guard_v1()'::regprocedure");
  for(const mutation of [
    "alter function private.dreamcatcher_tool_directory_write_guard_v1() set search_path='public'",
    "alter function private.dreamcatcher_tool_directory_write_guard_v1() stable",
    "grant execute on function private.dreamcatcher_tool_directory_write_guard_v1() to authenticated",
    "alter function private.dreamcatcher_tool_directory_write_guard_v1() parallel safe",
    "alter function private.dreamcatcher_tool_directory_write_guard_v1() owner to authenticated",
  ]) {
    await db.exec(mutation);const changed=(await states()).rows;
    await assert.rejects(()=>db.exec(rollback()),undefined,mutation);await db.exec("rollback");
    assert.deepEqual((await states()).rows,changed);
    assert.equal((await db.query("select count(*)::int as n from pg_trigger where tgrelid='operations.knowledge_items'::regclass and tgname='dreamcatcher_tool_directory_write_guard_v1'")).rows[0].n,1);
    await db.exec("alter function private.dreamcatcher_tool_directory_write_guard_v1() owner to postgres");
    await db.exec(original);
    await db.exec("revoke all on function private.dreamcatcher_tool_directory_write_guard_v1() from public,anon,authenticated,service_role");
  }
});

test("rollback refuses drift and removes only its unchanged guard",async()=>{
  const original=(await db.query("select pg_get_functiondef('private.dreamcatcher_tool_directory_write_guard_v1()'::regprocedure) as ddl")).rows[0].ddl;
  await db.exec(original.replace("return new;","return null;"));
  await assert.rejects(()=>db.exec(rollback()));await db.exec("rollback");
  await db.exec(original);
  const prior=await read();await db.exec(rollback());assert.deepEqual(await read(),prior);
  assert.equal((await db.query("select to_regprocedure('private.dreamcatcher_tool_directory_write_guard_v1()') as guard")).rows[0].guard,null);
  // Restore the test fixture's guard and verify no duplicate source rewrite.
  await db.exec(apply());assert.deepEqual(await read(),prior);
});
