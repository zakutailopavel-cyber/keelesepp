// Covers for the children's group campaigns (features/campaigns/kidsCampaigns.js): square 1080×1080 for the feed and
// story 1080×1920, ET and RU, in the textbook art style (black line, white, one lime accent, pale lime blob).
// Run: node scripts/campaign-covers.mjs  (needs Google Chrome; writes public/campaign-art/kids-*.png)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../public/campaign-art');
const PHONE = '+372 5434 4155';
const LINE = '#1E1E1E'; const LIME = '#C9F03D'; const PALE = '#E8F9B0'; const GREY = '#D9D9D9';
const s = `stroke="${LINE}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"`;

const ART = {
  56: `<g ${s}>
    <rect x="58" y="228" width="118" height="118" rx="14" fill="#fff"/><text x="117" y="312" font-size="78" font-weight="800" text-anchor="middle" fill="${LINE}" stroke="none">A</text>
    <rect x="196" y="228" width="118" height="118" rx="14" fill="${LIME}"/><text x="255" y="312" font-size="78" font-weight="800" text-anchor="middle" fill="${LINE}" stroke="none">Ä</text>
    <rect x="127" y="104" width="118" height="118" rx="14" fill="#fff" transform="rotate(-6 186 163)"/><text x="186" y="190" font-size="78" font-weight="800" text-anchor="middle" fill="${LINE}" stroke="none" transform="rotate(-6 186 163)">1</text>
    <g transform="rotate(35 330 120)"><rect x="300" y="40" width="36" height="150" rx="6" fill="#fff"/><path d="M300 190 L318 228 L336 190 Z" fill="${GREY}"/><line x1="300" y1="70" x2="336" y2="70"/></g>
    <path d="M60 80 l8 18 20 2 -15 13 4 20 -17 -10 -17 10 4 -20 -15 -13 20 -2 Z" fill="${LIME}"/>
    <circle cx="350" cy="300" r="12" fill="${GREY}"/><line x1="20" y1="362" x2="380" y2="362"/></g>`,
  67: `<g ${s}>
    <path d="M150 112 Q150 70 200 70 Q250 70 250 112" fill="none"/>
    <rect x="102" y="108" width="196" height="236" rx="38" fill="${LIME}"/>
    <rect x="138" y="232" width="124" height="84" rx="16" fill="#fff"/><line x1="138" y1="258" x2="262" y2="258"/>
    <line x1="140" y1="150" x2="140" y2="210"/><line x1="260" y1="150" x2="260" y2="210"/>
    <g transform="rotate(-28 330 210)"><rect x="312" y="110" width="34" height="170" rx="6" fill="#fff"/><path d="M312 280 L329 318 L346 280 Z" fill="${GREY}"/><line x1="312" y1="138" x2="346" y2="138"/></g>
    <rect x="22" y="250" width="70" height="92" rx="8" fill="#fff" transform="rotate(-10 57 296)"/><text x="57" y="304" font-size="34" font-weight="800" text-anchor="middle" fill="${LINE}" stroke="none" transform="rotate(-10 57 296)">ab</text>
    <line x1="10" y1="362" x2="390" y2="362"/></g>`,
  89: `<g ${s}>
    <path d="M200 160 Q140 130 50 150 L50 330 Q140 310 200 340 Z" fill="#fff"/>
    <path d="M200 160 Q260 130 350 150 L350 330 Q260 310 200 340 Z" fill="#fff"/>
    <line x1="200" y1="160" x2="200" y2="340"/>
    <line x1="80" y1="200" x2="170" y2="190"/><line x1="80" y1="235" x2="170" y2="225"/><line x1="80" y1="270" x2="150" y2="262"/>
    <line x1="230" y1="190" x2="320" y2="200"/><line x1="230" y1="225" x2="320" y2="235"/>
    <path d="M285 140 L285 220 L300 205 L315 220 L315 138" fill="${LIME}"/>
    <path d="M70 36 h150 a22 22 0 0 1 22 22 v44 a22 22 0 0 1 -22 22 h-96 l-30 26 4 -26 h-28 a22 22 0 0 1 -22 -22 v-44 a22 22 0 0 1 22 -22 Z" fill="${LIME}"/>
    <text x="145" y="96" font-size="44" font-weight="800" text-anchor="middle" fill="${LINE}" stroke="none">Tere!</text>
    <circle cx="330" cy="70" r="14" fill="${GREY}"/><line x1="20" y1="362" x2="380" y2="362"/></g>`,
};

