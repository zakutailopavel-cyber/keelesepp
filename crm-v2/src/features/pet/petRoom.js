// The pet's room on „Minu õpingud”: it grows with the learner. Books on the shelf = learned words, framed diplomas =
// finished homework and worksheets, cups = reached lesson goals, the plant grows with the streak of learning days.
// The window shows the time of day and the season (or the background the learner bought for the pet).
// Drawn from numbers and our own constants only; no user text goes into the SVG.
import { BACKGROUNDS } from './petArt.js';
import { dayPart, season } from './petLife.js';

export const ROOM_LIMITS = { books: 24, diplomas: 6, cups: 5, workPerDiploma: 3 };
const O = '#0b2a4f';
const SKY = { morning: '#fde2b8', day: '#bfe3ff', evening: '#f8b98b', night: '#1e2a4f' };
const BOOK = ['#2f7d4c', '#2563eb', '#e0823d', '#a855f7', '#dc2626', '#0d9488', '#f5b301', '#64748b'];

export function roomContents(progress = {}) {
  const work = (progress.homework || 0) + (progress.submissions || 0);
  const streak = progress.streak || 0;
  return {
    books: Math.min(ROOM_LIMITS.books, progress.learnedWords || 0),
    diplomas: Math.min(ROOM_LIMITS.diplomas, Math.floor(work / ROOM_LIMITS.workPerDiploma)),
    cups: Math.min(ROOM_LIMITS.cups, progress.goals || 0),
    plant: streak >= 14 ? 4 : streak >= 7 ? 3 : streak >= 3 ? 2 : streak >= 1 ? 1 : 0,
  };
}

