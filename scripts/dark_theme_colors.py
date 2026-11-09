"""Dark theme pass: rewrite colour literals in CRM CSS.

- literal equal to a token's light value (in the right property kind) -> var(--token)
- any other light-sensitive literal -> `prop:orig;prop:light-dark(orig, dark)` (old browsers keep the first one)
Light mode stays byte-for-byte the same colour. Re-running on a converted file changes nothing.
Usage (from the repo root; never on worksheet-generator/, worksheet-studio/, availabilityPoll.css, board.css,
languageTools.css — they stay light, see docs/DESIGN_TOKENS.md „Dark theme”):
  python3 scripts/dark_theme_colors.py [--write] crm-v2/src/features/<feature>/<file>.css ...
Without --write it only prints counts. The dark values of the tokens themselves live in crm-v2/src/styles/index.css.
"""
import re, sys, math, collections

TOKENS = {
  'bg': {'#ffffff': '--surface', '#f6f8fb': '--surface-soft', '#f8fafc': '--surface-alt', '#f9fafb': '--gray-50',
         '#f2f4f7': '--gray-100', '#e8f6f2': '--green-soft', '#fef3f2': '--danger-soft', '#ecfdf3': '--success-soft',
         '#fffaeb': '--warning-soft', '#f4f6f8': '--app-bg'},
  'color': {'#17253a': '--ink', '#627087': '--muted', '#101828': '--gray-900', '#344054': '--gray-700',
            '#475467': '--gray-600', '#667085': '--gray-500', '#98a2b3': '--gray-400', '#b42318': '--danger-text',
            '#067647': '--success-text', '#b54708': '--warning-text', '#175cd3': '--info-text', '#087e6b': '--green-text',
            '#132238': '--navy-text'},
  'border': {'#dfe5ec': '--border', '#d0d5dd': '--gray-300', '#eaecf0': '--gray-200', '#e4e7ec': '--border-cool',
             '#eef0f3': '--border-faint'},
}
# a text colour written with a token whose value is a fill colour (buttons) gets the text twin
TEXT_TWIN = {'--green': '--green-text', '--green-dark': '--green-text', '--navy': '--navy-text', '--danger': '--danger-text'}
# tokens that keep their colour in dark (a block with one as background is a "fixed" coloured block)
FIXED_BG_TOKENS = {'--green', '--green-dark', '--navy', '--navy-soft', '--amber', '--danger'}

COLOR_RE = re.compile(r'#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{4}\b|#[0-9a-fA-F]{3}\b|rgba?\([^)]*\)|(?<![-\w])white(?![-\w])')

def parse(c):
  c = c.lower()
  if c == 'white': return (255, 255, 255, 1.0)
  if c.startswith('#'):
    h = c[1:]
    if len(h) in (3, 4): h = ''.join(x * 2 for x in h)
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    a = int(h[6:8], 16) / 255 if len(h) == 8 else 1.0
    return (r, g, b, a)
  inner = c[c.index('(') + 1:-1].replace('/', ' ').replace(',', ' ').split()
  if any('var' in x or 'calc' in x or 'from' in x for x in inner): return None
  try:
    vals = [float(x[:-1]) * 2.55 if x.endswith('%') else float(x) for x in inner[:3]]
    a = inner[3] if len(inner) > 3 else '1'
    a = float(a[:-1]) / 100 if a.endswith('%') else float(a)
  except ValueError:
    return None
  return (*vals, a)

def hexnorm(rgba):
  r, g, b, a = rgba
  if a != 1.0: return None
  return '#%02x%02x%02x' % (round(r), round(g), round(b))

def lin(u):
  u /= 255
  return u / 12.92 if u <= 0.04045 else ((u + 0.055) / 1.055) ** 2.4

def delin(u):
  u = 12.92 * u if u <= 0.0031308 else 1.055 * u ** (1 / 2.4) - 0.055
  return max(0, min(255, round(u * 255)))

def to_oklch(rgba):
  r, g, b = (lin(x) for x in rgba[:3])
  l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
  l, m, s = (math.copysign(abs(x) ** (1 / 3), x) for x in (l, m, s))
  L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s
  A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s
  B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
  return L, math.hypot(A, B), math.atan2(B, A)

def from_oklch(L, C, h):
  for _ in range(40):  # reduce chroma until in sRGB gamut
    A, B = C * math.cos(h), C * math.sin(h)
    l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
    m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
    s = (L - 0.0894841775 * A - 1.2914855480 * B) ** 3
    r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    b = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    if all(-0.001 <= x <= 1.001 for x in (r, g, b)): break
    C *= 0.92
  return tuple(delin(max(0, min(1, x))) for x in (r, g, b))

