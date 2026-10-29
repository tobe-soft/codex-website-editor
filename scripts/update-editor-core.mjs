import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readCore,makeLock,compareVersion} from './editor-package.mjs';
export async function updateCore({root=process.cwd(),source,apply=false}){
 if(!source)throw Error('Usage: node scripts/update-editor-core.mjs --source <trusted checkout/editor/core> [--apply]');
 root=await fs.realpath(root);const target=path.join(root,'editor/core');
 const installed=await readCore(target),candidate=await readCore(source),lockPath=path.join(root,'editor/core.lock.json');
 const lock=JSON.parse(await fs.readFile(lockPath,'utf8'));
 if(JSON.stringify(makeLock(installed))!==JSON.stringify(lock))throw Error('Local editor core differs from core.lock.json. Review local changes before updating.');
 if(candidate.release.system!==lock.system||candidate.release.integrationVersion!==lock.integrationVersion||candidate.release.minimumDataSchema>lock.dataSchema||candidate.release.dataSchema<lock.dataSchema||compareVersion(candidate.release.version,lock.version)<0)throw Error('Incompatible release, data schema or downgrade');
 const changed=[...new Set([...Object.keys(installed.files),...Object.keys(candidate.files)])].filter(file=>installed.files[file]!==candidate.files[file]);
 if(changed.length&&candidate.release.version===lock.version)throw Error('A changed editor package must have a new release version');
 const plan={from:lock.version,to:candidate.release.version,dataSchema:{from:lock.dataSchema,to:candidate.release.dataSchema},changed,applied:false};
 if(!apply||!changed.length)return plan;
 // Back up the complete old core and lock before a directory swap. Site-specific
 // sources, configuration, credentials, uploads and content are never copied.
 const backup=path.join(root,'.editor-tools/core-update-backups',new Date().toISOString().replaceAll(':','-'));
 await fs.mkdir(backup,{recursive:true});await fs.copyFile(lockPath,path.join(backup,'core.lock.json'));
 const staged=path.join(backup,'incoming');await fs.mkdir(staged);
 for(const file of Object.keys(candidate.files)){const dest=path.join(staged,file);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.copyFile(path.join(source,file),dest);}
 if(JSON.stringify(makeLock(await readCore(staged)))!==JSON.stringify(makeLock(candidate)))throw Error('Editor package changed during staging');
 const old=path.join(backup,'core');let moved=false,swapped=false;
 try{
  await fs.rename(target,old);moved=true;await fs.rename(staged,target);swapped=true;
  await fs.writeFile(lockPath,JSON.stringify(makeLock(candidate),null,2)+'\n');
 }catch(error){
  if(swapped)await fs.rename(target,path.join(backup,'failed'));
  if(moved)await fs.rename(old,target);
  await fs.copyFile(path.join(backup,'core.lock.json'),lockPath);throw error;
 }
 return {...plan,applied:true,backup};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const args=process.argv.slice(2),at=args.indexOf('--source');if(args.some((arg,i)=>arg!=='--source'&&arg!=='--apply'&&i!==at+1))throw Error('Unknown option');const plan=await updateCore({source:at<0?null:args[at+1],apply:args.includes('--apply')});console.log(JSON.stringify(plan,null,2));}catch(error){console.error(error.message);process.exitCode=1;}
}
