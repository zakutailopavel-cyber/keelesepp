// „Andmediagramm”: a bar or line chart from a small table (owner 2026-10-18, Harno C1 writing task 1 — a summary of
// data shown in a diagram or graph). Written as text so a sheet stays plain data:
//   series: „Paberraamat, E-raamat, Audioraamat”
//   rows:   „2015 | 62 | 8 | 3” — one category per line, then one value per series
// Values may use a decimal comma. Pure helpers here, the SVG in chart.jsx.

export const CHART_KINDS = [['bar', 'Tulpdiagramm'], ['line', 'Joondiagramm'], ['pie', 'Sektordiagramm']];
// a pie (the 9th-grade e-exam's W2 summary) has one value per row, 2–8 slices
export const MAX_SLICES = 8;

// the slices of a pie: [{ label, value, share (0–1), from, to (angles in turns) }] from the first value of each row;
// a row without a value or with a value ≤ 0 is left out
export function pieSlices(data = {}) {
  const rows = chartRows(data).map((row) => ({ label: row.label, value: row.values[0] })).filter((row) => row.value !== null && row.value > 0).slice(0, MAX_SLICES);
  const sum = rows.reduce((n, row) => n + row.value, 0);
  let at = 0;
  return rows.map((row) => {
    const share = sum ? row.value / sum : 0;
    const slice = { ...row, share, from: at, to: at + share };
    at += share;
    return slice;
  });
}
export const MAX_SERIES = 4;
export const MAX_ROWS = 10;

const number = (value) => {
  const text = String(value ?? '').trim().replace(/\s/g, '').replace(',', '.');
  if (!text) return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
};

export function chartSeries(data = {}) {
  return String(data.series || '').split(',').map((name) => name.trim()).filter(Boolean).slice(0, MAX_SERIES);
}

/** [{ label, values: [n|null, …] }] — one entry per row, as many values as series (at least one). */
export function chartRows(data = {}) {
  const count = Math.max(1, chartSeries(data).length);
  return String(data.rows || '').split('\n').map((line) => line.trim()).filter(Boolean).slice(0, MAX_ROWS).map((line) => {
    const [label, ...cells] = line.split('|').map((cell) => cell.trim());
    return { label, values: Array.from({ length: count }, (_, index) => number(cells[index])) };
  });
}

// a round top for the value axis: 1, 2 or 5 times a power of ten, so 4–6 grid lines read well
export function niceMax(max) {
  if (!(max > 0)) return 1;
  const power = 10 ** Math.floor(Math.log10(max));
  const step = [1, 2, 2.5, 5, 10].find((factor) => max <= factor * power) * power;
  return step;
}

export function chartScale(data = {}) {
  const values = chartRows(data).flatMap((row) => row.values).filter((value) => value !== null);
  const top = niceMax(Math.max(0, ...values));
  const ticks = Array.from({ length: 6 }, (_, index) => (top / 5) * index);
  return { top, ticks };
}

export const formatValue = (value) => (value === null || value === undefined ? '' : Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2))).replace('.', ','));

export const chartHasData = (data = {}) => chartRows(data).some((row) => row.values.some((value) => value !== null));
