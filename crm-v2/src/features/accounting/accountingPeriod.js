// Period of the accounting reports (päevaraamat, pearaamat, käibeandmik, partnerid, bilanss ja kasumiaruanne):
// quick buttons, the Tallinn calendar day, the note on a period that does not start on 1 January, and the period
// remembered per device. The report maths (accountingReports.js) is not touched here.

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const pad = (n) => String(n).padStart(2, '0');
const lastDay = (year, month) => new Date(Date.UTC(year, month, 0)).getUTCDate(); // month 1–12
const monthEnd = (year, month) => `${year}-${pad(month)}-${pad(lastDay(year, month))}`;
const dmy = (date) => (DAY.test(String(date || '')) ? `${date.slice(8, 10)}.${date.slice(5, 7)}.${date.slice(0, 4)}` : '');

// the calendar day in Tallinn as YYYY-MM-DD, whatever the device's own time zone
export function tallinnToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Tallinn', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export const isDay = (value) => DAY.test(String(value || ''));
export const yearStartOf = (date) => `${String(date).slice(0, 4)}-01-01`;
// the käibeandmik note: a period that does not start on 1 January opens income / expense accounts with the year so far
export const startsMidYear = (from) => isDay(from) && !from.endsWith('-01-01');

export const TRIAL_MID_YEAR_NOTE = 'Periood ei alga 1. jaanuarist: tulu- ja kulukontode algsaldo on summa aasta algusest kuni perioodi alguseni (seepärast pole need kulud käibes).';

export const PERIOD_PRESETS = [
  ['year', 'Aasta algusest'],
  ['month', 'See kuu'],
  ['prevMonth', 'Eelmine kuu'],
  ['quarter', 'See kvartal'],
  ['prevQuarter', 'Eelmine kvartal'],
];

// the period of a quick button; „Aasta algusest” keeps the year of the period in view (a past year runs to 31.12),
// „See …” ends today, „Eelmine …” is the whole month / quarter
export function presetPeriod(key, today = tallinnToday(), current = {}) {
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7));
  if (key === 'year') {
    const picked = isDay(current.from) ? Number(current.from.slice(0, 4)) : year;
    const y = picked > year ? year : picked;
    return { from: `${y}-01-01`, to: y < year ? `${y}-12-31` : today };
  }
  if (key === 'month') return { from: `${today.slice(0, 7)}-01`, to: today };
  if (key === 'prevMonth') {
    const y = month === 1 ? year - 1 : year;
    const m = month === 1 ? 12 : month - 1;
    return { from: `${y}-${pad(m)}-01`, to: monthEnd(y, m) };
  }
  const q = Math.floor((month - 1) / 3); // 0–3
  if (key === 'quarter') return { from: `${year}-${pad(q * 3 + 1)}-01`, to: today };
  if (key === 'prevQuarter') {
    const y = q === 0 ? year - 1 : year;
    const pq = q === 0 ? 3 : q - 1;
    return { from: `${y}-${pad(pq * 3 + 1)}-01`, to: monthEnd(y, pq * 3 + 3) };
  }
  return null;
}

// which quick button the period equals (highlighted), or ''
export function activePreset(period = {}, today = tallinnToday()) {
  return PERIOD_PRESETS.find(([key]) => {
    const p = presetPeriod(key, today, period);
    return p && p.from === period.from && p.to === period.to;
  })?.[0] || '';
}

export const defaultPeriod = (today = tallinnToday()) => ({ from: `${today.slice(0, 4)}-01-01`, to: today });
export const periodLabel = ({ from, to } = {}) => `${dmy(from) || '…'}–${dmy(to) || '…'}`;

// remembered per device so the period does not change silently between visits; storage may be missing or blocked
export const PERIOD_STORAGE_KEY = 'keelesepp.accounting.period';

export function loadPeriod(today = tallinnToday(), storage = globalThis.localStorage) {
  try {
    const saved = JSON.parse(storage?.getItem(PERIOD_STORAGE_KEY) || 'null');
    if (saved && isDay(saved.from) && isDay(saved.to) && saved.from <= saved.to) return { from: saved.from, to: saved.to };
  } catch {
    // unreadable or blocked storage: the default period
  }
  return defaultPeriod(today);
}

export function savePeriod(period, storage = globalThis.localStorage) {
  try {
    if (isDay(period?.from) && isDay(period?.to)) storage?.setItem(PERIOD_STORAGE_KEY, JSON.stringify({ from: period.from, to: period.to }));
  } catch {
    // private window or full storage: the period is simply not remembered
  }
}
