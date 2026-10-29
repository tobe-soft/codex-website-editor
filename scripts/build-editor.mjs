// Stable Astro integration. Shared implementation is versioned with the editor.
import fs from 'node:fs/promises';
import {readCore,makeLock} from './editor-package.mjs';
const core=await readCore('editor/core');
const lock=JSON.parse(await fs.readFile('editor/core.lock.json','utf8'));
if(JSON.stringify(makeLock(core))!==JSON.stringify(lock))throw Error('Editor core differs from core.lock.json; review changes before building');
await import('../editor/core/build.mjs');
