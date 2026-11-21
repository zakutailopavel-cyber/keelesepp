// Authoring helpers of lesson design v3 „stations” (docs/COURSE_DESIGN_STATIONS.md), used by the module files. Pure and
// node-importable (tools/listening-audio reads the module files with plain node): no block registry here — the gates and
// the teacher page are in stations.js.
//   station(block, n, minutes, { final, needs })  marks the first block of station n (its own input or card)
//   purpose(block, text)                           the task's purpose line: who does this, for whom, with what result

// the final task kinds rotate across a module (no two lessons with the same kind)
export const FINAL_KINDS = Object.freeze({ decide: 'otsustab', plan: 'planeerib', complain: 'kaebab', advise: 'annab nõu', explain: 'selgitab', negotiate: 'lepib kokku', present: 'esitleb' });
// block types that are not tasks (engine/registry.js `task: false`): a purpose line belongs to a task
export const NOT_TASKS = new Set(['text', 'notice', 'tip', 'image', 'vocab', 'wordstrip', 'chart', 'phrasebank', 'exampart', 'readcard', 'boardgame', 'graph', 'geofigure']);

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

// design v4: the lesson's exit check (docs/COURSE_DESIGN_STATIONS.md §7) — 2–3 quick scored items at the end of Kasuta;
// it is exempt from the 5–8 item rule and from „one closed task per station”
export const EXIT_ITEMS = Object.freeze([2, 3]);
export function exitCheck(block) {
  return { ...block, data: { ...block.data, exit: true } };
}

// design v4: a task done at home after the lesson (the 1-minute voice message): the level's in-class speaking length
// (B1 120–240 s) does not apply to it — the Harno B2 talk is one minute
export function homeTask(block) {
  return { ...block, data: { ...block.data, home: true } };
}

// design v4: the lesson's optional extension „Kui aega jääb” (10–15 min, owner 2026-11-17 round 3): a meaningful task on
// the topic for a lesson that runs faster than planned; not one of the 4 core stations, so their ≤ 75 min stay
export const EXTENSION_MINUTES = Object.freeze([10, 15]);
export function extension(block, minutes) {
  const title = String(block.data?.title || '').trim();
  return { ...block, data: { ...block.data, title: `Kui aega jääb · ${title} · ${minutes} min`, extension: { minutes } } };
}

// stored for the gates and the teacher page, shown in italics before the instruction
export function purpose(block, text) {
  if (NOT_TASKS.has(block.type)) throw new Error(`${block.id}: eesmärgirida on ülesande omadus`);
  const clean = String(text || '').trim();
  return { ...block, data: { ...block.data, purpose: clean, instruction: [`*${clean}*`, block.data?.instruction].filter(Boolean).join(' ') } };
}
