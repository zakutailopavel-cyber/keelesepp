import { ArrowRightLeft, Check, HandCoins, X } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, Input, Modal } from '../../components/ui/index.js';
import { financeRequestId } from '../../services/firebase/financeApi.js';
import { euro } from './cashModel.js';
import { chosenCents, dayLabel, itemLine } from './myCashModel.js';

// „Minu kassa” (owner 2026-11-11) building blocks, shared by the teacher's page (/kassa/minu) and the admin's Kassa:
// the amount on hand with „Andsin raha üle”, the hand-overs that wait for this person's „Sain kätte”, and the dialog.
// `box` = financeApi.cashMine() (functions/cash-core.js myCashView + receivers).

/** „Sinu käes 50 €” + „Andsin raha üle” (disabled with nothing to give). */
export function MyCashSummary({ box, onHandOver, title = 'Sinu käes' }) {
  const canGive = box.availableCents > 0 && (box.receivers || []).length > 0;
  return (
    <Card className="my-cash-summary" as="section" aria-label="Minu käes olev sularaha">
      <div className="my-cash-summary__sum">
        <span>{title}</span>
        <strong>{euro(box.onHandCents)}</strong>
        {box.pendingOutCents > 0 ? <small>sellest {euro(box.pendingOutCents)} ootab kinnitust</small> : null}
      </div>
      <Button onClick={onHandOver} disabled={!canGive} title={canGive ? undefined : box.availableCents > 0 ? 'Kassa vastuvõtjaid pole määratud' : 'Üle anda pole midagi'}>
        <ArrowRightLeft size={16} aria-hidden="true" /> Andsin raha üle
      </Button>
    </Card>
  );
}

