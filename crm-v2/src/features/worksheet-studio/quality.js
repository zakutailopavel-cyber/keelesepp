import { BLOCKS } from './engine/registry.js';
import { diagramHasContent } from './engine/blocks/diagramModel.js';
import { didacticCheck } from './didactics/didacticCheck.js';

const text = (value) => String(value || '').trim();
const rows = (value) => String(value || '').split('\n').filter((x) => x.trim());

// `forms`: the EKI level vocabularies, once loaded (didactics/levelVocabulary.js)
export function analyzeWorksheet(document, { forms = null } = {}) {
  const issues = [];
  if (!text(document?.meta?.title) || text(document.meta.title) === 'Uus tööleht') issues.push({ level: 'warning', code: 'title', text: 'Anna töölehele sisuline pealkiri.' });
  if (!document?.blocks?.length) issues.push({ level: 'error', code: 'blocks', text: 'Lisa vähemalt üks ülesanne või sisublokk.' });
  const taskBlocks = (document?.blocks || []).filter((block) => BLOCKS[block.type]?.task);
  if (!taskBlocks.length) issues.push({ level: 'error', code: 'tasks', text: 'Lisa vähemalt üks õpilase tegevust nõudev ülesanne.' });
  taskBlocks.forEach((block, index) => {
    const d = block.data || {};
    const name = `${index + 1}. ${BLOCKS[block.type]?.label || block.type}`;
    if (!text(d.title)) issues.push({ level: 'error', code: `${block.id}:title`, text: `${name}: pealkiri puudub.` });
    if (!text(d.instruction)) issues.push({ level: 'warning', code: `${block.id}:instruction`, text: `${name}: juhis puudub.` });
    if (block.type === 'choice' && !(d.questions || []).every((q) => String(q.options || '').includes('*'))) issues.push({ level: 'error', code: `${block.id}:answers`, text: `${name}: märgi igas küsimuses vähemalt üks õige vastus tärniga.` });
    if (['gaps', 'dialogue', 'listening'].includes(block.type) && !JSON.stringify(d).includes('[')) issues.push({ level: 'error', code: `${block.id}:answers`, text: `${name}: lisa vähemalt üks vastus nurksulgudes.` });
    if (['wordforms', 'errorfix', 'crossword'].includes(block.type) && !(d.rows || []).every((r) => text(r.answer))) issues.push({ level: 'error', code: `${block.id}:answers`, text: `${name}: mõnel real puudub õige vastus.` });
    if (block.type === 'dictation' && !rows(d.sentences).length) issues.push({ level: 'error', code: `${block.id}:sentences`, text: `${name}: etteütluse tekst puudub.` });
    if (block.type === 'listening' && !d.audio?.src) issues.push({ level: 'warning', code: `${block.id}:audio`, text: `${name}: helifail puudub. Õpetaja saab teksti ise ette lugeda.` });
    if (block.type === 'diagram' && !diagramHasContent(d)) issues.push({ level: 'error', code: `${block.id}:nodes`, text: `${name}: skeemil pole ühtegi kasti.` });
    if (block.type === 'image' && !d.img?.src) issues.push({ level: 'warning', code: `${block.id}:image`, text: `${name}: pilt puudub.` });
  });
  // tips (do not block publishing): a balanced, not too long sheet
  const types = taskBlocks.map((block) => block.type);
  for (let i = 2; i < types.length; i += 1) {
    if (types[i] === types[i - 1] && types[i] === types[i - 2]) {
      issues.push({ level: 'tip', code: `${taskBlocks[i].id}:same-type`, text: `Nõuanne: ülesanded ${i - 1}–${i + 1} on sama tüüpi (${BLOCKS[types[i]]?.label || types[i]}). Vaheldus hoiab tähelepanu.` });
      break;
    }
  }
  if (taskBlocks.length > 10) issues.push({ level: 'tip', code: 'long', text: `Nõuanne: lehel on ${taskBlocks.length} ülesannet. Kas jagad selle kahe tunni peale?` });
  if (!Object.keys(document?.meta?.goals || {}).length) issues.push({ level: 'warning', code: 'goals', text: 'Lisa vähemalt üks õpieesmärk, et tulemusi saaks eesmärkide kaupa jälgida.' });
  // the level's didactic norms (didactics/levels.js): never blocking, shown as warnings and tips
  const didactics = didacticCheck(document || {}, { forms });
  issues.push(...didactics.issues);
  const errors = issues.filter((issue) => issue.level === 'error');
  return { ready: errors.length === 0, issues, errors, warnings: issues.filter((issue) => issue.level === 'warning'), tips: issues.filter((issue) => issue.level === 'tip'), didactics };
}
