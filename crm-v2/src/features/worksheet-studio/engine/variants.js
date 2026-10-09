import { BLOCKS, SHUFFLE_BLOCKS } from './registry.js';
import { newId } from './schema.js';
import { diagramAnswers, diagramKind } from './blocks/diagramModel.js';

// One sheet, two more levels (owner, 2026-10-09): „Toetav” (easier) and „Väljakutse” (harder) copies of a worksheet.
// Plain rules, no AI: the easier copy gives word banks, helper words and a solved example and fewer options; the
// harder one takes the banks and examples away, shuffles options and turns some given words into gaps.
// Returns { doc, changes } — `changes` is the list the teacher sees on the new copy.

export const VARIANTS = {
  support: { label: 'Toetav versioon', short: 'toetav', hint: 'lihtsam: sõnapangad, abisõnad, näidis, vähem valikuid' },
  challenge: { label: 'Väljakutse', short: 'väljakutse', hint: 'raskem: ilma pankade ja näideteta, rohkem lünki' },
};

const HELP = 'Abisõnad:';
const firstAnswers = (text) => [...String(text || '').matchAll(/\[([^\]]*)\]/g)].map((m) => m[1].split('|')[0].trim()).filter(Boolean);
const unique = (list) => [...new Set(list)];
// a stable mixed order, so the bank does not give the answers away in sentence order
const mixed = (list) => [...list].sort((a, b) => a.localeCompare(b, 'et'));
const withHelp = (instruction, words) => {
  const base = String(instruction || '').replace(new RegExp(`\\s*${HELP}.*$`), '').trim();
  return words.length ? `${base ? `${base} ` : ''}${HELP} ${mixed(unique(words)).join(', ')}.` : base;
};
const withoutHelp = (instruction) => String(instruction || '').replace(new RegExp(`\\s*${HELP}.*$`), '').trim();
const lines = (value) => String(value || '').split('\n');

// every other given (non-gap) line → a gap: "kevad" → "[kevad]" (the first one stays as a hint)
// (in a mind map with sub-branches only the sub-branches: the branch names stay as the map's headings)
const SUB = /^(\s+|\s*[-*•]\s*)\S/;
function moreGaps(value, keep = (line) => line) {
  let given = 0;
  const all = lines(value);
  const onlySubs = all.some((raw, i) => i > 0 && SUB.test(raw));
  return all.map((raw, i) => {
    const line = raw.trim();
    if (!line || /\[[^\]]*\]/.test(line)) return raw;
    if (onlySubs && !(i > 0 && SUB.test(raw))) return raw;
    given += 1;
    if (given % 2) return raw;
    const prefix = raw.match(/^(\s*[-*•]\s*)/)?.[1] || '';
    return `${prefix}[${keep(raw.slice(prefix.length).trim())}]`;
  }).join('\n');
}

function supportBlock(block, note) {
  const def = BLOCKS[block.type];
  const data = { ...block.data };
  const opts = { ...(block.opts || {}) };
  if (def?.example && !opts.example) { opts.example = true; note('näidis (esimene rida lahendatud)'); }
  if (block.type === 'gaps') {
    const answers = firstAnswers(data.sentences);
    if (data.showBank === 'no' || !String(data.bank || '').trim()) {
      data.showBank = 'yes';
      if (!String(data.bank || '').trim()) data.bank = mixed(unique(answers)).join(', ');
      note('sõnapank');
    }
  }
  if (block.type === 'listening' || block.type === 'dialogue') {
    const words = block.type === 'dialogue' ? (data.lines || []).flatMap((l) => firstAnswers(l.text)) : firstAnswers(data.sentences);
    if (words.length) { data.instruction = withHelp(data.instruction, words); note('abisõnad'); }
  }
  if (block.type === 'table') {
    const words = firstAnswers(data.rows).flatMap((w) => w.split('/').slice(0, 1));
    if (words.length) { data.instruction = withHelp(data.instruction, words); note('abisõnad'); }
  }
  if (block.type === 'diagram') {
    const words = diagramAnswers(data).map((a) => a.accept[0]).filter(Boolean);
    if (words.length) { data.instruction = withHelp(data.instruction, words); note('abisõnad skeemile'); }
  }
  if (block.type === 'choice') {
    let cut = false;
    data.questions = (data.questions || []).map((q) => {
      const options = lines(q.options).map((o) => o.trim()).filter(Boolean);
      const right = options.filter((o) => o.startsWith('*'));
      const wrong = options.filter((o) => !o.startsWith('*'));
      if (!right.length || wrong.length <= 1) return q;
      cut = true;
      const keepWrong = wrong.slice(0, Math.max(1, Math.min(2, wrong.length - 1)));
      return { ...q, options: options.filter((o) => right.includes(o) || keepWrong.includes(o)).join('\n') };
    });
    if (cut) note('vähem valikvastuseid');
    if (opts.shuffle) { opts.shuffle = false; }
  }
  return { ...block, data, opts };
}