/** Hand-overs addressed to this person: „Sain kätte” / „Ei saanud” (with a note). */
export function PendingIncoming({ incoming = [], api, onDone }) {
  const [busy, setBusy] = useState('');
  const [refusing, setRefusing] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  if (!incoming.length) return null;
  const answer = async (entry, decision) => {
    setBusy(`${decision}-${entry.id}`); setError('');
    try {
      await api.answerCashHandover(entry.id, decision, decision === 'reject' ? note : '');
      setRefusing(''); setNote('');
      await onDone?.(decision === 'confirm' ? `${euro(entry.amountCents)} on nüüd sinu käes.` : 'Andjale on teada antud, et raha ei jõudnud kohale.');
    } catch (caught) { setError(caught.message || 'Salvestamine ebaõnnestus.'); } finally { setBusy(''); }
  };
  return (
    <Card className="my-cash-incoming" as="section" aria-label="Ootab sinu kinnitust">
      <h2><HandCoins size={18} aria-hidden="true" /> Ootab sinu kinnitust</h2>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <ul>
        {incoming.map((entry) => (
          <li key={entry.id}>
            <div className="my-cash-incoming__what">
              <strong>{entry.fromName || 'Kolleeg'} andis sulle {euro(entry.amountCents)}</strong>
              <small>{dayLabel(entry.handedAt)}{entry.itemCount ? ` · ${entry.itemCount} ${entry.itemCount === 1 ? 'kirje' : 'kirjet'}` : ''}{entry.note ? ` · ${entry.note}` : ''}</small>
            </div>
            {refusing === entry.id ? (
              <form className="my-cash-incoming__refuse" onSubmit={(event) => { event.preventDefault(); answer(entry, 'reject'); }}>
                <Input label="Mis juhtus?" value={note} onChange={(event) => setNote(event.target.value)} placeholder="nt sain ainult 25 €" required />
                <div className="my-cash-incoming__buttons">
                  <Button type="submit" variant="danger" loading={busy === `reject-${entry.id}`} disabled={!note.trim()}>Saada</Button>
                  <Button type="button" variant="secondary" onClick={() => { setRefusing(''); setNote(''); }}>Loobu</Button>
                </div>
              </form>
            ) : (
              <div className="my-cash-incoming__buttons">
                <Button loading={busy === `confirm-${entry.id}`} disabled={Boolean(busy)} onClick={() => answer(entry, 'confirm')}><Check size={16} aria-hidden="true" /> Sain kätte</Button>
                <Button variant="secondary" disabled={Boolean(busy)} onClick={() => { setRefusing(entry.id); setNote(''); }}><X size={16} aria-hidden="true" /> Ei saanud</Button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** „Andsin raha üle”: whom (the cash receivers) and what (everything on hand, or chosen entries). */
export function HandoverDialog({ box, api, onClose, onDone }) {
  const receivers = box.receivers || [];
  const items = box.items || [];
  const [toUid, setToUid] = useState(receivers.length === 1 ? receivers[0].uid : '');
  const [chosen, setChosen] = useState(null); // null = everything
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [requestId] = useState(() => financeRequestId('cash_handover_request'));
  const amount = chosenCents(items, chosen, box.availableCents);
  const receiver = receivers.find((person) => person.uid === toUid);
  const toggle = (id) => setChosen((current) => {
    const next = new Set(current || []);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const submit = async (event) => {
    event.preventDefault();
    if (!toUid || !(amount > 0)) return;
    setBusy(true); setError('');
    try {
      await api.requestCashHandover({ toUid, itemIds: chosen ? [...chosen] : [], note, requestId });
      await onDone?.(`${euro(amount)} ootab, et ${receiver?.name || 'saaja'} kinnitab „Sain kätte”.`);
    } catch (caught) { setError(caught.message || 'Salvestamine ebaõnnestus.'); setBusy(false); }
  };
  return (
    <Modal open title="Andsin raha üle" onClose={onClose} className="my-cash-dialog"
      footer={<><Button variant="secondary" onClick={onClose}>Loobu</Button><Button type="submit" form="my-cash-handover" loading={busy} disabled={!toUid || !(amount > 0)}>Andsin üle {amount > 0 ? euro(amount) : ''}</Button></>}>
      <form id="my-cash-handover" className="my-cash-dialog__form" onSubmit={submit}>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <fieldset>
          <legend>Kellele andsid?</legend>
          {receivers.length ? receivers.map((person) => (
            <label key={person.uid} className={`my-cash-choice ${toUid === person.uid ? 'is-chosen' : ''}`}>
              <input type="radio" name="cash-receiver" value={person.uid} checked={toUid === person.uid} onChange={() => setToUid(person.uid)} />
              <span>{person.name}</span>
            </label>
          )) : <p className="form-hint">Kassa vastuvõtjaid pole määratud. Palu adminil need Kassas lisada.</p>}
        </fieldset>
        <fieldset>
          <legend>Mida andsid?</legend>
          <label className={`my-cash-choice ${!chosen ? 'is-chosen' : ''}`}>
            <input type="radio" name="cash-what" checked={!chosen} onChange={() => setChosen(null)} />
            <span>Kõik, mis on käes · <b>{euro(box.availableCents)}</b></span>
          </label>
          {items.length > 1 ? (
            <label className={`my-cash-choice ${chosen ? 'is-chosen' : ''}`}>
              <input type="radio" name="cash-what" checked={Boolean(chosen)} onChange={() => setChosen(new Set())} />
              <span>Valin kirjed</span>
            </label>
          ) : null}
          {chosen ? (
            <ul className="my-cash-pick">
              {items.map((item) => (
                <li key={item.id}>
                  <label>
                    <input type="checkbox" checked={chosen.has(item.id)} onChange={() => toggle(item.id)} />
                    <span><strong>{itemLine(item)}</strong><small>{dayLabel(item.date)}</small></span>
                    <b>{euro(item.remainingCents)}</b>
                  </label>
                </li>
              ))}
            </ul>
          ) : null}
        </fieldset>
        <Input label="Märkus (valikuline)" value={note} onChange={(event) => setNote(event.target.value)} placeholder="nt andsin koolis kell 15" />
        <p className="form-hint">Raha liigub {receiver?.name || 'saaja'} kassasse alles siis, kui ta vajutab „Sain kätte”. Seni on see sinu kassas kirjas „ootab kinnitust”.</p>
      </form>
    </Modal>
  );
}

export const HandoverStatus = ({ status, labels }) => {
  const meta = labels[status] || labels.active;
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
};
