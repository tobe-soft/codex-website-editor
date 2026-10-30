(async () => {
 'use strict';
 const uploadEndpoint=new URL('upload.php',document.currentScript.src).href;
 const editor=window.siteEditor;if(!editor)return;await editor.ready;
 const state=editor.getState();if(!state?.authenticated||document.querySelector('#admin-login'))return;
 const {node,dialog,message,closeButton,registerMarker,send}=editor;
 function input(form,title,type='text'){const label=node('label',title),control=node('input',null,{type});label.append(control);form.append(label);return control;}
 async function save(d,status,data){try{await send('publish',{revision:state.revision,...data});location.reload();}catch(error){status.textContent=error.message;d.querySelectorAll('button').forEach(b=>b.disabled=false);}}
 function buttons(form,d,status,data,reset){const publish=node('button','Veröffentlichen',{type:'submit'});form.append(status);if(reset){const more=node('details',null,{class:'editor-more-options'});more.append(node('summary','Weitere Optionen'));const b=node('button',reset.label,{type:'button',class:'editor-danger-link'});b.onclick=()=>{if(confirm(reset.question))save(d,status,{...data(),reset:true});};more.append(b);form.append(more);}const actions=node('div',null,{class:'editor-form-actions'});actions.append(publish,closeButton(d));form.append(actions);return publish;}

 function imageDialog(image){
  const id=image.dataset.editImage,d=dialog('Bild bearbeiten'),form=node('form');d.append(form,node('p','Das Bild wird erst mit „Veröffentlichen“ ersetzt.'));
  const label=node('label','Bild auswählen'),select=node('select',null,{'aria-label':'Bild auswählen'});label.append(select);form.append(label);
  const current=image.getAttribute('src');for(const asset of state.gallery)select.append(node('option',asset.label,{value:asset.src}));select.value=current;
  const file=input(form,'Neues Bild hochladen','file');file.accept='image/png,image/jpeg,image/webp';file.setAttribute('aria-label','Neues Bild hochladen');
  form.append(node('p','PNG, JPG oder WebP. Maximal '+(state.uploadLimit/1048576).toFixed(1)+' MB und 24 Megapixel. Bereits vorhandene SVG-Logos bleiben auswählbar.'));
  const alt=input(form,'Alternativtext');alt.value=image.alt;alt.maxLength=600;
  const preview=node('img',null,{class:'editor-image-preview',alt:image.alt,src:current});form.append(preview);const status=message(form);let blob;
  function update(){if(blob)URL.revokeObjectURL(blob);blob=null;select.disabled=file.files.length>0;if(file.files.length){const f=file.files[0];if(f.size>state.uploadLimit){status.textContent='Dieses Bild ist zu groß.';return;}blob=URL.createObjectURL(f);preview.src=blob;}else preview.src=select.value;preview.alt=alt.value;status.textContent='';}
  file.onchange=update;select.onchange=update;alt.oninput=()=>{preview.alt=alt.value;};d.addEventListener('close',()=>{if(blob)URL.revokeObjectURL(blob);});
  const publish=buttons(form,d,status,()=>({scope:'image',id}),{label:'Originalbild wiederherstellen',question:'Das ursprüngliche Bild wiederherstellen?'});
  form.onsubmit=async event=>{event.preventDefault();publish.disabled=true;try{let src=select.value;if(file.files.length){const body=new FormData();body.append('csrf',state.csrf);body.append('image',file.files[0]);const response=await fetch(uploadEndpoint,{method:'POST',body});const result=await response.json();if(!response.ok)throw Error(result.error||'Upload fehlgeschlagen.');src=result.asset.src;state.gallery.push(result.asset);}await save(d,status,{scope:'image',id,src,alt:alt.value});}catch(error){status.textContent=error.message;publish.disabled=false;}};
  d.showModal();
 }
 function linkDialog(link){
  const id=link.dataset.editLink,entry=state.media.links[id],d=dialog('Link bearbeiten'),form=node('form');d.append(form);
  const typeLabel=node('label','Linktyp'),type=node('select',null,{'aria-label':'Linktyp'});for(const [value,text]of [['web','Website / interner Pfad'],['phone','Telefonnummer'],['email','E-Mail-Adresse'],['anchor','Sprungmarke']])type.append(node('option',text,{value}));typeLabel.append(type);form.append(typeLabel);
  const original=link.getAttribute('href');type.value=original.startsWith('tel:')?'phone':original.startsWith('mailto:')?'email':original.startsWith('#')?'anchor':'web';
  const target=input(form,'Linkziel');target.setAttribute('aria-label','Linkziel');let query=new URLSearchParams();
  if(type.value==='email'){const [address,q]=original.slice(7).split('?');target.value=address;query=new URLSearchParams(q??'');}else target.value=type.value==='phone'?original.slice(4):type.value==='anchor'?original.slice(1):original;
  const subject=input(form,'Betreff (optional)');subject.value=query.get('subject')??'';
  let text;const initialText=entry.labelId?link.querySelector('[data-edit-id="'+entry.labelId+'"]')?.textContent:link.textContent;
  if(entry.labelId||entry.canText){text=input(form,'Sichtbarer Linktext');text.value=initialText;text.required=true;text.maxLength=2000;}else form.append(node('p','Dieser Link enthält ein Bild oder mehrere Textblöcke. Deren Inhalte bleiben erhalten.'));
  const tabLabel=node('label',null,{class:'editor-inline'}),newTab=node('input',null,{type:'checkbox','aria-label':'In neuem Tab öffnen'});newTab.checked=link.target==='_blank';tabLabel.append(newTab,node('span','In neuem Tab öffnen'));form.append(tabLabel);
  const preview=node('p',null,{class:'editor-link-preview'});form.append(preview);const status=message(form);
  function href(){const value=target.value.trim();if(type.value==='phone')return 'tel:'+value.replace(/[\s/]/g,'');if(type.value==='email'){const params=new URLSearchParams(query);if(subject.value.trim())params.set('subject',subject.value.trim());else params.delete('subject');return 'mailto:'+value+(params.size?'?'+params.toString():'');}return type.value==='anchor'?'#'+value.replace(/^#/,''):value;}
  function update(){subject.parentElement.hidden=type.value!=='email';newTab.disabled=['phone','email'].includes(type.value);target.type=type.value==='email'?'email':type.value==='phone'?'tel':'text';preview.textContent='Ziel: '+href();}
  type.onchange=update;target.oninput=update;subject.oninput=update;update();
  const publish=buttons(form,d,status,()=>({scope:'link',id}),{label:'Linkziel zurücksetzen',question:'Das ursprüngliche Linkziel wiederherstellen? Die Textbeschriftung bleibt bei Textbausteinen erhalten.'});
  form.onsubmit=event=>{event.preventDefault();publish.disabled=true;save(d,status,{scope:'link',id,href:href(),newTab:!newTab.disabled&&newTab.checked,...(text&&text.value!==initialText?{text:text.value}:{})});};d.showModal();
 }
 const markers=[];
 function add(element,kind,id,handler){const b=node('button',kind==='image'?'✎':'✎↗',{type:'button',class:'editor-pencil editor-media-pencil','aria-label':kind==='image'?'Bild bearbeiten: '+(element.alt||id):'Link bearbeiten: '+(element.textContent.trim().slice(0,55)||id)});b.setAttribute('data-edit-'+kind+'-for',id);b.onclick=e=>{e.preventDefault();handler(element);};document.body.append(b);registerMarker(element,b);markers.push({element,b,kind});}
 document.querySelectorAll('img[data-edit-image]').forEach(el=>add(el,'image',el.dataset.editImage,imageDialog));
 document.querySelectorAll('a[data-edit-link]').forEach(el=>add(el,'link',el.dataset.editLink,linkDialog));
 let queued=false;
 function position(){queued=false;for(const{element,b,kind}of markers){const rect=element.getBoundingClientRect();b.hidden=!element.getClientRects().length||rect.width===0||rect.height===0;if(b.hidden)continue;const offset=kind==='link'?(element.querySelectorAll('[data-edit-id]').length===1?100:62):20;b.style.left=Math.max(0,Math.min(innerWidth-40,rect.right-offset))+scrollX+'px';b.style.top=Math.max(0,rect.top+scrollY-18)+'px';}}
 function schedule(){if(!queued){queued=true;requestAnimationFrame(position);}}
 const observer=new ResizeObserver(schedule);markers.forEach(({element})=>observer.observe(element));addEventListener('resize',schedule);addEventListener('scroll',schedule,{passive:true});document.addEventListener('toggle',schedule,true);document.addEventListener('editor-mode-change',schedule);position();
})();
