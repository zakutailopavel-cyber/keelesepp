// Estonian personal identification code check (the same rule as functions/inf3-core.js): 11 digits, century/sex digit
// 1–8, a real birth date and the check digit (weights 1…9,1; on remainder 10 weights 3…9,1,2,3; again 10 → 0).
export function isValidIsikukood(value) {
  const code = String(value || '').trim();
  if (!/^[1-8]\d{10}$/.test(code)) return false;
  const digits = code.split('').map(Number);
  const century = { 1: 1800, 2: 1800, 3: 1900, 4: 1900, 5: 2000, 6: 2000, 7: 2100, 8: 2100 }[digits[0]];
  const year = century + Number(code.slice(1, 3));
  const month = Number(code.slice(3, 5));
  const day = Number(code.slice(5, 7));
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return false;
  const check = (weights) => digits.slice(0, 10).reduce((sum, digit, index) => sum + digit * weights[index], 0) % 11;
  let remainder = check([1, 2, 3, 4, 5, 6, 7, 8, 9, 1]);
  if (remainder === 10) remainder = check([3, 4, 5, 6, 7, 8, 9, 1, 2, 3]);
  if (remainder === 10) remainder = 0;
  return remainder === digits[10];
}

// 37605030299 → 376•••••299: enough to recognise, not enough to copy
export const maskCode = (code) => (code ? `${String(code).slice(0, 3)}•••••${String(code).slice(-3)}` : '');
