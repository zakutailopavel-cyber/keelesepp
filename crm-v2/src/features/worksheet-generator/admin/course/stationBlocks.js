// Authoring helpers of lesson design v3 „stations” (docs/COURSE_DESIGN_STATIONS.md), used by the module files. Pure and
// node-importable (tools/listening-audio reads the module files with plain node): no block registry here — the gates and
// the teacher page are in stations.js.
//   station(block, n, minutes, { final, needs })  marks the first block of station n (its own input or card)
//   purpose(block, text)                           the task's purpose line: who does this, for whom, with what result

// the final task kinds rotate across a module (no two lessons with the same kind)
export const FINAL_KINDS = Object.freeze({ decide: 'otsustab', plan: 'planeerib', complain: 'kaebab', advise: 'annab nõu', explain: 'selgitab', negotiate: 'lepib kokku', present: 'esitleb' });
// block types that are not tasks (engine/registry.js `task: false`): a purpose line belongs to a task
export const NOT_TASKS = new Set(['text', 'notice', 'tip', 'image', 'vocab', 'wordstrip', 'chart', 'phrasebank', 'exampart', 'readcard']);

// the field a block shows as its heading
const TITLE_FIELD = { text: 'heading', chart: 'chartTitle' };
export const fallbackLine = (needs) => `**Kui jätsid jaama ${needs.from} vahele, kasuta seda kaarti:** ${needs.card}`;

export function station(block, n, minutes, { final = '', needs = null } = {}) {
  if (!Number.isInteger(n) || n < 1) throw new Error(`${block.id}: jaama number peab olema 1, 2, …`);
  if (final && !FINAL_KINDS[final]) throw new Error(`${block.id}: lõpuülesande liik ${final} on tundmatu (${Object.keys(FINAL_KINDS).join(', ')})`);
  if (needs && (!Number.isInteger(needs.from) || !String(needs.card || '').trim())) throw new Error(`${block.id}: sõltuvusel on vaja jaama numbrit (from) ja asenduskaarti (card)`);
  const field = TITLE_FIELD[block.type] || 'title';
  const title = String(block.data?.[field] || '').trim().replace(/[.]$/, '');
  const data = { ...block.data, [field]: `Jaam ${n} · ${title} · ${minutes} min`, station: { n, title, minutes, ...(final ? { final } : {}), ...(needs ? { needs } : {}) } };
  // the fallback card is printed where the learner reads: in the card's text or in the task's instruction
  if (needs) {
    const key = block.type === 'text' ? 'text' : 'instruction';
    data[key] = [data[key], fallbackLine(needs)].filter(Boolean).join('\n\n');
  }
  return { ...block, data };
}

// stored for the gates and the teacher page, shown in italics before the instruction
export function purpose(block, text) {
  if (NOT_TASKS.has(block.type)) throw new Error(`${block.id}: eesmärgirida on ülesande omadus`);
  const clean = String(text || '').trim();
  return { ...block, data: { ...block.data, purpose: clean, instruction: [`*${clean}*`, block.data?.instruction].filter(Boolean).join(' ') } };
}
