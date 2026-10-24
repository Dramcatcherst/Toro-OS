import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { normalizeAlegraInvoiceEvidence as normalize, planEvidenceImport, resolveServiceMapping } from '../scripts/finance/alegra-evidence-preflight.mjs';
const context = { orgId:'test-org', sourceAccountKey:'approved-account', expectedCostCenterId:'1', observedAt:'2026-10-15T23:00:00Z', accountBindingVerified:true };
function invoice(change={}) { return { id:'001',date:'2026-10-13',status:'closed',subtotal:100,tax:13,total:113,totalPaid:113,balance:0,currency:{code:'USD',exchangeRate:'500.00000000'},costCenter:{id:'1'},client:{id:'751',name:'Huesped',email:'private@example.invalid'},numberTemplate:{fullNumber:'001',isElectronic:false},paymentMethod:'CARD',items:[{id:'1',quantity:1,price:100}],payments:[{id:'payment-1'}],...change }; }
test('preserves document identity, native cents and direction without ledger writes',()=>{const r=normalize(invoice(),context);assert.equal(r.document_number,'001');assert.equal(r.amount,'113.00');assert.equal(r.currency,'USD');assert.equal(r.document_type,'alegra_invoice_source_observation');assert.equal(r.metadata.write_to_alegra,false);});
test('does not assume USD or base currency when absent',()=>{const r=normalize(invoice({currency:undefined}),context);assert.equal(r.currency,null);assert.ok(r.metadata.issues.includes('CURRENCY_UNRESOLVED'));});
test('null monetary value is not zero',()=>assert.throws(()=>normalize(invoice({total:null}),context),/INVALID_MONEY/));
test('empty monetary value is not zero',()=>assert.throws(()=>normalize(invoice({total:''}),context),/INVALID_MONEY/));
test('zero amount stays a real zero',()=>assert.equal(normalize(invoice({subtotal:0,tax:0,total:0,totalPaid:0,balance:0}),context).amount,'0.00'));
test('rejects nonfinite monetary value',()=>assert.throws(()=>normalize(invoice({total:Infinity}),context),/INVALID_MONEY/));
test('rejects ambiguous decimal separator',()=>assert.throws(()=>normalize(invoice({total:'1,00'}),context),/INVALID_MONEY/));
test('does not silently round header precision',()=>assert.throws(()=>normalize(invoice({total:'113.001'}),context),/INVALID_MONEY/));
test('amount arithmetic is exact in cents',()=>assert.equal(normalize(invoice({subtotal:'0.10',tax:'0.20',total:'0.30',totalPaid:'0.30'}),context).metadata.header_arithmetic_valid,true));
test('inconsistent gross becomes a review issue',()=>assert.ok(normalize(invoice({total:115}),context).metadata.issues.includes('HEADER_TOTAL_MISMATCH')));
test('missing org blocks ingestion',()=>assert.throws(()=>normalize(invoice(),{...context,orgId:''}),/INVALID_SCOPE/));
test('unverified account binding blocks ingestion',()=>assert.throws(()=>normalize(invoice(),{...context,accountBindingVerified:false}),/ACCOUNT_BINDING_REQUIRED/));
test('source account required independently from org',()=>assert.throws(()=>normalize(invoice(),{...context,sourceAccountKey:''}),/INVALID_SCOPE/));
test('different cost center cannot enter hotel batch',()=>assert.throws(()=>normalize(invoice({costCenter:{id:'2'}}),context),/COST_CENTER_MISMATCH/));
test('missing cost center is not assumed hotel',()=>assert.throws(()=>normalize(invoice({costCenter:null}),context),/COST_CENTER_MISMATCH/));
test('invalid ISO day blocks',()=>assert.throws(()=>normalize(invoice({date:'2026-02-30'}),context),/INVALID_DATE/));
test('observation timestamp needs explicit timezone',()=>assert.throws(()=>normalize(invoice(),{...context,observedAt:'2026-10-15 23:00:00'}),/INVALID_TIMESTAMP/));
test('unknown explicit currency blocks',()=>assert.throws(()=>normalize(invoice({currency:{code:'???'}}),context),/INVALID_CURRENCY/));
test('document id missing blocks',()=>assert.throws(()=>normalize(invoice({id:''}),context),/INVALID_SOURCE_ID/));
test('source observation has no customer contact information',()=>{const text=JSON.stringify(normalize(invoice(),context));assert.ok(!text.includes('private@example'));assert.ok(!text.includes('Huesped'));});
test('generic client and absent reservation are review flags not a fabricated match',()=>{const r=normalize(invoice(),context);assert.ok(r.metadata.issues.includes('GENERIC_CLIENT'));assert.equal(r.metadata.reservation_match_status,'unmatched');});
test('non-electronic numbering does not prove fiscal acceptance',()=>assert.equal(normalize(invoice(),context).metadata.fiscal_acceptance,'unverified'));
test('electronic numbering still does not prove fiscal acceptance',()=>assert.equal(normalize(invoice({numberTemplate:{isElectronic:true}}),context).metadata.fiscal_acceptance,'unverified'));
test('closed/paid in Alegra is not bank reconciliation',()=>assert.equal(normalize(invoice(),context).metadata.bank_match_status,'unmatched'));
test('changes to observation time do not change projection hash',()=>assert.equal(normalize(invoice(),context).metadata.projection_sha256,normalize(invoice(),{...context,observedAt:'2026-10-16T00:00:00Z'}).metadata.projection_sha256));
test('changed source amount changes projection hash',()=>assert.notEqual(normalize(invoice(),context).metadata.projection_sha256,normalize(invoice({subtotal:200,tax:26,total:226,totalPaid:226}),context).metadata.projection_sha256));
test('replay of persisted observation is skipped',()=>{const r=normalize(invoice(),context);const p=planEvidenceImport([r],[r]);assert.equal(p.insert.length,0);assert.equal(p.unchanged.length,1);});
test('changed source with same native id becomes conflict never overwrite',()=>{const r=normalize(invoice(),context);const s=normalize(invoice({total:114}),context);const p=planEvidenceImport([s],[r]);assert.equal(p.insert.length,0);assert.equal(p.conflicts.length,1);});
test('identical duplicate inside input batch is only planned once',()=>{const r=normalize(invoice(),context);assert.equal(planEvidenceImport([r,r],[]).insert.length,1);});
test('conflicting duplicate within batch quarantines both revisions',()=>{const r=normalize(invoice(),context),s=normalize(invoice({total:115}),context);const p=planEvidenceImport([r,s],[]);assert.equal(p.insert.length,0);assert.equal(p.conflicts.length,1);});
test('cross-tenant rows do not collide',()=>{const r=normalize(invoice(),context),s=normalize(invoice(),{...context,orgId:'another-org'});assert.equal(planEvidenceImport([r],[s]).insert.length,1);});
test('empty input never requests deletions',()=>assert.deepEqual(planEvidenceImport([],[]),{insert:[],unchanged:[],conflicts:[]}));
test('same numeric ids never imply same service mapping',()=>assert.throws(()=>resolveServiceMapping({sourceSystem:'kross',sourceAccount:'hotel',sourceId:'3'},[]),/SERVICE_MAPPING_NOT_APPROVED/));
test('unapproved breakfast mapping does not allow posting',()=>assert.throws(()=>resolveServiceMapping({sourceSystem:'kross',sourceAccount:'hotel',sourceId:'3'},[{sourceSystem:'kross',sourceAccount:'hotel',sourceId:'3',targetSystem:'alegra',targetAccount:'book',targetId:'2',status:'candidate'}]),/SERVICE_MAPPING_NOT_APPROVED/));
test('explicit approved namespaced mapping returns correct target id',()=>{
  // Synthetic complete approval: the test must not weaken fiscal / entity guards.
  const source = {
    orgId:'SYNTHETIC-ORG', legalEntityKey:'SYNTHETIC-ENTITY',
    sourceSystem:'kross', sourceAccount:'SYNTHETIC-KROSS-ACCOUNT', sourceId:'3',
    unit:'per_person', salesMode:'own', chargeClass:'extra', effectiveDate:'2026-10-15',
  };
  const approved = {
    ...source, status:'approved', validFrom:'2026-01-01', validTo:null,
    targetSystem:'alegra', targetAccount:'SYNTHETIC-ALEGRA-ACCOUNT', targetId:'2',
    targetLegalEntityKey:'SYNTHETIC-ENTITY',
    accountingAccountId:'SYNTHETIC-ACCOUNT-ID', accountingAccountVerified:true,
    cabysCode:'SYNTHETIC-CABYS-ID', cabysVerified:true,
    fiscalApproved:true, priceApproved:true, priceApprovedAt:'2026-10-15',
    priceEvidenceRef:'synthetic-fixture-not-real-price', priceCurrency:'CRC', price:'1.00',
    taxNativeId:'SYNTHETIC-TAX-ID', taxVerified:true, version:1,
  };
  assert.equal(resolveServiceMapping(source,[approved]).targetId,'2');
});
test('unreconciled observations are staged, not active accounting data',()=>assert.equal(normalize(invoice(),context).status,'staging'));

