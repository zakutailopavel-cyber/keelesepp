// A small, safe formula reader for the „Koordinaattasand” block (math course, owner 2026-11-16): the teacher writes
// y = x^2 - 4x + 3 and the sheet draws it. No eval: the text is parsed into a tree and evaluated per x.
// Understands numbers (2,5 or 2.5), x, pi / π, e, + - * / ^ (also ² ³), brackets, implicit products (2x, 3(x+1),
// x(x-1), 2sin(x)) and sin cos tan sqrt √ ln log (base 10) abs exp. Trigonometry in radians unless deg is set.

const FUNCS = new Set(['sin', 'cos', 'tan', 'sqrt', 'ln', 'log', 'abs', 'exp']);

function tokenize(src) {
  const s = String(src || '')
    .replace(/²/g, '^2').replace(/³/g, '^3').replace(/π/g, 'pi').replace(/√/g, 'sqrt').replace(/[−–]/g, '-')
    .replace(/·|×/g, '*').replace(/:/g, '/').replace(/\s+/g, '');
  const out = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    const num = /^(\d+(?:[.,]\d+)?|[.,]\d+)/.exec(s.slice(i));
    if (num) { out.push({ t: 'num', v: Number(num[1].replace(',', '.')) }); i += num[1].length; continue; }
    const word = /^[a-z]+/i.exec(s.slice(i));
    if (word) {
      // split a run like "xsin" or "pix" into known names
      let w = word[0].toLowerCase();
      while (w) {
        const fn = [...FUNCS].find((f) => w.startsWith(f));
        if (fn) { out.push({ t: 'fn', v: fn }); w = w.slice(fn.length); continue; }
        if (w.startsWith('pi')) { out.push({ t: 'num', v: Math.PI }); w = w.slice(2); continue; }
        if (w[0] === 'x') { out.push({ t: 'x' }); w = w.slice(1); continue; }
        if (w[0] === 'e') { out.push({ t: 'num', v: Math.E }); w = w.slice(1); continue; }
        throw new Error(`Tundmatu nimi: ${word[0]}`);
      }
      i += word[0].length;
      continue;
    }
    if ('+-*/^()'.includes(ch)) { out.push({ t: 'op', v: ch }); i += 1; continue; }
    throw new Error(`Tundmatu märk: ${ch}`);
  }
  // implicit multiplication: 2x, 2(…), x(…), )(, )x, 2sin
  const withMul = [];
  out.forEach((tok, k) => {
    const prev = out[k - 1];
    const prevEnds = prev && (prev.t === 'num' || prev.t === 'x' || (prev.t === 'op' && prev.v === ')'));
    const starts = tok.t === 'num' || tok.t === 'x' || tok.t === 'fn' || (tok.t === 'op' && tok.v === '(');
    if (prevEnds && starts) withMul.push({ t: 'op', v: '*' });
    withMul.push(tok);
  });
  return withMul;
}

// recursive descent: expr = term (± term)*, term = unary (*|/ unary)*, unary = -unary | power, power = atom (^ unary)?
export function parseExpr(src) {
  const toks = tokenize(String(src || '').replace(/^\s*[yf]\s*(\(\s*x\s*\))?\s*=/i, ''));
  if (!toks.length) throw new Error('Tühi valem');
  let p = 0;
  const peek = () => toks[p];
  const isOp = (v) => peek()?.t === 'op' && peek().v === v;
  const expr = () => {
    let node = term();
    while (isOp('+') || isOp('-')) { const op = toks[p++].v; node = { op, a: node, b: term() }; }
    return node;
  };
  const term = () => {
    let node = unary();
    while (isOp('*') || isOp('/')) { const op = toks[p++].v; node = { op, a: node, b: unary() }; }
    return node;
  };
  const unary = () => {
    if (isOp('-')) { p += 1; return { op: 'neg', a: unary() }; }
    if (isOp('+')) { p += 1; return unary(); }
    return power();
  };
  const power = () => {
    const base = atom();
    if (isOp('^')) { p += 1; return { op: '^', a: base, b: unary() }; }
    return base;
  };
  const atom = () => {
    const tok = toks[p++];
    if (!tok) throw new Error('Valem lõpeb poole pealt');
    if (tok.t === 'num') return { num: tok.v };
    if (tok.t === 'x') return { x: true };
    if (tok.t === 'fn') {
      // sin x (no bracket) takes the next power: sin2x is sin(2x) is not assumed — write sin(2x)
      const arg = isOp('(') ? atom() : power();
      return { fn: tok.v, a: arg };
    }
    if (tok.t === 'op' && tok.v === '(') {
      const inner = expr();
      if (!isOp(')')) throw new Error('Sulg jäi sulgemata');
      p += 1;
      return inner;
    }
    throw new Error(`Ootamatu märk: ${tok.v}`);
  };
  const tree = expr();
  if (p < toks.length) throw new Error(`Liigne märk: ${toks[p].v ?? toks[p].t}`);
  return tree;
}

export function evalTree(node, x, deg = false) {
  if ('num' in node) return node.num;
  if (node.x) return x;
  if (node.fn) {
    const v = evalTree(node.a, x, deg);
    const r = deg ? (v * Math.PI) / 180 : v;
    switch (node.fn) {
      case 'sin': return Math.sin(r);
      case 'cos': return Math.cos(r);
      case 'tan': return Math.tan(r);
      case 'sqrt': return Math.sqrt(v);
      case 'ln': return Math.log(v);
      case 'log': return Math.log10(v);
      case 'abs': return Math.abs(v);
      case 'exp': return Math.exp(v);
      default: return NaN;
    }
  }
  const a = evalTree(node.a, x, deg);
  if (node.op === 'neg') return -a;
  const b = evalTree(node.b, x, deg);
  switch (node.op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return a / b;
    case '^': return Math.pow(a, b);
    default: return NaN;
  }
}

// f(x) as a function, or { error } when the text is not a formula
export function compileExpr(src, deg = false) {
  try {
    const tree = parseExpr(src);
    return { f: (x) => evalTree(tree, x, deg) };
  } catch (error) {
    return { error: error.message };
  }
}

// A typed answer compared as mathematics, not as words: spaces, x= / y=, decimal comma and a trailing dot do not matter;
// a number equals another within 0.01 (or as entered, 2,5 = 5/2); "x=2; x=3" equals "x=3; x=2".
const plainAnswer = (s) => String(s ?? '').trim().toLowerCase().replace(/\s+/g, '').replace(/[−–]/g, '-').replace(/\.$/, '');
const asNumber = (s) => {
  const t = s.replace(/^[a-z]=/, '').replace(',', '.');
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
  const frac = /^(-?\d+)\/(\d+)$/.exec(t);
  return frac ? Number(frac[1]) / Number(frac[2]) : null;
};
const parts = (s) => plainAnswer(s).split(/[;]|(?:ja)|(?:või)/).filter(Boolean).map((x) => x.replace(/^[a-z]\d?=/, ''));

export function sameMathAnswer(given, expected) {
  const g = parts(given);
  const e = parts(expected);
  if (!g.length || g.length !== e.length) return false;
  const eq = (a, b) => {
    const na = asNumber(a);
    const nb = asNumber(b);
    if (na !== null && nb !== null) return Math.abs(na - nb) <= 0.01 + 1e-9;
    return a.replace(/,/g, '.') === b.replace(/,/g, '.');
  };
  const left = [...e];
  return g.every((x) => {
    const at = left.findIndex((y) => eq(x, y));
    if (at < 0) return false;
    left.splice(at, 1);
    return true;
  });
}
