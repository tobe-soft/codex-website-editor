import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const themes=JSON.parse(await fs.readFile('editor/core/themes.json','utf8'));
const luminance=hex=>hex.slice(1).match(/../g).map(n=>parseInt(n,16)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
const ratio=(a,b)=>{a=luminance(a);b=luminance(b);return(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
for(const [id,theme] of Object.entries(themes))test(id+' readable text, accents, buttons and footer',()=>{
 const c=theme.colors;for(const [fg,bg]of [['text','bg'],['text','surface'],['text','tint'],['muted','bg'],['muted','tint'],['link','bg'],['link','surface'],['link','active'],['onAccent','accent'],['footerText','footer'],['footerMuted','footer']])assert.ok(ratio(c[fg],c[bg])>=4.5,id+' '+fg+' on '+bg+' contrast '+ratio(c[fg],c[bg]).toFixed(2));
});
