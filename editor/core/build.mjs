import fs from 'node:fs/promises';
import path from 'node:path';
import {parse,serialize} from 'parse5';
import {fileURLToPath} from 'node:url';
import {readSiteConfig} from './config.mjs';
const site=await readSiteConfig();
const coreRoot=path.dirname(fileURLToPath(import.meta.url));
const release=JSON.parse(await fs.readFile(path.join(coreRoot,'release.json'),'utf8'));
const destination=path.resolve('dist/site-editor');
await fs.mkdir(destination,{recursive:true});
for(const file of [...release.runtimeFiles,'release.json']){
 await fs.mkdir(path.dirname(path.join(destination,file)),{recursive:true});
 let content=await fs.readFile(path.join(coreRoot,file));
 if(file.endsWith('.php'))content=content.toString('utf8').replace(/((?:editor\.css|editor\.js|site-admin\.js|media\.js|navigation\.js)\?v=)[0-9.]+/g,'$1'+release.version);
 await fs.writeFile(path.join(destination,file),content);
}
await fs.writeFile(path.join(destination,'site-config.json'),JSON.stringify(site,null,2)+'\n');
await fs.writeFile(path.join(destination,'installation.json'),JSON.stringify({system:release.system,coreVersion:release.version,dataSchema:release.dataSchema,integrationVersion:release.integrationVersion,siteId:site.id,origin:site.origin},null,2)+'\n');
const root=path.resolve('dist');
const catalog=JSON.parse(await fs.readFile(path.join(coreRoot,'text-styles.json'),'utf8'));
const fields={},coverage=[],assets={images:{},links:{}};
const get=(node,name)=>node.attrs?.find(attr=>attr.name===name)?.value;
const hasClass=(node,name)=>(get(node,'class')??'').split(/\s+/).includes(name);
function originalAttributes(tag,raw){let result;function scan(n){if(n.tagName===tag)result=n.attrs;for(const c of n.childNodes??[])scan(c);}scan(parse('<'+tag+raw+'>'));return result;}
const semantic=new Set(['h1','h2','h3','h4','h5','h6','p','li','small','a','summary']);
function category(node,inherited){
 const explicit=get(node,'data-text-style');if(explicit){if(!catalog[explicit])throw Error('Unknown text category: '+explicit);return explicit;}
 const tag=node.tagName;
 if(/^h[1-6]$/.test(tag??''))return tag;
 if(tag==='nav')return 'nav';
 if(tag==='a')return hasClass(node,'button')?'button':inherited==='nav'?'nav':'a';
 if(tag==='p')return hasClass(node,'eyebrow')?'label':'p';
 if(tag==='li')return 'li';if(tag==='small')return 'small';if(tag==='summary')return 'label';
 if(hasClass(node,'eyebrow')||hasClass(node,'trust-strip')||hasClass(node,'steps'))return 'label';
 if(hasClass(node,'art-signature')||hasClass(node,'footer-bottom')||hasClass(node,'visual-top')||hasClass(node,'visual-bottom'))return 'small';
 return inherited??'p';
}
async function walk(dir){for(const entry of await fs.readdir(dir,{withFileTypes:true})){
 const file=path.join(dir,entry.name);if(entry.isDirectory()){await walk(file);continue;}if(!entry.name.endsWith('.html'))continue;
 const document=parse(await fs.readFile(file,'utf8'));let textNodes=0;const tokens=new Map();
 function visit(node,inherited=null,editableParent=false){
  if(node.nodeName==='#text'){if(node.value.trim()){if(!inherited)throw Error('Uncategorized text in '+file);textNodes++;}return;}
  if(node.tagName==='img'&&get(node,'data-edit-image')){const id=get(node,'data-edit-image');if(!/^[a-z0-9.-]+$/.test(id))throw Error('Invalid image ID');assets.images[id]??={attrs:node.attrs};}
  if(['head','script','style','svg','img','template'].includes(node.tagName)||get(node,'aria-hidden')==='true')return;
  const current=node.tagName?category(node,inherited):inherited;
  const id=get(node,'data-edit-id');if(id&&(editableParent||!/^[a-z0-9.-]+$/.test(id)))throw Error('Invalid/nested editable field: '+id);
  const directText=node.childNodes?.some(child=>child.nodeName==='#text'&&child.value.trim());
  if(node.tagName&&(id||directText||semantic.has(node.tagName))){node.attrs=node.attrs.filter(attr=>attr.name!=='data-text-style');node.attrs.push({name:'data-text-style',value:current});}
  for(const child of node.childNodes??[])visit(child,current,editableParent||Boolean(id));
  if(node.tagName==='a'&&get(node,'data-edit-link')){const linkId=get(node,'data-edit-link');if(!/^[a-z0-9.-]+$/.test(linkId))throw Error('Invalid link ID');const labels=[];let image=false;function descendants(n){if(get(n,'data-edit-id'))labels.push(get(n,'data-edit-id'));if(n.tagName==='img')image=true;for(const c of n.childNodes??[])descendants(c);}for(const c of node.childNodes??[])descendants(c);const canText=labels.length===0&&!image&&!hasClass(node,'service-card');const entry={attrs:node.attrs,labelId:labels.length===1?labels[0]:'',canText,html:canText?serialize(node):''};if(assets.links[linkId]&&get({attrs:assets.links[linkId].attrs},'href')!==get(node,'href'))throw Error('Conflicting link ID');assets.links[linkId]=entry;if(canText)node.childNodes=[{nodeName:'#text',value:'__LINK_LABEL_'+linkId+'__',parentNode:node}];}
  if(id){
   const fallback=serialize(node);if(fields[id]&&fields[id].html!==fallback)throw Error('Duplicate editor ID with different content: '+id);
   const categories=[...new Set([...(fields[id]?.categories??[]),current])];fields[id]={type:node.tagName,category:current,categories,html:fallback};
   const token='__EDITOR_CONTENT_'+id+'__';tokens.set(token,{id,tag:node.tagName,attrs:node.attrs,category:current});node.childNodes=[{nodeName:'#text',value:token,parentNode:node}];
  }
 }
 visit(document);
 const route=entry.name==='404.html'?'/404.php':path.dirname(path.relative(root,file))==='.'?'/':'/'+path.dirname(path.relative(root,file)).replaceAll('\\','/')+'/';
 function metadata(n){if(n.tagName==='title'){const title=n.childNodes.map(c=>c.value??'').join('');n.childNodes=[{nodeName:'#text',value:'__EDITOR_PAGE_TITLE__',parentNode:n}];tokens.set('__EDITOR_PAGE_TITLE__',{metaTitle:title});}if(n.tagName==='meta'&&get(n,'property')==='og:title'){const attr=n.attrs.find(a=>a.name==='content');tokens.set('__EDITOR_OG_TITLE__',{metaTitle:attr.value});attr.value='__EDITOR_OG_TITLE__';}if(n.tagName==='script'&&get(n,'type')==='application/ld+json'){const json=n.childNodes.map(c=>c.value??'').join('');n.childNodes=[{nodeName:'#text',value:'__EDITOR_PAGE_JSON__',parentNode:n}];tokens.set('__EDITOR_PAGE_JSON__',{metaJson:json});}for(const c of n.childNodes??[])metadata(c);}metadata(document);
 let html=serialize(document);for(const [token,field]of tokens){if(field.metaJson!==undefined){html=html.replace(token,"<?php echo editor_page_json("+phpValue(route)+","+phpValue(field.metaJson)+"); ?>");continue;}if(field.metaTitle!==undefined){html=html.replace(token,"<?php echo editor_page_title("+phpValue(route)+","+phpValue(field.metaTitle)+"); ?>");continue;}html=html.replace(token,()=>"<?php echo editor_text('"+field.id+"'); ?>");}
 // Replace editable element envelopes after serialization so tag changes are rendered on the server.
 html=html.replace(/<([a-z0-9]+)([^>]*data-edit-id="([a-z0-9.-]+)"[^>]*)><\?php echo editor_text\('[^']+'\); \?><\/\1>/g,(_all,_tag,_attrs,id)=>{const field=[...tokens.values()].find(value=>value.id===id);return "<?php echo editor_element('"+id+"','"+field.tag+"',"+phpValue(field.attrs)+",'"+field.category+"'); ?>";});
 html=html.replace(/<img\b([^>]*data-edit-image="([a-z0-9.-]+)"[^>]*)>/g,(_all,_attrs,id)=>"<?php echo editor_image('"+id+"',"+phpValue(originalAttributes('img',_attrs))+"); ?>");
 html=html.replace(/<a\b([^>]*data-edit-link="([a-z0-9.-]+)"[^>]*)>/g,(_all,_attrs,id)=>"<?php echo editor_link_open('"+id+"',"+phpValue(originalAttributes('a',_attrs))+"); ?>");
 for(const [id,entry]of Object.entries(assets.links))if(entry.canText)html=html.replaceAll('__LINK_LABEL_'+id+'__',"<?php echo editor_link_label('"+id+"'); ?>");
 html=html.replaceAll('__EDITOR_NAVIGATION__','<?php echo editor_navigation(); ?>').replaceAll('__EDITOR_FOOTER_NAVIGATION__','<?php echo editor_navigation(true); ?>');
 html=html.replace('</head>','<?php echo editor_styles(); ?></head>').replace('</body>','<?php echo editor_controls(); ?></body>');
 const relative=path.relative(path.dirname(file),root).replaceAll('\\','/')||'.';html="<?php require_once __DIR__ . '/"+relative+"/site-editor/runtime.php'; editor_page_guard("+phpValue(route)+"); ?>\n"+html;
 await fs.writeFile(file.replace(/\.html$/,'.php'),html);await fs.unlink(file);coverage.push({page:path.relative(root,file).replaceAll('\\','/'),categorizedTextNodes:textNodes});
}}
await walk(root);
let shell=await fs.readFile(path.join(root,'page-template/index.php'),'utf8');
shell=shell.replace("editor_page_guard('/page-template/');",'')
 .replaceAll('__EDITOR_PAGE_CONTENT__',"<?php echo editor_page_content($currentPage); ?>")
 .replace(/<title>[\s\S]*?<\/title>/,"<title><?php echo editor_page_title($currentPage['path'],$currentPage['name'].' | '.editor_config()['name']); ?></title>")
 .replace(/<link rel="canonical" href="[^"]*">/,'<link rel="canonical" href="<?php echo htmlspecialchars(editor_config()["origin"].$currentPage["path"],ENT_QUOTES); ?>">')
 .replace(/<meta property="og:title" content="[^"]*">/,'<meta property="og:title" content="<?php echo htmlspecialchars($currentPage["name"],ENT_QUOTES); ?>">')
 .replaceAll(site.origin+'/page-template/','<?php echo htmlspecialchars(editor_config()["origin"].$currentPage["path"],ENT_QUOTES); ?>');
shell=shell.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,'<script type="application/ld+json"><?php echo editor_custom_metadata($currentPage); ?></script>').replace(/<meta name="description" content="[^"]*">/,'<meta name="description" content="<?php echo editor_page_description($currentPage); ?>">');
 await fs.writeFile(path.join(root,'site-editor/page-shell.php'),shell);await fs.unlink(path.join(root,'page-template/index.php'));await fs.rmdir(path.join(root,'page-template'));
