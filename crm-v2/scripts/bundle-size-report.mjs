// After `vite build`: what a first visit downloads (compressed), against a budget. Only warns (CI annotation), never fails.
// node scripts/bundle-size-report.mjs [distDir]
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const FIRST_LOAD_JS_KB = 340; // 307 KB when set (2026-11-01)
const FIRST_LOAD_CSS_KB = 80; // 72 KB when set: one CSS file, see src/app/eagerStyles.js

const dist = process.argv[2] || 'dist';
const gzipKb = (file) => gzipSync(readFileSync(join(dist, file))).length / 1024;
const html = readFileSync(join(dist, 'index.html'), 'utf8');
const firstLoad = [...html.matchAll(/(?:src|href)="\/(assets\/[^"]+\.(js|css))"/g)].map((match) => ({ file: match[1], kind: match[2], kb: gzipKb(match[1]) }));
const sum = (kind) => firstLoad.filter((item) => item.kind === kind).reduce((total, item) => total + item.kb, 0);
const line = (item) => `${item.kb.toFixed(1).padStart(8)} KB  ${item.file}`;

console.log('First load (gzip):');
firstLoad.forEach((item) => console.log(line(item)));
console.log(`JS ${sum('js').toFixed(1)} KB (budget ${FIRST_LOAD_JS_KB}), CSS ${sum('css').toFixed(1)} KB (budget ${FIRST_LOAD_CSS_KB})`);
console.log('Largest chunks (gzip):');
readdirSync(join(dist, 'assets')).filter((file) => file.endsWith('.js')).map((file) => ({ file: `assets/${file}`, kb: gzipKb(`assets/${file}`) }))
  .sort((a, b) => b.kb - a.kb).slice(0, 10).forEach((item) => console.log(line(item)));

if (sum('js') > FIRST_LOAD_JS_KB) console.log(`::warning::First-load JS is ${sum('js').toFixed(0)} KB gzip, budget ${FIRST_LOAD_JS_KB} KB. A page or a large file probably went into the eager bundle: check src/app/routes.jsx and the shell's imports.`);
if (sum('css') > FIRST_LOAD_CSS_KB) console.log(`::warning::First-load CSS is ${sum('css').toFixed(0)} KB gzip, budget ${FIRST_LOAD_CSS_KB} KB.`);
