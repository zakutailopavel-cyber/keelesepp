// The calendar date where the school is (the browser's own day), as YYYY-MM-DD. `toISOString().slice(0, 10)` gives the
// UTC day instead: in Estonia between 00:00 and 02:00 / 03:00 that is still yesterday (a deadline looked a day off, a
// practice done after midnight counted for the day before).
export function localDate(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}
