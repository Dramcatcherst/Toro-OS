// Offline archive mapping audit. No SQL, network, inferred currency or merge authority.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const SCHEMA='kross_source_archive_staging_v1';
const aliases={
 number:['Number','Número'],channelCode:['Code','Código'],
 checkIn:['Arrival','Llegada'],checkOut:['Departure','Salida'],
 revision:['Last operation','Ultima operación'],
 cashCode:['Code','Código'],converted:['Total Amount (Conv $)','Importe total (Conv $)'],
 registration:['Registration date','Fecha de registración'],
};
function unique(columns,names,issues,key){
 const matches=columns.filter(c=>names.includes(c.header));
 if(matches.length>1){issues.push(`ambiguous_${key}_columns`);return null;}
 const c=matches[0];return c&&!c.redacted&&c.value!==null&&c.value!==undefined&&String(c.value).trim()!==''?String(c.value).trim():null;
}
function dateOnly(value){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return null;
 const d=new Date(value+'T00:00:00Z');return Number.isFinite(d.valueOf())&&d.toISOString().slice(0,10)===value?value:null;
}
const aware=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)&&Number.isFinite(Date.parse(value));
const decimal=value=>typeof value==='string'&&/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(value);

export function inspectRow(row){
 const payload=row?.source_payload,columns=payload?.columns;
 if(payload?.schema_version!==SCHEMA||!Array.isArray(columns))return{valid:false,issues:['archive_schema_mismatch']};
 const kind=payload.provenance?.source_kind,issues=[];
 const out={valid:true,kind,issues,number:null,channelCode:null,checkIn:null,checkOut:null,awareRevision:false,awareRegistration:false,convertedAmount:null,currency:null,paymentId:null,transactionKind:null};
 if(kind==='reservations'){
  out.number=unique(columns,aliases.number,issues,'number');
  out.channelCode=unique(columns,aliases.channelCode,issues,'channel_code');
  const a=unique(columns,aliases.checkIn,issues,'check_in'),b=unique(columns,aliases.checkOut,issues,'check_out');
  out.checkIn=dateOnly(a);out.checkOut=dateOnly(b);
  if(!out.checkIn)issues.push('invalid_check_in');if(!out.checkOut)issues.push('invalid_check_out');
  if(out.checkIn&&out.checkOut&&out.checkOut<out.checkIn)issues.push('checkout_before_checkin');
  out.awareRevision=aware(unique(columns,aliases.revision,issues,'revision'));
 }else if(kind==='cash_ledger'){
  out.number=unique(columns,aliases.cashCode,issues,'cash_code');
  const v=unique(columns,aliases.converted,issues,'converted_amount');
  if(decimal(v))out.convertedAmount=v;else issues.push('invalid_converted_decimal');
  out.awareRegistration=aware(unique(columns,aliases.registration,issues,'registration'));
 }
 return out;
}

export function auditRows(rows,orgId){
 const numbers=new Set(),channelCodes=new Set(),cash=[];
 const out={state:'OFFLINE_MAPPING_EVIDENCE_ONLY',canonical_write_allowed:false,currency_inferred:false,rejected_scope_or_schema:0,reservations:{rows:0,number_year_reference:0,aware_revisions:0,invalid_stays:0,ambiguous_columns:0},cash_links:{rows:0,number_matches:0,channel_code_matches:0,missing_code:0,present_unmatched_number:0,converted_decimals:0,aware_registrations:0,stable_payment_id_verified:0},unresolved_link_rows:[]};
 for(const row of rows){
  const x=inspectRow(row);
  if(row.org_id!==orgId||!x.valid){out.rejected_scope_or_schema++;continue;}
  if(x.kind==='reservations'){
   out.reservations.rows++;if(x.number)numbers.add(x.number);if(x.channelCode)channelCodes.add(x.channelCode);
   out.reservations.number_year_reference+=/^\d+\/\d{4}$/.test(x.number||'')?1:0;
   out.reservations.aware_revisions+=x.awareRevision?1:0;
   out.reservations.invalid_stays+=x.issues.some(v=>['invalid_check_in','invalid_check_out','checkout_before_checkin'].includes(v))?1:0;
   out.reservations.ambiguous_columns+=x.issues.some(v=>v.startsWith('ambiguous_'))?1:0;
  }else if(x.kind==='cash_ledger')cash.push({x,ref:row.source_record_id,sourceBase:row.source_base_id});
 }
 for(const {x,ref,sourceBase} of cash){
  out.cash_links.rows++;out.cash_links.converted_decimals+=x.convertedAmount!==null?1:0;out.cash_links.aware_registrations+=x.awareRegistration?1:0;
  if(x.number&&channelCodes.has(x.number))out.cash_links.channel_code_matches++;
  const reason=!x.number?'missing_reservation_number':!numbers.has(x.number)?'reservation_number_not_in_available_exports':null;
  if(!x.number)out.cash_links.missing_code++;else if(reason)out.cash_links.present_unmatched_number++;else out.cash_links.number_matches++;
  if(reason)out.unresolved_link_rows.push({source_record_id:ref,source_base_id:sourceBase,reason});
 }
 return out;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const [input,expectedHash,orgId,output]=process.argv.slice(2);
 if(!input||!output||!orgId||!/^[a-f0-9]{64}$/.test(expectedHash||''))throw Error('Usage: input-jsonl expected-sha256 org-id output-json');
 const bytes=await readFile(input),hash=createHash('sha256').update(bytes).digest('hex');
 if(hash!==expectedHash)throw Error('Source checksum mismatch');
 const report=auditRows(bytes.toString('utf8').trim().split('\n').map(JSON.parse),orgId);
 report.source_sha256=hash;report.observed_at=new Date().toISOString();
 // Refuse existing destinations, including an input path, hard link or symlink.
 await writeFile(output,JSON.stringify(report,null,2)+'\n',{mode:0o600,flag:'wx'});
 const {unresolved_link_rows,...summary}=report;console.log(JSON.stringify({...summary,unresolved_link_rows:unresolved_link_rows.length},null,2));
}
