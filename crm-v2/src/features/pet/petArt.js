// KeeleSepp pets: vector drawing of the four species, moods and growth stages (animations in pet.css).
// Everything is generated from our own constants; no user text is put into the SVG.
export const SPECIES = {
  siil:    { name: 'Siil', ru: 'ёжик, спокойный и упорный', body: '#b98552', belly: '#f6e2c4', accent: '#7f582a' },
  rebane:  { name: 'Rebane', ru: 'лиса, быстрая и любопытная', body: '#e0823d', belly: '#fff3e6', accent: '#b85a1f' },
  kakk:    { name: 'Kakk', ru: 'сова, мудрая и внимательная', body: '#8a6a4a', belly: '#f3e7d3', accent: '#5a4028' },
  draakon: { name: 'Draakon', ru: 'дракончик, смелый и весёлый', body: '#3f9a63', belly: '#e9f5d9', accent: '#267743' },
};
export const MOODS = {
  happy: { label: 'Rõõmus', why: 'Сегодня был урок или сдан лист.' },
  calm:  { label: 'Tavaline', why: 'Обычный день: моргает и ждёт ученика.' },
  proud: { label: 'Uhke', why: 'Выполнена цель урока: получен новый предмет.' },
  sleep: { label: 'Magab', why: 'Ученик давно не заходил. Питомец просто спит и проснётся при входе.' },
};
export const STAGES = { 1: 'Beebi', 2: 'Noor', 3: 'Täiskasvanu' };
const O = 'var(--outline)';
function face(mood, cx, cy, r) {
  const ex = r * 0.38, ey = cy - r * 0.05;
  let eyes, mouth, extra = '';
  if (mood === 'happy') {
    eyes = [-1, 1].map((s) => `<path d="M${cx + s * ex - 8} ${ey + 2} q8 -10 16 0" fill="none" stroke="${O}" stroke-width="4" stroke-linecap="round"/>`).join('');
    mouth = `<path d="M${cx - 11} ${cy + r * 0.3} q11 13 22 0 z" fill="#c2412d" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>`;
  } else if (mood === 'sleep') {
    eyes = [-1, 1].map((s) => `<path d="M${cx + s * ex - 8} ${ey} q8 6 16 0" fill="none" stroke="${O}" stroke-width="4" stroke-linecap="round"/>`).join('');
    mouth = `<ellipse cx="${cx}" cy="${cy + r * 0.34}" rx="4" ry="3" fill="${O}"/>`;
    extra = `<text class="zz" x="${cx + r * 0.7}" y="${cy - r * 0.6}" font-family="Nunito, sans-serif" font-weight="900" font-size="20" fill="${O}">z</text><text class="zz z2" x="${cx + r * 0.9}" y="${cy - r * 0.85}" font-family="Nunito, sans-serif" font-weight="900" font-size="14" fill="${O}">z</text>`;
  } else {
    const big = mood === 'proud';
    eyes = [-1, 1].map((s) => `<g class="eye"><ellipse cx="${cx + s * ex}" cy="${ey}" rx="${big ? 8 : 7}" ry="${big ? 10 : 9}" fill="${O}"/><circle cx="${cx + s * ex + 2.5}" cy="${ey - 3.5}" r="2.6" fill="#fff"/></g>`).join('');
    mouth = big
      ? `<path d="M${cx - 12} ${cy + r * 0.27} q12 14 24 0" fill="none" stroke="${O}" stroke-width="4" stroke-linecap="round"/>`
      : `<path d="M${cx - 8} ${cy + r * 0.3} q8 7 16 0" fill="none" stroke="${O}" stroke-width="3.5" stroke-linecap="round"/>`;
  }
  const blush = mood === 'sleep' ? '' : [-1, 1].map((s) => `<ellipse cx="${cx + s * r * 0.62}" cy="${cy + r * 0.2}" rx="7" ry="4.5" fill="#f28b82" opacity=".55"/>`).join('');
  return eyes + blush + mouth + extra;
}