def fmt(rgb, a):
  if a >= 0.999: return '#%02x%02x%02x' % rgb
  return 'rgba(%d,%d,%d,%s)' % (*rgb, ('%.3f' % a).rstrip('0').rstrip('.'))

def surface_like(L, C, h, a):  # a light background -> a dark surface of the same hue, order kept (white = card)
  L2 = 0.245 - (1 - L) * 0.5
  if C <= 0.008: h, C2 = 4.4, 0.014  # neutral greys get the app's slight blue
  else: C2 = min(C * 2, 0.05)
  return fmt(from_oklch(L2, C2, h), a)

def light_bg(L, C):
  return L > 0.86 or (L > 0.76 and C < 0.07)

def dark_for(kind, rgba):
  """None = keep the literal in dark too."""
  L, C, h = to_oklch(rgba)
  a = rgba[3]
  if a == 0: return None
  whiteish = L > 0.86 and C < 0.03
  if whiteish and a < 0.5: return None  # light veil, drawn over dark areas already
  if L < 0.4 and C < 0.1 and a < 0.7: return None  # dark veil / shadow
  if kind == 'bg':
    return surface_like(L, C, h, a) if light_bg(L, C) else None
  if kind == 'border':
    if not light_bg(L, C): return None
    L2 = 0.30 + (1 - L) * 0.6
    C2 = min(C * 1.5, 0.06) if C > 0.008 else 0.016
    if C <= 0.008: h = 4.4
    return fmt(from_oklch(L2, C2, h), a)
  if kind == 'color':
    if L >= 0.62: return None
    L2 = 0.985 - L * 0.4
    C2 = C * 0.45 if C < 0.06 else min(C, 0.16)
    return fmt(from_oklch(L2, C2, h), a)
  if kind == 'shadow':
    return surface_like(L, C, h, a) if whiteish else None
  return None

def kind_of(prop):
  p = prop.lower()
  if p.startswith('--') or 'mask' in p: return None
  if p.startswith('background'): return 'bg'
  if p in ('color', 'caret-color', 'text-decoration-color', '-webkit-text-fill-color', 'column-rule-color', 'accent-color'):
    return 'color' if p != 'accent-color' else None
  if 'border' in p or 'outline' in p or p == 'column-rule': return 'border'
  if 'shadow' in p: return 'shadow'
  if p == 'fill': return 'fill'
  if p == 'stroke': return 'stroke'
  return None

def split_decls(body):
  out, depth, cur, q = [], 0, '', None
  for ch in body:
    if q:
      cur += ch
      if ch == q: q = None
      continue
    if ch in '"\'': q = ch
    elif ch == '(': depth += 1
    elif ch == ')': depth -= 1
    elif ch == ';' and depth == 0:
      out.append(cur); cur = ''; continue
    cur += ch
  out.append(cur)
  return out

def mask_urls(v):
  # colours inside url(...) and strings are not touched
  spans = [m.span() for m in re.finditer(r'url\([^)]*\)|"[^"]*"|\'[^\']*\'', v)]
  return lambda pos: any(a <= pos < b for a, b in spans)

stats = collections.Counter()

def block_bg_fixed(decls):
  """the block paints a coloured (not light, not mapped) background -> keep its text colours."""
  for d in decls:
    if ':' not in d: continue
    p, v = d.split(':', 1)
    if kind_of(p.strip()) != 'bg': continue
    for t in re.findall(r'var\((--[\w-]+)', v):
      if t in FIXED_BG_TOKENS: return True
    for m in COLOR_RE.finditer(v):
      c = parse(m.group(0))
      if c and c[3] > 0.6 and dark_for('bg', c) is None:
        L, C, h = to_oklch(c)
        if L > 0.35 or C > 0.06: return True
  return False

def block_bg_mapped_or_none(decls):
  return not block_bg_fixed(decls)

def transform_value(kind, v, fixed_block, textish=False):
  inside = mask_urls(v)
  dark_v, light_changed, any_dark = [], False, False
  token_v = ''
  last = 0
  out_light, out_dark = [], []
  for m in COLOR_RE.finditer(v):
    if inside(m.start()): continue
    lit = m.group(0)
    c = parse(lit)
    if c is None: continue
    out_light.append(v[last:m.start()]); out_dark.append(v[last:m.start()])
    last = m.end()
    k = kind
    if kind == 'fill':
      L, C, _ = to_oklch(c)
      k = 'bg' if L > 0.86 else ('color' if L < 0.62 and (C < 0.05 or textish) else None)
    elif kind == 'stroke':
      L, C, _ = to_oklch(c)
      k = 'border' if L > 0.76 else ('color' if L < 0.62 and C < 0.05 else None)
    if k == 'color' and fixed_block: k = None
    hx = hexnorm(c)
    tok = TOKENS.get(k or '', {}).get(hx) if hx else None
    if tok:
      out_light.append('var(%s)' % tok); out_dark.append('var(%s)' % tok)
      light_changed = True
      stats['token'] += 1
      continue
    d = dark_for(k, c) if k else None
    if d:
      out_light.append(lit); out_dark.append('light-dark(%s,%s)' % (lit, d))
      any_dark = True
      stats['light-dark'] += 1
    else:
      out_light.append(lit); out_dark.append(lit)
      stats['kept'] += 1
  out_light.append(v[last:]); out_dark.append(v[last:])
  return ''.join(out_light), ''.join(out_dark), light_changed, any_dark

