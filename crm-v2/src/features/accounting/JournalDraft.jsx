import { useEffect, useRef } from 'react';
import { Button } from '../../components/ui/index.js';
import { amount, blankEntryLine, dmy, draftDescription, entryLineTotals, parseEuro } from './accountingReports.js';
import { pastedEntryLines } from './journalGrid.js';
import AccountInput from './AccountInput.jsx';

// A manual entry typed straight into the päevaraamat grid (the accountant 2026-10-23: like Excel, no separate form).
// The header row takes the date, the source document and the content; each line row the account, its note, debit or
// credit. Tab moves cell to cell; Tab in the last cell adds a row. „Salvesta kanne” is enabled only when debit = credit.
// The same rows correct an existing entry (mode „edit”): an automatic entry keeps its date and document (fixedHeader),
// and the reason of the correction goes to the entry's history. Rows copied from Excel can be pasted (Ctrl/Cmd+V).
export default function JournalDraft({ draft, setDraft, lines, setLines, accounts, busy, error, onSave, onCancel, label = 'PR (uus kanne)', fixedHeader = false, reason, setReason, reasonRequired = false, saveLabel = 'Salvesta kanne' }) {
  const dateRef = useRef(null);
  const focusAccount = useRef(-1);
  const rowRefs = useRef([]);
  useEffect(() => { dateRef.current?.focus(); }, []);
  useEffect(() => {
    if (focusAccount.current >= 0) {
      rowRefs.current[focusAccount.current]?.focus();
      focusAccount.current = -1;
    }
  }, [lines.length]);

  const update = (index, patch) => setLines(lines.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  const addRow = () => { focusAccount.current = lines.length; setLines([...lines, blankEntryLine()]); };
  const accountName = (code) => accounts.find((a) => a.code === code && a.active !== false)?.name;
  // Ctrl/Cmd+V of rows copied from Excel (Konto | Kirjeldus | Deebet | Kreedit, optionally Kuupäev | Dokument first):
  // the rows replace the empty lines; the first date and document fill the entry when they are still empty
  const onPaste = (event) => {
    const text = event.clipboardData?.getData('text/plain') || '';
    if (!/[\t\n]/.test(text.trim())) return;
    const pasted = pastedEntryLines(text);
    if (!pasted.lines.length) return;
    event.preventDefault();
    setLines([...lines.filter((l) => l.account || l.debit || l.credit || l.note), ...pasted.lines]);
    if (!fixedHeader && (pasted.date || pasted.documentRef)) setDraft({ ...draft, date: draft.date && !pasted.date ? draft.date : pasted.date || draft.date, documentRef: draft.documentRef.trim() ? draft.documentRef : pasted.documentRef });
  };
  const totals = entryLineTotals(lines);
  const badAmount = lines.some((l) => Number.isNaN(parseEuro(l.debit)) || Number.isNaN(parseEuro(l.credit)));
  const filled = lines.filter((l) => l.account && ((parseEuro(l.debit) || 0) || (parseEuro(l.credit) || 0)));
  const balanced = !badAmount && totals.debit > 0 && totals.debit === totals.credit && filled.length >= 2;
  const knownAccounts = lines.every((l) => !l.account || accountName(l.account));
  const noAccount = lines.some((l) => !l.account && ((parseEuro(l.debit) || 0) || (parseEuro(l.credit) || 0)));
  // what still blocks „Salvesta kanne”, said next to the button (a silent grey button told her nothing)
  const missing = [
    !draft.date && 'kuupäev',
    !draft.documentRef.trim() && 'dokument',
    !draftDescription(draft, lines) && 'kande sisu',
    noAccount && 'konto summaga real',
    !knownAccounts && 'konto, mida kontoplaanis pole',
    !badAmount && totals.debit !== totals.credit && 'deebet = kreedit',
    !badAmount && totals.debit === totals.credit && filled.length < 2 && 'vähemalt üks deebet- ja üks kreeditrida',
    reasonRequired && !String(reason || '').trim() && 'paranduse põhjus',
  ].filter(Boolean);
  const ready = balanced && !noAccount && !missing.length;

  return <tbody className="accounting-draft" onPaste={onPaste}>
    <tr className="accounting-grid__entry">
      <td>{label}</td>
      <td>{fixedHeader ? dmy(draft.date) : <input ref={dateRef} aria-label="Kuupäev" type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} />}</td>
      <td>{fixedHeader ? draft.documentRef : <input aria-label="Algdokument (nr / nimetus)" value={draft.documentRef} placeholder="dokument" onChange={(event) => setDraft({ ...draft, documentRef: event.target.value })} />}</td>
      <td colSpan="3"><input aria-label="Sisu" value={draft.description} placeholder="kande sisu" onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></td>
    </tr>
    {lines.map((l, index) => {
      const last = index === lines.length - 1;
      const name = accountName(l.account);
      return <tr key={index}>
        <td><div className="accounting-draft__account"><AccountInput ref={(node) => { rowRefs.current[index] = node; }} label={`Rida ${index + 1} konto`} accounts={accounts} value={l.account} onChange={(account) => update(index, { account: account.trim() })} /><small>{name || (l.account ? 'konto puudub või on suletud' : '')}</small></div></td>
        <td className="accounting-draft__mirror" onClick={() => dateRef.current?.focus()} title="Kuupäev on kogu kandel ühine">{dmy(draft.date)}</td>
        {/* the accountant 2026-10-24 clicked the Dokument cell of a line and could not type: every line has the entry's
            document, typing in any of them sets it for the whole entry */}
        <td>{fixedHeader ? draft.documentRef : <input aria-label={`Rida ${index + 1} dokument`} value={draft.documentRef} placeholder="dokument" onChange={(event) => setDraft({ ...draft, documentRef: event.target.value })} />}</td>
        <td><input aria-label={`Rida ${index + 1} märkus`} value={l.note} placeholder={draft.description} onChange={(event) => update(index, { note: event.target.value })} /></td>
        <td className="num"><input aria-label={`Rida ${index + 1} deebet`} inputMode="decimal" value={l.debit} onChange={(event) => update(index, { debit: event.target.value, credit: event.target.value ? '' : l.credit })} /></td>
        <td className="num"><input aria-label={`Rida ${index + 1} kreedit`} inputMode="decimal" value={l.credit}
          onChange={(event) => update(index, { credit: event.target.value, debit: event.target.value ? '' : l.debit })}
          onKeyDown={(event) => { if (last && event.key === 'Tab' && !event.shiftKey) { event.preventDefault(); addRow(); } }} /></td>
      </tr>;
    })}
    <tr className="accounting-grid__subtotal">
      <td colSpan="4">
        <div className="accounting-draft__actions">
          <button type="button" className="link-button" onClick={addRow}>+ rida</button>
          <span className={balanced ? 'is-ok' : 'is-off'}>Deebet {amount(totals.debit)} · Kreedit {amount(totals.credit)}{totals.debit !== totals.credit ? ` · vahe ${amount(Math.abs(totals.debit - totals.credit))}` : ''}</span>
          {badAmount ? <span className="is-off">Summa peab olema kujul 123,45.</span> : null}
          {setReason ? <input className="accounting-draft__reason" aria-label="Paranduse põhjus" value={reason || ''} placeholder={reasonRequired ? 'paranduse põhjus (kohustuslik)' : 'paranduse põhjus'} onChange={(event) => setReason(event.target.value)} /> : null}
          {missing.length && !badAmount ? <span className="is-off">Puudub: {missing.join(', ')}</span> : null}
          {error ? <span className="is-off" role="alert">{error}</span> : null}
          <span className="accounting-draft__buttons">
            <Button variant="secondary" disabled={busy} onClick={onCancel}>Loobu</Button>
            <Button disabled={!ready} loading={busy} onClick={onSave}>{saveLabel}</Button>
          </span>
        </div>
      </td>
      <td className="num">{amount(totals.debit)}</td>
      <td className="num">{amount(totals.credit)}</td>
    </tr>
  </tbody>;
}
