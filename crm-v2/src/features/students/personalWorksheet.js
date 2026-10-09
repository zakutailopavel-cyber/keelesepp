// „Isiklik tööleht”: a draft made from what the CRM knows about one learner (docs/DIDACTIC_ENGINE.md, step 6):
//   his own errors from recorded lessons (TartuNLP corrections) → „Leia ja paranda viga”, gaps, word forms
//   his words due for repetition („Minu sõnad”) → vocabulary + matching
//   his weakest of speaking / writing (automatic „Areng”) → one task with his level's amounts (didactics/levels.js)
// Nothing is invented; the teacher checks the draft in the constructor and assigns it.
import { createBlock } from '../worksheet-studio/engine/registry.js';
import { newDocument } from '../worksheet-studio/engine/schema.js';
import { isDue } from '../vocabulary/wordsModel.js';
import { levelProfile } from '../worksheet-studio/didactics/levels.js';
import { errorsWorksheet } from '../lesson-recording/errorWorksheet.js';

const MAX_WORDS = 10;

export function personalWorksheet({ student = {}, lessons = [], words = [], skills = [], now = Date.now() } = {}) {
  const norm = levelProfile(student.level);
  const level = norm.label.replace('A2+/B1-', 'B1');
  // the newest lessons first, their errors together (at most 8, as said and as corrected)
  const errors = [...lessons].sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)))
    .flatMap((lesson) => (Array.isArray(lesson.analysis?.errors) ? lesson.analysis.errors : [])).filter((e) => !e.unsure).slice(0, 8);
  const fromErrors = errorsWorksheet({ errors, studentName: student.name || '' })?.blocks || [];
  const due = words.filter((w) => w.word && w.translation && isDue(w, now))
    .sort((a, b) => (a.box || 0) - (b.box || 0)).slice(0, MAX_WORDS);
  const blocks = [];
  const goals = {};
  if (due.length >= 4) {
    const vocab = createBlock('vocab');
    vocab.data = { ...vocab.data, title: 'Minu sõnad', words: due.map((w) => `${w.word} - ${w.translation}`).join(', '), columns: '3' };
    const match = createBlock('match');
    match.data = { ...match.data, title: 'Ühenda sõna ja tõlge.', instruction: 'Need on sinu sõnad. Leia paar.', pairs: due.map((w) => ({ left: w.word, right: w.translation })) };
    match.goal = 'g_words';
    goals.g_words = 'Kordan oma sõnu';
    blocks.push(vocab, match);
  }
  if (fromErrors.length) {
    fromErrors.forEach((b) => { b.goal = 'g_errors'; });
    goals.g_errors = 'Parandan oma vead tunnist';
    blocks.push(...fromErrors);
  }
  // the weaker of speaking and writing gets one task with the level's amounts
  const productive = skills.filter((s) => s.skill === 'Rääkimine' || s.skill === 'Kirjutamine').sort((a, b) => a.pct - b.pct)[0];
  const write = productive?.skill === 'Kirjutamine';
  const task = createBlock(write ? 'writing' : 'speaking');
  if (write) {
    const [lo, hi] = norm.writing.sentences || norm.writing.words.map((w) => Math.round(w / 12));
    task.data = { ...task.data, title: 'Kirjuta.', instruction: `Kirjuta oma nädalast (${lo}–${hi} lauset). Kasuta oma uusi sõnu.`, minSent: lo, maxSent: hi, keywords: due.slice(0, 6).map((w) => w.word).join(', '), minKeywords: Math.min(3, due.length) };
  } else {
    const [lo, hi] = norm.speaking;
    task.data = { ...task.data, title: 'Räägi.', instruction: `Vasta küsimustele. Räägi ${Math.round(lo / 60) || 1}–${Math.max(1, Math.round(hi / 60))} minutit.`, questions: 'Mida sa sel nädalal tegid?\nMis oli kõige huvitavam?\nMida sa järgmisel nädalal teed?', minSec: lo, maxSec: hi };
  }
  task.goal = 'g_use';
  goals.g_use = write ? 'Kirjutan iseseisvalt' : 'Räägin iseseisvalt';
  blocks.push(task);
  if (blocks.length < 2) return null;
  const doc = newDocument();
  doc.meta = { ...doc.meta, title: `Isiklik tööleht${student.name ? ` · ${student.name}` : ''}`, subtitle: 'Sinu vead, sinu sõnad, sinu järgmine samm', level, goals };
  doc.blocks = blocks;
  return { document: doc, summary: { errors: errors.length, words: due.length, task: write ? 'Kirjutamine' : 'Rääkimine' } };
}
