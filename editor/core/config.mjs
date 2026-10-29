import fs from 'node:fs/promises';
import path from 'node:path';
export async function readSiteConfig(root=process.cwd()) {
 const config=JSON.parse(await fs.readFile(path.resolve(root,process.env.SITE_CONFIG_PATH||'site.config.json'),'utf8'));
 const origin=new URL(config.origin);
 if(origin.protocol!=='https:'||origin.username||origin.password||origin.pathname!=='/'||origin.search||origin.hash||config.origin!==origin.origin)throw Error('site.config.json: origin must be an HTTPS origin without trailing slash');
 if(!/^[a-z][a-z0-9-]{1,63}$/.test(config.id)||typeof config.name!=='string'||!config.name.trim()||config.name.length>100||! /^[a-zA-Z][a-zA-Z0-9_]{2,63}$/.test(config.sessionName)||! /^[a-z]{2}-[A-Z]{2}$/.test(config.language))throw Error('Invalid site identity, name, language or session name');
 const base=config.basePath??'';
 if(typeof base!=='string'||(base!==''&&!/^\/(?:[a-z0-9][a-z0-9-]*)(?:\/[a-z0-9][a-z0-9-]*)*$/.test(base)))throw Error('basePath must be empty or a safe absolute path without trailing slash');
 return {...config,basePath:base};
}
