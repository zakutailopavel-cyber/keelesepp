export const INVOICE_DETAILS = Object.freeze({
  company: 'E&P Koolitus OÜ',
  regCode: '17270880',
  address: 'Harju maakond, Saue vald, Laagri alevik, Nõlvaku põik 3b, 76401',
  email: 'zakutailo.pavel@gmail.com',
  iban: 'EE917700771011885682',
  bank: 'LHV Pank AS',
  swift: 'LHVBEE22',
  paymentDueDay: 10,
  paymentDueRule: 'monthly_10',
  lateFeePerDay: '0.0%',
  issuer: 'Pavel Zakutailo',
});

export function formatInvoiceDate(value) {
  if (!value) return '—';
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatInvoiceMoney(value) {
  const amount = Number(value || 0);
  return `${amount.toFixed(2).replace('.', ',')} €`;
}
