import { CheckCircle2, CreditCard, Loader2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { linkpayApi } from '../../services/firebase/linkpayApi.js';
import './payments.css';

const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format((Number(cents) || 0) / 100);

/**
 * Public pay page (no login): /maksa/<invoiceId>?k=<code> from the PDF / e-mail opens the bank page with the invoice's
 * current balance; /maksa/tagasi?payment_reference=…&order_reference=… is where the bank sends the payer back — the
 * server asks the bank for the real state, this page only shows it.
 */
export default function PayInvoicePage({ api = linkpayApi, go = (url) => globalThis.location.assign(url) }) {
  const { invoiceId } = useParams();
  const [params] = useSearchParams();
  const [state, setState] = useState({ phase: 'loading' });
  const back = invoiceId === 'tagasi';
  const paymentReference = params.get('payment_reference') || '';
  const orderReference = params.get('order_reference') || '';
  const code = params.get('k') || '';

  useEffect(() => {
    let live = true;
    const run = back
      ? api.checkReturn(paymentReference, orderReference).then((result) => live && setState({ phase: 'result', ...result }))
      : api.startWithCode(invoiceId, code).then((result) => { if (live) { setState({ phase: 'redirect' }); go(result.url); } });
    run.catch((error) => live && setState({ phase: 'error', message: error?.message || 'Midagi läks valesti.' }));
    return () => { live = false; };
  }, [api, back, code, go, invoiceId, orderReference, paymentReference]);

  let body;
  if (state.phase === 'loading' || state.phase === 'redirect') {
    body = <><Loader2 className="pay-spin" size={36} /><h1>{back ? 'Kontrollime makset…' : 'Avan panga makselehe…'}</h1><p>Palun oota mõni sekund.</p></>;
  } else if (state.phase === 'error') {
    body = <><XCircle className="pay-icon is-bad" size={40} /><h1>Makset ei saanud alustada</h1><p>{state.message}</p><p className="pay-muted">Kui viga kordub, kirjuta meile: info@epkoolitus.ee</p></>;
  } else if (state.status === 'settled') {
    body = <><CheckCircle2 className="pay-icon is-ok" size={40} /><h1>Aitäh, makse on kinnitatud!</h1><p>Arve {state.invoiceNum} {state.balanceCents > 0 ? `— tasuda jääb veel ${money(state.balanceCents)}` : 'on tasutud'}.</p></>;
  } else if (state.status === 'failed') {
    body = <><XCircle className="pay-icon is-bad" size={40} /><h1>Makse ei õnnestunud</h1><p>Raha ei võetud. Proovi uuesti sama lingiga arvelt või e-kirjast.</p></>;
  } else {
    body = <><CreditCard className="pay-icon" size={40} /><h1>Makse on töötlemisel</h1><p>Pank kinnitab makse peagi. Arve {state.invoiceNum} märgitakse tasutuks automaatselt.</p></>;
  }
  return <main className="pay-page"><section className="pay-card" aria-live="polite">{body}<footer>KeeleSepp · E&amp;P Koolitus OÜ</footer></section></main>;
}
