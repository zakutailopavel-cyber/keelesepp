import { BLOCKS, numberTasks } from './registry.js';

// The auto-check's error list („Automaatselt tuvastatud vead”) in words a teacher reads at a glance:
// „Ülesanne 3 · Tingiv kõneviis — lause 1, lünk 1: õpilane kirjutas „õppin”, õige „õpiksin””.

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
    const hit = def.answers(block.data || {}).find((item) => item.key === key);
    if (hit?.accept?.length) return hit.accept.join(' / ');
  }
  const index = Number(key);
  if (Number.isInteger(index)) {
    const row = (block.data?.rows || [])[index] || (block.data?.items || [])[index];
    if (row?.answer) return String(row.answer).replace(/\|/g, ' / ');
  }
  return '';
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
    const answer = String(entry?.answer ?? '').trim();
    const task = block ? [numbers[block.id] ? `Ülesanne ${numbers[block.id]}` : BLOCKS[block.type]?.label, block.data?.title].filter(Boolean).join(' · ') : 'Ülesanne';
    const right = block ? expectedAnswer(block, sub) : '';
    const where = position(sub);
    return {
      task,
      where,
      answer,
      expected: right,
      text: `${task}${where ? ` — ${where}` : ''}: ${answer ? `õpilane kirjutas „${answer}”` : 'vastus puudub'}${right ? `, õige „${right}”` : ''}`,
    };
  });
}