const COPY = {
  56: {
    et: { badge: '5–6 a', title: 'Eelkool<br>pühapäeviti', sub: 'Eesti keel mänguga', bullets: ['Grupp kuni 5 last', 'Tähed, numbrid, laulud', 'Pühapäeval kell 10.00'], bar: `Proovitund tasuta · ${PHONE}`, start: 'Algus 15. novembril · 5 kohta' },
    ru: { badge: '5–6 лет', title: 'Подготовишка<br>по воскресеньям', sub: 'Эстонский в игре', bullets: ['Группа до 5 детей', 'Буквы, счёт, песни', 'Воскресенье, 10:00'], bar: `Пробное бесплатно · ${PHONE}`, start: 'Старт 15 ноября · 5 мест' },
  },
  67: {
    et: { badge: '6–7 a', title: 'Kooliks<br>valmis', sub: 'Eesti keel enne 1. klassi', bullets: ['Lugemine ja kirjutamine', 'Klassi keel ja numbrid', 'Pühapäeval kell 11.00'], bar: `Proovitund tasuta · ${PHONE}`, start: 'Algus 15. novembril · 5 kohta' },
    ru: { badge: '6–7 лет', title: 'Готов<br>к школе', sub: 'Эстонский перед 1 классом', bullets: ['Чтение и письмо', 'Язык класса и счёт', 'Воскресенье, 11:00'], bar: `Пробное бесплатно · ${PHONE}`, start: 'Старт 15 ноября · 5 мест' },
  },
  89: {
    et: { badge: '8–9 a', title: 'Eesti keel<br>2.–3. klassile', sub: 'Julgemalt koolis', bullets: ['Lugemine ja mõistmine', 'Kirjutamine ja grammatika', 'Pühapäeval kell 12.15'], bar: `Proovitund tasuta · ${PHONE}`, start: 'Algus 15. novembril · 5 kohta' },
    ru: { badge: '8–9 лет', title: 'Эстонский<br>для 2–3 класса', sub: 'Увереннее в школе', bullets: ['Чтение и понимание', 'Письмо и грамматика', 'Воскресенье, 12:15'], bar: `Пробное бесплатно · ${PHONE}`, start: 'Старт 15 ноября · 5 мест' },
  },
};

const blob = `<svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg"><path fill="${PALE}" d="M436 72c78 52 132 150 112 248-20 99-113 199-224 214S90 490 58 386 54 168 134 98 358 20 436 72Z"/></svg>`;
const art = (age) => `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" font-family="Avenir Next, Helvetica Neue, Arial">${ART[age]}</svg>`;
const check = `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="${LIME}" stroke="${LINE}" stroke-width="3"/><path d="M11 21l6 6 12-13" fill="none" stroke="${LINE}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function page(age, lang, format) {
  const c = COPY[age][lang];
  const story = format === 'story';
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{box-sizing:border-box;margin:0}
  html,body{width:1080px;height:${story ? 1920 : 1080}px;background:#fff;overflow:hidden}
  body{font-family:"Avenir Next","Helvetica Neue",Arial,sans-serif;color:${LINE};position:relative;padding:${story ? '110px 90px' : '72px'}}
  .brand{display:flex;align-items:center;gap:14px;font-size:40px;font-weight:800;color:#123f37;letter-spacing:-.5px}
  .brand i{width:30px;height:30px;border-radius:9px;background:${LIME};border:4px solid ${LINE}}
  .badge{display:inline-block;margin-top:${story ? 90 : 46}px;padding:10px 30px;border:5px solid ${LINE};border-radius:999px;background:${LIME};font-size:${story ? 70 : 54}px;font-weight:800}
  h1{margin-top:${story ? 40 : 26}px;font-size:${story ? 118 : (c.title.length > 30 ? 80 : 92)}px;line-height:1.02;font-weight:800;letter-spacing:-2px;max-width:${story ? 900 : 640}px}
  .sub{margin-top:${story ? 30 : 20}px;font-size:${story ? 52 : 40}px;font-weight:600;color:#3d4a45}
  ul{list-style:none;margin-top:${story ? 50 : 34}px;display:grid;gap:${story ? 26 : 16}px}
  li{display:flex;align-items:center;gap:18px;font-size:${story ? 50 : 36}px;font-weight:600}
  li svg{width:${story ? 54 : 42}px;height:${story ? 54 : 42}px;flex:none}
  .blob{position:absolute;${story ? 'left:120px;top:880px;width:860px;height:860px' : 'right:-40px;bottom:60px;width:560px;height:560px'}}
  .art{position:absolute;${story ? 'left:210px;top:930px;width:660px;height:660px' : 'right:30px;bottom:150px;width:420px;height:420px'}}
  .start{position:absolute;left:90px;right:90px;bottom:270px;font-size:52px;font-weight:800;text-align:center}
  .bar{position:absolute;left:${story ? 90 : 72}px;right:${story ? 90 : 72}px;bottom:${story ? 110 : 60}px;background:${LINE};color:#fff;border-radius:28px;padding:${story ? '34px 40px' : '26px 34px'};font-size:${story ? 46 : 36}px;font-weight:700;text-align:center}
  </style></head><body>
  <div class="blob">${blob}</div><div class="art">${art(age)}</div>
  <div class="brand"><i></i>KeeleSepp</div>
  <div class="badge">${c.badge}</div>
  <h1>${c.title}</h1>
  <div class="sub">${c.sub}</div>
  ${story ? '' : `<ul>${c.bullets.map((item) => `<li>${check}${item}</li>`).join('')}</ul>`}
  ${story ? `<div class="start">${c.start}</div>` : ''}
  <div class="bar">${c.bar}</div>
  </body></html>`;
}

fs.mkdirSync(OUT, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'covers-'));
for (const age of Object.keys(COPY)) for (const lang of ['et', 'ru']) for (const format of ['square', 'story']) {
  const name = `kids-${age}-${format}-${lang}`;
  const html = path.join(tmp, `${name}.html`);
  fs.writeFileSync(html, page(age, lang, format));
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', `--window-size=1080,${format === 'story' ? 1920 : 1080}`, `--screenshot=${path.join(OUT, `${name}.png`)}`, `file://${html}`], { stdio: 'ignore' });
  console.log(name);
}
