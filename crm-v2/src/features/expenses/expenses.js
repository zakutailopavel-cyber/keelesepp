export const EXPENSE_CATEGORIES = [
  ['rent', 'Üür'],
  ['advertising', 'Reklaam'],
  ['software', 'Tarkvara'],
  ['learning_materials', 'Õppematerjalid'],
  ['bank_fees', 'Pangatasud'],
  ['taxes', 'Maksud'],
  ['office', 'Kontor'],
  ['travel', 'Sõidukulud'],
  ['other', 'Muu'],
];

export const EXPENSE_PAYMENT_METHODS = [
  ['bank', 'Pangaülekanne'],
  ['card', 'Kaart'],
  ['cash', 'Sularaha'],
  ['other', 'Muu'],
];

export const categoryLabel = (value) => EXPENSE_CATEGORIES.find(([id]) => id === value)?.[1] || value || '—';
export const paymentMethodLabel = (value) => EXPENSE_PAYMENT_METHODS.find(([id]) => id === value)?.[1] || value || '—';

export function expenseTotals(expenses) {
  const active = expenses.filter((expense) => expense.status === 'active');
  return active.reduce((totals, expense) => ({
    count: totals.count + 1,
    amountCents: totals.amountCents + (Number(expense.amountCents) || 0),
    vatAmountCents: totals.vatAmountCents + (Number(expense.vatAmountCents) || 0),
    netAmountCents: totals.netAmountCents + (Number(expense.netAmountCents) || 0),
    documentCount: totals.documentCount + (Number(expense.documentCount) || 0),
  }), { count: 0, amountCents: 0, vatAmountCents: 0, netAmountCents: 0, documentCount: 0 });
}

export function validateExpenseForm(values) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.expenseDate || '')) return 'Vali kulu kuupäev.';
  if (!EXPENSE_CATEGORIES.some(([id]) => id === values.category)) return 'Vali kulu kategooria.';
  if (!String(values.description || '').trim()) return 'Lisa kulu kirjeldus.';
  const amount = Number(String(values.amount || '').replace(',', '.'));
  const vatAmount = Number(String(values.vatAmount || '0').replace(',', '.'));
  if (!Number.isFinite(amount) || amount <= 0 || Math.abs(Math.round(amount * 100) - amount * 100) > 0.000001) return 'Sisesta korrektne summa kuni kahe komakohaga.';
  if (!Number.isFinite(vatAmount) || vatAmount < 0 || vatAmount > amount || Math.abs(Math.round(vatAmount * 100) - vatAmount * 100) > 0.000001) return 'Kontrolli käibemaksu summat.';
  return '';
}

export function filterExpenses(expenses, month, query) {
  const search = String(query || '').trim().toLocaleLowerCase('et');
  return expenses.filter((expense) => {
    if (month && !String(expense.expenseDate || '').startsWith(month)) return false;
    return !search || `${expense.description || ''} ${categoryLabel(expense.category)} ${expense.note || ''}`.toLocaleLowerCase('et').includes(search);
  });
}
