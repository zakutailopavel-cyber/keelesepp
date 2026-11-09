import { Badge } from '../../components/ui/index.js';
import { displayDate } from './finance.js';
import './financeDebts.css';

// „Pere: makstud?” (owner 2026-11-09): the parent pressed „Maksin ära” in the cabinet (invoicePaymentClaims). Only a
// notice — the invoice stays unpaid until the administrator finds the money in the bank and adds the payment.
export function paymentClaimTitle(claim, { stillOpen = true } = {}) {
  if (!claim) return '';
  return [
    `Pere teatas maksest${claim.claimedAt ? ` ${displayDate(claim.claimedAt)}` : ''}`,
    claim.claimedByName ? `(${claim.claimedByName})` : '',
    claim.note ? `— „${claim.note}”` : '',
  ].filter(Boolean).join(' ') + (stillOpen ? '. Kontrolli panka ja lisa makse.' : '.');
}

export default function PaymentClaimBadge({ claim }) {
  if (!claim) return null;
  return <span title={paymentClaimTitle(claim)} data-payment-claim><Badge tone="warning">Pere: makstud?</Badge></span>;
}
