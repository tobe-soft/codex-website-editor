import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {publishTransaction} from './editor-publish-transaction.mjs';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
async function setup(){
 await fs.mkdir('.editor-tools',{recursive:true});const root=await fs.mkdtemp(path.resolve('.editor-tools/publish-test-')),backup=path.join(root,'backup'),dist=path.join(root,'dist');
 const previousFiles={'.htaccess':'old routing','site-editor/runtime.php':'old runtime','site-editor/editor.js':'old editor'};
 const next={'.htaccess':'new routing','site-editor/editor.js':'new editor','site-editor/installation.json':'new installation','site-editor/runtime.php':'new runtime'};
 const server=new Map(Object.entries(previousFiles).map(([name,data])=>[name,Buffer.from(data)]));server.set('site-editor/storage/state.php',Buffer.from('persistent fixture'));
 const previous={verification:[]},files=[],uploads=[];
 for(const [name,data] of Object.entries(previousFiles)){const dest=path.join(backup,name);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,data);previous.verification.push({file:name,sha256:hash(Buffer.from(data))});}
 for(const [rel,data] of Object.entries(next)){const p=path.join(dist,rel);await fs.mkdir(path.dirname(p),{recursive:true});await fs.writeFile(p,data);files.push({p,rel});}
 const client={async ensureDir(){},async cd(){},async remove(file){server.delete(file);},async uploadFrom(input,file){let data;if(typeof input==='string')data=await fs.readFile(input);else{const chunks=[];for await(const chunk of input)chunks.push(Buffer.from(chunk));data=Buffer.concat(chunks);}uploads.push({file,data:data.toString()});server.set(file,data);}};
 return {client,files,previous,backup,hash,server,uploads,next,previousFiles,remote:async file=>server.get(file)};
}
test('publishing blocks HTTP until all files verify and leaves persistent storage untouched',async()=>{
 const f=await setup(),verification=await publishTransaction(f);assert.equal(verification.length,f.files.length);assert.match(f.uploads[0].data,/R=503/);assert.equal(f.uploads.at(-1).data,'new routing');
 for(const [name,data] of Object.entries(f.next))assert.equal(f.server.get(name).toString(),data);assert.equal(f.server.get('site-editor/storage/state.php').toString(),'persistent fixture');
});
test('a failed verification restores old files and routing, removes new files, preserves content',async()=>{
 const f=await setup();let fail=true;const remote=async file=>{if(file==='site-editor/runtime.php'&&fail){fail=false;return Buffer.from('corrupt transport');}return f.server.get(file);};
 await assert.rejects(publishTransaction({...f,remote}),/previous files restored/);
 for(const [name,data] of Object.entries(f.previousFiles))assert.equal(f.server.get(name).toString(),data);assert.equal(f.server.has('site-editor/installation.json'),false);assert.equal(f.server.get('site-editor/storage/state.php').toString(),'persistent fixture');assert.equal(f.uploads.at(-1).data,'old routing');
});

test('failed first installation removes new runtime and temporary routing',async()=>{
 const f=await setup();f.server.clear();f.previous.verification=[];
 let fail=true;const remote=async file=>{if(file==='site-editor/runtime.php'&&fail){fail=false;return Buffer.from('broken');}return f.server.get(file);};
 await assert.rejects(publishTransaction({...f,remote}),/previous files restored/);
 assert.equal(f.server.size,0);
});
