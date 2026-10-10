// Advisory material checklist (docs/MATERIAL_QUALITY_CHECKLIST.md). It measures the criteria a script can see on a
// worksheet document; the rest of the checklist is for a human reviewer. Nothing here blocks publishing — the hard
// gate stays in quality.js. Codes (K/A/J + number) match the document.
import { BLOCKS } from '../../../worksheet-studio/engine/registry.js';

const isTask = (b) => Boolean(BLOCKS[b.type]?.task);
const SKILLS = {
  reading: ['reading', 'dialogue'],
  listening: ['listening', 'dictation'],
  speaking: ['speaking', 'rolecards'],
  writing: ['writing', 'guidedletter'],
};
export const SKILL_LABELS = { reading: 'lugemine', listening: 'kuulamine', speaking: 'rääkimine', writing: 'kirjutamine' };
const TEXT_INPUT = ['reading', 'listening'];
const PRODUCTIVE = ['speaking', 'writing', 'rolecards', 'guidedletter'];
const OPEN = [...PRODUCTIVE, 'planning'];
const CONTROLLED = ['gaps', 'wordforms', 'table', 'transformation', 'dictation', 'translation', 'choice', 'truefalse', 'match', 'manymatch', 'categorize', 'crossword', 'wordsearch', 'errorfix', 'wordorder', 'pictures', 'clock', 'diagram'];
const CLOSING = ['selfcheck', 'rubric'];
const SUPPORT_BLOCKS = ['phrasebank', 'planning', 'vocab', 'notice', 'tip'];
const OPENING = ['text', 'image', 'tip', 'notice', 'vocab', 'dialogue', 'reading', 'listening', 'pictures'];
const INTERACTION = /\b(paaris|paarilise\w*|kaaslase\w*|rühmas|rühma\w*|grupis|klassikaaslase\w*|lugege|rääkige|küsige|arutage|vahetage|tutvustage|leppige|mängige|võrrelge)\b/i;
const BEYOND_CLASS = /\b(kodus|päriselus|veebis|internetis|küsi eestlaselt|tänaval|poes|linnas|väljas|telefonis|e-kirjaga saada)\b/i;
const DIFFERENTIATION = /(lisaülesanne|raskem variant|kergem variant|kui jõuad|kui oled valmis|boonus|tugevamale|kiiremale)/i;
// controlled exercises only: in a speaking / writing task the instruction is the situation itself
export const MAX_INSTRUCTION_WORDS = 20;

const tasks = (doc) => (doc.blocks || []).filter(isTask);
const instruction = (b) => String(b.data?.instruction || '').trim();
const words = (text) => text.split(/\s+/).filter(Boolean).length;
const hasImage = (b) => (b.type === 'image' && b.data?.src) || Boolean(b.data?.img) || Boolean(b.data?.image);

function hasSupport(block, index, blocks) {
  const d = block.data || {};
  if (block.type === 'speaking' && (d.tipText || d.questions)) return true;
  if (block.type === 'writing' && (d.keywords || d.tipText)) return true;
  if (block.type === 'guidedletter' && (d.opening || d.prompts)) return true;
  if (block.type === 'rolecards' && (d.phrasesA || d.phrasesB)) return true;
  return blocks.slice(0, index).some((b) => SUPPORT_BLOCKS.includes(b.type));
}

