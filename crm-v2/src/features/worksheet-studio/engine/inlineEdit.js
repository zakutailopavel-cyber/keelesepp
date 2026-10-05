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
