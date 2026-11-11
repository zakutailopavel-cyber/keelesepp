import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { shareInFlight } from './shareInFlight.js';

// „Minu kassa” (owner 2026-11-11), reads only. firestore.rules let a staff member read the cashLedger entries where
// they hold, give or get money — each query filters on one of those fields with their own uid. Everything that
// changes money goes through financeApi (/cash/handover/request, /answer, /cancel). Used by the menu (show „Minu
// kassa” only to a teacher who ever had cash), the badge for a receiver and the dashboard line.

const FIELDS = ['holderUid', 'fromUid', 'toUid'];

// every entry of the person (no other person's entries; deduplicated)
async function readOwn(uid) {
  const { db } = requireFirebaseClient();
  const ledger = collection(db, 'cashLedger');
  const snaps = await Promise.all(FIELDS.map((field) => getDocs(query(ledger, where(field, '==', uid)))));
  const byId = new Map();
  snaps.forEach((snap) => snap.docs.forEach((item) => byId.set(item.id, { id: item.id, ...item.data() })));
  return [...byId.values()];
}

export const cashBoxService = {
  ownEntries(uid) {
    if (!uid) return Promise.resolve([]);
    return shareInFlight(`cash-box:${uid}`, () => readOwn(uid));
  },
  // hand-overs addressed to the person that wait for „Sain kätte” (once, for the bell)
  async pendingIncoming(uid) {
    if (!uid) return [];
    const { db } = requireFirebaseClient();
    const snap = await getDocs(query(collection(db, 'cashLedger'), where('toUid', '==', uid), where('status', '==', 'pending')));
    return snap.docs.map((item) => ({ id: item.id, ...item.data() }));
  },
  // the same, live (for the menu badge)
  subscribePendingIncoming(uid, onChange, onError = () => {}) {
    if (!uid) return () => {};
    const { db } = requireFirebaseClient();
    const pending = query(collection(db, 'cashLedger'), where('toUid', '==', uid), where('status', '==', 'pending'));
    return onSnapshot(pending, (snap) => onChange(snap.docs.map((item) => ({ id: item.id, ...item.data() }))), onError);
  },
};

// a change in the person's cash (a hand-over made / answered): the menu and the dashboard line read again
export const CASH_BOX_CHANGED_EVENT = 'keelesepp:cash-box-changed';
export const announceCashBoxChange = () => { try { globalThis.dispatchEvent?.(new globalThis.Event(CASH_BOX_CHANGED_EVENT)); } catch { /* no window */ } };
