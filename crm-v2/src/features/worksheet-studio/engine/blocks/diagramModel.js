// Shapes of the „Skeem” block: boxes from text lines ([gap] = learner fills in) and their positions.
export const node = (raw) => {
  const text = String(raw || '').trim();
  const gap = /^\[([^\]]*)\]$/.exec(text);
  return gap ? { gap: gap[1].split('|').map((x) => x.trim()).filter(Boolean) } : { text };
};
export const MAX_NODES = 12;
const lines = (value, max = MAX_NODES) => String(value || '').split('\n').map((line) => line.trim()).filter(Boolean).slice(0, max);
export function diagramNodes(data = {}) {
  return lines(data.nodes).map(node);
}

// The scheme kinds (owner, 2026-10-09: „normal blocks with schemes”). `zones` = two-sided kinds with their own fields.
export const DIAGRAM_KINDS = [
  { kind: 'mind', label: 'Mõttekaart', hint: 'teema keskel, sõnad ümber', icon: 'Network' },
  { kind: 'flow', label: 'Järjestus nooltega', hint: 'sammud, protsess, retsept', icon: 'Workflow' },
  { kind: 'cycle', label: 'Ring / tsükkel', hint: 'aastaajad, päev, kordused', icon: 'RefreshCcw' },
  { kind: 'timeline', label: 'Ajajoon', hint: 'eile – täna – homme, elulugu', icon: 'GitCommitHorizontal' },
  { kind: 'formula', label: 'Lause valem', hint: 'Kes? + teeb mida? + kus?', icon: 'Puzzle' },
  { kind: 'venn', label: 'Venni diagramm', hint: 'kaks asja: erinev ja ühine', icon: 'CircleDashed' },
  { kind: 'compare', label: 'Võrdlus (T-tabel)', hint: 'pluss / miinus, enne / nüüd', icon: 'Columns2' },
  { kind: 'tree', label: 'Puu', hint: 'üks üleval, teised all', icon: 'GitFork' },
];
export const ZONE_KINDS = new Set(['venn', 'compare']);
const KIND_SET = new Set(DIAGRAM_KINDS.map((k) => k.kind));
export const diagramKind = (data = {}) => (KIND_SET.has(data.kind) ? data.kind : 'mind');

// A ready example per kind: a new block of that kind (or switching an empty one) starts filled in.
export const KIND_SAMPLES = {
  mind: { title: 'Täida skeem.', instruction: 'Kirjuta puuduvad sõnad.', center: 'Minu päev', nodes: 'hommikul\n[päeval]\nõhtul\n[öösel]' },
  flow: { title: 'Pane sammud järjekorda.', instruction: 'Kirjuta puuduvad tegusõnad.', nodes: 'Ärkan kell seitse.\n[Pesen] hambaid.\nSöön hommikusööki.\n[Lähen] tööle.' },
  cycle: { title: 'Aastaajad.', instruction: 'Kirjuta puuduvad aastaajad.', center: 'Aasta', nodes: 'kevad\n[suvi]\nsügis\n[talv]' },
  timeline: { title: 'Minu nädal.', instruction: 'Kirjuta tegusõna õiges ajavormis.', nodes: 'eile | [käisin] kinos\ntäna | olen kodus\nhomme | [lähen] tööle' },
  formula: { title: 'Lause valem.', instruction: 'Vaata valemit ja täida lüngad.', nodes: 'Kes? | Mina\nMida teeb? | [elan]\nKus? | [Tallinnas]', note: 'Mina elan Tallinnas. Sina elad Tartus.' },
  venn: { title: 'Linn ja maa.', instruction: 'Kirjuta, mis on erinev ja mis on ühine.', left: 'Linn', right: 'Maa', leftItems: 'palju inimesi\n[pood]', both: 'kodu\nsõbrad', rightItems: 'mets\n[vaikus]' },
  compare: { title: 'Pluss ja miinus.', instruction: 'Mis on hea ja mis on halb?', left: '+ Hea', right: '− Halb', leftItems: 'odav\n[kiire]', rightItems: 'kauge\n[külm]' },
  tree: { title: 'Sõnapere.', instruction: 'Kirjuta puuduvad sõnad.', center: 'õppima', nodes: 'õpetaja\n[õpilane]\nõpik' },
};
const SAMPLE_FIELDS = ['center', 'nodes', 'note', 'left', 'right', 'leftItems', 'rightItems', 'both'];
const isEmptyContent = (data = {}) => SAMPLE_FIELDS.every((f) => !String(data[f] || '').trim());
// Switching kinds keeps what the teacher wrote; an empty block (or one still holding the previous kind's example)
// takes the new kind's example.
export function switchKind(data = {}, kind) {
  const prev = KIND_SAMPLES[diagramKind(data)] || {};
  const untouched = SAMPLE_FIELDS.every((f) => String(data[f] || '') === String(prev[f] || ''));
  if (isEmptyContent(data) || untouched) {
    const sample = KIND_SAMPLES[kind] || {};
    const keepTitle = data.title && data.title !== prev.title;
    const keepInstruction = data.instruction && data.instruction !== prev.instruction;
    const cleared = Object.fromEntries(SAMPLE_FIELDS.map((f) => [f, '']));
    return { ...cleared, ...sample, ...(keepTitle ? { title: data.title } : {}), ...(keepInstruction ? { instruction: data.instruction } : {}), kind };
  }
  return { kind };
}

