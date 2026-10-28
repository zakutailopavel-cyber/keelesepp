// Where a task is done (owner 2026-10-28: „катастрофически не хватает разговорных заданий … сверить с дидактикой, куда
// их лучше интегрировать”; docs/COURSE_FINAL_SHAPE_B1.md §8 V16). A pair task — role cards, an exam speaking card,
// talking with a partner — happens in the lesson with the teacher as the partner; at home it cannot be done and must not
// pull the result down. Alone at home the learner records a monologue (the speaking block records the voice).
// `block.inLesson` set by hand wins (true / false); otherwise the block type, the catalogue task and the instruction decide.

export const PAIR_TYPES = new Set(['rolecards', 'speakcard']);
// catalogue tasks that need a second speaker (didactics/taskCatalogue.js §3.4)
export const PAIR_TASKS = new Set(['S03', 'S04', 'S05', 'S10', 'S12']);
const PAIR_TEXT = /paarilis|paaris|rühmas|grupis|\bA ja B\b|teineteise|kuulajale|klassikaaslas|vestluskaaslas|partneri/i;

export function isInLesson(block = {}) {
  if (block.inLesson === true || block.inLesson === false) return block.inLesson;
  if (PAIR_TYPES.has(block.type)) return true;
  if (block.type !== 'speaking') return false;
  if (PAIR_TASKS.has(block.tag?.task)) return true;
  return PAIR_TEXT.test(`${block.data?.title || ''} ${block.data?.instruction || ''}`);
}

export const IN_LESSON_LABEL = 'Teeme tunnis koos õpetajaga';
