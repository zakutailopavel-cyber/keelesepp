import { BLOCKS, numberTasks } from './registry.js';

// The auto-check's error list („Automaatselt tuvastatud vead”) in words a teacher reads at a glance:
// „Ülesanne 3 · Tingiv kõneviis — lause 1, lünk 1: õpilane kirjutas „õppin”, õige „õpiksin””. In a task with options the
// answer is stored as the option's number: it is shown as the option's text („õpilane valis „teha””). Display only: the
// sheet is checked on the stored value, by the block's own `score`.

function position(key) {
  const [row, gap] = String(key || '').split('.');
  if (row === undefined || row === '' || Number.isNaN(Number(row))) return '';
  if (gap !== undefined && !Number.isNaN(Number(gap))) return `lause ${Number(row) + 1}, lünk ${Number(gap) + 1}`;
  return `${Number(row) + 1}. vastus`;
}

export function expectedAnswer(block, key) {
  const def = BLOCKS[block?.type];
  if (!def) return '';
  if (typeof def.answers === 'function') {
    const hit = def.answers(block.data || {}, block).find((item) => item.key === key);
    if (hit?.accept?.length) return hit.accept.join(' / ');
  }
  const index = Number(key);
  if (Number.isInteger(index)) {
    const row = (block.data?.rows || [])[index] || (block.data?.items || [])[index];
    if (row?.answer) return String(row.answer).replace(/\|/g, ' / ');
  }
  return '';
}

// what the learner answered, in words: the option behind a stored number; '' when it is no longer on the sheet
export function givenAnswer(block, key, answer) {
  const def = BLOCKS[block?.type];
  const raw = String(answer ?? '').trim();
  if (!raw || typeof def?.answerText !== 'function') return raw;
  return def.answerText(block.data || {}, key, raw, block) || '';
}

export function describeAutoErrors(worksheetDoc, errorLog = []) {
  const blocks = worksheetDoc?.blocks || [];
  const numbers = numberTasks(blocks);
  return (errorLog || []).map((entry) => {
    const raw = String(entry?.key || '');
    const split = raw.indexOf(':');
    const blockId = split > 0 ? raw.slice(0, split) : raw;
    const sub = split > 0 ? raw.slice(split + 1) : '';
    const block = blocks.find((item) => item.id === blockId);
    const stored = String(entry?.answer ?? '').trim();
    const picked = Boolean(stored) && typeof BLOCKS[block?.type]?.answerText === 'function';
    const answer = block ? givenAnswer(block, sub, stored) : stored;
    const task = block ? [numbers[block.id] ? `Ülesanne ${numbers[block.id]}` : BLOCKS[block.type]?.label, block.data?.title].filter(Boolean).join(' · ') : 'Ülesanne';
    const right = (block && BLOCKS[block.type]?.expectedText?.(block.data || {}, sub)) || (block ? expectedAnswer(block, sub) : '');
    const where = position(sub);
    return {
      task,
      where,
      answer,
      expected: right,
      text: `${task}${where ? ` — ${where}` : ''}: ${answer ? `õpilane ${picked ? 'valis' : 'kirjutas'} „${answer}”` : picked ? 'õpilase valikut ei leitud' : 'vastus puudub'}${right ? `, õige „${right}”` : ''}`,
    };
  });
}
