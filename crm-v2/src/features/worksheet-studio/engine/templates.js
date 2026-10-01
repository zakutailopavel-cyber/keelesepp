import { createBlock } from './registry.js';
import { newDocument } from './schema.js';

export function formalLetterDocument() {
  const doc = newDocument();
  doc.meta = { ...doc.meta, title: 'Kiri linnavalitsusele', subtitle: 'Ametlik kiri: probleemi kirjeldamine, põhjendamine ja lahenduse pakkumine', level: 'B1', module: 'Kirjutamine', canDo: 'Kirjutan selge ja viisaka ametliku kirja.', goals: { g_plan: 'Planeerin kirja põhiideed.', g_write: 'Kirjutan 120–150-sõnalise ametliku kirja.', g_review: 'Kontrollin kirja sisu ja keelt.' } };
  const planning = createBlock('planning'); planning.goal = 'g_plan';
  const structure = createBlock('table'); structure.data = { title: 'Kirja ülesehitus.', instruction: 'Kasuta osi õiges järjekorras.', headers: 'Osa, Eesmärk, Näide', rows: 'Pöördumine | Kellele kirjutad | Lugupeetud linnavalitsuse esindaja\nKirja põhjus | Miks kirjutad | Soovin juhtida tähelepanu …\nProbleem ja mõju | Mis toimub | Praegu … See mõjutab …\nLahendus | Mida palud | Teen ettepaneku …\nLõpetus | Viisakas lõpp | Lugupidamisega' };
  const phrases = createBlock('phrasebank');
  const letter = createBlock('guidedletter'); letter.goal = 'g_write'; letter.pageBreakBefore = true;
  const rubric = createBlock('rubric'); rubric.goal = 'g_review';
  doc.blocks = [planning, structure, phrases, letter, rubric];
  return doc;
}
