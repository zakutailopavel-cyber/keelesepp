// The teacher's answer key of a worksheet (owner 2026-10-21: „ответы для учителей с объяснением почему именно такой
// ответ”): every task, every item, the right answer and — when the sheet has it — why it is right. Explanations live on
// the block as data.explain, one line per item in the order the key lists them (course files: B.why(block, lines)).
// Pure: doc → [{ id, title, instruction, items: [{ n, prompt, answer, why }] }]. Shown to teachers only (studio
// „Õpetaja võti”); the student's player never renders it.
import { BLOCKS } from './registry.js';
import { groupItems } from './schema.js';

const lines = (v) => String(v || '').split('\n').map((x) => x.trim()).filter(Boolean);
const blank = (text) => String(text || '').replace(/\[[^\]]*\]/g, '___').replace(/\{[^}]*\}/g, '___').trim();
const answerOf = (text) => String(text || '').match(/\[([^\]]*)\]\s*$/)?.[1] || '';
const variants = (v) => String(v || '').split('|').map((x) => x.trim()).filter(Boolean).join(' / ');

// one item per numbered line of the task as the learner sees it
function itemsOf(block) {
  const d = block.data || {};
  const def = BLOCKS[block.type];
  switch (block.type) {
    case 'gaps': {
      const byLine = new Map();
      (def.answers(d) || []).forEach(({ key, accept }) => {
        const line = Number(String(key).split('.')[0]);
        byLine.set(line, [...(byLine.get(line) || []), accept.map(variants).join(' / ')]);
      });
      return lines(d.sentences).map((sentence, i) => ({ prompt: blank(sentence), answer: (byLine.get(i) || []).join(' · ') }));
    }
    case 'choice':
      return (d.questions || []).map((q) => ({ prompt: q.q, answer: lines(q.options).find((o) => o.startsWith('*'))?.slice(1).trim() || '' }));
    case 'truefalse':
      return (d.statements || []).map((s) => ({ prompt: s.text, answer: s.answer === 'true' ? 'Õige' : 'Vale' }));
    case 'match':
      return (d.pairs || []).map((p) => ({ prompt: p.left, answer: p.right }));
    case 'errorfix':
      return (d.rows || []).map((r) => ({ prompt: r.wrong, answer: variants(String(r.answer || '').replace(/;/g, '|')) }));
    case 'transformation':
      return (d.rows || []).map((r) => ({ prompt: [r.from, r.prompt ? `(${r.prompt})` : ''].filter(Boolean).join(' '), answer: variants(String(r.answer || '').replace(/;/g, '|')) }));
    case 'wordforms':
      return (d.rows || []).map((r) => ({ prompt: `${r.base} — ${r.prompt}`, answer: r.answer }));
    case 'categorize':
      return (d.groups || []).flatMap((g) => groupItems(g).map((item) => ({ prompt: item, answer: g.name })));
    case 'reading':
      return lines(d.questions).map((q) => ({ prompt: q.replace(/\s*\[[^\]]*\]\s*$/, ''), answer: variants(answerOf(q)) }));
    case 'table':
      return lines(d.rows).map((row) => {
        const cells = row.split('|').map((c) => c.trim());
        return { prompt: cells[0], answer: cells.slice(1).map((c) => variants(answerOf(c) || c.replace(/^\[|\]$/g, ''))).filter(Boolean).join(' · ') };
      });
    default:
      if (typeof def?.answers !== 'function') return [];
      return (def.answers(d, block) || []).map(({ key, accept }) => ({ prompt: `${key}`, answer: (accept || []).map(variants).join(' / ') }));
  }
}

export function answerKeyOf(doc) {
  return (doc?.blocks || []).filter((b) => BLOCKS[b.type]?.task).map((b) => {
    const why = lines(b.data?.explain);
    const items = itemsOf(b).filter((it) => it.answer || it.prompt).map((it, i) => ({ n: i + 1, ...it, why: why[i] || '' }));
    return { id: b.id, type: b.type, title: b.data?.title || BLOCKS[b.type]?.label || b.type, instruction: b.data?.instruction || '', items };
  }).filter((t) => t.items.length);
}

// how many items of a task have an explanation (quality check for course files)
export const explainedShare = (task) => (task.items.length ? task.items.filter((it) => it.why).length / task.items.length : 1);
