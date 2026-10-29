import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {updateCore} from './update-editor-core.mjs';
import {readCore,makeLock} from './editor-package.mjs';

test('core update preserves site sources and blocks unversioned or locally modified core',async()=>{
 await fs.mkdir('.editor-tools',{recursive:true});const root=await fs.mkdtemp(path.resolve('.editor-tools/upgrade-test-'));
 await fs.mkdir(path.join(root,'editor'),{recursive:true});await fs.cp('editor/core',path.join(root,'editor/core'),{recursive:true});await fs.copyFile('editor/core.lock.json',path.join(root,'editor/core.lock.json'));
 await fs.writeFile(path.join(root,'site.config.json'),'site-specific fixture');
 const candidate=path.join(root,'candidate');await fs.cp('editor/core',candidate,{recursive:true});
 await fs.appendFile(path.join(candidate,'editor.css'),'\n/* test change */\n');
 await assert.rejects(updateCore({root,source:candidate,apply:true}),/new release version/);
 const release=JSON.parse(await fs.readFile(path.join(candidate,'release.json'),'utf8'));release.version=release.version.split('.').map((n,i)=>i===2?Number(n)+1:n).join('.');await fs.writeFile(path.join(candidate,'release.json'),JSON.stringify(release));
 const plan=await updateCore({root,source:candidate,apply:true});assert.equal(plan.applied,true);assert.equal(await fs.readFile(path.join(root,'site.config.json'),'utf8'),'site-specific fixture');
 assert.deepEqual(makeLock(await readCore(path.join(root,'editor/core'))),JSON.parse(await fs.readFile(path.join(root,'editor/core.lock.json'),'utf8')));
 await fs.appendFile(path.join(root,'editor/core/editor.css'),'\n/* local change */');await assert.rejects(updateCore({root,source:candidate}),/Local editor core differs/);
});

test('PHP schema migration is idempotent and preserves admin, styles, media, revision and previous content',()=>{
 const code=`require 'dist/site-editor/migrations.php'; $state=['schema'=>1,'revision'=>12,'admin'=>['hash'=>'test-hash','epoch'=>'test-epoch'],'blocks'=>['x'=>['text'=>'Beispiel','custom'=>true,'style'=>['color'=>'#123456']]],'images'=>['hero'=>['src'=>'/site-editor/uploads/test.png']],'links'=>['contact'=>['href'=>'mailto:test@example.invalid']],'assets'=>['a'=>['name'=>'test']],'pages'=>[['id'=>'privacy','path'=>'/datenschutz/','name'=>'Datenschutz']],'previous'=>['theme'=>'dark','pages'=>[['id'=>'privacy','name'=>'Alt']]],'theme'=>'blue','unknown'=>'keep']; $next=editor_migrate_state($state); if($next!==editor_migrate_state($next))exit(2); if($next['schema']!==2||!$next['pages'][0]['showInFooter']||!$next['previous']['pages'][0]['showInFooter'])exit(3); unset($next['schema'],$next['pages'][0]['showInFooter'],$next['previous']['pages'][0]['showInFooter']); unset($state['schema']); if($next!==$state)exit(4); try{editor_migrate_state(['schema'=>999]);exit(5);}catch(RuntimeException $e){} echo 'Migration verified';`;
 const result=spawnSync(process.env.PHP_BIN||'php',['-r',code],{encoding:'utf8'});assert.equal(result.error,undefined,result.error?.message);assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/verified/);
});

test('password records accept short and long values and retain legacy login compatibility',()=>{
 const code="require 'dist/site-editor/runtime.php'; foreach(['a',str_repeat('ä',200)] as $p){$a=editor_password_record($p);if(!editor_verify_password($p,$a)||editor_verify_password($p.'x',$a))exit(2);} $old=['hash'=>password_hash('old-password',PASSWORD_DEFAULT)];if(!editor_verify_password('old-password',$old))exit(3);echo 'Passwords verified';";
 const result=spawnSync(process.env.PHP_BIN||'php',['-r',code],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/verified/);
});
