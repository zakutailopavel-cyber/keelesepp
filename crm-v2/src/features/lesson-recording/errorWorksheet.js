// „Tee tööleht vigadest”: a draft worksheet made from the learner's own errors in one lesson (the corrections come
// from TartuNLP's model on the school Mac, see TranscriptView → LessonAi). Nothing is invented: every sentence is one
// the learner said, and its corrected form. The teacher opens the draft in the constructor, checks it and assigns it.
import { createBlock } from '../worksheet-studio/engine/registry.js';
import { newDocument } from '../worksheet-studio/engine/schema.js';
import { wordDiff } from './lessonTimeline.js';

const MAX_ROWS = 10;
const strip = (w) => String(w || '').replace(/^[„"«(]+|[.,!?;:…"”»)]+$/g, '');

// the first changed place of a correction: the words said there and the right words (with sentence punctuation kept
// outside the gap)
export function firstChange(said, corrected) {
  const diff = wordDiff(said, corrected);
  const start = diff.findIndex((d) => d.type !== 'same');
  if (start < 0) return null;
  let end = start;
  while (end < diff.length && diff[end].type !== 'same') end += 1;
  const part = diff.slice(start, end);
  const wrong = part.filter((d) => d.type === 'del').map((d) => strip(d.text)).join(' ');
  const right = part.filter((d) => d.type === 'ins').map((d) => strip(d.text)).join(' ');
  if (!right) return null;
  // the corrected sentence with the right words as a gap: „Eriti palju räägitakse [toidu] raiskamisest.”
  const words = diff.filter((d) => d.type !== 'del');
  const insAt = words.findIndex((d) => d === part.find((p) => p.type === 'ins'));
  const insCount = part.filter((d) => d.type === 'ins').length;
  const tail = (words[insAt + insCount - 1]?.text || '').match(/[.,!?;:…"”»)]+$/)?.[0] || '';
  const gapped = [...words.slice(0, insAt).map((d) => d.text), `[${right}]${tail}`, ...words.slice(insAt + insCount).map((d) => d.text)].join(' ');
  return { wrong, right, gapped };
}

export function errorsWorksheet({ errors = [], studentName = '', date = '', level = '' } = {}) {
  const usable = errors.filter((e) => e?.said && e?.corrected && !e.unsure).slice(0, MAX_ROWS);
  if (!usable.length) return null;
  const doc = newDocument();
  doc.meta = { ...doc.meta, title: `Minu vead tunnist${date ? ` ${date}` : ''}`, subtitle: studentName ? `${studentName} · laused tunnist` : 'Laused tunnist', ...(level ? { level } : {}) };
  const fix = createBlock('errorfix');
  fix.data = { ...fix.data, title: 'Leia ja paranda viga.', instruction: 'Need laused ütlesid sa tunnis. Kirjuta need õigesti.', rows: usable.map((e) => ({ wrong: e.said, answer: e.corrected })) };
  const changes = usable.map((e) => firstChange(e.said, e.corrected)).filter(Boolean);
  const blocks = [fix];
  if (changes.length) {
    const gaps = createBlock('gaps');
    gaps.data = { ...gaps.data, title: 'Täienda laused.', instruction: 'Kirjuta lünka õige sõna või vorm.', sentences: changes.map((c) => c.gapped).join('\n'), bank: '', showBank: 'no' };
    blocks.push(gaps);
    const forms = changes.filter((c) => c.wrong && c.wrong.split(' ').length === 1 && c.right.split(' ').length === 1 && c.wrong.toLocaleLowerCase('et') !== c.right.toLocaleLowerCase('et'));
    if (forms.length) {
      const wf = createBlock('wordforms');
      wf.data = { ...wf.data, title: 'Moodusta õige vorm.', instruction: 'Vasakul on vorm, mille sa tunnis ütlesid. Kirjuta õige vorm.', rows: forms.map((c) => ({ base: c.wrong, prompt: 'õige vorm', answer: c.right })) };
      blocks.push(wf);
    }
  }
  doc.blocks = blocks;
  return doc;
}
