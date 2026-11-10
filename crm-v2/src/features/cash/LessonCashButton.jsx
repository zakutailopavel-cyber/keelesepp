import { useEffect, useState } from 'react';
import { Banknote, Undo2 } from 'lucide-react';
import { Button, Input, Modal } from '../../components/ui/index.js';
import { financeApi } from '../../services/firebase/financeApi.js';
import { amountCents, amountText, dayLabel, lessonCashLessonId, lessonCashSubtitle } from './lessonCash.js';
import { euro } from './cashModel.js';
import './lessonCash.css';

/**
 * „Makstud sularahas” (owner 2026-11-10): a ≥ 44 px button beside the lesson's marking buttons. The dialog takes the
 * amount (default: the card's lesson price for this subject and length, from the server — only the lesson's own
 * teacher gets it) and an optional note. The server flags the lesson record (`cashPaid`), so the lesson leaves the
 * monthly invoice (crm-v2 finance/monthlyBilling.js isChargeable); that needs a marked lesson, so on an unmarked row
 * `markFirst` marks it held before the cash is recorded. A marked lesson shows the sum; the teacher can take it back
 * the same day until the admin has the money — then the lesson is billable again.
 *
 * mark: the teacher's current mark of this lesson (lessonCashMine), or null; onChanged(lessonId, markOrNull)
 * markFirst(item): marks the lesson held and throws on a refusal (only on an unmarked row); onDone(item, cents): both done
 */
export default function LessonCashButton({ item, mark = null, api = financeApi, onChanged, markFirst = null, onDone, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const lessonId = lessonCashLessonId(item);
  const who = item.studentName || 'Õpilane';
  const subtitle = lessonCashSubtitle(item);

  useEffect(() => {
    if (!open || mark) return undefined;
    let alive = true;
    api.lessonCashInfo(item)
      .then((result) => { if (!alive) return; setInfo(result); setAmount((current) => current || amountText(result?.priceCents)); })
      .catch((problem) => { if (alive) { setInfo({ priceCents: 0 }); setError(problem.message || 'Tunni hinda ei saanud lugeda.'); } });
    return () => { alive = false; };
  }, [open, mark, api, item]);

  const close = () => { setOpen(false); setInfo(null); setError(''); setNote(''); setAmount(''); };
  const save = async (event) => {
    event.preventDefault();
    const cents = amountCents(amount);
    if (!cents) { setError('Kirjuta summa eurodes, nt 25 või 25,50.'); return; }
    setBusy('save'); setError('');
    try {
      // the lesson first (marking it again is harmless: the calendar's path returns the existing mark)
      if (markFirst) await markFirst(item);
      const result = await api.recordLessonCash(item, { amount: (cents / 100).toFixed(2), note });
      const entry = result?.entry || {};
      onChanged?.(lessonId, { id: entry.id, amountCents: entry.amountCents ?? cents, status: entry.status || 'open', receivedAt: entry.receivedAt, canUndo: true });
      close();
      onDone?.(item, entry.amountCents ?? cents);
    } catch (problem) {
      setError(problem.message || 'Salvestamine ebaõnnestus.');
    } finally { setBusy(''); }
  };
  const undo = async () => {
    setBusy('undo'); setError('');
    try {
      await api.undoLessonCash(item);
      onChanged?.(lessonId, null);
      close();
    } catch (problem) {
      setError(problem.message || 'Tagasivõtmine ebaõnnestus.');
    } finally { setBusy(''); }
  };

  const stop = (event) => event.stopPropagation();
  return <span className="lcash" onClick={stop}>
    {mark ? <button type="button" className="qm__btn lcash__btn is-marked" disabled={disabled} aria-label={`Makstud sularahas: ${who}, ${euro(mark.amountCents)}`} onClick={() => setOpen(true)}>
      <Banknote size={16} aria-hidden="true" /> {euro(mark.amountCents)}
    </button> : <button type="button" className="qm__btn lcash__btn" disabled={disabled} aria-label={`Makstud sularahas: ${who}`} onClick={() => setOpen(true)}>
      <Banknote size={16} aria-hidden="true" /> Sularahas
    </button>}
    <Modal open={open} title={mark ? 'Makstud sularahas' : 'Makstud sularahas?'} onClose={close} className="lcash-modal"
      footer={mark ? <>
        <Button variant="secondary" onClick={close}>Sulge</Button>
        {mark.canUndo ? <Button variant="danger" loading={busy === 'undo'} onClick={undo}><Undo2 size={15} aria-hidden="true" /> Võta tagasi</Button> : null}
      </> : <>
        <Button variant="secondary" onClick={close}>Loobu</Button>
        <Button type="submit" form={`lcash-${lessonId}`} loading={busy === 'save'} disabled={!info}>{markFirst ? 'Toimus ja makstud' : 'Märgi makstuks'}</Button>
      </>}>
      <p className="lcash__lesson"><strong>{who}</strong>{subtitle ? <span>{subtitle}</span> : null}</p>
      {mark ? <>
        <p className="lcash__sum">{euro(mark.amountCents)} <small>märgitud {dayLabel(mark.receivedAt)}</small></p>
        <p className="form-hint">{mark.canUndo
          ? 'Raha on sinu käes, kuni annad selle adminile. Vale märke saad täna tagasi võtta — siis läheb tund jälle arvele.'
          : 'Märget saab muuta ainult admin (raha on juba üle antud või märge on vanem kui täna).'}</p>
      </> : <form id={`lcash-${lessonId}`} className="lcash__form" onSubmit={save}>
        <Input label="Summa (€)" inputMode="decimal" autoComplete="off" value={amount} onChange={(event) => setAmount(event.target.value)} required />
        <small className="lcash__price" role="status">{info === null ? 'Loen tunni hinda…' : info.priceCents ? `Tunni hind: ${euro(info.priceCents)}` : 'Tunni hinda ei leitud — kirjuta summa.'}</small>
        <Input label="Märkus (valikuline)" value={note} onChange={(event) => setNote(event.target.value)} placeholder="nt ema maksis tunni lõpus" />
        {markFirst ? <p className="lcash__held">Tund märgitakse ka toimunuks.</p> : null}
        <p className="form-hint">Raha jääb sinu kätte, kuni annad selle adminile. Seda tundi kuuarvele ei panda.</p>
      </form>}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </Modal>
  </span>;
}
