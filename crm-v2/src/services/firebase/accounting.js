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
  sync: () => financeApi.syncAccounting(),
  createEntry: (entry) => financeApi.createAccountingEntry(entry),
  reverse: (entryId, date, reason) => financeApi.reverseAccountingEntry(entryId, date, reason),
  setOpening: (balances) => financeApi.setAccountingOpening(balances),
  saveAccount: (account) => financeApi.saveAccountingAccount(account),
  updateEntry: (entryId, entry, reason) => financeApi.updateAccountingEntry(entryId, entry, reason),
  deleteEntry: (entryId, reason) => financeApi.deleteAccountingEntry(entryId, reason),
  undoStorno: (entryId, reason) => financeApi.undoAccountingStorno(entryId, reason),
  replaceAccount: (request) => financeApi.replaceAccountingAccount(request),
  setLock: (lockedThrough, reason) => financeApi.setAccountingLock(lockedThrough, reason),
  saveSupplier: (supplierId, supplier) => financeApi.saveSupplier(supplierId, supplier),
  importSuppliers: (rows) => financeApi.importSuppliers(rows),
};
