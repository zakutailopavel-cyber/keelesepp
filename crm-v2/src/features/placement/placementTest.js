// „Paigutustest” (owner 2026-10-23: входной тест на 15 минут с автоматическим уровнем): 30 multiple-choice questions,
// six per level A1 → C1, each level a goal of the sheet, so the ordinary auto-check gives a result per level
// (score.perGoal). The level is the highest one passed (≥ 60 %) with every level below it passed too.
// The sheet is a normal worksheet assignment: the student does it in „Kodutööd”, the teacher sees it like any sheet.
import { createBlock } from '../worksheet-studio/engine/registry.js';
import { newDocument } from '../worksheet-studio/engine/schema.js';

export const PLACEMENT_ID = 'placement-et';
export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
export const PASS = 60;

// one right option (*), the others plausible; written for KeeleSepp
const QUESTIONS = {
  A1: [
    ['Mina ___ Anna.', '*olen\non\noled'],
    ['Mis ___ nimi on?', '*sinu\nsina\nsind'],
    ['Ma elan ___.', '*Tallinnas\nTallinn\nTallinnasse'],
    ['Täna on esmaspäev, homme on ___.', '*teisipäev\npühapäev\nreede'],
    ['Mul on kaks ___.', '*venda\nvend\nvennad'],
    ['Ta ___ hommikul kohvi.', '*joob\njooma\njoon'],
  ],
  A2: [
    ['Eile ma ___ kinos.', '*käisin\nkäin\nkäima'],
    ['Me sõidame homme ___.', '*maale\nmaal\nmaalt'],
    ['Ma ei ___ täna tööle.', '*lähe\nlähen\nläinud'],
    ['Ma joon hommikul ___.', '*kohvi\nkohv\nkohvis'],
    ['See maja on ___ kui see.', '*suurem\nsuur\nsuurim'],
    ['Kas sa ___ eesti keelt?', '*räägid\nrääkima\nräägib'],
  ],
  B1: [
    ['Kui mul oleks aega, ___ ma sinuga kaasa.', '*tuleksin\ntulen\ntulin'],
    ['Mees, ___ seal seisab, on minu õpetaja.', '*kes\nmis\nmida'],
    ['Ma pean selle töö homseks ___.', '*lõpetama\nlõpetada\nlõpetan'],
    ['Mul on vaja arsti juurde ___.', '*minna\nminema\nlähen'],
    ['Ta ütles, et ta ___ homme.', '*tuleb\ntule\ntulnud'],
    ['Ma ei ole teda ammu ___.', '*näinud\nnäha\nnägin'],
  ],
  B2: [
    ['Inimesed räägivad, et ta ___ eile Tartus olnud.', '*olevat\noleks\non'],
    ['Kui ma oleksin seda teadnud, ___ ma teisiti teinud.', '*oleksin\nolin\nolen'],
    ['Uus seadus ___ eelmisel nädalal vastu.', '*võeti\nvõttis\nvõetakse'],
    ['Tänu ___ abile sain töö õigeks ajaks valmis.', '*sinu\nsinule\nsind'],
    ['Matk lükkus edasi ___ ilma tõttu.', '*halva\nhalb\nhalba'],
    ['___ oli vihmane, läksime matkama.', '*Kuigi\nSest\nEt'],
  ],
  C1: [
    ['Otsus tehti ___ arvestamata, et paljud olid vastu.', '*sellega\nsee\nselle'],
    ['Ettepanek ei leidnud ___.', '*toetust\ntoetus\ntoetuse'],
    ['Vaatamata ___ jätkasime tööd.', '*raskustele\nraskused\nraskuste'],
    ['Ta ei muretsenud, vaid võttis asja ___.', '*kergelt\nraskelt\nsügavalt'],
    ['Lepingu ___ eest vastutab juhatus.', '*täitmise\ntäitma\ntäitmine'],
    ['Mida rohkem sa harjutad, ___ paremini sa räägid.', '*seda\nsee\nsellega'],
  ],
};

export function placementDocument() {
  const doc = newDocument();
  doc.meta = {
    ...doc.meta,
    title: 'Paigutustest · eesti keel',
    subtitle: 'Umbes 15 minutit. Vasta nii, nagu oskad — arvata ei ole vaja.',
    level: 'A1–C1',
    goals: Object.fromEntries(LEVELS.map((level) => [`g_${level.toLowerCase()}`, `Tase ${level}`])),
  };
  doc.blocks = LEVELS.map((level, index) => {
    const block = createBlock('choice');
    block.id = `pt_${level.toLowerCase()}`;
    block.goal = `g_${level.toLowerCase()}`;
    block.data = { ...block.data, title: `${index + 1}. osa`, instruction: 'Vali õige vastus.', questions: QUESTIONS[level].map(([q, options]) => ({ q, options })) };
    return block;
  });
  return doc;
}

// the level from a submitted test's per-goal result: highest passed with all below passed; below A1 → 'A0'
export function placementLevel(perGoal = {}) {
  const results = LEVELS.map((level) => {
    const g = perGoal[`g_${level.toLowerCase()}`] || { ok: 0, total: 0 };
    return { level, ok: Number(g.ok) || 0, total: Number(g.total) || 0, pct: g.total ? Math.round((g.ok / g.total) * 100) : 0 };
  });
  let level = 'A0';
  for (const row of results) { if (row.total && row.pct >= PASS) level = row.level; else break; }
  return { level, results };
}

// the item the library assigns (libraryService.assign): a normal worksheet assignment
export function placementItem() {
  const doc = placementDocument();
  return { sourceId: PLACEMENT_ID, type: 'worksheet', title: doc.meta.title, subject: 'Eesti keel', level: 'A1–C1', topic: 'Paigutustest', source: { worksheetDoc: doc, publishedWorksheetDoc: doc, worksheetDocStatus: 'published', files: [] } };
}
