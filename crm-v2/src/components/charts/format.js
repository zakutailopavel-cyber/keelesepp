// Money and percent as the finance screens show them: „1 234,56 €” (a no-break space between thousands, always —
// Intl's et-EE leaves four-digit numbers ungrouped: „1234,56 €”), the euro sign after the number.
const NBSP = ' ';

function groupDigits(digits) {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
}

// { sign: '' | '−', number: '1 234,56', symbol: '€' }
export function moneyParts(cents, { decimals = 2 } = {}) {
  const value = Number(cents || 0) / 100;
  const rounded = Math.abs(value).toFixed(decimals);
  const [whole, fraction] = rounded.split('.');
  const zero = Number(rounded) === 0;
  return { sign: value < 0 && !zero ? '−' : '', number: `${groupDigits(whole)}${fraction ? `,${fraction}` : ''}`, symbol: '€' };
}

export function formatMoney(cents, options) {
  const parts = moneyParts(cents, options);
  return `${parts.sign}${parts.number}${NBSP}${parts.symbol}`;
}

// an axis label: whole euros, thousands as „1,2k” (keeps narrow screens readable)
export function formatMoneyShort(cents) {
  const euros = Math.round(Number(cents || 0) / 100);
  if (Math.abs(euros) >= 1000) {
    const thousands = euros / 1000;
    return `${(Math.abs(thousands) >= 10 ? thousands.toFixed(0) : thousands.toFixed(1)).replace('.', ',').replace(',0', '')}k${NBSP}€`;
  }
  return `${euros}${NBSP}€`;
}

export function formatCount(value) {
  return groupDigits(String(Math.round(Number(value) || 0)));
}

export function formatPercent(value) {
  return `${Math.abs(value)}${NBSP}%`;
}
