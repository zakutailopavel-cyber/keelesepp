import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { financeApi } from './financeApi.js';

// bookkeeping (docs/ACCOUNTING.md): admins read the entries, the chart and Tarnijad (the partners of the lines); every
// change goes through financeApi
export const accountingService = {
  async load() {
    const { db } = requireFirebaseClient();
    const [entries, accounts, lock, suppliers] = await Promise.all([getDocs(collection(db, 'accountingEntries')), getDocs(collection(db, 'accountingAccounts')), getDoc(doc(db, 'accountingSettings', 'lock')), getDocs(collection(db, 'suppliers'))]);
    return {
      lockedThrough: lock.exists() ? String(lock.data().lockedThrough || '') : '',
      suppliers: suppliers.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => String(a.name).localeCompare(String(b.name), 'et')),
      entries: entries.docs.map((item) => ({ id: item.id, ...item.data() })),
      accounts: accounts.docs.map((item) => ({ code: item.id, ...item.data() })).sort((a, b) => a.code.localeCompare(b.code, 'et', { numeric: true })),
    };
  },
  // Pangapõhine raamatupidamine (docs/ACCOUNTING.md): the statement lines, rules, closing balances and the start date
  async loadBank() {
    const { db } = requireFirebaseClient();
    const [lines, rules, balances, setting, imports] = await Promise.all([
      getDocs(collection(db, 'bankStatementLines')), getDocs(collection(db, 'bankRules')), getDocs(collection(db, 'bankStatementBalances')),
      getDoc(doc(db, 'accountingSettings', 'bankBooks')), getDocs(collection(db, 'bankStatementImports')),
    ]);
    const list = (snap) => snap.docs.map((item) => ({ id: item.id, ...item.data() }));
    return {
      lines: list(lines),
      rules: list(rules),
      balances: Object.fromEntries(list(balances).map((b) => [b.id, b.closingCents])),
      bankBooksSince: setting.exists() ? String(setting.data().since || '') : '',
      imports: list(imports).sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''))),
    };
  },
  setBankBooks: (since, reason) => financeApi.setBankBooks(since, reason),
  bankBooksReview: (from, to) => financeApi.bankBooksReview(from, to),
  importBankStatement: (csv, fileName) => financeApi.importBankStatement(csv, fileName),
  confirmBankLine: (lineId, choice) => financeApi.confirmBankLine(lineId, choice),
  dismissBankLine: (lineId) => financeApi.dismissBankLine(lineId),
  categorizeBankLine: (lineId, values) => financeApi.categorizeBankLine(lineId, values),
  uncategorizeBankLine: (lineId, reason) => financeApi.uncategorizeBankLine(lineId, reason),
  saveBankRule: (ruleId, rule) => financeApi.saveBankRule(ruleId, rule),
  setBankClosingBalance: (month, closingCents) => financeApi.setBankClosingBalance(month, closingCents),
  rematchBankLines: () => financeApi.rematchBankLines(),
  sync: () => financeApi.syncAccounting(),
  createEntry: (entry) => financeApi.createAccountingEntry(entry),
  reverse: (entryId, date, reason) => financeApi.reverseAccountingEntry(entryId, date, reason),
  setOpening: (balances) => financeApi.setAccountingOpening(balances),
  saveAccount: (account) => financeApi.saveAccountingAccount(account),
  updateEntry: (entryId, entry, reason) => financeApi.updateAccountingEntry(entryId, entry, reason),
  deleteEntry: (entryId, reason) => financeApi.deleteAccountingEntry(entryId, reason),
  restoreEntry: (entryId) => financeApi.restoreAccountingEntry(entryId),
  undoStorno: (entryId, reason) => financeApi.undoAccountingStorno(entryId, reason),
  replaceAccount: (request) => financeApi.replaceAccountingAccount(request),
  setLock: (lockedThrough, reason) => financeApi.setAccountingLock(lockedThrough, reason),
  saveSupplier: (supplierId, supplier) => financeApi.saveSupplier(supplierId, supplier),
  importSuppliers: (rows) => financeApi.importSuppliers(rows),
};