// one sheet → [{ code, text }]
export function sheetChecklist(doc) {
  const out = [];
  const blocks = doc.blocks || [];
  tasks(doc).filter((b) => !CLOSING.includes(b.type)).forEach((b) => {
    const text = instruction(b);
    if (!text) out.push({ code: 'J3', text: `„${b.data?.title || b.type}”: tööjuhis puudub` });
    else if (CONTROLLED.includes(b.type) && words(text) > MAX_INSTRUCTION_WORDS) out.push({ code: 'J3', text: `„${b.data?.title || b.type}”: tööjuhis ${words(text)} sõna (kuni ${MAX_INSTRUCTION_WORDS})` });
  });
  const firstFree = blocks.findIndex((b) => PRODUCTIVE.includes(b.type));
  if (firstFree >= 0) {
    const late = blocks.slice(firstFree + 1).filter((b) => CONTROLLED.includes(b.type));
    if (late.length) out.push({ code: 'J1', text: `kontrollitud harjutus vaba ülesande järel: ${late.map((b) => b.type).join(', ')}` });
  }
  blocks.forEach((b, i) => {
    if (PRODUCTIVE.includes(b.type) && !hasSupport(b, i, blocks)) out.push({ code: 'J2', text: `„${b.data?.title || b.type}”: loovülesandel pole tuge (fraasid, märksõnad, plaan)` });
  });
  if (doc.meta?.phase === 'discover' && blocks.length && !OPENING.includes(blocks[0].type)) out.push({ code: 'A5', text: `Avasta algab ülesandega „${blocks[0].type}”, mitte olukorra või sissejuhatusega` });
  if (!blocks.some((b) => CLOSING.includes(b.type))) out.push({ code: 'J5', text: 'lehel pole enesehinnangut ega rubriiki' });
  return out;
}

const skillsOf = (docs) => Object.keys(SKILLS).filter((skill) => docs.some((doc) => tasks(doc).some((b) => SKILLS[skill].includes(b.type))));

// all phases of one lesson → [{ code, text }]
export function lessonChecklist(docs) {
  const out = docs.flatMap((doc) => sheetChecklist(doc).map((p) => ({ ...p, phase: doc.meta?.phase || '' })));
  const missing = Object.keys(SKILLS).filter((skill) => !skillsOf(docs).includes(skill));
  if (missing.length) out.push({ code: 'A1', phase: '*', text: `tunnis puudub: ${missing.map((s) => SKILL_LABELS[s]).join(', ')}` });
  const all = docs.flatMap(tasks);
  if (!all.some((b) => b.type === 'rolecards' || INTERACTION.test(instruction(b)))) out.push({ code: 'A2', phase: '*', text: 'tunnis pole paaris- ega rühmatööd' });
  // a text read or heard in one phase is used again in speaking or writing in the same or a later phase
  const flat = docs.flatMap((doc) => doc.blocks || []);
  const firstText = flat.findIndex((b) => TEXT_INPUT.includes(b.type));
  if (firstText >= 0 && !flat.slice(firstText + 1).some((b) => PRODUCTIVE.includes(b.type))) out.push({ code: 'A3', phase: '*', text: 'loetud / kuulatud teksti ei kasutata hiljem suuliselt ega kirjalikult' });
  if (!all.some((b) => OPEN.includes(b.type))) out.push({ code: 'K1', phase: '*', text: 'tunnis pole avatud ülesannet (ühe õige vastuseta)' });
  if (!docs.some((doc) => (doc.blocks || []).some(hasImage))) out.push({ code: 'K2', phase: '*', text: 'tunnis pole ühtki pilti' });
  return out;
}

// { [lessonId]: [doc, …] } → { lessons: { [lessonId]: problems }, module: problems }
export function moduleChecklist(lessons) {
  const result = { lessons: {}, module: [] };
  Object.entries(lessons).forEach(([lessonId, docs]) => { result.lessons[lessonId] = lessonChecklist(docs); });
  const all = Object.values(lessons).flat().flatMap(tasks);
  const texts = all.map(instruction);
  if (!texts.some((t) => BEYOND_CLASS.test(t))) result.module.push({ code: 'K4', text: 'moodulis pole ülesannet väljaspool klassi (kodus, linnas, veebis)' });
  if (!all.some((b) => DIFFERENTIATION.test(`${b.data?.title || ''} ${instruction(b)}`))) result.module.push({ code: 'J4', text: 'moodulis pole lisa- ega kergemat varianti (diferentseerimine)' });
  return result;
}

export const LESSON_CODES = ['A1', 'A2', 'A3', 'A5', 'J1', 'J2', 'J3', 'J5', 'K1', 'K2'];
export const MODULE_CODES = ['K4', 'J4'];
