import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
const require=createRequire(import.meta.url),ts=require('typescript');
const source=resolve(process.env.KROSS_EXTRACTOR_SOURCE_DIR||'src/features/kross');
const dir=mkdtempSync(join(tmpdir(),'kross-extractor-'));
for(const name of ['transport-adapter','archive-extractor']){
 const result=ts.transpileModule(readFileSync(join(source,name+'.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}});
 writeFileSync(join(dir,name+'.js'),result.outputText,{mode:0o600});
}
const {extractKrossArchiveReservation:extract,draftKrossArchiveReservation:draft}=require(join(dir,'archive-extractor.js'));
after(()=>rmSync(dir,{recursive:true,force:true}));
const scope={orgId:'org-test',propertyId:'property-test'},hash='a'.repeat(64);
const c=(header,value,ordinal)=>({header,value,ordinal,value_type:typeof value==='number'?'decimal_literal':'text'});
function fixture(){return{org_id:scope.orgId,property_id:scope.propertyId,source_system:'kross',source_base_id:'sha256:'+hash,source_record_id:'sha256:'+'b'.repeat(64),source_payload:{schema_version:'kross_source_archive_staging_v1',provenance:{source_kind:'reservations',file_sha256:hash},columns:[c('Number','7/2026',1),c('Arrival','2026-10-17',8),c('Departure','2026-10-18',9),c('Status','Cancelada',14)]}};}
const crosswalk={...scope,reservationNumber:'7/2026',externalReservationId:'999',evidenceReference:'verified-private-crosswalk-reference'};
test('extracts observed column arrays without using Number as an external ID',()=>{
 const r=extract(fixture(),scope);assert.ok(r.payload);assert.equal(r.payload.reservationNumber,'7/2026');assert.equal(r.payload.externalReservationId,undefined);assert.equal(r.payload.checkIn,'2026-10-17');
});
test('missing identity crosswalk cannot produce an adapter candidate',()=>{
 const r=draft(fixture(),scope);assert.equal(r.candidate,null);assert(r.issues.includes('identity_crosswalk_required'));
});
test('matching scoped crosswalk reaches the existing adapter as a draft only',()=>{
 const r=draft(fixture(),scope,crosswalk);assert.ok(r.candidate);assert.equal(r.candidate.externalReservationId,'999');assert.equal(r.candidate.reservationKey,'7/2026');assert.equal(r.candidate.status,'Cancelada');assert.equal(r.normalizationReady,false);assert.equal(r.mayWrite,false);assert.equal(r.mayClaimLive,false);
});
test('wrong crosswalk property and wrong source number are rejected',()=>{
 for(const bad of [{...crosswalk,propertyId:'other'},{...crosswalk,reservationNumber:'7/2025'}]){const r=draft(fixture(),scope,bad);assert.equal(r.candidate,null);assert(r.issues.includes('identity_crosswalk_mismatch'));}
});
test('blank redacted and absent optional cells remain distinct without clearing fields',()=>{
 const row=fixture();row.source_payload.columns.push(c('Channel',null,13),{ordinal:6,header:'Rooms',redacted:true,present:true});
 const e=extract(row,scope);assert.equal(e.fieldStates.channel,'blank');assert.equal(e.fieldStates.roomCodeRaw,'redacted');assert.equal(e.fieldStates.guestsCount,'absent');
 const r=draft(row,scope,crosswalk);assert.ok(r.candidate);assert(!Object.hasOwn(r.candidate,'channel'));assert(!Object.hasOwn(r.candidate,'roomCodeRaw'));assert(!Object.hasOwn(r.candidate,'guestsCount'));
});
test('zero guests survives extraction and adapter conversion',()=>{
 const row=fixture();row.source_payload.columns.push(c('Guests','0',7));assert.equal(draft(row,scope,crosswalk).candidate?.guestsCount,0);
});
test('duplicate alias columns never choose a convenient value',()=>{
 const row=fixture();row.source_payload.columns.push(c('Número','7/2026',2));const r=draft(row,scope,crosswalk);assert.equal(r.candidate,null);assert(r.issues.includes('ambiguous_reservationNumber'));
});
test('duplicate ordinals and mismatched provenance block extraction',()=>{
 const a=fixture();a.source_payload.columns.push(c('Guests','2',8));
 const b=fixture();b.source_payload.provenance.file_sha256='c'.repeat(64);
 for(const row of [a,b])assert.equal(extract(row,scope).payload,null);
});
test('impossible date is rejected without rollover and timestamps stay literal',()=>{
 const row=fixture();row.source_payload.columns[1].value='2026-02-30';assert.equal(draft(row,scope,crosswalk).candidate,null);
 const good=fixture();good.source_payload.columns.push(c('Last operation','2026-10-15 10:10:06.708758',11));assert.equal(extract(good,scope).payload?.lastOperationLiteral,'2026-10-15 10:10:06.708758');
});
test('financial precision is preserved outside the reservation candidate',()=>{
 const row=fixture();row.source_payload.columns.push(c('Total','12345678901234567890.123456789',19));
 assert.equal(extract(row,scope).money.totalAmount,'12345678901234567890.123456789');assert(!Object.hasOwn(draft(row,scope,crosswalk).candidate||{},'currency'));
});
test('other tenant null property unknown schema and guest names are never promoted',()=>{
 const a=fixture();a.org_id='other';const b=fixture();b.property_id=null;const d=fixture();d.source_payload.schema_version='unknown';
 for(const row of [a,b,d])assert.equal(extract(row,scope).payload,null);
 const e=fixture();e.source_payload.columns.push(c('Name','PRIVATE NAME',3));assert(!JSON.stringify(extract(e,scope)).includes('PRIVATE NAME'));
});
test('a different upstream source cannot masquerade as a Kross archive',()=>{
 const row=fixture();row.source_system='other';assert.equal(extract(row,scope).payload,null);
});