if(!Object.keys(fields).length)throw Error('No editable fields generated');
await fs.writeFile(path.join(root,'site-editor/registry.php'),'<?php\nreturn '+phpValue(fields)+';\n');
await fs.writeFile(path.join(root,'site-editor/asset-registry.php'),'<?php\nreturn '+phpValue(assets)+';\n');
const content=JSON.parse(await fs.readFile('src/data/editor-content.json','utf8'));
if(!Number.isInteger(content.schema)||content.schema<release.minimumDataSchema||content.schema>release.dataSchema)throw Error('Unsupported content schema; synchronize before building');
await fs.writeFile(path.join(root,'site-editor/content.php'),'<?php\nreturn '+phpValue(content)+';\n');
await fs.writeFile(path.join(root,'site-editor/category-coverage.json'),JSON.stringify(coverage,null,2)+'\n');
function phpValue(value){if(value===null)return 'null';if(typeof value==='boolean')return value?'true':'false';if(typeof value==='string')return "'"+value.replaceAll('\\','\\\\').replaceAll("'","\\'")+"'";if(typeof value==='number')return String(value);return '['+Object.entries(value).map(([k,v])=>phpValue(k)+'=>'+phpValue(v)).join(',')+']';}
console.log('Editor build: '+Object.keys(fields).length+' stable text fields; all visible text categorized on '+coverage.length+' pages.');