// A cell: text with inline gaps — „[käisin] kinos”. The first gap answers under the cell's key (as the whole-box
// gaps always did, so saved answers keep their keys), later ones under `key.1`, `key.2`.
export function cellParts(raw, key) {
  const text = String(raw || '').trim();
  const parts = [];
  let gaps = 0;
  text.split(/(\[[^\]]*\])/g).forEach((piece) => {
    const m = /^\[([^\]]*)\]$/.exec(piece);
    if (m) {
      const accept = m[1].split('|').map((x) => x.trim()).filter(Boolean);
      parts.push({ gap: accept, key: gaps ? `${key}.${gaps}` : key });
      gaps += 1;
    } else if (piece) parts.push({ text: piece });
  });
  return parts;
}
export const cellAnswers = (raw, key) => cellParts(raw, key).filter((p) => p.gap).map((p) => ({ key: p.key, accept: p.gap }));

// „label | text” lines (timeline: time | event, formula: question | words)
export const pairLines = (value, max = 8) => lines(value, max).map((line) => {
  // a gap may hold „|” itself ([a|b]) — split only on a bar outside brackets
  let depth = 0;
  let cut = -1;
  for (let i = 0; i < line.length; i += 1) {
    if (line[i] === '[') depth += 1;
    else if (line[i] === ']') depth = Math.max(0, depth - 1);
    else if (line[i] === '|' && depth === 0) { cut = i; break; }
  }
  return cut < 0 ? { label: '', text: line } : { label: line.slice(0, cut).trim(), text: line.slice(cut + 1).trim() };
});
export const zoneItems = (value, max = 6) => lines(value, max);

// Every answerable cell of the block, with its key — one source for the view, scoring and the progress count.
export function diagramCells(data = {}) {
  const kind = diagramKind(data);
  if (ZONE_KINDS.has(kind)) {
    return [
      { key: 'L', raw: data.left },
      { key: 'R', raw: data.right },
      ...zoneItems(data.leftItems).map((raw, i) => ({ key: `l${i}`, raw })),
      ...(kind === 'venn' ? zoneItems(data.both).map((raw, i) => ({ key: `m${i}`, raw })) : []),
      ...zoneItems(data.rightItems).map((raw, i) => ({ key: `r${i}`, raw })),
    ];
  }
  if (kind === 'timeline' || kind === 'formula') {
    const labelKey = kind === 'timeline' ? 't' : 'q';
    return pairLines(data.nodes).flatMap(({ label, text }, i) => [{ key: `${labelKey}${i}`, raw: label }, { key: `n${i}`, raw: text }]);
  }
  const center = kind !== 'flow' && data.center ? [{ key: 'c', raw: data.center }] : [];
  return [...center, ...lines(data.nodes).map((raw, i) => ({ key: `n${i}`, raw }))];
}
export const diagramAnswers = (data = {}) => diagramCells(data).flatMap(({ key, raw }) => cellAnswers(raw, key));
export const diagramHasContent = (data = {}) => diagramCells(data).some(({ raw }) => String(raw || '').trim());

