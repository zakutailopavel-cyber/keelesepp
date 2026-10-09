// Inline editing on the sheet: the text a teacher double-clicks is matched back to the one string in the
// block data (or sheet meta) it was rendered from. Ambiguous or derived text is left to the inspector.

const norm = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

// Paths of string leaves in `value` whose text equals `text` (whitespace-insensitive).
export function textPaths(value, text, path = [], out = []) {
  const wanted = norm(text);
  if (!wanted) return out;
  if (typeof value === 'string') {
    if (norm(value) === wanted) out.push(path);
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => textPaths(item, wanted, [...path, index], out));
  } else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => textPaths(item, wanted, [...path, key], out));
  }
  return out;
}

// Immutable set of `path` in `value`.
export function setPath(value, path, next) {
  if (!path.length) return next;
  const [head, ...rest] = path;
  const copy = Array.isArray(value) ? [...value] : { ...value };
  copy[head] = setPath(value?.[head], rest, next);
  return copy;
}

// From the double-clicked element up to `boundary`: the first element whose whole text maps to exactly one path.
export function findEditable(target, boundary, data) {
  for (let el = target; el && el !== boundary && el.nodeType === 1; el = el.parentElement) {
    if (el.matches('input, textarea, select, button, svg, svg *')) return null;
    const text = el.textContent;
    if (!norm(text)) continue;
    const paths = textPaths(data, text);
    if (paths.length === 1) return { el, path: paths[0], text: norm(text) };
    if (paths.length > 1) return null;
  }
  return null;
}

// Lines with gaps, scheme boxes, statements…: the view marks the element with data-edit and the teacher edits the
// stored source text (gaps stay in brackets) in a small field on the sheet.
//   "sentences#2"  → the 3rd non-empty line of the newline field `sentences` ("questions.0.options#1" works too)
//   "lines.1.text" → a nested string
// An empty value removes the line (newline fields) — for nested strings it is refused (the inspector removes rows).
export function editSource(data = {}, spec = '') {
  const toPath = (text) => String(text).split('.').filter(Boolean).map((p) => (/^\d+$/.test(p) ? Number(p) : p));
  const at = (path) => path.reduce((v, k) => (v == null ? v : v[k]), data);
  const hash = String(spec).indexOf('#');
  if (hash > 0) {
    const fieldPath = toPath(spec.slice(0, hash));
    const index = Number(spec.slice(hash + 1));
    const stored = at(fieldPath);
    if (stored != null && typeof stored !== 'string') return null;
    const raw = String(stored ?? '').split('\n');
    const line = raw.map((text, i) => (text.trim() ? i : -1)).filter((i) => i >= 0)[index];
    if (line === undefined) return null;
    return {
      value: raw[line].replace(/\s+$/, ''),
      multiline: false,
      write: (next) => {
        const clean = String(next ?? '').replace(/\r?\n/g, ' ').replace(/\s+$/, '');
        const lines = [...raw];
        if (clean.trim()) lines[line] = clean; else lines.splice(line, 1);
        return { path: fieldPath, value: lines.join('\n') };
      },
    };
  }
  const path = toPath(spec);
  const value = at(path);
  if (!path.length || typeof value !== 'string') return null;
  return {
    value,
    multiline: false,
    write: (next) => {
      const clean = String(next ?? '').replace(/\s+/g, ' ').trim();
      return clean ? { path, value: clean } : null;
    },
  };
}
