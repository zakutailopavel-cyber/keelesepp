import { useEffect, useState } from 'react';
import { CASH_BOX_CHANGED_EVENT, cashBoxService } from '../../services/firebase/cashBox.js';
import { myCashTotals } from './myCashModel.js';

// „Minu kassa” (owner 2026-11-11): no CSS or page code here — the app shell uses it for the menu.
/** A person's own cash totals from their own cashLedger entries (rules: only their own); null until read or on error. */
export function useMyCashTotals(uid, { service = cashBoxService, enabled = true } = {}) {
  const [totals, setTotals] = useState(null);
  const [key, setKey] = useState(0);
  useEffect(() => {
    if (!enabled) return undefined;
    const onChange = () => setKey((value) => value + 1);
    globalThis.addEventListener?.(CASH_BOX_CHANGED_EVENT, onChange);
    return () => globalThis.removeEventListener?.(CASH_BOX_CHANGED_EVENT, onChange);
  }, [enabled]);
  useEffect(() => {
    if (!enabled || !uid || !service?.ownEntries) return undefined;
    let alive = true;
    Promise.resolve(service.ownEntries(uid))
      .then((entries) => { if (alive) setTotals(myCashTotals(entries || [], uid)); })
      .catch(() => { if (alive) setTotals(null); });
    return () => { alive = false; };
  }, [uid, service, enabled, key]);
  return totals;
}

