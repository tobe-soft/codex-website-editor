import fs from 'node:fs/promises';
import path from 'node:path';
import {Readable} from 'node:stream';
const maintenance='RewriteEngine On\nRewriteRule ^ - [R=503,L]\nErrorDocument 503 "Die Website wird aktualisiert. Bitte in Kuerze erneut versuchen."\n';
export async function publishTransaction({client,files,previous,backup,remote,hash}){
 const root=files.find(file=>file.rel==='.htaccess');
 if(!root)throw Error('Missing root routing');
 const verification=[],touched=[];
 const pause=()=>client.uploadFrom(Readable.from(maintenance),'.htaccess');
 async function upload(file){
  await client.ensureDir(path.posix.dirname('/'+file.rel));await client.cd('/');touched.push(file.rel);await client.uploadFrom(file.p,file.rel);
  const bytes=await fs.readFile(file.p);if(hash(await remote(file.rel))!==hash(bytes))throw Error('Upload mismatch: '+file.rel);
  verification.push({file:file.rel,bytes:bytes.length,sha256:hash(bytes)});
 }
 try{
  await pause();
  for(const file of files)if(file.rel!=='.htaccess')await upload(file);
  // Re-enable HTTP only after every runtime file has been verified.
  await upload(root);return verification;
 }catch(error){
  try{
   await pause();
   const old=new Map(previous.verification.map(file=>[file.file,file]));
   for(const rel of [...new Set(touched)].filter(rel=>rel!=='.htaccess')){
    if(old.has(rel)){await client.uploadFrom(path.join(backup,rel),rel);if(hash(await remote(rel))!==old.get(rel).sha256)throw Error('Rollback verification failed: '+rel);}
    else await client.remove(rel);
   }
   if(old.has('.htaccess')){
    await client.uploadFrom(path.join(backup,'.htaccess'),'.htaccess');
    if(hash(await remote('.htaccess'))!==old.get('.htaccess').sha256)throw Error('Routing rollback verification failed');
   }else await client.remove('.htaccess');
  }catch(rollback){throw Error('Upload failed and rollback is incomplete. Backup: '+backup+'. '+rollback.message);}
  throw Error('Upload failed; previous files restored. '+error.message);
 }
}
