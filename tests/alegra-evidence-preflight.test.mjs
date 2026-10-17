import test from 'node:test';
import assert from 'node:assert/strict';
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