test('rejects changed projection content with a retained checksum before planning an insert',()=>{
  const row=normalize(invoice(),context);
  row.metadata.total='999999.00';
  row.amount='999999.00';
  assert.throws(()=>planEvidenceImport([row],[]),/INVALID_OBSERVATION/);
});
test('rejects a changed persisted projection with its retained checksum',()=>{
  const row=normalize(invoice(),context), persisted=structuredClone(row);
  persisted.metadata.total='999999.00';
  persisted.amount='999999.00';
  assert.throws(()=>planEvidenceImport([row],[persisted]),/INVALID_OBSERVATION/);
});
for (const [field,value] of [['amount','999999.00'],['currency','CRC'],['document_number','another-document'],['issue_date','2026-10-14'],['source_key','account:other:sales_invoice:001']]) {
  test(`rejects top-level ${field} inconsistent with the checksum-valid projection`,()=>{
    const row=normalize(invoice(),context);
    row[field]=value;
    assert.throws(()=>planEvidenceImport([row],[]),/INVALID_OBSERVATION/);
  });
}
test('rejects an incomplete projection even if its checksum has a valid digest shape',()=>{
  const row=normalize(invoice(),context);
  delete row.metadata.client_native_id;
  assert.throws(()=>planEvidenceImport([row],[]),/INVALID_OBSERVATION/);
});
test('rejects numeric money whose cents exceed safe integer precision',()=>{
  for (const total of [9007199254740992,-9007199254740992,90071992547409.92]) {
    assert.throws(()=>normalize(invoice({total}),context),/INVALID_MONEY/);
  }
});
test('preserves ordinary numeric cents and large exact decimal strings',()=>{
  assert.equal(normalize(invoice({subtotal:0.29,tax:0,total:0.29}),context).amount,'0.29');
  assert.equal(normalize(invoice({subtotal:'9007199254740993.01',tax:'0.00',total:'9007199254740993.01'}),context).amount,'9007199254740993.01');
});
test('rejects a price approval dated after the source effective date',()=>{
  const source={orgId:'test-org',legalEntityKey:'test-entity',sourceSystem:'kross',sourceAccount:'test-account',sourceId:'3',unit:'per_person',salesMode:'own',chargeClass:'extra',effectiveDate:'2026-10-15'};
  const mapping={...source,status:'approved',validFrom:'2026-01-01',validTo:null,targetSystem:'alegra',targetAccount:'test-target',targetId:'2',targetLegalEntityKey:source.legalEntityKey,accountingAccountId:'test-accounting',accountingAccountVerified:true,cabysCode:'test-cabys',cabysVerified:true,fiscalApproved:true,priceApproved:true,priceApprovedAt:'2026-10-16',priceEvidenceRef:'fixture:price',priceCurrency:'CRC',price:'1.00',taxNativeId:'test-tax',taxVerified:true,version:1};
  assert.throws(()=>resolveServiceMapping(source,[mapping]),/SERVICE_MAPPING_NOT_APPROVED/);
  assert.equal(resolveServiceMapping(source,[{...mapping,priceApprovedAt:'2026-10-15'}]).targetId,'2');
  assert.equal(resolveServiceMapping(source,[{...mapping,priceApprovedAt:'2026-10-14'}]).targetId,'2');
  assert.throws(()=>resolveServiceMapping({...source,effectiveDate:'2026-03-03'},[{...mapping,priceApprovedAt:'2026-02-31'}]),/SERVICE_MAPPING_NOT_APPROVED/);
  assert.throws(()=>resolveServiceMapping({...source,effectiveDate:'2026-02-31'},[{...mapping,priceApprovedAt:'2026-02-28'}]),/SERVICE_MAPPING_NOT_APPROVED/);
});

