import { BLOCKS } from './engine/registry.js';
import { diagramHasContent } from './engine/blocks/diagramModel.js';

const text = (value) => String(value || '').trim();
const rows = (value) => String(value || '').split('\n').filter((x) => x.trim());

export function analyzeWorksheet(document) {
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
  if (!Object.keys(document?.meta?.goals || {}).length) issues.push({ level: 'warning', code: 'goals', text: 'Lisa vähemalt üks õpieesmärk, et tulemusi saaks eesmärkide kaupa jälgida.' });
  const errors = issues.filter((issue) => issue.level === 'error');
  return { ready: errors.length === 0, issues, errors, warnings: issues.filter((issue) => issue.level === 'warning') };
}
