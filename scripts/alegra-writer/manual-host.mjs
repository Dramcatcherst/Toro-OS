// Run only from the verified release on the existing Lightsail host.
// No server, scheduler, flags, provisioning or operator-supplied payload.
import { readFileSync, readdirSync, lstatSync, fstatSync, openSync, closeSync, constants } from 'node:fs';
import { createHash } from 'node:crypto';
import { hostname, userInfo } from 'node:os';
import { dirname, join, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const directory=dirname(fileURLToPath(import.meta.url));
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
function verifyPackage() {
  const rootStat=lstatSync(directory),manifestPath=join(directory,'manifest.json'),manifestStat=lstatSync(manifestPath);
  if(rootStat.isSymbolicLink()||!rootStat.isDirectory()||manifestStat.isSymbolicLink()||!manifestStat.isFile())throw new Error();
  const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
  const published=/^[0-9a-f]{40}$/.test(manifest.sourceCommit??'')&&manifest.publicationRequired!==true&&manifest.worktreeDirty===false;
  const unpublished=manifest.sourceCommit===null&&/^[0-9a-f]{40}$/.test(manifest.sourceBase??'')&&manifest.publicationRequired===true&&manifest.worktreeDirty===true;
  if(manifest.kind!=='TORO_ALEGRA_MANUAL_HOST_RELEASE_V1'||manifest.nodeMajor!==24||(!published&&!unpublished)||!Array.isArray(manifest.files))throw new Error();
  const names=manifest.files.map(file=>file.path);
  if(new Set(names).size!==names.length||['manual-host.mjs','alegra-writer-runtime.mjs','supabase-prod-ca-2021.crt','vendor/node_modules/pg/lib/client.js'].some(name=>!names.includes(name)))throw new Error();
  // Require the complete inventory before importing anything. An unlisted
  // nested node_modules file could otherwise shadow a verified pg dependency.
  const actual=new Set();let entries=0;
  function inventory(parent){
    for(const name of readdirSync(parent)){
      if(++entries>4096)throw new Error();
      const file=join(parent,name),stat=lstatSync(file),path=relative(directory,file).replaceAll('\\','/');
      if(stat.isSymbolicLink())throw new Error();
      if(stat.isDirectory())inventory(file);
      else if(stat.isFile()){if(path!=='manifest.json')actual.add(path);}
      else throw new Error();
    }
  }
  inventory(directory);
  if(actual.size!==names.length||names.some(name=>!actual.has(name)))throw new Error();
  for(const item of manifest.files){
    if(typeof item.path!=='string'||isAbsolute(item.path)||item.path.split(/[\\/]/).some(part=>part==='..'))throw new Error();
    const file=resolve(directory,item.path),inside=relative(directory,file),stat=lstatSync(file);
    if(inside.startsWith('..')||stat.isSymbolicLink()||!stat.isFile()||digest(readFileSync(file))!==item.sha256)throw new Error();
  }
  return manifest;
}
try {
  if(Number(process.versions.node.split('.')[0])!==24)throw new Error();
  const manifest=verifyPackage();
  const args=process.argv.slice(2);
  if(args.length===1&&args[0]==='--verify-package'){
    console.log(JSON.stringify({state:manifest.publicationRequired===true?'CANDIDATE_PACKAGE_VERIFIED':'PACKAGE_VERIFIED',sourceCommit:manifest.sourceCommit,sourceBase:manifest.sourceBase,publicationRequired:manifest.publicationRequired===true,files:manifest.files.length,providerCalls:0,databaseConnections:0}));
  } else {
    // Offline reconciliation can prove bytes, never a published release. This
    // candidate must be rebuilt from the accepted Git head before host use.
    if(manifest.publicationRequired===true)throw new Error('ALEGRA_PACKAGE_UNPUBLISHED');
    const options=Object.fromEntries(args.map(arg=>{const match=/^--(operation|org-id|run-id|payload-hash)=([^=]+)$/.exec(arg);if(!match)throw new Error();return [match[1],match[2]];}));
    if(args.length!==4||Object.keys(options).length!==4||!['dispatch','recover'].includes(options.operation)||
      options['org-id']!=='595801ce-2895-4d91-81ae-e8d1d5cc8593'||!/^\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b$/i.test(options['run-id'])||
      !/^[0-9a-f]{64}$/.test(options['payload-hash'])||process.env.TORO_DEPLOYMENT_MODE!=='internal'||hostname()!=='ip-172-26-13-14'||userInfo().username!=='openclaw')throw new Error();
    const secretDirectory='/var/lib/openclaw/.config/toro-whatsapp';
    async function readSecret(name){
      if(!['alegra-writer-postgres.secret','alegra-writer-reader-postgres.secret','alegra-api.secret'].includes(name))throw new Error();
      const parent=lstatSync(secretDirectory),uid=process.getuid();
      if(!parent.isDirectory()||parent.isSymbolicLink()||parent.uid!==uid||(parent.mode&0o077)!==0)throw new Error();
      const fd=openSync(join(secretDirectory,name),constants.O_RDONLY|constants.O_NOFOLLOW);
      try{const stat=fstatSync(fd);if(!stat.isFile()||stat.uid!==uid||(stat.mode&0o077)!==0||stat.size>32768)throw new Error();return readFileSync(fd,'utf8').trim();}
      finally{closeSync(fd);}
    }
    const [{createAlegraManualHost},{default:Client}]=await Promise.all([import('./alegra-writer-runtime.mjs'),import('./vendor/node_modules/pg/lib/client.js')]);
    const host=createAlegraManualHost({target:{orgId:options['org-id'],runId:options['run-id'],payloadHash:options['payload-hash']},
      workerId:'writer:toro-openclaw-gateway-01:purchase-bill:v1',recoveryWorkerId:'writer:toro-openclaw-gateway-01:purchase-bill:recovery:v1',
      Client,ca:readFileSync(join(directory,'supabase-prod-ca-2021.crt'),'utf8'),readSecret,now:()=>new Date().toISOString()});
    console.log(JSON.stringify(await host[options.operation]()));
  }
}catch(error){console.error(JSON.stringify({state:'blocked',reason:error?.message==='ALEGRA_PACKAGE_UNPUBLISHED'?'ALEGRA_PACKAGE_UNPUBLISHED':'ALEGRA_MANUAL_HOST_NOT_READY'}));process.exitCode=2;}
