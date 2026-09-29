// "+ Lisa" on the sheet (edit mode): append one more item of the same kind to a task block.
// Arrays get a blank copy of the last item; newline lists get a placeholder line the teacher then edits.

const MAX_ITEMS = { pictures: 12 };
const DEFAULT_MAX = 30;

const blank = (item) => Object.fromEntries(Object.entries(item).map(([k, v]) => [k, typeof v === 'string' ? '' : v && typeof v === 'object' ? null : v]));

const ARRAY_ITEMS = {
  pictures: { key: 'items', label: 'pilt', make: () => ({ img: null, caption: '', answer: '' }) },
  clock: { key: 'items', label: 'kell', make: (last) => ({ time: last?.time || '12:00', extra: '' }) },
  choice: { key: 'questions', label: 'küsimus', make: () => ({ q: 'Uus küsimus?', options: '*Õige vastus\nVale vastus\nVale vastus' }) },
  truefalse: { key: 'statements', label: 'väide', make: () => ({ text: 'Uus väide.', answer: 'true' }) },
  match: { key: 'pairs', label: 'paar', make: () => ({ left: 'uus sõna', right: 'vaste' }) },
  dialogue: { key: 'lines', label: 'repliik', make: (last) => ({ who: last?.who === 'A' ? 'B' : 'A', text: 'Uus repliik [vastus].' }) },
  categorize: { key: 'groups', label: 'grupp', make: () => ({ name: 'Uus grupp', words: '' }) },
};

const LINE_ITEMS = {
  gaps: { key: 'sentences', label: 'lause', line: () => 'Uus lause [vastus].' },
  listening: { key: 'sentences', label: 'lause', line: () => 'Uus lause [vastus].' },
  wordorder: { key: 'sentences', label: 'lause', line: () => 'Uus lause.' },
  reading: { key: 'questions', label: 'küsimus', line: () => 'Uus küsimus? [vastus]' },
  speaking: { key: 'questions', label: 'küsimus', line: () => 'Uus küsimus?' },
  selfcheck: { key: 'items', label: 'rida', line: () => 'Ma oskan …' },
  manymatch: { key: 'left', label: 'rida', line: () => 'uus tegevus' },
  table: { key: 'rows', label: 'rida', line: (data) => ['sõna', ...Array(Math.max(1, String(data.headers || '').split(',').length - 1)).fill('[vastus]')].join(' | ') },
};

const lines = (value) => String(value || '').split('\n').filter((l) => l.trim());

function count(block) {
  const arr = ARRAY_ITEMS[block.type];
  if (arr) return Array.isArray(block.data?.[arr.key]) ? block.data[arr.key].length : 0;
  const list = LINE_ITEMS[block.type];
  return list ? lines(block.data?.[list.key]).length : 0;
}

// what the button says ("Lisa pilt"), or null when the block has no items or is full
export function addItemLabel(block) {
  const spec = ARRAY_ITEMS[block?.type] || LINE_ITEMS[block?.type];
  if (!spec) return null;
  return count(block) < (MAX_ITEMS[block.type] || DEFAULT_MAX) ? `Lisa ${spec.label}` : null;
}

export function addItem(block) {
  if (!addItemLabel(block)) return block;
  const data = block.data || {};
  const arr = ARRAY_ITEMS[block.type];
  if (arr) {
    const list = Array.isArray(data[arr.key]) ? data[arr.key] : [];
    const last = list[list.length - 1];
    const item = { ...(last ? blank(last) : {}), ...arr.make(last) };
    return { ...block, data: { ...data, [arr.key]: [...list, item] } };
  }
  const spec = LINE_ITEMS[block.type];
  return { ...block, data: { ...data, [spec.key]: [...lines(data[spec.key]), spec.line(data)].join('\n') } };
}
