import { Coins } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button, Input, Modal, Select } from '../../components/ui/index.js';
import { manualInvoiceApi } from '../../services/firebase/manualInvoiceApi.js';
import { invoiceDeliveryApi } from '../../services/firebase/financeApi.js';
import { lessonTokensService, TOKEN_EXPIRY_DAYS, tokenAccount, tokenSubjectKey } from '../../services/firebase/lessonTokens.js';
import { subjectsOf } from '../students/subjects.js';
import { INVOICE_NOTE_MAX, invoiceNotesService, saveCreationNote } from '../../services/firebase/invoiceNotes.js';
import { defaultBillingMonth } from './monthlyBilling.js';

const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format((Number(cents) || 0) / 100);
const PRESETS = [4, 8, 9, 12];
const dueDefault = () => `${defaultBillingMonth()}-10`;

// „Tunnipakett” (owner 2026-10-14): an invoice for N lessons at the card's price. The parent pays; the administrator
// then presses „Lisa tunnid” on the paid invoice and the card gets N lessons; every held lesson takes one.
export default function TokenInvoiceDialog({ studentCards = [], plans = [], onCreated, api = manualInvoiceApi, deliveryApi = invoiceDeliveryApi, tokensApi = lessonTokensService, notesRepository = invoiceNotesService }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [studentId, setStudentId] = useState('');
  const [pickedSubject, setPickedSubject] = useState('');
  const [lessons, setLessons] = useState(8);
  const [due, setDue] = useState(dueDefault);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState({ studentId: '', packages: null });
  const [requestId, setRequestId] = useState('');

  const cards = useMemo(() => studentCards.filter((card) => card && card.active !== false && !card.convertedToParent && String(card.name || '').trim())
    .sort((a, b) => String(a.name).localeCompare(String(b.name), 'et')), [studentCards]);
  const matches = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('et');
    return needle ? cards.filter((card) => `${card.name} ${card.subject || ''} ${card.parentName || ''} ${card.parentEmail || ''}`.toLocaleLowerCase('et').includes(needle)) : cards;
  }, [cards, query]);
  const card = cards.find((item) => item.id === studentId) || null;
  const plan = plans.find((item) => (item.studentId || item.id) === studentId) || null;
  // one package per subject (owner 2026-10-30): a card with several subjects has to name one; that subject's price
  const subjects = useMemo(() => (card ? subjectsOf(card) : []), [card]);
  const subject = subjects.length === 1 ? subjects[0] : subjects.includes(pickedSubject) ? pickedSubject : '';
  const subjectPrice = subject ? plan?.subjectPrices?.[subject] : null;
  const priceCents = Number(subjectPrice?.lessonPriceCents ?? plan?.lessonPriceCents) || 0;
  const minutes = subjectPrice?.lessonMinutes || plan?.lessonMinutes || 60;
  const count = Math.max(0, Math.floor(Number(lessons) || 0));
  const payer = card ? (card.payerName || card.parentName || card.name) : '';
  const payerEmail = card ? (card.payerEmail || card.parentEmail || card.email || '') : '';

  // the chosen card's current package balance of this subject (shown only for the card it was read for)
  const balance = useMemo(() => {
    if (loaded.studentId !== studentId || !loaded.packages || !subject) return null;
    const account = tokenAccount({ packages: loaded.packages, card });
    return account.subjects.find((group) => group.key === tokenSubjectKey(subject))?.left ?? 0;
  }, [card, loaded, studentId, subject]);
  useEffect(() => {
    if (!studentId) return undefined;
    let alive = true;
    tokensApi.listByStudent(studentId)
      .then((packages) => { if (alive) setLoaded({ studentId, packages }); })
      .catch(() => { if (alive) setLoaded({ studentId, packages: null }); });
    return () => { alive = false; };
  }, [studentId, tokensApi]);

  const close = () => { if (busy) return; setOpen(false); setQuery(''); setStudentId(''); setPickedSubject(''); setLessons(8); setNote(''); setError(''); setRequestId(''); setDue(dueDefault()); };

  const create = async (send) => {
    setError('');
    if (!card) { setError('Vali õpilane.'); return; }
    if (!subject) { setError('Vali aine: õpilasel on mitu ainet ja pakett kuulub ühele neist.'); return; }
    if (!priceCents) { setError('Õpilasel puudub tunnihind: määra see õpilase kaardil (Finantsid → Arveldus).'); return; }
    if (count < 1 || count > 100) { setError('Tundide arv peab olema 1–100.'); return; }
    if (send && !payerEmail) { setError('Maksjal puudub e-post: lisa see õpilase kaardile või loo arve ilma saatmata.'); return; }
    setBusy(send ? 'send' : 'create');
    // one request id per form: a retry after an error never makes a second invoice
    const id = requestId || `lesson_tokens_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setRequestId(id);
    try {
      // the note is internal: it goes to invoiceNotes, never onto the invoice the payer can read
      const { invoice } = await api.createTokens({ studentId, lessons: count, due, note: '', subject, requestId: id });
      const noted = await saveCreationNote(notesRepository, invoice, note);
      if (send) await deliveryApi.send(invoice.id);
      setBusy('');
      close();
      await onCreated?.(invoice, { sent: send, ...noted });
    } catch (caught) {
      setError(caught.message || 'Arvet ei saanud luua.');
      setBusy('');
    }
  };

  return <>
    <Button variant="secondary" onClick={() => setOpen(true)}><Coins size={17} /> Tunnipakett</Button>
    <Modal open={open} title="Tunnipakett: arve N tunni eest" onClose={close} footer={<>
      <Button variant="secondary" disabled={Boolean(busy)} onClick={close}>Loobu</Button>
      <Button variant="secondary" loading={busy === 'create'} disabled={Boolean(busy)} onClick={() => create(false)}>Loo arve</Button>
      <Button loading={busy === 'send'} disabled={Boolean(busy)} onClick={() => create(true)}>Loo ja saada</Button>
    </>}>
      <div className="form-grid">
        <Input className="form-grid__wide" label="Otsi õpilast" type="search" placeholder="Nimi, aine, lapsevanem või e-post" value={query} onChange={(event) => setQuery(event.target.value)} />
        <Select className="form-grid__wide" label="Õpilane ja aine" value={studentId} onChange={(event) => setStudentId(event.target.value)}>
          <option value="">{matches.length ? `Vali (${matches.length})` : 'Keegi ei vasta otsingule'}</option>
          {matches.map((item) => <option key={item.id} value={item.id}>{item.name}{item.subject ? ` · ${item.subject}` : ''}{item.parentName ? ` · ${item.parentName}` : ''}</option>)}
        </Select>
        {subjects.length > 1 ? <Select className="form-grid__wide" label="Aine" value={subject} onChange={(event) => setPickedSubject(event.target.value)}>
          <option value="">Vali aine ({subjects.length})</option>
          {subjects.map((item) => <option key={item} value={item}>{item}</option>)}
        </Select> : null}
        {card ? <p className="form-hint form-grid__wide">
          Maksja: <strong>{payer}</strong>{payerEmail ? ` · ${payerEmail}` : ' · e-post puudub'} · Tunnihind: <strong>{priceCents ? `${money(priceCents)} / ${minutes} min` : 'määramata'}</strong>
          {balance !== null ? <> · Praegu paketis{subjects.length > 1 ? ` (${subject})` : ''}: <strong>{balance} tundi</strong></> : null}
        </p> : null}
        <div className="field form-grid__wide">
          <span className="field__label">Tundide arv</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {PRESETS.map((n) => <Button key={n} type="button" variant={count === n ? 'primary' : 'secondary'} onClick={() => setLessons(n)}>{n}</Button>)}
            <input aria-label="Tundide arv" className="field__input" style={{ width: 90 }} type="number" min="1" max="100" value={lessons} onChange={(event) => setLessons(event.target.value)} />
            <span className="form-hint">nt 2 korda nädalas → 8–9 tundi kuus</span>
          </div>
        </div>
        <Input label="Maksetähtaeg" type="date" value={due} onChange={(event) => setDue(event.target.value)} />
        <Input label="Sisemine märkus (ainult töötajatele)" maxLength={INVOICE_NOTE_MAX} placeholder="Mille eest arve on — ei ilmu arvele ega e-kirja" value={note} onChange={(event) => setNote(event.target.value)} />
        <p className="form-grid__wide" role="status"><strong>Kokku: {priceCents && count ? `${count} × ${money(priceCents)} = ${money(count * priceCents)}` : '—'}</strong><br />
          <span className="form-hint">Tunnid lisatakse õpilasele pärast makse laekumist nupuga „Lisa tunnid” arvete nimekirjas. Iga toimunud tund selles aines (ja ette teatamata puudumine) võtab ühe tunni. Kasutamata tunnid aeguvad, kui {TOKEN_EXPIRY_DAYS} päeva ei toimu ühtegi tundi.</span></p>
        {error ? <p className="action-error form-grid__wide" role="alert">{error}</p> : null}
      </div>
    </Modal>
  </>;
}
