import fs from 'node:fs';
import * as mod from './features/worksheet-generator/admin/course/b1/module10.js';
import { moduleSheets } from './features/worksheet-generator/admin/course/registry.js';
import { blockMinutes, sheetMinutes } from './features/worksheet-studio/didactics/timeEstimate.js';
const OPEN = new Set(['speaking', 'writing', 'guidedletter', 'rolecards', 'planning', 'selfcheck', 'rubric', 'phrasebank', 'vocab', 'text', 'tip', 'notice', 'image', 'heading']);
const words = (v) => String(v || '').split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
it('stats', () => { const out = [];
  const s = moduleSheets(mod);
  for (const [id, ph] of Object.entries(s)) for (const [p, d] of Object.entries(ph)) {
    if (d.meta.assessment) continue;
    const ex = d.blocks.filter((b) => !OPEN.has(b.type)).reduce((n, b) => n + blockMinutes(b, d.meta.level, '', d.meta.template), 0);
    const rd = d.blocks.filter((b) => ['reading','listening','cloze','formtext','dialogue','profiles'].includes(b.type)).map((b) => `${b.type}:${words(b.data.passage || b.data.transcript || (b.data.lines||[]).map(l=>l.text).join(' ') || (b.data.people||[]).map(x=>x.facts+' '+x.sentences).join(' '))}`);
    out.push([id, p, 'min', sheetMinutes(d), 'ex', ex.toFixed(1), 'own', d.blocks.filter(b=>!b.data?.artFor&&!b.data?.artId&&!b.data?.review).length, rd.join(' ')].join(' '));
  }
  fs.writeFileSync("/private/tmp/claude-501/-Users-pavel-keelesepp-release/dd020207-c671-4df6-aeec-cad2733a0540/scratchpad/stats.txt", out.join("\n"));
});
