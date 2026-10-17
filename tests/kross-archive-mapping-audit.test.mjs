import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { inspectRow, auditRows } from '../scripts/kross-archive-mapping-audit.mjs';
const cell=(header,value,ordinal=1)=>({header,value,ordinal,value_type:'text'});
const row=(kind,columns,id='source-row')=>({org_id:'org-test',property_id:null,source_record_id:id,source_created_at:null,source_payload:{schema_version:'kross_source_archive_staging_v1',provenance:{source_kind:kind},columns}});

test('movement code joins reservation Number while channel Code stays separate',()=>{
 const rs=[row('reservations',[cell('Number','7/2026'),cell('Code','channel-7',2)]),row('cash_ledger',[cell('Code','7/2026')],'cash')];
 const out=auditRows(rs,'org-test');assert.equal(out.cash_links.number_matches,1);assert.equal(out.cash_links.channel_code_matches,0);assert.equal(out.canonical_write_allowed,false);
});
test('guest label and payment reference never become a join or payment identity',()=>{
 const result=inspectRow(row('cash_ledger',[cell('Reservation','7/2026'),cell('Payment','stable-looking-reference',2)]));
 assert.equal(result.number,null);assert.equal(result.paymentId,null);
});
test('identical Number and Número alias columns fail closed',()=>{
 const result=inspectRow(row('reservations',[cell('Number','7/2026'),cell('Número','7/2026',2)]));
 assert.equal(result.number,null);assert(result.issues.includes('ambiguous_number_columns'));
});
test('missing, wrong-year and OTA-only links remain separate exceptions',()=>{
 const rs=[row('reservations',[cell('Número','7/2026'),cell('Código','OTA7',2)]),row('cash_ledger',[],'missing'),row('cash_ledger',[cell('Code','7/2025')],'old'),row('cash_ledger',[cell('Code','OTA7')],'ota')];
 const out=auditRows(rs,'org-test');assert.equal(out.cash_links.missing_code,1);assert.equal(out.cash_links.present_unmatched_number,2);assert.equal(out.cash_links.channel_code_matches,1);assert.equal(out.unresolved_link_rows.length,3);
});
test('invalid calendar days rejected and naive revision timestamp kept unresolved',()=>{
 const result=inspectRow(row('reservations',[cell('Arrival','2026-02-30'),cell('Departure','2026-03-02',2),cell('Last operation','2026-10-15 10:10:06.708758',3)]));
 assert.equal(result.checkIn,null);assert.equal(result.checkOut,'2026-03-02');assert.equal(result.awareRevision,false);assert(result.issues.includes('invalid_check_in'));
});
test('money lexeme remains a string and dollar column does not assert ISO currency',()=>{
 const literal='12345678901234567890.123456789';
 const result=inspectRow(row('cash_ledger',[cell('Total Amount (Conv $)',literal),cell('Total $','$100.00',2)]));
 assert.equal(result.convertedAmount,literal);assert.equal(result.currency,null);assert.equal(typeof result.convertedAmount,'string');
});
test('negative converted amount is preserved without turning it into a refund',()=>{
 const result=inspectRow(row('cash_ledger',[cell('Total Amount (Conv $)','-10.50')]));
 assert.equal(result.convertedAmount,'-10.50');assert.equal(result.transactionKind,null);
});
test('scope mismatch and unknown archive version are excluded',()=>{
 const wrong=row('cash_ledger',[cell('Code','7/2026')]);wrong.org_id='other';
 const bad=row('cash_ledger',[]);bad.source_payload.schema_version='unknown';
 const out=auditRows([wrong,bad],'org-test');assert.equal(out.rejected_scope_or_schema,2);assert.equal(out.cash_links.rows,0);
});
test('CLI cannot overwrite its input or an existing report',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'kross-mapping-'));
 const input=join(dir,'input.jsonl'),output=join(dir,'existing.json');
 const original=JSON.stringify(row('cash_ledger',[]))+'\n';
 await writeFile(input,original,{mode:0o600});await writeFile(output,'preserved',{mode:0o600});
 const hash=createHash('sha256').update(original).digest('hex');
 for(const destination of [input,output]){
  const result=spawnSync(process.execPath,['scripts/kross-archive-mapping-audit.mjs',input,hash,'org-test',destination],{encoding:'utf8'});
  assert.notEqual(result.status,0);assert.match(result.stderr,/EEXIST/);
 }
 assert.equal(await readFile(input,'utf8'),original);assert.equal(await readFile(output,'utf8'),'preserved');
});
