import test from 'node:test';import assert from 'node:assert/strict';import {validatePortfolioMap} from '../scripts/validate-portfolio-map.mjs';
function node(id){return{canonical_id:id,tenant_scope:'org-a',brain_path:[],relations:[],source_authority:'fixture',provenance:[],confidence:'observed',privacy:'private',owner_agent:null,human_owner:null,capabilities:[],workflows:[],metrics:[],freshness:null,risk:'medium',action_ceiling:'metadata_only',evidence:[],feedback:[]}}
function map(){return{schema_version:'toro-portfolio-map-v1',nodes:[node('a'),node('b')],edges:[{id:'e',from:'a',to:'b',type:'belongs_to',evidence:['source'],observed_at:'2026-10-15',validation_state:'observed',grants_access:false}],inventory_refs:[]}}
test('accepts metadata graph with proven endpoints',()=>assert.deepEqual(validatePortfolioMap(map()),[]));
test('rejects duplicate canonical IDs',()=>{let m=map();m.nodes.push(node('a'));assert.match(validatePortfolioMap(m).join(),/Duplicate node/)});
test('rejects missing evidence and scope',()=>{let m=map();delete m.nodes[0].tenant_scope;m.edges[0].evidence=[];assert.match(validatePortfolioMap(m).join(),/missing tenant_scope/);assert.match(validatePortfolioMap(m).join(),/missing relation provenance/)});
test('rejects dangling endpoints',()=>{let m=map();m.edges[0].to='hidden';assert.match(validatePortfolioMap(m).join(),/dangling/)});
test('rejects observed parent cycles',()=>{let m=map();m.edges.push({...m.edges[0],id:'e2',from:'b',to:'a'});assert.match(validatePortfolioMap(m).join(),/cycle/)});
test('preserves historical merge receivers',()=>{let m=map();m.nodes[0].merged_into_project_key='gone';assert.match(validatePortfolioMap(m).join(),/merge receiver/)});
test('does not count a deployment as a business project',()=>{let m=map();m.nodes[0].record_kind='technical_resource';m.nodes[0].count_as_business_project=true;assert.match(validatePortfolioMap(m).join(),/resource cannot count/)});
test('rejects unsafe URLs and credentials',()=>{for(const url of ['javascript:alert(1)','https://user:pass@example.com','https://example.com?token=x']){let m=map();m.nodes[0].urls=[url];assert.match(validatePortfolioMap(m).join(),/unsafe URL/) }});
test('keeps every original inventory reference',()=>{let m=map();m.inventory_refs=['INV-001'];assert.match(validatePortfolioMap(m).join(),/Lost inventory reference/)});
test('relations never grant permission',()=>{let m=map();m.edges[0].grants_access=true;assert.match(validatePortfolioMap(m).join(),/cannot grant access/)});
test('new relation vocabulary requires contract extension',()=>{let m=map();m.edges[0].type='same_as';assert.match(validatePortfolioMap(m).join(),/unknown relation/)});
test('rejects unbound per-node relation references',()=>{let m=map();m.nodes[0].relations=['missing'];assert.match(validatePortfolioMap(m).join(),/missing relation reference/)});
test('rejects encoded credential keys and fragments',()=>{for(const url of ['https://example.com/?to%6ben=secret','https://example.com/#token=secret','https://example.com/?to%256ben=x','https://example.com/#%2574oken=x']){let m=map();m.nodes[0].urls=[url];assert.match(validatePortfolioMap(m).join(),/unsafe URL/)}});
test('rejects malformed relation provenance types and dates',()=>{for(const delta of [{observed_at:{}},{validation_state:{}},{evidence:[null]},{evidence:[' ']},{observed_at:'2026-02-30'},{observed_at:'not-a-date'},{validation_state:'made_up'}]){let m=map();Object.assign(m.edges[0],delta);assert.match(validatePortfolioMap(m).join(),/missing relation provenance/)}});
test('accepts decoded safe URL and timestamp provenance',()=>{let m=map();m.nodes[0].urls=['https://example.com/?lang=es#room-1'];m.edges[0].observed_at='2026-10-15T20:30:00-06:00';assert.deepEqual(validatePortfolioMap(m),[])});