function windowView(part, s, bg) {
  if (bg && BACKGROUNDS[bg]) return `<svg x="22" y="26" width="66" height="66" viewBox="4 4 192 192" preserveAspectRatio="xMidYMid slice">${BACKGROUNDS[bg]}</svg>`;
  let out = `<rect x="22" y="26" width="66" height="66" fill="${SKY[part]}"/>`;
  if (part === 'night') out += `<circle cx="70" cy="42" r="8" fill="#fde68a"/><circle cx="74" cy="39" r="7" fill="${SKY.night}"/><g fill="#fde68a"><circle cx="34" cy="38" r="1.5"/><circle cx="48" cy="56" r="1.2"/><circle cx="60" cy="34" r="1.3"/></g>`;
  else if (s === 'summer' || part === 'day') out += `<circle cx="70" cy="42" r="8" fill="#fbbf24"/>`;
  if (s === 'winter' || s === 'christmas') out += `<rect x="22" y="84" width="66" height="8" fill="#fff"/><g class="room-snow" fill="#fff">${[[30, 40], [44, 60], [58, 34], [72, 66], [38, 76], [80, 50]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8"/>`).join('')}</g>`;
  if (s === 'autumn') out += `<g fill="#e0823d">${[[32, 50], [52, 70], [74, 60]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3" ry="1.6" transform="rotate(30 ${x} ${y})"/>`).join('')}</g>`;
  if (s === 'spring') out += `<rect x="22" y="84" width="66" height="8" fill="#86efac"/><g fill="#f9a8d4"><circle cx="34" cy="86" r="2"/><circle cx="56" cy="87" r="2"/><circle cx="76" cy="86" r="2"/></g>`;
  return out;
}

// the plant stands under the window, left of the pet
const PX = 66;
function plant(level) {
  const pot = `<path d="M${PX - 11} 182 h22 l-3 16 h-16 z" fill="#c2410c" stroke="${O}" stroke-width="2"/>`;
  if (!level) return pot + `<path d="M${PX} 182 v-4" stroke="#2f7d4c" stroke-width="2.5"/>`;
  const h = [0, 14, 26, 38, 44][level];
  let leaves = '';
  for (let i = 1; i <= level + 1; i += 1) {
    const y = 182 - (h * i) / (level + 2);
    const d = i % 2 ? -1 : 1;
    leaves += `<ellipse cx="${PX + d * 7}" cy="${y}" rx="7" ry="3.5" fill="#4ade80" stroke="${O}" stroke-width="1.5" transform="rotate(${d * -25} ${PX + d * 7} ${y})"/>`;
  }
  const flower = level >= 4 ? `<g transform="translate(${PX} ${182 - h})">${[0, 72, 144, 216, 288].map((a) => `<ellipse rx="3.5" ry="6" transform="rotate(${a}) translate(0 -5)" fill="#f9a8d4" stroke="${O}" stroke-width="1"/>`).join('')}<circle r="3.5" fill="#f5b301"/></g>` : '';
  return `<path d="M${PX} 182 v-${h}" stroke="#2f7d4c" stroke-width="3" stroke-linecap="round"/>${leaves}${flower}${pot}`;
}

export function roomSvg({ progress = {}, now = Date.now(), bg = '' } = {}) {
  const part = dayPart(now);
  const s = season(now);
  const c = roomContents(progress);
  const night = part === 'night';
  const wall = night ? '#d9d3e6' : '#f6efe4';
  const floor = night ? '#cbb89c' : '#e9d8bf';

  const books = Array.from({ length: c.books }, (_, i) => {
    const shelf = Math.floor(i / 8);
    const x = 238 + (i % 8) * 7.5;
    const h = 22 + ((i * 7) % 5);
    const y = 76 + shelf * 32 - h;
    return `<rect x="${x}" y="${y}" width="6.5" height="${h}" rx="1" fill="${BOOK[i % BOOK.length]}" stroke="${O}" stroke-width="1"/>`;
  }).join('');
  const diplomas = Array.from({ length: c.diplomas }, (_, i) => {
    const x = 112 + (i % 3) * 32;
    const y = 22 + Math.floor(i / 3) * 30;
    return `<g><rect x="${x}" y="${y}" width="24" height="20" rx="2" fill="#fff" stroke="#b45309" stroke-width="2.5"/><path d="M${x + 5} ${y + 7} h14 M${x + 5} ${y + 11} h10" stroke="#94a3b8" stroke-width="1.5"/><circle cx="${x + 18}" cy="${y + 15}" r="2.5" fill="#dc2626"/></g>`;
  }).join('');
  const cups = Array.from({ length: c.cups }, (_, i) => {
    const x = 240 + i * 12;
    return `<g><path d="M${x} 30 h9 v4 q0 6 -4.5 6 q-4.5 0 -4.5 -6 z" fill="#f5b301" stroke="${O}" stroke-width="1.2"/><rect x="${x + 3}" y="40" width="3" height="3" fill="#f5b301"/><rect x="${x + 1}" y="43" width="7" height="2" fill="${O}"/></g>`;
  }).join('');
  const tree = s === 'christmas' ? `<g transform="translate(10 150)"><path d="M14 0 l14 22 h-8 l10 16 h-32 l10 -16 h-8 z" fill="#15803d" stroke="${O}" stroke-width="2" stroke-linejoin="round"/><rect x="11" y="38" width="6" height="8" fill="#92400e"/><circle cx="14" cy="-2" r="3" fill="#f5b301"/><circle cx="8" cy="20" r="2" fill="#dc2626"/><circle cx="20" cy="30" r="2" fill="#2563eb"/></g>` : '';
  const garland = s === 'christmas' ? `<path d="M20 26 q35 12 70 0" fill="none" stroke="#15803d" stroke-width="3"/><g>${[30, 45, 60, 75].map((x, i) => `<circle cx="${x}" cy="${30 + (i % 2) * 2}" r="2.2" fill="${['#dc2626', '#f5b301', '#2563eb', '#dc2626'][i]}"/>`).join('')}</g>` : '';
  const label = `Toas: ${c.books} raamatut, ${c.diplomas} diplomit, ${c.cups} karikat`;

  return `<svg class="pet-room" viewBox="0 0 320 200" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax slice">
    <rect width="320" height="150" fill="${wall}"/>
    <rect y="150" width="320" height="50" fill="${floor}"/>
    <path d="M0 150 h320" stroke="#b08d61" stroke-width="3"/>
    <path d="M0 170 h320 M0 186 h320" stroke="#d6c09f" stroke-width="1"/>
    <rect x="18" y="22" width="74" height="74" rx="4" fill="#fff" stroke="${O}" stroke-width="3"/>
    ${windowView(part, s, bg)}
    <path d="M55 26 v66 M22 59 h66" stroke="#fff" stroke-width="3"/>
    <rect x="14" y="94" width="82" height="6" rx="2" fill="#b08d61" stroke="${O}" stroke-width="2"/>
    ${garland}
    ${diplomas}
    <rect x="232" y="46" width="68" height="104" rx="3" fill="#a16207" stroke="${O}" stroke-width="2.5"/>
    <rect x="236" y="50" width="60" height="96" fill="#fef3c7"/>
    <path d="M236 78 h60 M236 110 h60 M236 142 h60" stroke="#a16207" stroke-width="4"/>
    <path d="M232 46 h68" stroke="${O}" stroke-width="2.5"/>
    ${books}
    ${cups}
    <ellipse cx="150" cy="182" rx="74" ry="11" fill="#fca5a5" opacity=".55"/>
    ${plant(c.plant)}
    ${tree}
    ${night ? '<rect width="320" height="200" fill="#1e1b4b" opacity=".12"/>' : ''}
  </svg>`;
}
