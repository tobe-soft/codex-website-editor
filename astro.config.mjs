import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import {readSiteConfig} from './editor/core/config.mjs';
const site=await readSiteConfig();
export default defineConfig({site:site.origin,base:site.basePath||'/',output:'static',vite:{plugins:[tailwindcss()]}});