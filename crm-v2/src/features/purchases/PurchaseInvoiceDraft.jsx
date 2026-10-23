import { useEffect, useRef } from 'react';
import { Button } from '../../components/ui/index.js';
import { amount } from '../accounting/accountingReports.js';
import { pastedPurchaseLines } from '../accounting/journalGrid.js';
import { PAYMENT_METHODS, blankPurchaseLine, draftProblem, draftTotals } from './purchases.js';

// A purchase invoice typed into the ostuarved grid row by row, like Excel (the accountant 2026-10-23): the first row
// takes the supplier, the invoice number, the date and the due date; each line the account, the description, the amount
// with VAT and the VAT. Tab in the last cell adds a line. Picking a supplier fills its default account.
// VAT: the company is not VAT registered, so „maha” (deductible, booked to 2311) is off by default.
export default function PurchaseInvoiceDraft({ draft, setDraft, lines, setLines, suppliers, accounts, busy, error, onSave, onCancel, editing = false, reason, setReason }) {
  const supplierRef = useRef(null);
  const focusLine = useRef(-1);
  const accountRefs = useRef([]);
  useEffect(() => { supplierRef.current?.focus(); }, []);
  useEffect(() => {
    if (focusLine.current >= 0) {
      accountRefs.current[focusLine.current]?.focus();
      focusLine.current = -1;
    }
  }, [lines.length]);

  const supplier = suppliers.find((s) => s.id === draft.supplierId);
  const accountName = (code) => accounts.find((a) => a.code === code && a.active !== false)?.name;
  const update = (index, patch) => setLines(lines.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  const addLine = () => { focusLine.current = lines.length; setLines([...lines, blankPurchaseLine(supplier?.defaultAccount || '')]); };
  const pickSupplier = (name) => {
    const match = suppliers.find((s) => s.active !== false && s.name.toLocaleLowerCase('et') === name.trim().toLocaleLowerCase('et'));
    setDraft({ ...draft, supplierName: name, supplierId: match?.id || '' });
    if (match?.defaultAccount) setLines(lines.map((l) => (l.account ? l : { ...l, account: match.defaultAccount })));
  };
  // Ctrl/Cmd+V of rows copied from Excel: Konto | Kirjeldus | Summa (with VAT) | KM — they replace the empty lines
  const onPaste = (event) => {
    const text = event.clipboardData?.getData('text/plain') || '';
    if (!/[\t\n]/.test(text.trim())) return;
    const pasted = pastedPurchaseLines(text);
    if (!pasted.length) return;
    event.preventDefault();
    setLines([...lines.filter((l) => l.description || l.amount || l.vat), ...pasted]);
  };
  const totals = draftTotals(lines);
  const problem = draftProblem(draft, lines, accounts);

  return <tbody className="accounting-draft" onPaste={onPaste}>
    <datalist id="purchase-supplier-list">{suppliers.filter((s) => s.active !== false).map((s) => <option key={s.id} value={s.name}>{s.regCode}</option>)}</datalist>
    <tr className="accounting-grid__entry">
      <td><input ref={supplierRef} aria-label="Tarnija" list="purchase-supplier-list" value={draft.supplierName} placeholder="tarnija" onChange={(event) => pickSupplier(event.target.value)} />
        <small>{supplier ? supplier.regCode || '' : draft.supplierName ? 'tarnijat pole — lisa „Tarnijad” lehel' : ''}</small></td>
      <td><input aria-label="Arve nr" value={draft.documentNumber} placeholder="arve nr" onChange={(event) => setDraft({ ...draft, documentNumber: event.target.value })} /></td>
      <td><input aria-label="Arve kuupäev" type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} /></td>
      <td><input aria-label="Maksetähtaeg" type="date" value={draft.dueDate} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} /></td>
      <td><input aria-label="Märkus" value={draft.note} placeholder="märkus (valikuline)" onChange={(event) => setDraft({ ...draft, note: event.target.value })} /></td>
      <td className="num">{amount(totals.amount)}</td>
      <td colSpan="2">{editing ? 'Parandus' : <span className="purchases-paid-now">
        <select aria-label="Arve olek" value={draft.paidNow ? 'paid' : 'unpaid'} onChange={(event) => setDraft({ ...draft, paidNow: event.target.value === 'paid' })}><option value="unpaid">Tasumata</option><option value="paid">Tasutud kohe</option></select>
        {draft.paidNow ? <select aria-label="Makseviis" value={draft.method} onChange={(event) => setDraft({ ...draft, method: event.target.value })}>{PAYMENT_METHODS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select> : null}
      </span>}</td>
    </tr>
    {lines.map((l, index) => {
      const last = index === lines.length - 1;
      return <tr key={index}>
        <td><div className="accounting-draft__account"><input ref={(node) => { accountRefs.current[index] = node; }} aria-label={`Rida ${index + 1} konto`} value={l.account} placeholder="konto" onChange={(event) => update(index, { account: event.target.value.trim() })} /><small>{accountName(l.account) || (l.account ? 'konto puudub või on suletud' : '')}</small></div></td>
        <td colSpan="3" />
        <td><input aria-label={`Rida ${index + 1} kirjeldus`} value={l.description} placeholder="kirjeldus" onChange={(event) => update(index, { description: event.target.value })} /></td>
        <td className="num"><input aria-label={`Rida ${index + 1} summa`} inputMode="decimal" value={l.amount} placeholder="summa koos KM" onChange={(event) => update(index, { amount: event.target.value })} /></td>
        <td className="num"><input aria-label={`Rida ${index + 1} KM`} inputMode="decimal" value={l.vat} placeholder="KM"
          onChange={(event) => update(index, { vat: event.target.value })}
          onKeyDown={(event) => { if (last && event.key === 'Tab' && !event.shiftKey) { event.preventDefault(); addLine(); } }} /></td>
        <td><label className="purchases-vat-check" title="Sisendkäibemaks arvatakse maha (konto 2311). Ettevõte ei ole KMKR-is — tavaliselt väljas."><input type="checkbox" aria-label={`Rida ${index + 1} KM maha`} checked={l.vatDeductible} onChange={(event) => update(index, { vatDeductible: event.target.checked })} /> maha</label></td>
      </tr>;
    })}
    <tr className="accounting-grid__subtotal">
      <td colSpan="8">
        <div className="accounting-draft__actions">
          <button type="button" className="link-button" onClick={addLine}>+ rida</button>
          <span>Kokku {amount(totals.amount)}{totals.vat ? ` · KM ${amount(totals.vat)}` : ''}</span>
          {problem ? <span className="is-off">{problem}</span> : <span className="is-ok">OA kanne: D kulu · K 2110{draft.paidNow && !editing ? ' + VM kanne: D 2110 · K pank' : ''}</span>}
          {editing && setReason ? <input className="accounting-draft__reason" aria-label="Paranduse põhjus" value={reason || ''} placeholder="paranduse põhjus" onChange={(event) => setReason(event.target.value)} /> : null}
          {error ? <span className="is-off" role="alert">{error}</span> : null}
          <span className="accounting-draft__buttons">
            <Button variant="secondary" disabled={busy} onClick={onCancel}>Loobu</Button>
            <Button disabled={Boolean(problem)} loading={busy} onClick={onSave}>{editing ? 'Salvesta parandus' : 'Salvesta ostuarve'}</Button>
          </span>
        </div>
      </td>
    </tr>
  </tbody>;
}
