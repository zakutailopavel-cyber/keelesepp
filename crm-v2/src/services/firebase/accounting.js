import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { financeApi } from './financeApi.js';

// bookkeeping (docs/ACCOUNTING.md): admins read the entries and the chart; every change goes through financeApi
export const accountingService = {
  async load() {
    const { db } = requireFirebaseClient();
    const [entries, accounts, lock] = await Promise.all([getDocs(collection(db, 'accountingEntries')), getDocs(collection(db, 'accountingAccounts')), getDoc(doc(db, 'accountingSettings', 'lock'))]);
    return {
      lockedThrough: lock.exists() ? String(lock.data().lockedThrough || '') : '',
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
  replaceAccount: (request) => financeApi.replaceAccountingAccount(request),
  setLock: (lockedThrough, reason) => financeApi.setAccountingLock(lockedThrough, reason),
};