function challengeBlock(block, note) {
  const data = { ...block.data };
  const opts = { ...(block.opts || {}) };
  if (opts.example) { opts.example = false; note('näidis ära'); }
  if (SHUFFLE_BLOCKS.has(block.type) && !opts.shuffle) { opts.shuffle = true; note('valikud segamini'); }
  if ('instruction' in data && String(data.instruction || '').includes(HELP)) { data.instruction = withoutHelp(data.instruction); note('abisõnad ära'); }
  if (block.type === 'gaps' && data.showBank !== 'no' && String(data.bank || '').trim()) { data.showBank = 'no'; note('sõnapank peidetud'); }
  if (block.type === 'diagram') {
    const kind = diagramKind(data);
    if (['mind', 'tree', 'flow', 'cycle'].includes(kind)) {
      const next = moreGaps(data.nodes);
      if (next !== data.nodes) { data.nodes = next; note('rohkem lünki skeemis'); }
    }
    if (kind === 'venn' || kind === 'compare') {
      ['leftItems', 'rightItems', 'both'].forEach((field) => {
        const next = moreGaps(data[field]);
        if (next !== data[field]) { data[field] = next; note('rohkem lünki skeemis'); }
      });
    }
  }
  if (block.type === 'table') {
    let turned = false;
    data.rows = lines(data.rows).map((row, ri) => {
      if (!row.trim() || ri % 2 === 0) return row;
      return row.split('|').map((cell, ci) => {
        const c = cell.trim();
        if (ci === 0 || !c || /^\[.*\]$/.test(c)) return cell;
        turned = true;
        return ` [${c}] `;
      }).join('|').replace(/\s+\|/g, ' |').replace(/\|\s+/g, '| ').trim();
    }).join('\n');
    if (turned) note('rohkem lünki tabelis');
  }
  return { ...block, data, opts };
}

export function makeVariant(doc, level) {
  const variant = VARIANTS[level];
  if (!variant || !doc) throw new Error('Tundmatu variant.');
  const counts = new Map();
  const note = (text) => counts.set(text, (counts.get(text) || 0) + 1);
  const blocks = (doc.blocks || []).map((block) => {
    const next = level === 'support' ? supportBlock(block, note) : challengeBlock(block, note);
    return { ...structuredClone(next), id: newId() };
  });
  const baseTitle = String(doc.meta?.title || 'Tööleht').replace(/\s+\((toetav|väljakutse)\)$/i, '');
  const changes = [...counts.entries()].map(([text, n]) => (n > 1 ? `${text} (${n} ülesandes)` : text));
  return {
    doc: {
      ...structuredClone(doc),
      id: newId('ws'),
      meta: { ...structuredClone(doc.meta || {}), title: `${baseTitle} (${variant.short})`, variant: level, variantOf: doc.id || '', variantChanges: changes },
      blocks,
    },
    changes,
  };
}
