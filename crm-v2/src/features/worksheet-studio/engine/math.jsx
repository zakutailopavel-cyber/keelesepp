/* eslint-disable react-refresh/only-export-components -- the formula helpers live next to the component that uses them */
import katex from 'katex';
import 'katex/dist/katex.min.css';

// Mathematics inside worksheet texts (math course 10.–12. klass, owner 2026-11-16): $x^2+1$ is an inline formula,
// $$\frac{a}{b}$$ a formula on its own centred line. The source stays a plain string (LaTeX between dollar signs), so
// sheets, the Õpik editor and the answer key keep working; <Md> renders it with KaTeX. A formula KaTeX cannot read is
// shown as its source in red instead of breaking the sheet.
export const MATH_TOKEN = /(\$\$[^$]+\$\$|\$[^$\n]+\$)/g;

export const isMath = (part) => /^\$\$[^$]+\$\$$/.test(part) || /^\$[^$\n]+\$$/.test(part);

const cache = new Map();
export function mathHtml(tex, display = false) {
  const key = `${display ? 'D' : 'I'}${tex}`;
  if (!cache.has(key)) {
    cache.set(key, katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: 'ignore', output: 'html' }));
    if (cache.size > 2000) cache.delete(cache.keys().next().value);
  }
  return cache.get(key);
}

export function MathTex({ part }) {
  const display = part.startsWith('$$');
  const tex = display ? part.slice(2, -2) : part.slice(1, -1);
  return display
    ? <span className="ws-math ws-math--display" dangerouslySetInnerHTML={{ __html: mathHtml(tex, true) }} />
    : <span className="ws-math" dangerouslySetInnerHTML={{ __html: mathHtml(tex, false) }} />;
}

// the readable text of a formula (search, aria, matching): the LaTeX source without the dollar signs
export const stripMath = (text) => String(text ?? '').replace(MATH_TOKEN, (part) => (part.startsWith('$$') ? part.slice(2, -2) : part.slice(1, -1)));
