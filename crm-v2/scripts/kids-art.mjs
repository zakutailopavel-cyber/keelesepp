// Word pictures for the children's sheets: public/kids-art/<id>.svg from the colouring library
// (src/features/worksheet-studio/engine/blocks/kidsPictures.js) — black line, white, a pale lime blob behind
// (docs/TEXTBOOK_ART_BIBLE.md). Run: node scripts/kids-art.mjs
import fs from 'node:fs';
import path from 'node:path';
import { COLORING_PICTURES } from '../src/features/worksheet-studio/engine/blocks/kidsPictures.js';

const OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../public/kids-art');
const shape = ([kind, ...v]) => (kind === 'c' ? `<circle cx="${v[0]}" cy="${v[1]}" r="${v[2]}"/>`
  : kind === 'e' ? `<ellipse cx="${v[0]}" cy="${v[1]}" rx="${v[2]}" ry="${v[3]}"/>`
    : kind === 'r' ? `<rect x="${v[0]}" y="${v[1]}" width="${v[2]}" height="${v[3]}" rx="${v[4] || 0}"/>`
      : `<path d="${v[0]}"/>`);
fs.mkdirSync(OUT, { recursive: true });
for (const [id, pic] of Object.entries(COLORING_PICTURES)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="600" height="600">
<rect width="300" height="300" fill="#fff"/>
<path fill="#E8F9B0" d="M218 36c39 26 66 75 56 124-10 50-56 100-112 107S45 245 29 193 27 84 67 49 179 10 218 36Z"/>
<g fill="#fff" stroke="#1E1E1E" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">${pic.regions.flatMap((r) => r.shapes.map(shape)).join('')}</g>
<g fill="none" stroke="#1E1E1E" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">${pic.lines.map((d) => `<path d="${d}"/>`).join('')}</g>
</svg>
`;
  fs.writeFileSync(path.join(OUT, `${id}.svg`), svg);
}
console.log(Object.keys(COLORING_PICTURES).length, 'pictures');