// positions in a 100-wide box; `h` is the box height in the same units
export function diagramLayout(kind, count) {
  if (kind === 'flow') {
    // a snake: odd rows run right to left, so every step is a short horizontal or vertical arrow
    const perRow = Math.min(4, Math.max(1, count));
    const rows = Math.max(1, Math.ceil(count / perRow));
    const h = rows * 16 + 2;
    const width = 100 / perRow;
    return {
      h,
      center: null,
      points: Array.from({ length: count }, (_, i) => {
        const row = Math.floor(i / perRow);
        const col = row % 2 ? perRow - 1 - (i % perRow) : i % perRow;
        return { x: width / 2 + col * width, y: 9 + row * 16 };
      }),
      links: Array.from({ length: Math.max(0, count - 1) }, (_, i) => [i, i + 1]),
    };
  }
  if (kind === 'tree') {
    const h = 44;
    return {
      h,
      center: { x: 50, y: 9 },
      points: Array.from({ length: count }, (_, i) => ({ x: ((i + 0.5) * 100) / Math.max(1, count), y: 34 })),
      links: Array.from({ length: count }, (_, i) => ['c', i]),
    };
  }
  if (kind === 'cycle') {
    const h = 50;
    const rx = 36;
    const ry = 18;
    const angles = Array.from({ length: count }, (_, i) => -90 + (i * 360) / Math.max(1, count));
    return {
      h,
      center: { x: 50, y: h / 2 },
      rx,
      ry,
      angles,
      points: angles.map((deg) => ({ x: 50 + rx * Math.cos((deg * Math.PI) / 180), y: h / 2 + ry * Math.sin((deg * Math.PI) / 180) })),
      links: count > 1 ? Array.from({ length: count }, (_, i) => [i, (i + 1) % count]) : [],
    };
  }
  const h = 40;
  return {
    h,
    center: { x: 50, y: h / 2 },
    points: Array.from({ length: count }, (_, i) => {
      const angle = (-90 + (i * 360) / Math.max(1, count)) * (Math.PI / 180);
      return { x: 50 + 34 * Math.cos(angle), y: h / 2 + 14 * Math.sin(angle) };
    }),
    links: Array.from({ length: count }, (_, i) => ['c', i]),
  };
}

// The arrows of a cycle: arcs of the ellipse between neighbouring boxes, trimmed so they start and end outside
// the boxes (a box is about 18 × 7 units on a full-width card).
export function cycleArcs(layout, trimX = 8, trimY = 3.6) {
  const { rx, ry, angles = [], h } = layout;
  const cy = h / 2;
  const at = (deg) => ({ x: 50 + rx * Math.cos((deg * Math.PI) / 180), y: cy + ry * Math.sin((deg * Math.PI) / 180) });
  const inside = (p, c) => ((p.x - c.x) / trimX) ** 2 + ((p.y - c.y) / trimY) ** 2 < 1;
  return angles.length < 2 ? [] : angles.map((from, i) => {
    const to = i === angles.length - 1 ? angles[0] + 360 : angles[i + 1];
    const a = at(from);
    const b = at(to);
    const pts = [];
    for (let s = 0; s <= 40; s += 1) {
      const p = at(from + ((to - from) * s) / 40);
      if (!inside(p, a) && !inside(p, b)) pts.push(p);
    }
    return pts.length > 1 ? `M${pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' L')}` : '';
  }).filter(Boolean);
}
