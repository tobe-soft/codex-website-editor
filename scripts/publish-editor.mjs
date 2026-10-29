import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash,randomBytes} from 'node:crypto';
import {Writable,Readable} from 'node:stream';
import {Client} from 'basic-ftp';
import {publishTransaction} from './editor-publish-transaction.mjs';
import {readCore,makeLock} from './editor-package.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const site=JSON.parse(await fs.readFile('site.config.json','utf8'));
if(new URL(site.origin).hostname.endsWith('.invalid'))throw Error('Configure the real HTTPS origin before publishing');
const core=makeLock(await readCore('editor/core'));if(JSON.stringify(core)!==JSON.stringify(JSON.parse(await fs.readFile('editor/core.lock.json','utf8'))))throw Error('Unreviewed core changes');
const built=JSON.parse(await fs.readFile('dist/site-editor/installation.json','utf8'));
if(built.siteId!==site.id||built.origin!==site.origin||built.coreVersion!==core.version)throw Error('Build is stale; rebuild first');
console.log('Ready for publishing JSON on stdin (host, user, password, remoteRoot, mode: probe/install/update).');
let input='';for await(const chunk of process.stdin){input+=chunk;if(input.length>16384)throw Error('Input too large');}
const options=JSON.parse(input);input='';
if(!['probe','install','update'].includes(options.mode)||typeof options.remoteRoot!=='string'||!/^\/(?:[a-zA-Z0-9_.-]+\/?)*$/.test(options.remoteRoot)||options.remoteRoot.split('/').some(p=>p==='.'||p==='..')||!options.host||!options.user||!options.password)throw Error('Invalid publishing settings');
const ftp=new Client(30000);ftp.ftp.verbose=false;
try{
 await ftp.access({host:options.host,user:options.user,password:options.password,port:options.port||21,secure:true});options.password='';
 await ftp.cd(options.remoteRoot);const root=(await ftp.pwd()).replace(/\/$/,'');
 const target=rel=>root+'/'+rel;
 const remote=async rel=>{const chunks=[];await ftp.downloadTo(new Writable({write(c,_e,cb){chunks.push(Buffer.from(c));cb();}}),target(rel));return Buffer.concat(chunks)};
 const listing=await ftp.list();const existing=listing.find(e=>e.name==='site-editor');
 let installation=null;
 if(existing){try{installation=JSON.parse((await remote('site-editor/installation.json')).toString('utf8'));}catch{throw Error('Unknown installation: refusing to overwrite');}}
 if(installation&&(installation.system!==built.system||installation.siteId!==site.id||installation.origin!==site.origin||installation.integrationVersion!==built.integrationVersion||installation.dataSchema>built.dataSchema))throw Error('Installation identity or compatibility mismatch');
 if(options.mode==='install'&&listing.length)throw Error('First installation requires an empty dedicated target directory');
 if(options.mode==='update'&&!installation)throw Error('No matching installation found; refusing update');
 if(options.mode==='probe'){console.log(JSON.stringify({connected:true,matchingInstallation:!!installation,empty:listing.length===0}));process.exitCode=0;}
 else{
 // Verify the FTPS directory actually serves the configured HTTPS origin.
 const challenge=randomBytes(24).toString('hex'),name='editor-check-'+randomBytes(12).toString('hex')+'.php';
 try{await ftp.uploadFrom(Readable.from("<?php header('Content-Type: text/plain'); echo '"+challenge+"';"),target(name));const response=await fetch(site.origin+'/'+name,{redirect:'error',signal:AbortSignal.timeout(15000)});if(!response.ok||await response.text()!==challenge)throw Error('Domain does not serve the selected FTPS directory');}finally{await ftp.remove(target(name),true);}
 const backup=path.resolve('.local/backups/'+new Date().toISOString().replaceAll(':','-'));await fs.mkdir(backup,{recursive:true});
 const previous={verification:[]};
 async function snapshot(dir=''){
  for(const entry of await ftp.list(target(dir))){if(!/^[a-zA-Z0-9_.-]+$/.test(entry.name)||entry.name==='.'||entry.name==='..'||entry.isSymbolicLink)throw Error('Unsupported remote filename or symlink; manual review needed');const rel=dir+entry.name;if(entry.isDirectory)await snapshot(rel+'/');else if(entry.isFile){const bytes=await remote(rel),local=path.join(backup,rel);await fs.mkdir(path.dirname(local),{recursive:true});await fs.writeFile(local,bytes);previous.verification.push({file:rel,sha256:hash(bytes)});}else throw Error('Unsupported remote entry');}
 }
 await snapshot();await fs.writeFile(path.join(backup,'backup-manifest.json'),JSON.stringify(previous,null,2));
 const files=[];
 async function collect(dir=''){for(const e of await fs.readdir(path.join('dist',dir),{withFileTypes:true})){const rel=dir+e.name;if(e.isSymbolicLink())throw Error('Symlinks not supported');if(/^site-editor\/(storage|uploads)\//.test(rel)&&!rel.endsWith('/.htaccess'))continue;if(rel==='site-editor/bootstrap.php'&&options.mode==='update')continue;if(e.isDirectory())await collect(rel+'/');else files.push({p:path.resolve('dist',rel),rel});}}
 await collect();if(options.mode==='install'&&!files.some(f=>f.rel==='site-editor/bootstrap.php'))throw Error('Run editor:setup and rebuild before installation');
 const client={ensureDir:async dir=>{await ftp.ensureDir(root+dir)},cd:async()=>ftp.cd(root||'/'),uploadFrom:async(src,rel)=>ftp.uploadFrom(src,target(rel)),remove:async rel=>ftp.remove(target(rel))};
 const verification=await publishTransaction({client,files,previous,backup,remote,hash});
 await fs.writeFile(path.join(backup,'published-manifest.json'),JSON.stringify({siteId:site.id,origin:site.origin,verification},null,2));
 console.log(JSON.stringify({published:true,origin:site.origin,files:verification.length,backup}));
 }
}finally{options.password='';ftp.close();}