def transform_block(selector, body):
  sel = selector.strip()
  if re.search(r'\.ws-|\.sb\b|\.sb-|\.st-canvas|data-theme|^:root$|^html$', sel): return body
  decls = split_decls(body)
  fixed = block_bg_fixed(decls)
  out = []
  for i, d in enumerate(decls):
    if ':' not in d or d.strip().startswith('--'):
      out.append(d); continue
    # already done (re-run): the light-dark() line and the plain fallback just before it
    nxt = decls[i + 1] if i + 1 < len(decls) else ''
    if 'light-dark(' in d or ('light-dark(' in nxt and nxt.split(':', 1)[0].strip() == d.split(':', 1)[0].strip()):
      out.append(d); continue
    p, v = d.split(':', 1)
    prop = p.strip()
    if prop.startswith('@') or '{' in d:
      out.append(d); continue
    kind = kind_of(prop)
    if kind == 'color' and not fixed:
      v2 = re.sub(r'var\((--[\w-]+)(?=[,)])', lambda m: 'var(%s' % TEXT_TWIN.get(m.group(1), m.group(1)), v)
      if v2 != v: stats['text-twin'] += 1
      v = v2
    if not kind:
      out.append(p + ':' + v); continue
    vl, vd, _, any_dark = transform_value(kind, v, fixed, bool(re.search(r'label|axis|text|value|title', sel)))
    if any_dark:
      # old browsers drop the light-dark() one and keep the plain value
      out.append('%s:%s;%s:%s' % (p, vl, p.strip(), vd.strip()))
    else:
      out.append(p + ':' + vl)
  return ';'.join(out)

def walk(s, skip=False):
  """returns the transformed text; recursive over blocks."""
  res, i, n = [], 0, len(s)
  start = 0
  while i < n:
    if s.startswith('/*', i):
      j = s.find('*/', i + 2); j = n if j < 0 else j + 2
      i = j; continue
    ch = s[i]
    if ch in '"\'':
      j = s.find(ch, i + 1); i = (j + 1) if j >= 0 else n; continue
    if ch == '{':
      # prelude = text since last boundary
      prelude = s[start:i]
      # find the matching brace
      depth, j = 1, i + 1
      while j < n and depth:
        if s.startswith('/*', j):
          k = s.find('*/', j + 2); j = n if k < 0 else k + 2; continue
        if s[j] in '"\'':
          k = s.find(s[j], j + 1); j = (k + 1) if k >= 0 else n; continue
        if s[j] == '{': depth += 1
        elif s[j] == '}': depth -= 1
        j += 1
      body = s[i + 1:j - 1]
      # the prelude may begin with comments / whitespace; the selector is its last part
      res.append(s[start:i + 1])
      pre = re.sub(r'/\*.*?\*/', '', prelude, flags=re.S).strip().split(';')[-1].strip()
      if '{' in strip_comments(body):
        inner_skip = skip or pre.startswith('@media print') or bool(re.search(r'\bprint\b', pre) and pre.startswith('@media'))
        if pre.startswith('@keyframes') or pre.startswith('@-webkit-keyframes'): inner_skip = skip
        res.append(walk(body, inner_skip))
      else:
        res.append(body if (skip or pre.startswith('@font-face')) else transform_block(pre, body))
      res.append('}')
      i = j; start = j
      continue
    if ch == ';' and s[start:i].lstrip().startswith('@'):
      i += 1; continue
    i += 1
  res.append(s[start:])
  return ''.join(res)

def strip_comments(t):
  return re.sub(r'/\*.*?\*/', '', t, flags=re.S)

if __name__ == '__main__':
  write = '--write' in sys.argv
  for f in [a for a in sys.argv[1:] if not a.startswith('--')]:
    src = open(f).read()
    before = sum(stats.values())
    out = walk(src)
    if write and out != src: open(f, 'w').write(out)
  print(dict(stats))