test('rejects numeric amounts when their binary spacing can lose a cent',()=>{
  for (const source of ['70368744177664.01','90071992547409.91','-70368744177664.01','-90071992547409.91']) {
    const total=JSON.parse(source);
    assert.throws(()=>normalize(invoice({subtotal:total,tax:0,total,totalPaid:0,balance:total}),context),/INVALID_MONEY/);
  }
});
test('retains exact cents below the numeric spacing bound and above it as decimal strings',()=>{
  assert.equal(normalize(invoice({subtotal:70368744177663.99,tax:0,total:70368744177663.99}),context).amount,'70368744177663.99');
  assert.equal(normalize(invoice({subtotal:'70368744177664.01',tax:'0.00',total:'70368744177664.01'}),context).amount,'70368744177664.01');
});
for (const [field,value] of [['status','active'],['verification_status','verified'],['dropbox_backup_status','backed_up'],['org_id',42]]) {
  test(`rejects an observation envelope claiming ${field}=${value}`,()=>{
    const row=normalize(invoice(),context);
    row[field]=value;
    assert.throws(()=>planEvidenceImport([row],[]),/INVALID_OBSERVATION/);
  });
}
for (const [field,value] of [['write_to_alegra',true],['eligible_for_ledger_posting',true],['full_source_document_captured',true],['bank_match_status','matched'],['reservation_match_status','matched'],['fiscal_acceptance','verified'],['hash_scope','original_document']]) {
  test(`rejects source-only metadata claiming ${field}=${value}`,()=>{
    const row=normalize(invoice(),context);
    row.metadata[field]=value;
    assert.throws(()=>planEvidenceImport([row],[]),/INVALID_OBSERVATION/);
  });
}
function rehashProjection(row) {
  const projection={...row.metadata};
  for (const key of ['projection_sha256','hash_scope','observed_at','header_arithmetic_valid','issues','bank_match_status','reservation_match_status','fiscal_acceptance','write_to_alegra','eligible_for_ledger_posting','full_source_document_captured']) delete projection[key];
  const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
  row.metadata.projection_sha256=createHash('sha256').update(JSON.stringify(stable(projection))).digest('hex');
}
for (const [field,value] of [['total','not-money'],['subtotal',100],['tax',null],['issue_date','2026-02-31'],['client_is_generic','true'],['electronic_numbering','false'],['payment_native_ids',['id',42]],['item_native_ids',['2','1']],['source_account_key',' approved-account ']]) {
  test(`rejects malformed ${field} even with a matching recomputed projection checksum`,()=>{
    const row=normalize(invoice(),context);
    row.metadata[field]=value;
    if (field==='total') row.amount=value;
    if (field==='issue_date') row.issue_date=value;
    if (field==='source_account_key') row.source_key=`account:${encodeURIComponent(value)}:sales_invoice:001`;
    rehashProjection(row);
    assert.throws(()=>planEvidenceImport([row],[]),/INVALID_OBSERVATION/);
  });
}
for (const [field,value] of [['header_arithmetic_valid',false],['header_arithmetic_valid','true'],['issues',[]],['issues','HEADER_TOTAL_MISMATCH'],['observed_at','2026-02-31T00:00:00Z'],['observed_at','2026-10-15T23:00:00']]) {
  test(`rejects inconsistent or malformed observation metadata ${field}=${JSON.stringify(value)}`,()=>{
    const row=normalize(invoice(),context);
    row.metadata[field]=value;
    assert.throws(()=>planEvidenceImport([row],[]),/INVALID_OBSERVATION/);
  });
}
test('retains truthful arithmetic and payment mismatch issues as staged observations',()=>{
  const row=normalize(invoice({total:114,totalPaid:100,balance:10}),context);
  assert.equal(row.metadata.header_arithmetic_valid,false);
  assert.ok(row.metadata.issues.includes('HEADER_TOTAL_MISMATCH'));
  assert.ok(row.metadata.issues.includes('PAYMENT_BALANCE_MISMATCH'));
  assert.equal(planEvidenceImport([row],[]).insert.length,1);
});
test('rejects midnight rollover in observed timestamps instead of normalizing it to another day',()=>{
  const observedAt='2026-10-15T24:00:00Z';
  assert.throws(()=>normalize(invoice(),{...context,observedAt}),/INVALID_TIMESTAMP/);
  const row=normalize(invoice(),context);
  row.metadata.observed_at=observedAt;
  assert.throws(()=>planEvidenceImport([row],[]),/INVALID_OBSERVATION/);
});
test('retains zoned observation timestamps with explicit fractional seconds',()=>{
  for (const observedAt of ['2026-10-15T23:59:59.1Z','2026-10-15T23:59:59.123456789+05:30']) {
    const row=normalize(invoice(),{...context,observedAt});
    assert.equal(planEvidenceImport([row],[]).insert.length,1);
  }
});