function item(stage, mood, cx, headTop, bodyY) {
  let out = '';
  if (stage >= 2) out += `<path d="M${cx - 30} ${bodyY - 34} q30 14 60 0 l-4 12 q-26 12 -52 0 z" fill="#2f7d4c" stroke="${O}" stroke-width="3" stroke-linejoin="round"/><path d="M${cx + 18} ${bodyY - 26} l10 26 l-12 -2 z" fill="#2f7d4c" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>`;
  if (stage >= 3) out += `<g><rect x="${cx - 26}" y="${headTop - 16}" width="52" height="8" rx="3" fill="${O}"/><path d="M${cx - 34} ${headTop - 16} l34 -14 l34 14 l-34 12 z" fill="${O}"/><path d="M${cx + 30} ${headTop - 15} v14" stroke="#f5b301" stroke-width="3" stroke-linecap="round"/><circle cx="${cx + 30}" cy="${headTop + 1}" r="4" fill="#f5b301"/></g>`;
  if (mood === 'proud') out += `<g transform="translate(${cx + 40} ${bodyY - 4})"><circle r="12" fill="#f5b301" stroke="${O}" stroke-width="3"/><path d="M0 -6 l1.8 4 4.4 .4 -3.3 3 1 4.3 -3.9 -2.3 -3.9 2.3 1 -4.3 -3.3 -3 4.4 -.4z" fill="#fff"/></g>` +
    ['', 's2', 's3'].map((c, i) => `<path class="spark ${c}" d="M0 -7 L2 -2 7 0 2 2 0 7 -2 2 -7 0 -2 -2Z" transform="translate(${[cx - 70, cx + 72, cx - 58][i]} ${[headTop + 10, headTop + 30, bodyY + 10][i]})" fill="#f5b301"/>`).join('');
  return out;
}

