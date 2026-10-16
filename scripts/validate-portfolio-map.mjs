import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
export const RELATIONS = new Set(['belongs_to','uses','depends_on','affects','managed_by','executed_by','approved_by','connected_via','sourced_from','evidenced_by','measured_by','governed_by']);
const REQUIRED=['canonical_id','tenant_scope','brain_path','relations','source_authority','provenance','confidence','privacy','owner_agent','human_owner','capabilities','workflows','metrics','freshness','risk','action_ceiling','evidence','feedback'];
export function validatePortfolioMap(map){
 const issues=[];
 if(!map || map.schema_version!=='toro-portfolio-map-v1')return ['Unsupported map schema'];
 if(!Array.isArray(map.nodes)||!Array.isArray(map.edges))return ['nodes and edges must be arrays'];
 const nodes=new Map();
 for(const n of map.nodes){
  if(!n || typeof n.canonical_id!=='string' || !n.canonical_id){issues.push('Missing node ID');continue}
  if(nodes.has(n.canonical_id))issues.push('Duplicate node ID: '+n.canonical_id);
  nodes.set(n.canonical_id,n);
  for(const k of REQUIRED)if(!(k in n))issues.push(n.canonical_id+': missing '+k);
  if(!n.tenant_scope || !n.privacy)issues.push(n.canonical_id+': missing scope/privacy');
  if(n.record_kind==='technical_resource' && n.count_as_business_project!==false)issues.push(n.canonical_id+': resource cannot count as project');
  for(const u of n.urls??[]){
   try{const p=new URL(u);if(p.protocol!=='https:' || p.username || p.password || /token|secret|password|api.?key|signature|credential/i.test(p.search))issues.push(n.canonical_id+': unsafe URL')}
   catch{issues.push(n.canonical_id+': invalid URL')}
  }
 }
 const edgeIds=new Set(),parents=new Map();
 for(const e of map.edges){
  if(!e.id || edgeIds.has(e.id))issues.push('Missing or duplicate edge ID');else edgeIds.add(e.id);
  if(!nodes.has(e.from)||!nodes.has(e.to))issues.push(e.id+': dangling endpoint');
  if(!RELATIONS.has(e.type))issues.push(e.id+': unknown relation');
  if(!e.evidence?.length || !e.observed_at || !e.validation_state)issues.push(e.id+': missing relation provenance');
  if(e.grants_access!==false)issues.push(e.id+': relation cannot grant access');
  if(e.type==='belongs_to' && e.validation_state==='observed'){
   const list=parents.get(e.from)??[];list.push(e.to);parents.set(e.from,list);
  }
 }
 const visiting=new Set(),done=new Set();
 function walk(id){if(visiting.has(id)){issues.push('Observed parent cycle: '+id);return}if(done.has(id))return;visiting.add(id);for(const p of parents.get(id)??[])walk(p);visiting.delete(id);done.add(id)}
 for(const id of nodes.keys())walk(id);
 const ids=map.inventory_refs??[];
 if(new Set(ids).size!==ids.length)issues.push('Duplicate inventory reference');
 const mapped=new Set(map.nodes.filter(n=>n.record_kind==='inventory_reference').map(n=>n.inventory_id));
 for(const id of ids)if(!mapped.has(id))issues.push('Lost inventory reference: '+id);
 for(const n of map.nodes){
  if(n.merged_into_project_key && !nodes.has('project:'+n.merged_into_project_key))issues.push(n.canonical_id+': missing merge receiver');
  for(const id of n.relations??[])if(!edgeIds.has(id))issues.push(n.canonical_id+': missing relation reference');
 }
 return issues;
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href){
 try{const map=JSON.parse(await fs.readFile(process.argv[2],'utf8'));const issues=validatePortfolioMap(map);console.log(JSON.stringify({valid:issues.length===0,nodes:map.nodes?.length,edges:map.edges?.length,issues},null,2));if(issues.length)process.exitCode=1;}
 catch(e){console.error(e.message);process.exitCode=1;}
}

