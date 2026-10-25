import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,mkdirSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const entry=readFileSync('scripts/alegra-writer/manual-host.mjs');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
function fixture(){
  const dir=mkdtempSync(join(tmpdir(),'toro-writer-package-'));
  const files=[['manual-host.mjs',entry],['alegra-writer-runtime.mjs',Buffer.from('throw new Error("MUST_NOT_IMPORT_FOR_VERIFY")')],['supabase-prod-ca-2021.crt',Buffer.from('synthetic-public-certificate')],['vendor/node_modules/pg/lib/client.js',Buffer.from('throw new Error("MUST_NOT_IMPORT_FOR_VERIFY")')]];
  for(const[path,bytes]of files){mkdirSync(dirname(join(dir,path)),{recursive:true});writeFileSync(join(dir,path),bytes);}
  const manifest={kind:'TORO_ALEGRA_MANUAL_HOST_RELEASE_V1',sourceCommit:'c5021fcb39723e5765d399c909c667cc1a87a5e1',worktreeDirty:false,nodeMajor:24,files:files.map(([path,bytes])=>({path,sha256:hash(bytes)}))};
  const save=()=>writeFileSync(join(dir,'manifest.json'),JSON.stringify(manifest));save();
  const run=(args=['--verify-package'])=>spawnSync(process.execPath,[join(dir,'manual-host.mjs'),...args],{encoding:'utf8',env:{PATH:process.env.PATH}});
  return{dir,manifest,save,run};
}
test('verifies package files without importing runtime/driver or reading secrets',()=>{
  const f=fixture(),result=f.run();assert.equal(result.status,0,result.stderr);
  const receipt=JSON.parse(result.stdout);assert.equal(receipt.state,'PACKAGE_VERIFIED');assert.equal(receipt.providerCalls,0);assert.equal(receipt.databaseConnections,0);
});
test('verifies an unpublished candidate without inventing a source commit',()=>{
  const f=fixture();Object.assign(f.manifest,{sourceCommit:null,sourceBase:'2da8a7217dcd263758f22230f647f10e19c35213',publicationRequired:true,worktreeDirty:true});f.save();
  const result=f.run();assert.equal(result.status,0,result.stderr);
  const receipt=JSON.parse(result.stdout);assert.equal(receipt.state,'CANDIDATE_PACKAGE_VERIFIED');
  assert.equal(receipt.sourceCommit,null);assert.equal(receipt.publicationRequired,true);assert.equal(receipt.providerCalls,0);
});
test('blocks unpublished candidates before runtime import or host access',()=>{
  const f=fixture();Object.assign(f.manifest,{sourceCommit:null,sourceBase:'2da8a7217dcd263758f22230f647f10e19c35213',publicationRequired:true,worktreeDirty:true});f.save();
  const result=f.run(['--operation=dispatch','--org-id=595801ce-2895-4d91-81ae-e8d1d5cc8593','--run-id=11111111-1111-4111-8111-111111111111','--payload-hash='+'a'.repeat(64)]);
  assert.equal(result.status,2);assert.equal(result.stdout,'');assert.equal(JSON.parse(result.stderr).reason,'ALEGRA_PACKAGE_UNPUBLISHED');
});
test('rejects dirty or unattested worktrees even with a claimed published commit',()=>{
  for(const state of [true,undefined]){
    const f=fixture();if(state===undefined)delete f.manifest.worktreeDirty;else f.manifest.worktreeDirty=state;f.save();
    const result=f.run();assert.equal(result.status,2);assert.equal(JSON.parse(result.stderr).reason,'ALEGRA_MANUAL_HOST_NOT_READY');
  }
});
test('rejects extra dependencies that can shadow a pinned pg import',()=>{
  const f=fixture(),shadow=join(f.dir,'vendor/node_modules/pg/lib/node_modules/pg-connection-string/index.js');
  mkdirSync(dirname(shadow),{recursive:true});writeFileSync(shadow,'throw new Error("UNVERIFIED_SHADOW_IMPORT")');
  const result=f.run();assert.equal(result.status,2);assert.equal(result.stdout,'');
});
test('rejects symlinked directory components before importing a dependency',()=>{
  const f=fixture(),outside=mkdtempSync(join(tmpdir(),'toro-writer-shadow-'));
  writeFileSync(join(outside,'index.js'),'throw new Error("UNVERIFIED_LINK_IMPORT")');
  symlinkSync(outside,join(f.dir,'vendor/node_modules/shadow'),process.platform==='win32'?'junction':'dir');
  const result=f.run();assert.equal(result.status,2);assert.equal(result.stdout,'');
});
test('rejects tampering, incomplete/duplicate manifests and unsafe paths',()=>{
  for(const issue of ['tamper','missing-runtime','duplicate','absolute','parent']){
    const f=fixture();
    if(issue==='tamper')writeFileSync(join(f.dir,'alegra-writer-runtime.mjs'),'tampered');
    if(issue==='missing-runtime')f.manifest.files=f.manifest.files.filter(x=>x.path!=='alegra-writer-runtime.mjs');
    if(issue==='duplicate')f.manifest.files=[f.manifest.files[0],f.manifest.files[0],f.manifest.files[0]];
    if(issue==='absolute')f.manifest.files[0].path=process.execPath;
    if(issue==='parent')f.manifest.files[0].path='../manual-host.mjs';
    f.save();const result=f.run();assert.equal(result.status,2,issue);assert.equal(JSON.parse(result.stderr).reason,'ALEGRA_MANUAL_HOST_NOT_READY');
  }
});
test('rejects operator payload, flag overrides and absent operation without effects',()=>{
  const f=fixture();for(const args of [[],['--payload={}'],['--writer-enabled=true'],['--operation=dispatch','--operation=recover']]){
    const result=f.run(args);assert.equal(result.status,2);assert.equal(result.stdout,'');assert.equal(JSON.parse(result.stderr).state,'blocked');
  }
});