export function petSvg(kind, mood = 'calm', stage = 2) {
  const s = SPECIES[kind];
  const cx = 100;
  const headR = { 1: 50, 2: 45, 3: 41 }[stage];
  const bodyRx = { 1: 34, 2: 42, 3: 48 }[stage];
  const bodyRy = { 1: 30, 2: 37, 3: 43 }[stage];
  const bodyY = 196 - bodyRy - 8;
  const headY = bodyY - bodyRy - headR * 0.55;
  const headTop = headY - headR;
  const st = `stroke="${O}" stroke-width="3.5" stroke-linejoin="round"`;
  let back = '', ears = '', headExtra = '', bodyExtra = '';

  if (kind === 'siil') {
    const n = 9;
    back = Array.from({ length: n }, (_, i) => {
      const a = Math.PI * (0.95 + (i / (n - 1)) * 1.1);
      const x1 = cx + Math.cos(a - 0.12) * headR * 0.95, y1 = headY + Math.sin(a - 0.12) * headR * 0.95;
      const x2 = cx + Math.cos(a) * headR * 1.38, y2 = headY + Math.sin(a) * headR * 1.38;
      const x3 = cx + Math.cos(a + 0.12) * headR * 0.95, y3 = headY + Math.sin(a + 0.12) * headR * 0.95;
      return `M${x1} ${y1} L${x2} ${y2} L${x3} ${y3}`;
    }).join(' ');
    back = `<path d="${back}" fill="${s.accent}" ${st}/>`;
    headExtra = `<ellipse cx="${cx}" cy="${headY + headR * 0.2}" rx="${headR * 0.72}" ry="${headR * 0.62}" fill="${s.belly}"/><ellipse cx="${cx}" cy="${headY + headR * 0.12}" rx="6" ry="4.5" fill="${O}"/>`;
  }
  if (kind === 'rebane') {
    ears = [-1, 1].map((d) => `<path d="M${cx + d * headR * 0.35} ${headTop + 10} L${cx + d * headR * 0.85} ${headTop - 26} L${cx + d * headR * 0.95} ${headTop + 22} Z" fill="${s.body}" ${st}/><path d="M${cx + d * headR * 0.52} ${headTop + 8} L${cx + d * headR * 0.8} ${headTop - 12} L${cx + d * headR * 0.84} ${headTop + 16} Z" fill="${s.belly}"/>`).join('');
    back = `<path class="tail" d="M${cx + bodyRx * 0.7} ${bodyY + 8} q${bodyRx * 1.2} -10 ${bodyRx * 0.9} -${bodyRy * 1.3} q-8 22 -${bodyRx * 0.55} ${bodyRy * 0.95} z" fill="${s.body}" ${st}/><path d="M${cx + bodyRx * 1.42} ${bodyY - bodyRy * 1.05} q-8 12 -16 10 q10 -2 16 -10z" fill="#fff"/>`;
    headExtra = `<path d="M${cx - headR * 0.95} ${headY + headR * 0.1} q${headR * 0.55} ${headR * 0.75} ${headR * 0.95} ${headR * 0.8} q${headR * 0.4} -${headR * 0.05} ${headR * 0.95} -${headR * 0.8} q-${headR * 0.3} ${headR * 0.25} -${headR * 0.95} ${headR * 0.25} q-${headR * 0.65} 0 -${headR * 0.95} -${headR * 0.25}z" fill="${s.belly}"/><ellipse cx="${cx}" cy="${headY + headR * 0.14}" rx="5.5" ry="4" fill="${O}"/>`;
  }
  if (kind === 'kakk') {
    ears = [-1, 1].map((d) => `<path d="M${cx + d * headR * 0.45} ${headTop + 12} L${cx + d * headR * 0.9} ${headTop - 14} L${cx + d * headR * 0.95} ${headTop + 26} Z" fill="${s.accent}" ${st}/>`).join('');
    headExtra = [-1, 1].map((d) => `<circle cx="${cx + d * headR * 0.38}" cy="${headY - headR * 0.05}" r="${headR * 0.33}" fill="${s.belly}" stroke="${s.accent}" stroke-width="3"/>`).join('') +
      `<path d="M${cx - 5} ${headY + headR * 0.14} L${cx + 5} ${headY + headR * 0.14} L${cx} ${headY + headR * 0.3} Z" fill="#f5b301" stroke="${O}" stroke-width="2.5" stroke-linejoin="round"/>`;
    bodyExtra = [-1, 1].map((d) => `<path d="M${cx + d * bodyRx * 0.7} ${bodyY - bodyRy * 0.5} q${d * bodyRx * 0.55} ${bodyRy * 0.4} ${d * bodyRx * 0.15} ${bodyRy * 1.05} q${-d * bodyRx * 0.3} -${bodyRy * 0.4} ${-d * bodyRx * 0.15} -${bodyRy * 1.05}z" fill="${s.accent}" ${st}/>`).join('') +
      [0, 1, 2].map((i) => `<path d="M${cx - 12 + i * 12} ${bodyY + 2 + (i % 2) * 8} q6 5 12 0" fill="none" stroke="${s.accent}" stroke-width="2.5" stroke-linecap="round"/>`).join('');
  }
  if (kind === 'draakon') {
    ears = [-1, 1].map((d) => `<path d="M${cx + d * headR * 0.4} ${headTop + 8} q${d * 6} -22 ${d * 20} -26 q${-d * 4} 16 ${d * 2} 30z" fill="#f5b301" ${st}/>`).join('');
    back = [-1, 1].map((d) => `<path d="M${cx + d * bodyRx * 0.55} ${bodyY - bodyRy * 0.55} q${d * bodyRx * 1.1} -${bodyRy * 1.1} ${d * bodyRx * 1.2} -${bodyRy * 0.1} q${-d * bodyRx * 0.4} -${bodyRy * 0.05} ${-d * bodyRx * 0.5} ${bodyRy * 0.35} q${-d * bodyRx * 0.2} -${bodyRy * 0.25} ${-d * bodyRx * 0.7} -${bodyRy * 0.25}z" fill="${s.accent}" ${st}/>`).join('') +
      `<path class="tail" d="M${cx + bodyRx * 0.8} ${bodyY + bodyRy * 0.5} q${bodyRx * 0.9} 6 ${bodyRx * 1.05} -${bodyRy * 0.45} l6 -2 l-4 8 q-${bodyRx * 0.4} ${bodyRy * 0.55} -${bodyRx * 1.1} ${bodyRy * 0.3}z" fill="${s.body}" ${st}/>`;
    headExtra = `<ellipse cx="${cx}" cy="${headY + headR * 0.28}" rx="${headR * 0.5}" ry="${headR * 0.34}" fill="${s.belly}"/><circle cx="${cx - 7}" cy="${headY + headR * 0.24}" r="2.4" fill="${O}"/><circle cx="${cx + 7}" cy="${headY + headR * 0.24}" r="2.4" fill="${O}"/>`;
  }

  const feet = [-1, 1].map((d) => `<ellipse cx="${cx + d * bodyRx * 0.5}" cy="${bodyY + bodyRy - 2}" rx="${bodyRx * 0.32}" ry="8" fill="${s.accent}" ${st}/>`).join('');
  const faceY = kind === 'kakk' ? headY - headR * 0.02 : headY - headR * 0.04;
  const faceSvg = kind === 'kakk' ? face(mood, cx, faceY, headR * 0.98).replace(/fill="#f28b82"/g, 'fill="#f28b82" opacity=".35"') : face(mood, cx, faceY, headR);

  return `<svg class="pet m-${mood}" viewBox="0 0 200 200" role="img" aria-label="${s.name}: ${MOODS[mood].label.toLowerCase()}, ${STAGES[stage].toLowerCase()}" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="${cx}" cy="194" rx="${bodyRx + 14}" ry="5" fill="${O}" opacity=".12"/>
    <g class="jump"><g class="breathe">
      ${back}
      <ellipse cx="${cx}" cy="${bodyY}" rx="${bodyRx}" ry="${bodyRy}" fill="${s.body}" ${st}/>
      <ellipse cx="${cx}" cy="${bodyY + bodyRy * 0.12}" rx="${bodyRx * 0.62}" ry="${bodyRy * 0.7}" fill="${s.belly}"/>
      ${bodyExtra}
      ${feet}
      ${ears}
      <circle cx="${cx}" cy="${headY}" r="${headR}" fill="${s.body}" ${st}/>
      ${headExtra}
      ${faceSvg}
      ${item(stage, mood, cx, headTop, bodyY)}
    </g></g>
  </svg>`;
}

