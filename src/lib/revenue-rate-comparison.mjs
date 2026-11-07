/**
 * TORO Revenue: pure, bounded quote comparison. No network, persistence,
 * reservations, price writes, authentication or accounting side effects.
 * Authority: TORO_DATA_ALIGNMENT_ALEGRA_SUPABASE_2026-10-15.md, section 9.
 * Inputs are observations, not proof that a source or mapping was verified.
 * Monetary inputs are decimal STRINGS; amounts are computed with integer cents.
 */
import { createHash } from 'node:crypto';

const CURRENCIES = new Set(['USD', 'CRC']);
const MAX_CENTS = 100_000_000_000_000n;
class QuoteError extends Error {}
function requireValue(ok, code) { if (!ok) throw new QuoteError(code); }
function record(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
function id(v) { return typeof v === 'string' && /^[A-Za-z0-9][A-Za-z0-9_:/.-]{0,190}$/.test(v); }
function hash(v) { return createHash('sha256').update(JSON.stringify(v)).digest('hex'); }
function whole(v, min, max) { return Number.isSafeInteger(v) && v >= min && v <= max; }
function civil(v) {
  requireValue(typeof v === 'string' && /^20\d{2}-\d{2}-\d{2}$/.test(v), 'STAY_INVALID');
  const n = Date.parse(`${v}T00:00:00Z`);
  requireValue(Number.isFinite(n) && new Date(n).toISOString().slice(0, 10) === v, 'STAY_INVALID');
  return n;
}
function timestamp(v) {
  requireValue(typeof v === 'string' && /^20\d{2}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:0\d|1[0-4]):[0-5]\d)$/.test(v), 'TIMESTAMP_INVALID');
  try { civil(v.slice(0, 10)); } catch { throw new QuoteError('TIMESTAMP_INVALID'); }
  const n = Date.parse(v); requireValue(Number.isFinite(n), 'TIMESTAMP_INVALID'); return n;
}
function policyCheck(p) {
  try {
    requireValue(record(p) && CURRENCIES.has(p.currency) && ['own_channels','competitors'].includes(p.mode), 'POLICY_INVALID');
    for (const k of ['maxAgeSeconds','maxSkewSeconds','fxMaxAgeSeconds']) requireValue(whole(p[k], 1, 31_536_000), 'POLICY_INVALID');
    timestamp(p.now);
  } catch { throw new Error('POLICY_INVALID'); }
}
function money(v) {
  requireValue(typeof v === 'string' && /^(?:0|[1-9]\d{0,12})(?:\.\d{1,2})?$/.test(v), 'AMOUNT_INVALID');
  const [major, minor=''] = v.split('.');
  const cents = BigInt(major) * 100n + BigInt(minor.padEnd(2,'0'));
  requireValue(cents <= MAX_CENTS, 'AMOUNT_INVALID'); return cents;
}
function amount(c) { const a = c < 0n ? -c : c; return `${c < 0n ? '-' : ''}${a/100n}.${String(a%100n).padStart(2,'0')}`; }
function rounded(n, d) { const s=n<0n?-1n:1n; const a=n*s; return s*((a+d/2n)/d); }
function checked(c) { requireValue(c <= MAX_CENTS && c >= 0n, 'AMOUNT_OVERFLOW'); return c; }
function fxRational(s) {
  requireValue(typeof s==='string' && /^(?:0|[1-9]\d{0,5})(?:\.\d{1,18})?$/.test(s), 'FX_RATE_INVALID');
  const [a,b=''] = s.split('.'), d=10n**BigInt(b.length), n=BigInt(a+b);
  requireValue(n>0n, 'FX_RATE_INVALID'); return [n,d];
}
function safeUrl(v) {
  requireValue(typeof v==='string' && v.length<=2048, 'SOURCE_URL_UNSAFE');
  let u; try { u=new URL(v); } catch { throw new QuoteError('SOURCE_URL_UNSAFE'); }
  requireValue(u.protocol==='https:' && !u.username && !u.password && !u.hash, 'SOURCE_URL_UNSAFE');
  requireValue(![...u.searchParams.keys()].some(k=>/token|secret|password|api.?key|auth|signature|credential|session|cookie|^sid$/i.test(k)), 'SOURCE_URL_UNSAFE');
  return u.href;
}
function party(stay) {
  requireValue(record(stay) && Array.isArray(stay.allocation) && stay.allocation.length>0 && stay.allocation.length<=50, 'ALLOCATION_INVALID');
  const nights=(civil(stay.checkOut)-civil(stay.checkIn))/86_400_000;
  requireValue(whole(nights,1,365), 'STAY_INVALID');
  const allocation=stay.allocation.map(r=>{
    requireValue(record(r) && whole(r.adults,1,50) && whole(r.infants,0,20) && whole(r.cribs,0,20) && Array.isArray(r.childAges) && r.childAges.length<=25 && r.childAges.every(a=>whole(a,0,17)), 'ALLOCATION_INVALID');
    return {adults:r.adults,childAges:[...r.childAges].sort((a,b)=>a-b),infants:r.infants,cribs:r.cribs};
  }).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
  const persons=allocation.reduce((n,r)=>n+r.adults+r.childAges.length+r.infants,0);
  return {nights,units:allocation.length,persons,stayKey:hash([stay.checkIn,stay.checkOut,allocation])};
}
function multiplier(line, stay) {
  if (line.basis==='stay') return 1n;
  if (line.basis==='night') return BigInt(stay.nights);
  if (line.basis==='unit_night') return BigInt(stay.units*stay.nights);
  if (line.basis==='person_night') {
    requireValue(whole(line.billableCount,1,stay.persons), 'BILLABLE_COUNT_REQUIRED');
    return BigInt(line.billableCount*stay.nights);
  }
  throw new QuoteError('PRICE_BASIS_INVALID');
}
function termsOf(t, stay) {
  requireValue(record(t) && ['mealPlan','cancellationKey','paymentKey','depositKey'].every(k=>id(t[k])) && whole(t.minNights,1,365) && Array.isArray(t.eligibility) && t.eligibility.length<=25 && t.eligibility.every(id), 'TERMS_INCOMPLETE');
  requireValue(stay.nights>=t.minNights, 'MIN_STAY_UNSATISFIED');
  requireValue(new Set(t.eligibility).size===t.eligibility.length, 'TERMS_INCOMPLETE');
  return {mealPlan:t.mealPlan,cancellationKey:t.cancellationKey,paymentKey:t.paymentKey,depositKey:t.depositKey,minNights:t.minNights,eligibility:[...t.eligibility].sort()};
}
function convert(cents, q, p) {
  if (q.currency===p.currency) return {cents,fx:null};
  requireValue(record(q.fx), 'FX_REQUIRED'); const f=q.fx;
  requireValue(f.from===q.currency && f.to===p.currency, 'FX_DIRECTION_INVALID');
  requireValue(f.purpose==='comparison', 'FX_PURPOSE_INVALID');
  requireValue(id(f.sourceRef), 'FX_SOURCE_REQUIRED');
  const age=timestamp(p.now)-timestamp(f.asOf);
  requireValue(age>=0 && age<=p.fxMaxAgeSeconds*1000, 'FX_STALE');
  const [n,d]=fxRational(f.rate), value=checked(rounded(cents*n,d));
  return {cents:value,fx:{from:f.from,to:f.to,rate:f.rate,asOf:f.asOf,sourceRef:f.sourceRef,purpose:'comparison'}};
}
function normalized(q,p) {
  requireValue(record(q) && q.version===1 && id(q.quoteId) && id(q.scopeKey) && ['synthetic','observed'].includes(q.dataMode), 'IDENTITY_INVALID');
  requireValue(['propertyKey','unitKey','category','comparisonClass','mappingEvidenceRef'].every(k=>id(q[k])), 'IDENTITY_INVALID');
  const s=q.source;
  requireValue(record(s) && ['slot','platform','sellerKey','listingId','offerId','evidenceRef'].every(k=>id(s[k])), 'SOURCE_INVALID');
  const url=safeUrl(s.url), observed=timestamp(s.observedAt), now=timestamp(p.now);
  requireValue(observed<=now, 'OBSERVATION_IN_FUTURE');
  const stay=party(q.stay);
  const offerIdentityKey=hash([q.scopeKey,q.dataMode,q.propertyKey,q.unitKey,s.sellerKey,s.listingId,s.offerId,stay.stayKey]);
  const base={quoteId:q.quoteId,scopeKey:q.scopeKey,dataMode:q.dataMode,propertyKey:q.propertyKey,unitKey:q.unitKey,category:q.category,comparisonClass:q.comparisonClass,mappingEvidenceRef:q.mappingEvidenceRef,source:{slot:s.slot,platform:s.platform,sellerKey:s.sellerKey,listingId:s.listingId,offerId:s.offerId,observedAt:s.observedAt,evidenceRef:s.evidenceRef,url},...stay,offerIdentityKey,nativeCurrency:null,nativeTotal:null,presentationCurrency:p.currency,presentationTotal:null,perUnitNight:null,perPersonStay:null,extras:[],fx:null,reasons:[]};
  if (now-observed>p.maxAgeSeconds*1000) return {...base,status:'STALE',reasons:['OBSERVATION_STALE']};
  requireValue(['available','blocked','no_offer'].includes(q.availability), 'AVAILABILITY_INVALID');
  if (q.availability!=='available') return {...base,status:q.availability==='blocked'?'SOURCE_BLOCKED':'NO_OFFER_OBSERVED',reasons:[q.availability==='blocked'?'SOURCE_BLOCKED':'NO_OFFER_OBSERVED']};
  requireValue(CURRENCIES.has(q.currency), 'CURRENCY_INVALID');
  const t=termsOf(q.terms,stay), price=q.price;
  requireValue(record(price) && ['display','guest_total'].includes(price.kind), 'PRICE_KIND_INVALID');
  requireValue(price.allMandatoryKnown===true, 'MANDATORY_COVERAGE_UNKNOWN');
  requireValue(Array.isArray(price.charges) && price.charges.length<=100, 'CHARGES_INVALID');
  if (price.kind==='guest_total') requireValue(price.basis==='stay', 'GROSS_TOTAL_BASIS_INVALID');
  let total=checked(money(price.amount)*multiplier(price,stay));
  const seen=new Set(), charges=[], extras=[], reasons=[];
  for (const c of price.charges) {
    requireValue(record(c) && id(c.id) && ['mandatory','conditional','optional'].includes(c.kind) && typeof c.included==='boolean', 'CHARGE_INVALID');
    requireValue(!seen.has(c.id), 'DUPLICATE_CHARGE');seen.add(c.id);
    const mult=multiplier(c,stay);
    if (c.kind==='mandatory') requireValue(c.amount!==null && c.amount!==undefined, 'MANDATORY_AMOUNT_UNKNOWN');
    const value=c.amount==null?null:checked(money(c.amount)*mult);
    charges.push({id:c.id,kind:c.kind,included:c.included,total:value===null?null:amount(value)});
    if (c.kind==='mandatory' && !c.included && price.kind==='display') total=checked(total+value);
    if (c.kind!=='mandatory') {
      requireValue(c.kind!=='conditional' || !c.included, 'CHARGE_INVALID');
      extras.push({id:c.id,kind:c.kind,amount:value===null?null:amount(value),currency:q.currency,included:c.included});
      if (c.kind==='conditional') reasons.push('CONDITIONAL_CHARGES');
    }
  }
  const mandatoryComponents=charges.filter(c=>c.kind==='mandatory').reduce((sum,c)=>sum+money(c.total),0n);
  requireValue(mandatoryComponents<=total,'COMPONENTS_EXCEED_TOTAL');
  if (price.reportedTotal!==undefined) requireValue(money(price.reportedTotal)===total, 'TOTAL_MISMATCH');
  const converted=convert(total,q,p);
  const economicHash=hash([q.currency,amount(total),p.currency,amount(converted.cents),converted.fx?.rate??null,t,charges.sort((a,b)=>a.id.localeCompare(b.id))]);
  const snapshotHash=hash([offerIdentityKey,economicHash,s.observedAt,s.evidenceRef]);
  return {...base,status:reasons.length?'CONDITIONAL':'COMPARABLE',reasons:[...new Set(reasons)],terms:t,nativeCurrency:q.currency,nativeTotal:amount(total),presentationTotal:amount(converted.cents),perUnitNight:amount(rounded(converted.cents,BigInt(stay.nights*stay.units))),perPersonStay:amount(rounded(converted.cents,BigInt(stay.persons))),extras,fx:converted.fx,economicHash,snapshotHash};
}

