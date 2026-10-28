// The teacher's answer key of a worksheet (owner 2026-10-21: „ответы для учителей с объяснением почему именно такой
// ответ”): every task, every item, the right answer and — when the sheet has it — why it is right. Explanations live on
// the block as data.explain, one line per item in the order the key lists them (course files: B.why(block, lines)).
// Pure: doc → [{ id, title, instruction, items: [{ n, prompt, answer, why }] }]. Shown to teachers only (studio
// „Õpetaja võti”); the student's player never renders it.
import { BLOCKS, numberTasks } from './registry.js';
import { groupItems } from './schema.js';

const lines = (v) => String(v || '').split('\n').map((x) => x.trim()).filter(Boolean);
const blank = (text) => String(text || '').replace(/\[[^\]]*\]/g, '___').replace(/\{[^}]*\}/g, '___').trim();
const answerOf = (text) => String(text || '').match(/\[([^\]]*)\]\s*$/)?.[1] || '';
const variants = (v) => String(v || '').split('|').map((x) => x.trim()).filter(Boolean).join(' / ');

const perGap = (answers, source) => answers.map(({ key, accept }) => ({ prompt: blank(source[Number(String(key).split('.')[0])]), answer: (accept || []).map(variants).join(' / ') }));

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
    // one item per gap (the course explanations count gaps here), the line with blanks as its prompt
    case 'listening':
      return perGap(def.answers(d) || [], lines(d.sentences));
    case 'dialogue':
      return perGap(def.answers(d) || [], (d.lines || []).map((l) => [l.who === 'B' ? d.speakerB : d.speakerA, l.text].filter(Boolean).join(': ')));
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
    // R1: the situation and the ad's letter with its title
    case 'adsmatch':
      return (d.situations || []).map((s) => ({ prompt: s.text, answer: String(s.answer || '').split(/[|,/]/).map((x) => x.trim().toUpperCase()).filter(Boolean)
        .map((l) => { const ad = (d.ads || [])['ABCDEFGHIJKLMN'.indexOf(l)]; return ad?.title ? `${l} (${ad.title})` : l; }).join(' / ') }));
    // exam listening: the items of its choice / true-false / matching task
    case 'examlisten':
      return itemsOf({ ...block, type: ['choice', 'truefalse', 'match'].includes(d.mode) ? d.mode : 'choice' });
    default:
      if (typeof def?.answers !== 'function') return [];
      // a bare item number is no prompt: the key numbers the items itself (dictation, word order)
      return (def.answers(d, block) || []).map(({ key, accept }) => {
        const answer = (accept || []).map(variants).join(' / ');
        return { prompt: answer && /^[\d.]+$/.test(String(key)) ? '' : `${key}`, answer };
      });
  }
}

// data.teacher: how to run an open task (role play, speaking, a game) — also with one learner, when the teacher is the
// partner (docs/METHODOLOGY_STANDARD.md §3); course files: teach(block, note)
function taskKey(b, num) {
  const why = lines(b.data?.explain);
  const items = itemsOf(b).filter((it) => it.answer || it.prompt).map((it, i) => ({ n: i + 1, ...it, why: why[i] || '' }));
  // the listening script is for the teacher only (the editor says „õpilane ei näe”)
  const transcript = String(b.data?.transcript || '').trim();
  return { id: b.id, num, type: b.type, title: b.data?.title || BLOCKS[b.type]?.label || b.type, instruction: b.data?.instruction || '', note: String(b.data?.teacher || '').trim(), transcript, items };
}

export function answerKeyOf(doc) {
  const blocks = doc?.blocks || [];
  const nums = numberTasks(blocks);
  return blocks.filter((b) => BLOCKS[b.type]?.task).map((b) => taskKey(b, nums[b.id])).filter((t) => t.items.length || t.note);
}

// the key of one task, numbered as on the sheet (the teacher clicks a task in a live or review view); null for a
// block that is no task. An open task without answers still returns its note / script, or an empty item list.
export function blockAnswerKey(doc, blockId) {
  const blocks = doc?.blocks || [];
  const block = blocks.find((b) => b.id === blockId);
  if (!block || !BLOCKS[block.type]?.task) return null;
  return taskKey(block, numberTasks(blocks)[block.id]);
}

// how many items of a task have an explanation (quality check for course files)
export const explainedShare = (task) => (task.items.length ? task.items.filter((it) => it.why).length / task.items.length : 1);
