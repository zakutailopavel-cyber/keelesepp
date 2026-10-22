import { collection, getDocs } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { financeApi } from './financeApi.js';

// bookkeeping (docs/ACCOUNTING.md): admins read the entries and the chart; every change goes through financeApi
export const accountingService = {
  async load() {
    const { db } = requireFirebaseClient();
    const [entries, accounts] = await Promise.all([getDocs(collection(db, 'accountingEntries')), getDocs(collection(db, 'accountingAccounts'))]);
    return {
      entries: entries.docs.map((item) => ({ id: item.id, ...item.data() })),
      accounts: accounts.docs.map((item) => ({ code: item.id, ...item.data() })).sort((a, b) => a.code.localeCompare(b.code, 'et', { numeric: true })),
    };
  },
  sync: () => financeApi.syncAccounting(),
  createEntry: (entry) => financeApi.createAccountingEntry(entry),
  reverse: (entryId, date, reason) => financeApi.reverseAccountingEntry(entryId, date, reason),
  setOpening: (balances) => financeApi.setAccountingOpening(balances),
  saveAccount: (account) => financeApi.saveAccountingAccount(account),
};
