import { Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { euro } from './cashModel.js';
import { useMyCashTotals } from './useMyCashTotals.js';
import './myCash.css';

// „Sinu käes sularaha: 50 € · Anna üle” (owner 2026-11-11) on the teacher's dashboard and „Märkimata tunnid”; nothing
// when the teacher holds no cash and nothing waits for a receiver.
export default function CashOnHandLine({ uid, service, enabled = true }) {
  const totals = useMyCashTotals(uid, { service, enabled });
  if (!totals || (totals.availableCents <= 0 && totals.pendingOutCents <= 0)) return null;
  return (
    <p className="cash-on-hand-line" role="status">
      <Wallet size={18} aria-hidden="true" />
      <span>Sinu käes sularaha: <b>{euro(totals.onHandCents)}</b>{totals.pendingOutCents > 0 ? <small> · {euro(totals.pendingOutCents)} ootab kinnitust</small> : null}</span>
      {totals.availableCents > 0 ? <Link to="/kassa/minu?anna=1">Anna üle</Link> : <Link to="/kassa/minu">Minu kassa</Link>}
    </p>
  );
}