/** Normalize an explicitly scoped observation; reject missing/unknown evidence. */
export function normalizeRateQuote(q,p) {
  policyCheck(p);
  try { return normalized(q,p); }
  catch(e) {
    if (!(e instanceof QuoteError)) throw e;
    return {quoteId:id(q?.quoteId)?q.quoteId:null,status:'NOT_COMPARABLE',reasons:[e.message],nativeTotal:null,presentationTotal:null};
  }
}
function compareNormalized(a,b,p) {
  const rejected=(status,reasons)=>({quoteId:b.quoteId,status,reasons,nativeTotal:null,presentationTotal:null,differenceFromReference:null,differencePercent:null});
  if(a.scopeKey && b.scopeKey && a.scopeKey!==b.scopeKey) return rejected('NOT_COMPARABLE',['SCOPE_MISMATCH']);
  if(a.dataMode && b.dataMode && a.dataMode!==b.dataMode) return rejected('NOT_COMPARABLE',['DATA_MODE_MISMATCH']);
  const usable=new Set(['COMPARABLE','CONDITIONAL']);
  if (!usable.has(a.status)) return rejected('NOT_COMPARABLE',[`REFERENCE_${a.status}`,...a.reasons]);
  if (!usable.has(b.status)) return {...b,differenceFromReference:null,differencePercent:null};
  const hard=[];
  if (a.scopeKey!==b.scopeKey) hard.push('SCOPE_MISMATCH');
  if (a.dataMode!==b.dataMode) hard.push('DATA_MODE_MISMATCH');
  if (a.stayKey!==b.stayKey) hard.push('STAY_MISMATCH');
  if (p.mode==='own_channels' && (a.propertyKey!==b.propertyKey || a.unitKey!==b.unitKey)) hard.push('UNIT_MISMATCH');
  if (a.category!==b.category || a.comparisonClass!==b.comparisonClass) hard.push('COMPARISON_CLASS_MISMATCH');
  if(hard.length) return {...b,status:'NOT_COMPARABLE',reasons:hard,differenceFromReference:null,differencePercent:null};
  if(Math.abs(timestamp(a.source.observedAt)-timestamp(b.source.observedAt))>p.maxSkewSeconds*1000) return {...b,status:'STALE',reasons:['OBSERVATION_WINDOW_MISMATCH'],differenceFromReference:null,differencePercent:null};
  const reasons=[...a.reasons,...b.reasons];
  if(a.nativeCurrency===b.nativeCurrency && a.fx && b.fx) {
    const [an,ad]=fxRational(a.fx.rate),[bn,bd]=fxRational(b.fx.rate);
    if(an*bd!==bn*ad) reasons.push('FX_BASIS_MISMATCH');
  }
  for(const k of ['mealPlan','cancellationKey','paymentKey','depositKey']) if(a.terms[k]!==b.terms[k]) reasons.push(`TERMS_${k.toUpperCase()}_MISMATCH`);
  if(JSON.stringify(a.terms.eligibility)!==JSON.stringify(b.terms.eligibility)) reasons.push('ELIGIBILITY_MISMATCH');
  if(reasons.length) return {...b,status:'CONDITIONAL',reasons:[...new Set(reasons)],differenceFromReference:null,differencePercent:null};
  const ref=money(a.presentationTotal), val=money(b.presentationTotal), diff=val-ref;
  return {...b,status:'COMPARABLE',reasons:[],differenceFromReference:amount(diff),differencePercent:ref===0n?null:amount(rounded(diff*10000n,ref))};
}
/** Only like-for-like quotes receive a price difference suitable for ranking. */
export function compareRateQuotes(reference,candidate,p) {
  policyCheck(p); return compareNormalized(normalizeRateQuote(reference,p),normalizeRateQuote(candidate,p),p);
}

