import { catalogueBlocks } from './catalogue.js';
import { sampleDocument } from '../../features/worksheet-studio/engine/sample.js';

// the page of a scanned worksheet with fields placed on it at x/y (assignment.files, interactiveOverlay)
const PAGE = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1240" height="1754"><rect width="1240" height="1754" fill="#fff"/><text x="80" y="120" font-size="44">Tööleht: täida lüngad</text><text x="80" y="300" font-size="30">1. Ma elan ______ linnas.</text><text x="80" y="500" font-size="30">2. Kirjuta oma päevast:</text><text x="80" y="1000" font-size="30">3. Vali õige:</text><text x="80" y="1200" font-size="30">4. Märgi:</text></svg>')}`;
export const overlayFiles = () => [{
  name: 'tooleht-1.png', url: PAGE, type: 'image/png',
  interactiveOverlay: { version: 1, elements: [
    { id: 'short', type: 'input', label: 'Lünk 1', x: .36, y: .155, w: .18, h: .025, correctAnswer: 'Tartu' },
    { id: 'essay', type: 'textarea', label: 'Minu päev', x: .07, y: .3, w: .85, h: .22, correctAnswer: '' },
    { id: 'pick', type: 'choice', x: .3, y: .555, w: .22, h: .025, options: ['elan', 'elab', 'elavad'], correctAnswer: 'elan' },
    { id: 'tick', type: 'checkbox', label: 'Olen valmis', x: .22, y: .668, w: .025, h: .018, correctAnswer: 'true' },
    { id: 'word', type: 'word', text: 'linnas', translation: 'в городе', x: .5, y: .155, w: .1, h: .025 },
  ] },
}];

// a v1 structured worksheet (assignment.worksheetData), which still opens in the old player
export const legacyWorksheetData = () => ({ blocks: [
  { id: 'l1', type: 'text', label: 'Sissejuhatus', content: 'Loe tekst läbi.' },
  { id: 'l2', type: 'fill', label: 'Täida lüngad', text: 'Ma [elan] Tartus ja mu sõber [töötab] Tallinnas.' },
  { id: 'l3', type: 'choice', label: 'Vali', questions: [{ q: 'Mis kell?', opts: ['kell 7', 'kell 8'], correct: 0 }] },
  { id: 'l4', type: 'match', label: 'Ühenda', pairs: [{ l: 'hommik', r: 'утро' }, { l: 'õhtu', r: 'вечер' }] },
  { id: 'l5', type: 'writing', label: 'Kirjuta', task: 'Kirjuta oma päevast', lines: 5 },
  { id: 'l6', type: 'order', label: 'Järjesta', sentence: 'Ma elan Tartus' },
  { id: 'l7', type: 'table', label: 'Tabel', headers: ['Üks', 'Kaks', 'Kolm', 'Neli'], rows: 2 },
  { id: 'l8', type: 'dialogue', label: 'Dialoog', lines: [{ speaker: 'Mari', text: 'Tere, [kuidas] läheb?' }] },
  { id: 'l9', type: 'error_correction', label: 'Paranda', sentences: [{ wrong: 'Ma lähen koolis.', correct: 'Ma lähen kooli.' }] },
  { id: 'l10', type: 'translate', label: 'Tõlgi', items: [{ l: 'tere', r: 'привет' }] },
] });

// what a teacher builds by hand: half-width blocks side by side, taller blocks, joined blocks, a theme
export function personalDoc() {
  const all = catalogueBlocks();
  const pick = (type) => all.find((block) => block.type === type);
  const half = (block, span = 6) => ({ ...block, span, width: 'half' });
  return { ...sampleDocument(), id: 'lab-personal', meta: { ...sampleDocument().meta, title: 'Minu õpilase tööleht', theme: 'kids' }, blocks: [
    half(pick('image'), 4), { ...half(pick('text'), 8), tone: 'peach' }, half(pick('gaps')), { ...half(pick('match')), joined: true }, half(pick('truefalse'), 3), half(pick('writing'), 9),
    { ...pick('table'), span: 12 }, { ...pick('choice'), pageBreakBefore: true },
  ] };
}
