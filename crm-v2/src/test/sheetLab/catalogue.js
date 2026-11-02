import { BLOCKS, createBlock, paletteEntries } from '../../features/worksheet-studio/engine/registry.js';

// Every block of the catalogue, filled harder than a teacher's first draft: the widest table, the longest words, the most
// columns the constructor allows. Used by the layout check (e2e/layout), never by the app.
const PIC = (hue) => ({ src: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200"><rect width="1600" height="1200" fill="hsl(${hue},60%,80%)"/><circle cx="800" cy="600" r="380" fill="hsl(${hue},60%,50%)"/></svg>`)}`, focus: { x: 50, y: 50 } });
const AUDIO = { src: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=' };
const LONG = 'kolmekümneviieaastaseksjuubeliks';

const STRESS = {
  gaps: { bank: 'hommikul, päeval, õhtul, tavaliselt, enne, pärast, üheksandal, kolmekümnendal', sentences: `Ma ärkan [hommikul] kell 7 ja lähen ${LONG} tööle.\nMa söön lõunat [päeval] koos [kolleegidega].\n[Mina olen seda juba mitu korda teinud ja teen uuesti.]` },
  choice: { questions: [{ q: 'Mis kell sa ärkad, kui homme on tööpäev ja buss väljub kell seitse?', options: `*Ma ärkan kell kuus, sest buss väljub vara ja ma ei taha hiljaks jääda.\nMa ärkan kell 23.\n${LONG}` }, { q: 'Vali kaks.', options: '*üks\n*kaks\nkolm' }] },
  truefalse: { statements: [{ text: 'Päeval on pime ja öösel on valge, kuid suvel on see vastupidi.', answer: 'false' }, { text: LONG, answer: 'true' }] },
  match: { pairs: [{ left: 'hommikul ärkan ma kell seitse ja joon kohvi', right: 'morning, when I wake up at seven and drink coffee' }, { left: 'õhtul', right: 'evening' }, { left: 'öösel', right: LONG }, { left: 'päeval', right: 'daytime' }] },
  manymatch: { left: 'ärkan\nsöön lõunat koos kolleegidega\nlähen magama', right: 'hommikul\npäeval\nõhtul' },
  pictures: { columns: '4', mode: 'order', items: [1, 2, 3, 4].map((n) => ({ img: PIC(n * 60), caption: `Pilt number ${n}`, answer: String(n) })) },
  clock: { columns: '6', items: ['07:00', '08:30', '12:00', '15:15', '18:45', '21:00'].map((time) => ({ time, extra: '' })) },
  cloze: { passage: `Eelmisel nädalal {*alustasin|alustan|alustama|alustavat} uues töökohas. Esimesel päeval {*tutvustas|tutvustab|tutvustada} juhataja mulle ${LONG} kolleege. Mulle {*meeldib väga pikk variant, mis ei mahu ühele reale|meeldin|meeldima} see töö väga.` },
  table: { headers: 'Nimetav, Omastav, Osastav, Sisseütlev, Seesütlev, Seestütlev', rows: `maja | [maja] | [maja] | [majja] | [majas] | [majast]\n${LONG} | [kooli] | siin ei [viibita] | [kooli] | [koolis] | [koolist]\n\nkool | | | | |` },
  categorize: { groups: [{ name: 'Hommikul', words: 'ärkan, söön hommikusööki, joon kohvi' }, { name: 'Päeval', words: 'töötan, söön lõunat' }, { name: 'Õhtul', words: 'vaatan filmi, lähen magama' }, { name: 'Öösel', words: 'magan' }] },
  wordorder: { sentences: 'Ma ärkan tavaliselt iga päev kell seitse hommikul.\nÕhtul ma vaatan koos perega filmi.' },
  reading: { audio: AUDIO, passage: `Mari ärkab tavaliselt kell seitse. ${LONG} hommikul ta joob kohvi ja läheb tööle.\n\nÕhtul ta loeb.`, questions: 'Mis kell Mari ärkab? [kell seitse|seitse|7]\nMida Mari hommikul joob? [kohvi]' },
  listening: { audio: AUDIO, sentences: 'Mari ärkab kell [seitse|7].\nTa joob [kohvi].' },
  dialogue: { audio: AUDIO },
  examlisten: { audio: AUDIO, mode: 'match', pairs: [{ left: 'Kõneleja 1', right: 'Ta armastab sporti ja käib iga päev jooksmas' }, { left: 'Kõneleja 2', right: 'Ta sõidab tööle bussiga' }, { left: 'Kõneleja 3', right: LONG }], questions: [], statements: [] },
  picmatch: { columns: '6', items: [1, 2, 3, 4, 5, 6].map((n) => ({ img: PIC(n * 50), word: n === 3 ? LONG : `sõna ${n}` })) },
  scenelabel: { img: PIC(200), columns: '3', pins: [{ x: 10, y: 10, answer: 'pööning' }, { x: 90, y: 10, answer: 'vannituba' }, { x: 10, y: 90, answer: 'köök' }, { x: 90, y: 90, answer: 'garaaž' }] },
  profiles: { columns: '6' },
  picrows: { rows: [{ img: PIC(100), text: 'Anna ostis poest kümme vihmavarju.', question: 'Miks ta seda tegi?' }] },
  image: { img: PIC(30), caption: 'Allkiri pildi all', bubble: 'Minu päev algab kell seitse' },
  vocab: { columns: '4', words: `hommikul, päeval, õhtul, öösel, tavaliselt, enne, pärast, ${LONG}` },
  wordstrip: { items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({ img: PIC(n * 30), word: `sõna ${n}` })) },
  speaking: { img: PIC(70), aspect: '4:3', bubble: 'Tere!', tipTitle: 'Vihje', tipText: 'Räägi rahulikult\nVaata pilti' },
  writing: { img: PIC(160), keywords: 'hommikul, päeval, õhtul, tavaliselt, enne, pärast, kolmekümneviieaastane' },
  crossword: { rows: [{ clue: 'Koht, kus õpitakse', answer: 'kool' }, { clue: 'Inimene, kes õpetab', answer: 'õpetaja' }, { clue: 'Mitte kunagi', answer: 'kooliõpetajaamet' }, { clue: 'Hommikul', answer: 'tartu' }, { clue: 'Raamat', answer: 'raamatukogu' }] },
  wordsearch: { size: 16, words: `kool, õpetaja, tund, hinne, raamat, ${LONG}` },
  tracing: { rows: [{ text: 'A', repeat: 12 }, { text: 'ema', repeat: 8 }, { text: 'kooliõpetaja', repeat: 4 }] },
  letterhunt: { grid: 'A M a S O K L A T a E A\nK L A T a E A N U I O a\nE A N U I O a M A L K L' },
  counting: { items: [{ icon: '🍎', count: 20 }, { icon: '🐟', count: 5 }, { icon: '🎈', count: 2 }, { icon: '⭐', count: 4 }] },
  examrubric: { criteria: [{ name: 'Ülesande täitmine', hint: 'Kõik sisupunktid on kirjas.', max: 10 }, { name: 'Sõnavara', hint: 'Sobiv ja mitmekesine.', max: 3 }] },
  speakcard: { ideas: [1, 2, 3, 4].map((n) => ({ text: `idee ${n}`, img: PIC(n * 40) })) },
  adsmatch: { ads: [{ title: 'Ujula', text: 'Avatud iga päev kell 7–21. Laste ujumistunnid laupäeviti.' }, { title: LONG, text: 'Uued raamatud ja ajakirjad.' }, { title: 'Rattarent', text: 'Jalgrattad päevaks.' }] },
};

const marks = [{ id: 'm1', kind: 'arrow', x1: 10, y1: 10, x2: 60, y2: 40, color: 'red' }, { id: 'm2', kind: 'note', x: 55, y: 8, w: 40, text: 'Märka seda!', color: 'navy' }, { id: 'm3', kind: 'sticker', x: 90, y: 4, size: 12, emoji: '⭐' }];

// opts: authors can give a task columns, a size, a fixed height, a frame and a mark layer
const EXTRA = (block) => {
  if (block.type === 'gaps') return { ...block, opts: { cols: 3, size: 'large' }, minHeightMm: 120, look: { frame: 'bold', head: 'band', num: 'square', accent: 'green', icon: 'write' }, marks };
  if (block.type === 'choice') return { ...block, opts: { cols: 2, example: true, shuffle: false, keepOrder: true } };
  if (block.type === 'truefalse') return { ...block, opts: { cols: 2 } };
  if (block.type === 'reading') return { ...block, opts: { cols: 2, size: 'small' } };
  if (block.type === 'selfcheck') return { ...block, opts: { cols: 3 } };
  return block;
};

export function catalogueBlocks() {
  const hidden = Object.values(BLOCKS).filter((def) => def.hidden).map((def) => ({ key: def.type }));
  return [...paletteEntries(), ...hidden].map((entry, i) => {
    const made = createBlock(entry.key);
    const id = `b${i}_${entry.key.replace(':', '_')}`;
    return EXTRA({ ...made, id, data: { ...made.data, ...(STRESS[made.type] || {}) } });
  });
}

export const catalogueTypes = () => Object.keys(BLOCKS);