/**
 * Dedupe economic offers across discovery surfaces. Conflicting observations
 * are quarantined, not resolved by picking the lower price or latest response.
 * Coverage measures expected SOURCE attempts, separately from usable quotes.
 */
export function evaluateRateBatch(reference,quotes,p) {
  policyCheck(p);
  requireValue(Array.isArray(quotes) && quotes.length<=500,'BATCH_LIMIT');
  requireValue(Array.isArray(p.expectedSlots) && p.expectedSlots.length>0 && p.expectedSlots.length<=500 && p.expectedSlots.every(id) && new Set(p.expectedSlots).size===p.expectedSlots.length,'EXPECTED_SLOTS_INVALID');
  const a=normalizeRateQuote(reference,p), groups=new Map(),received=new Set(),expected=new Set(p.expectedSlots),ids=new Map();
  quotes.forEach((q,i)=>{
    if(id(q?.source?.slot)) received.add(q.source.slot);
    const n=normalizeRateQuote(q,p), identity=n.offerIdentityKey??`invalid-${i}`;
    let r=compareNormalized(a,n,p), k=identity;
    if(n.source && !expected.has(n.source.slot)) {
      r={...r,status:'NOT_COMPARABLE',reasons:['UNPLANNED_SOURCE'],differenceFromReference:null,differencePercent:null};
      k=`unplanned-${i}`;
    }
    if(n.quoteId) { if(!ids.has(n.quoteId)) ids.set(n.quoteId,new Set()); ids.get(n.quoteId).add(identity); }
    if(!groups.has(k)) groups.set(k,[]); groups.get(k).push(r);
  });
  const conflictingIds=new Set([...ids].filter(([,values])=>values.size>1).map(([key])=>key));
  const rows=[],aliases=[];let deduplicatedCount=0,conflictCount=0;
  for(const group of groups.values()) {
    const economic=new Set(group.map(n=>JSON.stringify([n.economicHash??null,n.status,n.reasons])));
    const n=group[0], sourceSlots=[...new Set(group.map(x=>x.source?.slot).filter(Boolean))].sort();
    const quoteIdConflict=group.some(x=>conflictingIds.has(x.quoteId));
    if(economic.size>1 || quoteIdConflict) {
      conflictCount++;
      rows.push({...n,status:'NOT_COMPARABLE',reasons:[quoteIdConflict?'QUOTE_ID_CONFLICT':'DUPLICATE_CONFLICT'],sourceSlots,quoteIds:group.map(x=>x.quoteId),differenceFromReference:null,differencePercent:null});
      continue;
    }
    rows.push({...n,sourceSlots,quoteIds:group.map(x=>x.quoteId)});
    deduplicatedCount+=group.length-1;
    if(group.length>1) aliases.push({retainedQuoteId:n.quoteId,aliasQuoteIds:group.slice(1).map(x=>x.quoteId),sourceSlots});
  }
  const referenceConflict=rows.some(r=>(r.offerIdentityKey===a.offerIdentityKey || r.quoteIds?.includes(a.quoteId)) && r.reasons.some(x=>['DUPLICATE_CONFLICT','QUOTE_ID_CONFLICT'].includes(x)));
  if(referenceConflict) for(const r of rows) {
    r.status='NOT_COMPARABLE';r.reasons=[...new Set([...r.reasons,'REFERENCE_OFFER_CONFLICT'])];
    r.differenceFromReference=null;r.differencePercent=null;
  }
  const comparable=rows.filter(r=>r.status==='COMPARABLE' && r.presentationTotal!==null);
  comparable.sort((x,y)=>{const a=money(x.presentationTotal),b=money(y.presentationTotal);return a<b?-1:a>b?1:x.quoteId.localeCompare(y.quoteId);});
  const min=comparable[0]?.presentationTotal??null;
  const missingSlots=p.expectedSlots.filter(x=>!received.has(x)),unplannedSlots=[...received].filter(x=>!expected.has(x));
  const usableSlots=new Set(comparable.flatMap(r=>r.sourceSlots).filter(x=>expected.has(x)));
  return {version:1,status:missingSlots.length||conflictCount||usableSlots.size!==expected.size?'PARTIAL':'COMPARISON_PREPARED',dataMode:a.dataMode??null,asOf:p.now,mode:p.mode,currency:p.currency,referenceStatus:referenceConflict?'NOT_COMPARABLE':a.status,observationCount:quotes.length,uniqueOfferCount:rows.length,deduplicatedCount,conflictCount,coverage:{expectedSlots:expected.size,receivedSlots:[...received].filter(x=>expected.has(x)).length,usableSlots:usableSlots.size,complete:missingSlots.length===0,missingSlots,unplannedSlots},rows,aliases,lowestObservedQuoteIds:comparable.filter(r=>r.presentationTotal===min).map(r=>r.quoteId),lowestObservedTotal:min,marketBestPriceClaim:false,productionVerified:false,sideEffects:false};
}

/** Cost-based estimate only. Never a settlement, booking price or journal. */
export function estimateHotelContribution(input) {
  try {
    requireValue(record(input) && CURRENCIES.has(input.currency),'CURRENCY_INVALID');
    requireValue(input.currency===input.costCurrency,'COST_CURRENCY_MISMATCH');
    requireValue(id(input.evidenceRef),'COST_EVIDENCE_REQUIRED');
    const gross=money(input.guestTotal), costs=['tax','commission','processing','operatingCost'].map(k=>money(input[k]));
    const net=gross-costs.reduce((a,b)=>a+b,0n);
    return {status:'ESTIMATE_ONLY',currency:input.currency,guestTotal:amount(gross),contribution:amount(net),marginPercent:gross===0n?null:amount(rounded(net*10000n,gross)),reasons:[],isAccountingEntry:false};
  } catch(e) {
    if(!(e instanceof QuoteError)) throw e;
    return {status:'UNKNOWN',contribution:null,marginPercent:null,reasons:[e.message],isAccountingEntry:false};
  }
}
