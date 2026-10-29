import fs from 'node:fs/promises';
import {randomBytes,createHash} from 'node:crypto';
const key=randomBytes(24).toString('base64url');
await fs.mkdir('public/site-editor',{recursive:true});
await fs.writeFile('public/site-editor/bootstrap.php',"<?php return '"+createHash('sha256').update(key).digest('hex')+"';\n",{flag:'wx'});
console.log('Einrichtungsschlüssel (sicher aufbewahren, einmalig für /site-editor/): '+key);
console.log('Jetzt neu bauen. Eine bestehende Admin-Anmeldung wird dadurch nicht ersetzt.');
