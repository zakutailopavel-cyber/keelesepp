import { Coins, Plus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button, Input, Modal, Select } from '../../components/ui/index.js';
import { manualInvoiceApi } from '../../services/firebase/manualInvoiceApi.js';
import IssuerSelect from './fie/IssuerSelect.jsx';
import { lessonTokensService, subjectBalance } from '../../services/firebase/lessonTokens.js';
import { studyDirectionsService } from '../../services/firebase/studyDirections.js';
import { subjectsOf } from '../students/subjects.js';
import { activeDirections } from '../students/studyDirections.js';
import { useStudyDirections } from '../students/useStudyDirections.js';
import { INVOICE_NOTE_MAX, invoiceNotesService, saveCreationNote } from '../../services/firebase/invoiceNotes.js';
import { defaultBillingMonth, payerKey } from './monthlyBilling.js';
import { MIXED_PAYER_MESSAGE, TOKEN_INVOICE_NOT_SENT_HINT, TOKEN_ROWS_MAX, tokenMoney as money, tokenRowPriceView, tokenRowState, tokenRowsError } from './tokenInvoiceRows.js';
import { cardPayerEmail, cardPayerName } from './invoicePayer.js';

// one request id per form (a retry after an error never makes a second invoice); outside the component so it is never
// called during render
const newRequestId = () => `lesson_tokens_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const PRESETS = [4, 8, 9, 12];
const dueDefault = () => `${defaultBillingMonth()}-10`;
let rowSeq = 0;
const newRow = (studentId = '') => ({ key: `row-${(rowSeq += 1)}`, studentId, pickedSubject: '', lessons: 8 });

// „Tunnipakett” (owner 2026-10-14): an invoice for N lessons at the card's price. The parent pays; the administrator
// then presses „Lisa tunnid” on the paid invoice and the card gets N lessons; every held lesson takes one.
// The package is for one course (Oleksiy 2026-11-03: „нет возможности выбрать курс”): the card's own subjects (the
// school's „Õppesuunad” when the card names none), the only one chosen by default; that subject's price, and only its
// lessons take from the package (functions/lesson-tokens-core.js tokenInvoiceSubject / packageTiersForLesson).
// „Ühine tunnipakett” (owner 2026-11-04): „+ Lisa rida” adds another child (or another subject) of the SAME payer; the
// lines become ONE invoice (manualInvoiceApi /create-tokens-combined), each line priced from its own card, and after
// payment every line becomes its own package on its own card.
export default function TokenInvoiceDialog({ studentCards = [], plans = [], onCreated, api = manualInvoiceApi, tokensApi = lessonTokensService, notesRepository = invoiceNotesService, directionsService = studyDirectionsService }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState(() => [newRow()]);
  const [due, setDue] = useState(dueDefault);
  const [note, setNote] = useState('');
  const [issuer, setIssuer] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  // the packages read per card: { [studentId]: packages | null }
  const [loaded, setLoaded] = useState({});
  const directions = useStudyDirections(directionsService);
  const [requestId, setRequestId] = useState('');

  const cards = useMemo(() => studentCards.filter((card) => card && card.active !== false && !card.convertedToParent && String(card.name || '').trim())
    .sort((a, b) => String(a.name).localeCompare(String(b.name), 'et')), [studentCards]);
  const matches = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('et');
    return needle ? cards.filter((card) => `${card.name} ${subjectsOf(card).join(' ')} ${card.subject || ''} ${card.parentName || ''} ${card.parentEmail || ''}`.toLocaleLowerCase('et').includes(needle)) : cards;
  }, [cards, query]);
  const schoolSubjects = useMemo(() => activeDirections(directions).map((item) => item.name), [directions]);
  const states = rows.map((row) => tokenRowState(row, { cards, plans, schoolSubjects }));
  const first = states[0];
  const card = first.card;
  const combined = rows.length > 1;
  // the same payer and address the server stores and sends to (invoicePayer.js ↔ functions/invoice-payer-core.js)
  const payer = card ? cardPayerName(card) : '';
  const payerEmail = card ? cardPayerEmail(card) : '';
  const firstPayer = card ? payerKey(card) : '';
  // the other lines: the first card's payer's cards first (one parent's children); another payer cannot be combined
  const samePayerCards = cards.filter((item) => firstPayer && payerKey(item) === firstPayer);
  const otherCards = cards.filter((item) => !firstPayer || payerKey(item) !== firstPayer);
  const total = states.reduce((sum, state) => sum + state.amountCents, 0);
  const totalLessons = states.reduce((sum, state) => sum + state.count, 0);
  const complete = states.every((state) => state.priceCents && state.count);
  // a line whose card + subject has no price cannot be invoiced (the server refuses it too): „Loo arve” waits
  const priceMissing = states.some((state) => state.card && tokenRowPriceView(state).status === 'missing');

  // the lessons left that this subject's lessons can take (shown only for the card it was read for)
  const balanceOf = (state) => (state.card && state.subject && loaded[state.card.id] ? subjectBalance(loaded[state.card.id], state.subject) : null);
  const studentIdsKey = [...new Set(rows.map((row) => row.studentId).filter(Boolean))].sort().join('|');
  useEffect(() => {
    if (!studentIdsKey) return undefined;
    let alive = true;
    studentIdsKey.split('|').filter((id) => !(id in loaded)).forEach((id) => {
      tokensApi.listByStudent(id)
        .then((packages) => { if (alive) setLoaded((current) => ({ ...current, [id]: packages })); })
        .catch(() => { if (alive) setLoaded((current) => ({ ...current, [id]: null })); });
    });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- read each card once; `loaded` grows from these reads
  }, [studentIdsKey, tokensApi]);

  const updateRow = (key, patch) => { setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row))); setRequestId(''); setError(''); };
  const addRow = () => { if (rows.length < TOKEN_ROWS_MAX) { setRows((current) => [...current, newRow()]); setRequestId(''); } };
  const removeRow = (key) => { setRows((current) => current.filter((row) => row.key !== key)); setRequestId(''); setError(''); };
  const close = () => { if (busy) return; setOpen(false); setQuery(''); setRows([newRow()]); setNote(''); setError(''); setRequestId(''); setDue(dueDefault()); };

  // Oleksiy 2026-11-06 („Убрать автоматическую отправку счета по туннипакету!!”): the dialog only creates the invoice;
  // it is e-mailed by hand from its row in the invoice list („Saada”), never from here
  const create = async () => {
    setError('');
    const blocked = tokenRowsError(states);
    if (blocked) { setError(blocked); return; }
    setBusy('create');
    // one request id per form: a retry after an error never makes a second invoice
    const id = requestId || newRequestId();
    setRequestId(id);
    try {
      // the note is internal: it goes to invoiceNotes, never onto the invoice the payer can read
      const { invoice } = combined
        ? await api.createTokensCombined({ items: states.map((state) => ({ studentId: state.card.id, subject: state.subject, lessons: state.count })), due, note: '', requestId: id, issuer })
        : await api.createTokens({ studentId: card.id, lessons: first.count, due, note: '', subject: first.subject, requestId: id, issuer });
      const noted = await saveCreationNote(notesRepository, invoice, note);
      setBusy('');
      close();
      await onCreated?.(invoice, { sent: false, ...noted });
    } catch (caught) {
      setError(caught.message || 'Arvet ei saanud luua.');
      setBusy('');
    }
  };

  const subjectSelect = (row, state, label) => (state.card ? <Select className="form-grid__wide" label={label} value={state.subject} onChange={(event) => updateRow(row.key, { pickedSubject: event.target.value })}>
    {state.subjects.length === 1 && state.ownSubjects.length === 1 ? null : <option value="">{`Vali aine (${state.subjects.length})`}</option>}
    {state.subjects.map((item) => <option key={item} value={item}>{item}</option>)}
  </Select> : null);
  // „Tunnihind” for control (Oleksiy 2026-11-06): the price per hour, the lesson length and price when not 60 min, and
  // „N tundi × hind = summa” — all from the server's per-lesson price (tokenInvoiceRows.js tokenPlanPrice)
  const priceBlock = (state, index) => {
    if (!state.card) return null;
    const view = tokenRowPriceView(state);
    const subject = state.subject ? ` (${state.subject})` : '';
    if (view.status === 'no-subject') return <p className="form-hint form-grid__wide" data-token-price={index + 1}>Tunnihind: vali aine</p>;
    if (view.status === 'missing') return <p className="action-error form-grid__wide" data-token-price={index + 1}>{state.subject}: {view.warning}</p>;
    return <p className="form-hint form-grid__wide" data-token-price={index + 1}>
      <strong>{view.hourly}</strong>{subject}
      {view.lesson ? <> · {view.lesson}</> : null}
      {view.amount ? <><br />{index || combined ? `Rida ${index + 1}: ` : ''}{view.amount}</> : null}
    </p>;
  };
  const cardOption = (item) => <option key={item.id} value={item.id}>{item.name}{subjectsOf(item).length ? ` · ${subjectsOf(item).join(', ')}` : ''}{item.parentName ? ` · ${item.parentName}` : ''}</option>;
  const firstBalance = balanceOf(first);

  return <>
    <Button variant="secondary" onClick={() => setOpen(true)}><Coins size={17} /> Tunnipakett</Button>
    <Modal open={open} title={combined ? 'Ühine tunnipakett: üks arve mitme rea eest' : 'Tunnipakett: arve N tunni eest'} onClose={close} footer={<>
      <Button variant="secondary" disabled={Boolean(busy)} onClick={close}>Loobu</Button>
      <Button loading={busy === 'create'} disabled={Boolean(busy) || priceMissing} onClick={create}>Loo arve</Button>
    </>}>
      <div className="form-grid">
        <Input className="form-grid__wide" label="Otsi õpilast" type="search" placeholder="Nimi, aine, lapsevanem või e-post" value={query} onChange={(event) => setQuery(event.target.value)} />
        <Select className="form-grid__wide" label="Õpilane" value={rows[0].studentId} onChange={(event) => updateRow(rows[0].key, { studentId: event.target.value, pickedSubject: '' })}>
          <option value="">{matches.length ? `Vali (${matches.length})` : 'Keegi ei vasta otsingule'}</option>
          {matches.map(cardOption)}
        </Select>
        {subjectSelect(rows[0], first, 'Aine (kursus)')}
        {card ? <p className="form-hint form-grid__wide">
          Maksja: <strong>{payer}</strong>{payerEmail ? ` · ${payerEmail}` : ' · Arvel pole saaja e-posti'}
          {firstBalance !== null ? <> · Praegu paketis ({first.subject}): <strong>{firstBalance} tundi</strong></> : null}
        </p> : null}
        <div className="field form-grid__wide">
          <span className="field__label">Tundide arv</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* the modal renders inside .finance-month-hero__actions (no portal): the hero's white-on-dark secondary
                buttons rule is scoped to direct children (financeMonth.css), so unselected chips stay dark on white (#bug 2026-11-06) */}
            {PRESETS.map((n) => <Button key={n} type="button" data-token-chip={n} aria-pressed={first.count === n} variant={first.count === n ? 'primary' : 'secondary'} onClick={() => updateRow(rows[0].key, { lessons: n })}>{n}</Button>)}
            <input aria-label="Tundide arv" className="field__input" style={{ width: 90 }} type="number" min="1" max="100" value={rows[0].lessons} onChange={(event) => updateRow(rows[0].key, { lessons: event.target.value })} />
            <span className="form-hint">nt 2 korda nädalas → 8–9 tundi kuus</span>
          </div>
        </div>
        {priceBlock(first, 0)}

        {rows.slice(1).map((row, offset) => {
          const index = offset + 1;
          const state = states[index];
          const otherPayer = state.card && firstPayer && payerKey(state.card) !== firstPayer;
          const balance = balanceOf(state);
          return <fieldset key={row.key} className="form-grid__wide form-grid" data-token-row={index + 1} style={{ border: '1px solid var(--color-border, #ddd)', borderRadius: 8, padding: 12, margin: 0 }}>
            <legend style={{ display: 'flex', gap: 8, alignItems: 'center' }}><strong>Rida {index + 1}</strong>
              <Button type="button" variant="secondary" aria-label={`Eemalda rida ${index + 1}`} onClick={() => removeRow(row.key)}><X size={14} /></Button></legend>
            <Select className="form-grid__wide" label={`Õpilane (rida ${index + 1})`} value={row.studentId} onChange={(event) => updateRow(row.key, { studentId: event.target.value, pickedSubject: '' })}>
              <option value="">Vali</option>
              {samePayerCards.length ? <optgroup label="Sama maksja">{samePayerCards.map(cardOption)}</optgroup> : null}
              {otherCards.length ? <optgroup label="Teine maksja (ühisele arvele ei sobi)">{otherCards.map(cardOption)}</optgroup> : null}
            </Select>
            {subjectSelect(row, state, `Aine (rida ${index + 1})`)}
            <Input label={`Tundide arv (rida ${index + 1})`} type="number" min="1" max="100" value={row.lessons} onChange={(event) => updateRow(row.key, { lessons: event.target.value })} />
            {priceBlock(state, index)}
            {balance !== null ? <p className="form-hint form-grid__wide">Praegu paketis: {balance} tundi</p> : null}
            {otherPayer ? <p className="action-error form-grid__wide">{MIXED_PAYER_MESSAGE}</p> : null}
          </fieldset>;
        })}
        {card && rows.length < TOKEN_ROWS_MAX ? <div className="form-grid__wide">
          <Button type="button" variant="secondary" onClick={addRow}><Plus size={15} /> Lisa rida (teine laps või aine, sama maksja)</Button>
        </div> : null}

        <Input label="Maksetähtaeg" type="date" value={due} onChange={(event) => setDue(event.target.value)} />
        <IssuerSelect id="token-invoice-issuer" value={issuer} onChange={setIssuer} />
        <Input label="Sisemine märkus (ainult töötajatele)" maxLength={INVOICE_NOTE_MAX} placeholder="Mille eest arve on — ei ilmu arvele ega e-kirja" value={note} onChange={(event) => setNote(event.target.value)} />
        <p className="form-grid__wide" role="status"><strong>Kokku: {!complete ? '—' : combined ? `${totalLessons} tundi, ${rows.length} rida = ${money(total)}` : `${first.count} × ${money(first.priceCents)} = ${money(total)}`}</strong><br />
          <span className="form-hint">{combined
            ? 'Üks arve, üks makse. Pärast makse laekumist lisab „Lisa tunnid” iga rea tunnid selle õpilase kaardile ja ainele eraldi paketina.'
            : 'Tunnid lisatakse õpilasele pärast makse laekumist nupuga „Lisa tunnid” arvete nimekirjas. Iga selle aine toimunud tund (ja ette teatamata puudumine) võtab ühe tunni; teiste ainete tunnid sellest paketist ei võta.'}</span></p>
        <p className="form-hint form-grid__wide" data-token-not-sent>{TOKEN_INVOICE_NOT_SENT_HINT}</p>
        {error ? <p className="action-error form-grid__wide" role="alert">{error}</p> : null}
      </div>
    </Modal>
  </>;
}
