import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
// Core packages contain text files; Git CRLF conversion must not look like a fork.
const sha256=data=>createHash('sha256').update(data.toString('utf8').replaceAll('\r\n','\n')).digest('hex');
export async function readCore(directory) {
 const root=await fs.realpath(directory);
 const release=JSON.parse(await fs.readFile(path.join(root,'release.json'),'utf8'));
 if(release.system!=='astro-frontend-editor'||!/^\d+\.\d+\.\d+$/.test(release.version)||release.integrationVersion!==1||!Number.isInteger(release.dataSchema)||!Number.isInteger(release.minimumDataSchema)||release.minimumDataSchema<1||release.minimumDataSchema>release.dataSchema||!Array.isArray(release.runtimeFiles)||!Array.isArray(release.buildFiles))throw Error('Unsupported or invalid editor release');
 const files=['release.json',...release.runtimeFiles,...release.buildFiles];
 if(new Set(files).size!==files.length||!['runtime.php','api.php','migrations.php','build.mjs','config.mjs','.htaccess','storage/.htaccess','uploads/.htaccess'].every(file=>files.includes(file)))throw Error('Incomplete or duplicate editor package files');
 const hashes={};
 async function scan(dir,prefix=''){for(const entry of await fs.readdir(dir,{withFileTypes:true})){const name=prefix+entry.name;if(entry.isDirectory())await scan(path.join(dir,entry.name),name+'/');else if(!files.includes(name))throw Error('Unmanaged file in editor package: '+name);}}
 await scan(root);
 for(const file of files){
  if(typeof file!=='string'||! /^(?:[a-z0-9-]+\/)*(?:[a-z0-9-]+\.(?:php|mjs|js|css|json)|\.htaccess)$/.test(file)||file==='site-config.json'||file==='content.php'||(/^(storage|uploads)\//.test(file)&&!file.endsWith('/.htaccess')))throw Error('Unsafe editor package path: '+file);
  const target=path.join(root,file),info=await fs.lstat(target);
  if(!info.isFile()||info.isSymbolicLink()||!(await fs.realpath(target)).startsWith(root+path.sep))throw Error('Editor package must contain regular files inside its directory');
  hashes[file]=sha256(await fs.readFile(target));
 }
 return {release,files:hashes};
}
export function makeLock(core){return {system:core.release.system,version:core.release.version,dataSchema:core.release.dataSchema,integrationVersion:core.release.integrationVersion,files:core.files};}
export function compareVersion(a,b){const aa=a.split('.').map(Number),bb=b.split('.').map(Number);for(let i=0;i<3;i++)if(aa[i]!==bb[i])return Math.sign(aa[i]-bb[i]);return 0;}
