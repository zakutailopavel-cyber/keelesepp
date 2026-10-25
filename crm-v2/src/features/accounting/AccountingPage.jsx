import { ArrowLeft, BookOpen, ChevronDown, ChevronRight, Download, FilePlus2, Lock, RefreshCw, Scale, Truck } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState, Modal, PageHeader, Select } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { accountingService } from '../../services/firebase/index.js';
import { downloadWorkbook, journalWorkbook, partnersWorkbook, statementsWorkbook, suppliersWorkbook, trialBalanceWorkbook } from './accountingExcel.js';
import { ACCOUNT_TYPES, COMPANY, CUSTOMER_ACCOUNTS, ENTRY_CODES, PARTNER_TYPE_LABELS, SUPPLIER_ACCOUNTS, accountTypeLabel, amount, balanceSheet, blankEntryLine, dmy, draftDescription, euro, incomeStatement, journalReport, ledger, parseEuro, partnerKey, partnerReport, trialBalance } from './accountingReports.js';
import SuppliersPanel from '../purchases/SuppliersPanel.jsx';
import { useOptionalAuth } from '../../app/AuthContext.jsx';
import { hasAnyRole, ROLES } from '../../utils/roles.js';
import JournalDraft from './JournalDraft.jsx';
import JournalGrid from './JournalGrid.jsx';
import { SORT_LABELS, sortEntries } from './journalGrid.js';
import './accounting.css';

// Raamatupidamine (owner 2026-10-22, docs/ACCOUNTING.md): päevaraamat, pearaamat, käibeandmik, bilanss and
// kasumiaruanne from the numbered entries; manual entries, stornos, opening balances and the chart of accounts.
const COMPANY_LABEL = `${COMPANY.name} (${COMPANY.regCode})`;
const TABS = [
  ['journal', 'Päevaraamat'],
  ['ledger', 'Pearaamat'],
  ['trial', 'Käibeandmik'],
  ['partners', 'Partnerid'],
  ['statements', 'Bilanss ja kasumiaruanne'],
  ['chart', 'Kontoplaan'],
  ['suppliers', 'Tarnijad'],
];
const NO_PERIOD_TABS = new Set(['chart', 'suppliers']);
const today = () => new Date().toISOString().slice(0, 10);
const dateLabel = (value) => (value ? new Date(`${value}T12:00:00`).toLocaleDateString('et-EE') : '—');
const blankLine = () => ({ account: '', debit: '', credit: '', note: '' });

// the päevaraamat is edited like a spreadsheet only on a wide screen; on a phone it is read-only
function useNarrow(query = '(max-width: 760px)') {
  const get = () => Boolean(globalThis.matchMedia?.(query).matches);
  const [narrow, setNarrow] = useState(get);
  useEffect(() => {
    const media = globalThis.matchMedia?.(query);
    if (!media) return undefined;
    const onChange = () => setNarrow(media.matches);
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }, [query]);
  return narrow;
}

function LinesEditor({ lines, setLines, accounts }) {
  const totals = lines.reduce((t, l) => ({ debit: t.debit + (parseEuro(l.debit) || 0), credit: t.credit + (parseEuro(l.credit) || 0) }), { debit: 0, credit: 0 });
  const update = (index, patch) => setLines(lines.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  return <div className="accounting-lines">
    <datalist id="accounting-account-list">{accounts.filter((a) => a.active !== false).map((a) => <option key={a.code} value={a.code}>{a.name}</option>)}</datalist>
    <div className="accounting-lines__head"><span>Konto</span><span>Deebet</span><span>Kreedit</span><span>Märkus</span></div>
    {lines.map((l, index) => {
      const name = accounts.find((a) => a.code === l.account)?.name;
      return <div className="accounting-lines__row" key={index}>
        <label><input aria-label={`Rida ${index + 1} konto`} list="accounting-account-list" value={l.account} onChange={(event) => update(index, { account: event.target.value.trim() })} /><small>{name || (l.account ? 'tundmatu konto' : '')}</small></label>
        <input aria-label={`Rida ${index + 1} deebet`} inputMode="decimal" value={l.debit} onChange={(event) => update(index, { debit: event.target.value, credit: event.target.value ? '' : l.credit })} />
        <input aria-label={`Rida ${index + 1} kreedit`} inputMode="decimal" value={l.credit} onChange={(event) => update(index, { credit: event.target.value, debit: event.target.value ? '' : l.debit })} />
        <input aria-label={`Rida ${index + 1} märkus`} value={l.note} onChange={(event) => update(index, { note: event.target.value })} />
      </div>;
    })}
    <div className="accounting-lines__foot">
      <Button variant="secondary" type="button" onClick={() => setLines([...lines, blankLine()])}>+ Lisa rida</Button>
      <span className={totals.debit === totals.credit && totals.debit ? 'is-ok' : 'is-off'}>Deebet {euro(totals.debit)} · Kreedit {euro(totals.credit)}{totals.debit !== totals.credit ? ` · vahe ${euro(Math.abs(totals.debit - totals.credit))}` : ''}</span>
    </div>
  </div>;
}

const toLines = (lines) => lines.map((l) => ({ account: l.account, debitCents: parseEuro(l.debit) || 0, creditCents: parseEuro(l.credit) || 0, note: l.note, ...(l.partner?.type ? { partner: l.partner } : {}) })).filter((l) => l.account && (l.debitCents || l.creditCents));
const badAmount = (lines) => lines.some((l) => Number.isNaN(parseEuro(l.debit)) || Number.isNaN(parseEuro(l.credit)));

export default function AccountingPage({ repository = accountingService, canEdit }) {
  const state = useAsyncData(() => repository.load(), [repository]);
  const auth = useOptionalAuth();
  const narrow = useNarrow();
  // only an admin changes the books (financeApi checks again); the others and a phone see a read-only grid
  const readOnly = narrow || !(canEdit ?? (auth?.user ? hasAnyRole(auth.user.roles, [ROLES.ADMIN]) : true));
  const [tab, setTab] = useState('journal');
  const [period, setPeriod] = useState({ from: `${today().slice(0, 4)}-01-01`, to: today() });
  const [ledgerAccount, setLedgerAccount] = useState('1010');
  const [journalCode, setJournalCode] = useState('');
  const [journalSort, setJournalSort] = useState({ key: 'code', dir: 'asc' });
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState({});
  const [lines, setLines] = useState([blankLine(), blankLine()]);
  const [draft, setDraft] = useState(null);
  const [draftLines, setDraftLines] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [ledgerPartner, setLedgerPartner] = useState('');
  const [partnerAccount, setPartnerAccount] = useState('2110');
  const [openPartners, setOpenPartners] = useState(() => new Set());
  const synced = useRef(false);

  const allEntries = useMemo(() => state.data?.entries || [], [state.data]);
  // a deleted manual entry stays in the database as a tombstone (history); the registers leave it out
  const entries = useMemo(() => allEntries.filter((e) => !e.deleted), [allEntries]);
  const accounts = useMemo(() => state.data?.accounts || [], [state.data]);
  const lockedThrough = state.data?.lockedThrough || '';
  const suppliers = useMemo(() => state.data?.suppliers || [], [state.data]);
  // „OA 3” of every entry (the partner drill-down shows the kande kood)
  const labels = useMemo(() => new Map(journalReport(allEntries, accounts, { showDeleted: true }).entries.map((e) => [e.id, e.label])), [allEntries, accounts]);
  const partners = useMemo(() => partnerReport(entries, accounts, { ...period, account: partnerAccount }, { suppliers, labels }), [entries, accounts, period, partnerAccount, suppliers, labels]);
  // the partners on the lines of the pearaamat account (its partner filter)
  const ledgerPartners = useMemo(() => {
    const found = new Map();
    entries.forEach((e) => (e.lines || []).forEach((l) => { if (String(l.account) === String(ledgerAccount)) found.set(partnerKey(l.partner), l.partner?.name || 'Partner puudub'); }));
    return [...found.entries()].sort((a, b) => (a[0] === 'none') - (b[0] === 'none') || a[1].localeCompare(b[1], 'et'));
  }, [entries, ledgerAccount]);
  const journalFull = useMemo(() => journalReport(allEntries, accounts, { ...period, code: journalCode, sort: journalSort.key === 'date' ? 'date' : 'code', showDeleted }), [allEntries, accounts, period, journalCode, journalSort, showDeleted]);
  // a header click sorts by that column; a second click turns the order
  const sortBy = (key) => setJournalSort((current) => ({ key, dir: current.key === key && current.dir === 'asc' ? 'desc' : 'asc' }));
  const trial = useMemo(() => trialBalance(entries, accounts, period), [entries, accounts, period]);
  const accountLedger = useMemo(() => ledger(entries, ledgerAccount, { ...period, partner: ledgerPartner }, accounts), [entries, ledgerAccount, period, ledgerPartner, accounts]);
  const statements = useMemo(() => ({ sheet: balanceSheet(entries, accounts, { to: period.to }), result: incomeStatement(entries, accounts, period) }), [entries, accounts, period]);
  const usedAccounts = useMemo(() => new Set(entries.flatMap((e) => (e.lines || []).map((l) => String(l.account)))), [entries]);

  const run = async (label, action, success) => {
    setBusy(label); setError('');
    try {
      const result = await action();
      if (success) setNotice(typeof success === 'function' ? success(result) : success);
      await state.reload();
      return true;
    } catch (nextError) {
      setError(nextError.message || 'Toiming ebaõnnestus.');
      return false;
    } finally { setBusy(''); }
  };
  const sync = (silent = false) => run('sync', () => repository.sync(), silent ? null : (result) => (result.created ? `Lisati ${result.created} automaatkannet.` : 'Kõik dokumendid on juba kirjendatud.'));
  // the registers are always up to date when the page opens: missing automatic entries are created once
  useEffect(() => {
    if (!state.data || synced.current) return;
    synced.current = true;
    sync(true);
  }, [state.data]); // eslint-disable-line react-hooks/exhaustive-deps

  // a manual entry is typed straight into the päevaraamat grid (JournalDraft)
  const openEntry = () => { setTab('journal'); setDraft({ date: today(), description: '', documentRef: '' }); setDraftLines([blankEntryLine(), blankEntryLine()]); setError(''); };
  const cancelDraft = () => { if (!busy) { setDraft(null); setError(''); } };
  // „Algsaldod” shows the balances already entered (the accountant 2026-10-24: the button and the Algsaldo column of the
  // käibeandmik are the same numbers); saving changes them in the same entry, with its history
  const openingEntry = allEntries.find((e) => e.origin === 'opening' && !e.reversedBy && !e.deleted) || null;
  const centsText = (cents) => (cents ? amount(cents) : '');
  const openOpening = () => {
    setDialog('opening');
    const current = (openingEntry?.lines || []).map((l) => ({ ...blankLine(), account: String(l.account), debit: centsText(l.debitCents), credit: centsText(l.creditCents), partner: l.partner || null }));
    setLines([...current, blankLine(), ...(current.length ? [] : [blankLine(), blankLine()])]);
    setError('');
  };
  const openStorno = (entry) => { setDialog('storno'); setForm({ entry, date: today(), reason: '' }); setError(''); };
  const openAccount = (account) => { setDialog('account'); setForm(account ? { ...account, existing: true } : { code: '', name: '', type: 'expense', reportLine: '', active: true }); setError(''); };
  const close = () => { if (!busy) { setDialog(null); setError(''); } };
  const openDelete = (row) => { setDialog('delete'); setForm({ entry: row, reason: '' }); setError(''); };
  const openLock = () => { setDialog('lock'); setForm({ lockedThrough: lockedThrough || `${today().slice(0, 7)}-01`, reason: '' }); setError(''); };

  const saveDraft = async () => {
    if (badAmount(draftLines)) { setError('Summa peab olema kujul 123,45.'); return; }
    if (await run('save', () => repository.createEntry({ ...draft, description: draftDescription(draft, draftLines), lines: toLines(draftLines) }), (r) => `Kanne ${r.entry.number} salvestati.`)) setDraft(null);
  };
  const submitOpening = async (event) => {
    event.preventDefault();
    if (badAmount(lines)) { setError('Summa peab olema kujul 123,45.'); return; }
    const save = openingEntry
      ? () => repository.updateEntry(openingEntry.id, { date: openingEntry.date, description: openingEntry.description, documentRef: openingEntry.documentRef, lines: toLines(lines) }, 'Algsaldode parandus')
      : () => repository.setOpening(toLines(lines));
    if (await run('save', save, (r) => `Algsaldod salvestati (kanne ${r.entry?.number || openingEntry?.number || ''}).`)) setDialog(null);
  };
  const submitStorno = async (event) => {
    event.preventDefault();
    if (!form.reason?.trim()) { setError('Lisa tühistamise põhjus.'); return; }
    if (await run('save', () => repository.reverse(form.entry.id, form.date, form.reason.trim()), (r) => `Storno ${r.entry.number} salvestati. Algne kanne jäi alles.`)) setDialog(null);
  };
  const submitDelete = async (event) => {
    event.preventDefault();
    if (!form.reason?.trim()) { setError('Lisa kustutamise põhjus.'); return; }
    if (await run('save', () => repository.deleteEntry(form.entry.id, form.reason.trim()), `Kanne ${form.entry.label} kustutati. Sisu ja põhjus jäid ajalukku.`)) setDialog(null);
  };
  const submitLock = async (event) => {
    event.preventDefault();
    const reopening = lockedThrough && (!form.lockedThrough || form.lockedThrough < lockedThrough);
    if (reopening && !form.reason?.trim()) { setError('Perioodi uuesti avamiseks lisa põhjus.'); return; }
    if (await run('save', () => repository.setLock(form.lockedThrough || '', (form.reason || '').trim()), form.lockedThrough ? `Periood on suletud kuni ${dmy(form.lockedThrough)}.` : 'Kõik perioodid on avatud.')) setDialog(null);
  };
  const submitAccount = async (event) => {
    event.preventDefault();
    const { existing: _existing, ...account } = form;
    if (await run('save', () => repository.saveAccount(account), `Konto ${account.code} salvestati.`)) setDialog(null);
  };
  const saveSupplier = async (supplierId, values) => {
    setBusy('supplier'); setError('');
    try {
      await repository.saveSupplier(supplierId, values);
      setNotice(`Tarnija ${values.name} salvestati.`);
      await state.reload();
      return '';
    } catch (nextError) {
      return nextError.message || 'Salvestamine ebaõnnestus.';
    } finally { setBusy(''); }
  };
  const importSuppliers = async (rows) => {
    const result = await repository.importSuppliers(rows);
    setNotice(`Imporditi ${result?.created?.length ?? rows.length} tarnijat.`);
    await state.reload();
  };
  const accountLabel = (code) => (code ? `${code} ${accounts.find((a) => a.code === code)?.name || ''}`.trim() : 'Kõik kontod');
  const openLedgerFor = (row) => { setLedgerAccount(partnerAccount || '2110'); setLedgerPartner(row.key); setTab('ledger'); };
  const togglePartner = (key) => setOpenPartners((current) => { const next = new Set(current); if (next.has(key)) next.delete(key); else next.add(key); return next; });
  const exportFile = () => {
    const stamp = `${period.from || 'algus'}_${period.to || today()}`;
    if (tab === 'partners') downloadWorkbook(partnersWorkbook(partners, { company: COMPANY, period, accountLabel: accountLabel(partnerAccount) }), `partnerid_${partnerAccount || 'koik'}_${stamp}.xls`);
    else if (tab === 'trial') downloadWorkbook(trialBalanceWorkbook(trial, { company: COMPANY, period }), `kaibeandmik_${stamp}.xls`);
    else if (tab === 'statements') downloadWorkbook(statementsWorkbook(statements, { company: COMPANY_LABEL, period }), `bilanss_kasumiaruanne_${stamp}.xls`);
    else {
      const report = showDeleted ? journalReport(allEntries, accounts, { ...period, code: journalCode }) : journalFull;
      downloadWorkbook(journalWorkbook({ ...report, entries: sortEntries(report.entries, journalSort), filters: { ...report.filters, sortLabel: sortLabel } }, { company: COMPANY }), `paevaraamat_${stamp}${journalCode ? `_${journalCode}` : ''}.xls`);
    }
  };

  const sortLabel = `${SORT_LABELS[journalSort.key] || 'Kande kood'}${journalSort.dir === 'desc' ? ' (kahanev)' : ''}`;
  if (state.loading && !state.data) return <LoadingState label="Laen raamatupidamist…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;

  const setYear = () => setPeriod({ from: `${today().slice(0, 4)}-01-01`, to: today() });
  const setMonth = () => setPeriod({ from: `${today().slice(0, 7)}-01`, to: today() });

  return <div className="page-content accounting-page">
    <Link className="back-link" to="/finance"><ArrowLeft size={17} /> Tagasi finantsidesse</Link>
    <PageHeader eyebrow="Finantsid" title="Raamatupidamine" description="Päevaraamat, pearaamat, käibeandmik, bilanss ja kasumiaruanne. Kanded tekivad arvetest, maksetest ja ostuarvetest. Avatud perioodis saab kannet parandada (ajalugu jääb alles), suletud perioodis ainult uue kandega."
      actions={<>
        <Button variant="secondary" loading={busy === 'sync'} onClick={() => sync(false)}><RefreshCw size={17} /> Uuenda kanded</Button>
        <Button variant="secondary" onClick={openOpening}><Scale size={17} /> Algsaldod</Button>
        <Button variant="secondary" onClick={openLock}><Lock size={17} /> {lockedThrough ? `Suletud kuni ${dmy(lockedThrough)}` : 'Sulge periood'}</Button>
        <Button variant="secondary" onClick={() => setTab('suppliers')}><Truck size={17} /> Tarnijad</Button>
        <Link className="button button--secondary" to="/finance/ostuarved">Ostuarved</Link>
        <Link className="button button--secondary" to="/finance/inf3">INF 3</Link>
        {!readOnly ? <Button onClick={openEntry}><FilePlus2 size={17} /> Lisa kanne</Button> : null}
      </>} />
    {notice ? <div className="success-notice" role="status">{notice}<button aria-label="Sulge teade" onClick={() => setNotice('')}>×</button></div> : null}
    {error && !dialog && !draft ? <div className="expense-error" role="alert">{error}<button aria-label="Sulge veateade" onClick={() => setError('')}>×</button></div> : null}
    {!trial.balanced ? <div className="expense-error" role="alert">Käibeandmik ei ole tasakaalus — kontrolli kandeid.</div> : null}

    <Card className="accounting-toolbar">
      <nav className="accounting-tabs" aria-label="Raamatupidamise registrid">{TABS.map(([id, label]) => <button key={id} type="button" className={tab === id ? 'is-active' : ''} aria-pressed={tab === id} onClick={() => setTab(id)}>{label}</button>)}</nav>
      {!NO_PERIOD_TABS.has(tab) ? <div className="accounting-period">
        <Input id="accounting-from" label="Alates" type="date" value={period.from} onChange={(event) => setPeriod({ ...period, from: event.target.value })} />
        <Input id="accounting-to" label="Kuni" type="date" value={period.to} onChange={(event) => setPeriod({ ...period, to: event.target.value })} />
        <Button variant="secondary" onClick={setMonth}>Jooksev kuu</Button>
        <Button variant="secondary" onClick={setYear}>Jooksev aasta</Button>
        {tab !== 'ledger' ? <Button variant="secondary" onClick={exportFile}><Download size={17} /> Excel</Button> : null}
      </div> : null}
    </Card>

    {tab === 'journal' ? <Card className="accounting-card">
      <div className="accounting-card__search accounting-journal-filters">
        <Select id="journal-code" label="Kande kood" value={journalCode} onChange={(event) => setJournalCode(event.target.value)}><option value="">Kõik</option>{ENTRY_CODES.map(([code, name]) => <option key={code} value={code}>{code} {name}</option>)}</Select>
        <Select id="journal-sort" label="Järjestus" value={journalSort.key} onChange={(event) => setJournalSort({ key: event.target.value, dir: 'asc' })}>{Object.entries(SORT_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</Select>
        {journalFull.deletedCount ? <label className="accounting-check"><input type="checkbox" checked={showDeleted} onChange={(event) => setShowDeleted(event.target.checked)} /> Näita kustutatud ({journalFull.deletedCount})</label> : null}
      </div>
      {journalFull.entries.length || draft ? <div className="accounting-sheet">
        <h2>Päevaraamat</h2>
        <dl className="accounting-sheet__filters">
          <dt>Periood</dt><dd>{dmy(period.from) || '…'} kuni {dmy(period.to) || '…'}</dd>
          <dt>Kande kood</dt><dd>{journalCode ? `${journalCode} ${journalFull.filters.codeName}` : 'Kõik'}</dd>
          <dt>Järjestus</dt><dd>{sortLabel}</dd>
        </dl>
        <JournalGrid entries={journalFull.entries} accounts={accounts} suppliers={suppliers} lockedThrough={lockedThrough} readOnly={readOnly} repository={repository}
          onChanged={state.reload} onNotice={setNotice} sort={journalSort} onSort={sortBy} onDelete={openDelete} onStorno={openStorno}
          draftSlot={draft ? <JournalDraft draft={draft} setDraft={setDraft} lines={draftLines} setLines={setDraftLines} accounts={accounts} suppliers={suppliers} busy={busy === 'save'} error={error} onSave={saveDraft} onCancel={cancelDraft} /> : null} />
        <p className="accounting-sheet__footer"><span>{COMPANY.name}</span><span>Rg-kood {COMPANY.regCode}</span></p>
      </div> : <EmptyState title="Perioodis kandeid ei ole" description="Vali teine periood või kande kood või vajuta „Uuenda kanded”." />}
    </Card> : null}

    {tab === 'ledger' ? <Card className="accounting-card">
      <div className="accounting-card__search">
        <Select id="ledger-account" label="Konto" value={ledgerAccount} onChange={(event) => { setLedgerAccount(event.target.value); setLedgerPartner(''); }}>{accounts.filter((a) => usedAccounts.has(a.code)).map((a) => <option key={a.code} value={a.code}>{a.code} {a.name}</option>)}</Select>
        <Select id="ledger-partner" label="Partner" value={ledgerPartner} onChange={(event) => setLedgerPartner(event.target.value)}><option value="">Kõik partnerid</option>{ledgerPartners.map(([key, name]) => <option key={key} value={key}>{name}</option>)}{ledgerPartner && !ledgerPartners.some(([key]) => key === ledgerPartner) ? <option value={ledgerPartner}>(sellel kontol ei ole)</option> : null}</Select>
      </div>
      <div className="students-table-wrap"><table className="students-table accounting-table"><thead><tr><th>Kuupäev</th><th>Nr</th><th>Sisu</th><th>Dokument</th><th>Partner</th><th className="num">Deebet</th><th className="num">Kreedit</th><th className="num">Saldo</th></tr></thead>
        <tbody><tr className="accounting-entry"><td colSpan="7"><strong>Algsaldo</strong></td><td className="num">{euro(accountLedger.opening)}</td></tr>
          {accountLedger.rows.map((r, i) => <tr key={`${r.entryId}-${i}`}><td>{dateLabel(r.date)}</td><td>{r.number}</td><td>{r.description}</td><td>{r.documentRef}</td><td>{r.partner?.name || ''}</td><td className="num">{r.debitCents ? euro(r.debitCents) : ''}</td><td className="num">{r.creditCents ? euro(r.creditCents) : ''}</td><td className="num">{euro(r.balance)}</td></tr>)}
          <tr className="accounting-entry"><td colSpan="7"><strong>Lõppsaldo</strong></td><td className="num"><strong>{euro(accountLedger.closing)}</strong></td></tr></tbody></table></div>
    </Card> : null}

    {tab === 'trial' ? <Card className="accounting-card">
      {trial.rows.length ? <div className="accounting-sheet"><div className="accounting-grid-wrap"><table className="accounting-grid accounting-trial"><thead>
        <tr><th rowSpan="2">Konto</th><th rowSpan="2">Nimetus</th><th colSpan="2" className="center">Algsaldo{!readOnly ? <> <button type="button" className="link-button" onClick={openOpening}>muuda</button></> : null}</th><th colSpan="2" className="center">Käive</th><th colSpan="2" className="center">Lõppsaldo</th></tr>
        <tr><th className="num">Deebet</th><th className="num">Kreedit</th><th className="num">Deebet</th><th className="num">Kreedit</th><th className="num">Deebet</th><th className="num">Kreedit</th></tr></thead>
        <tbody>{trial.rows.map((r) => <tr key={r.code}><td><button type="button" className="link-button" onClick={() => { setLedgerAccount(r.code); setTab('ledger'); }}>{r.code}</button></td><td>{r.name}</td>{[r.opening.debit, r.opening.credit, r.turnover.debit, r.turnover.credit, r.closing.debit, r.closing.credit].map((v, i) => <td key={i} className="num">{v ? amount(v) : ''}</td>)}</tr>)}</tbody>
        <tfoot><tr><td colSpan="2">Kokku</td>{[trial.total.opening.debit, trial.total.opening.credit, trial.total.turnover.debit, trial.total.turnover.credit, trial.total.closing.debit, trial.total.closing.credit].map((v, i) => <td key={i} className="num">{amount(v)}</td>)}</tr></tfoot></table></div></div>
        : <EmptyState title="Perioodis liikumisi ei ole" description="Vali teine periood." />}
    </Card> : null}

    {tab === 'partners' ? <Card className="accounting-card">
      <div className="accounting-card__search accounting-journal-filters">
        <Select id="partner-account" label="Konto" value={partnerAccount} onChange={(event) => { setPartnerAccount(event.target.value); setOpenPartners(new Set()); }}>
          {[...new Set([...SUPPLIER_ACCOUNTS, ...CUSTOMER_ACCOUNTS, ...accounts.filter((a) => usedAccounts.has(a.code)).map((a) => a.code)])].map((code) => <option key={code} value={code}>{accountLabel(code)}</option>)}
          <option value="">Kõik kontod</option>
        </Select>
        <span className="accounting-partners__hint">Klõps partneril näitab tema read; „Pearaamat” avab sama konto selle partneri filtriga.</span>
      </div>
      {partners.rows.length ? <div className="accounting-sheet">
        <h2>Partnerid · {accountLabel(partnerAccount)}</h2>
        {partners.missing ? <p className="accounting-partners__missing" role="status">Partner puudub {partners.missing.lines.length + (partners.missing.openingBalance ? 1 : 0)} real — lisa see päevaraamatus (veerg Partner; filter „Konto” {partnerAccount || '…'}).</p> : null}
        <div className="accounting-grid-wrap"><table className="accounting-grid accounting-trial accounting-partners"><colgroup><col className="c-partner-name" /><col className="c-partner-code" /><col /><col /><col /><col /><col /><col /></colgroup><thead>
          <tr><th rowSpan="2">Partner</th><th rowSpan="2">Reg-kood</th><th colSpan="2" className="center">Algsaldo</th><th colSpan="2" className="center">Käive</th><th colSpan="2" className="center">Lõppsaldo</th></tr>
          <tr><th className="num">Deebet</th><th className="num">Kreedit</th><th className="num">Deebet</th><th className="num">Kreedit</th><th className="num">Deebet</th><th className="num">Kreedit</th></tr></thead>
          {partners.rows.map((r) => {
            const open = openPartners.has(r.key);
            return <tbody key={r.key} className={r.key === 'none' ? 'is-missing' : ''}>
              <tr className={open ? 'accounting-grid__entry' : ''}>
                <td><button type="button" className="link-button" aria-expanded={open} onClick={() => togglePartner(r.key)}>{open ? <ChevronDown size={13} /> : <ChevronRight size={13} />} {r.name}</button>{r.type ? <small> {PARTNER_TYPE_LABELS[r.type] || ''}</small> : null}</td>
                <td>{r.regCode}</td>
                {[r.opening.debit, r.opening.credit, r.turnover.debit, r.turnover.credit, r.closing.debit, r.closing.credit].map((v, i) => <td key={i} className="num">{v ? amount(v) : ''}</td>)}
              </tr>
              {open ? <>
                <tr className="accounting-partners__lines-head"><td>Kuupäev · Kanne</td><td>Dokument</td><td colSpan="2">Kirjeldus</td><td className="num">Deebet</td><td className="num">Kreedit</td><td className="num">Saldo</td><td><button type="button" className="link-button" onClick={() => openLedgerFor(r)}>Pearaamat</button></td></tr>
                {r.lines.map((l, i) => <tr key={`${l.entryId}-${i}`} className="accounting-partners__line"><td>{dmy(l.date)} · <span title={`CRM kanne ${l.number}`}>{l.label || l.number}</span>{partnerAccount ? '' : ` · ${l.account}`}</td><td>{l.documentRef}</td><td colSpan="2">{l.description}</td><td className="num">{l.debitCents ? amount(l.debitCents) : ''}</td><td className="num">{l.creditCents ? amount(l.creditCents) : ''}</td><td className="num">{amount(l.balance)}</td><td /></tr>)}
                {!r.lines.length ? <tr className="accounting-partners__line"><td colSpan="8">Perioodis liikumisi ei ole (ainult algsaldo).</td></tr> : null}
              </> : null}
            </tbody>;
          })}
          <tfoot><tr><td colSpan="2">Kokku</td>{[partners.total.opening.debit, partners.total.opening.credit, partners.total.turnover.debit, partners.total.turnover.credit, partners.total.closing.debit, partners.total.closing.credit].map((v, i) => <td key={i} className="num">{amount(v)}</td>)}</tr></tfoot>
        </table></div>
        <p className="accounting-sheet__footer"><span>{COMPANY.name}</span><span>Rg-kood {COMPANY.regCode}</span></p>
      </div> : <EmptyState title="Sellel kontol perioodis liikumisi ei ole" description="Vali teine konto või periood." />}
    </Card> : null}

    {tab === 'suppliers' ? <Card className="accounting-card">
      <p className="form-hint">Tarnijad on kannete partnerid: ostuarve (OA) ja tasumise (VM) kanded saavad tarnija igale reale ise; käsitsi kandes vali 2110 / 1350 real partner päevaraamatu veerus „Partner”. Ostuarved sisestatakse lehel <Link to="/finance/ostuarved">Ostuarved</Link>.</p>
      <SuppliersPanel suppliers={suppliers} accounts={accounts} onSave={saveSupplier} onImport={repository.importSuppliers ? importSuppliers : null}
        onExport={() => downloadWorkbook(suppliersWorkbook(suppliers, { company: COMPANY }), 'tarnijad.xls')} busy={busy === 'supplier'} />
    </Card> : null}

    {tab === 'statements' ? <div className="accounting-statements">
      <Card className="accounting-card accounting-statement"><h2><BookOpen size={18} /> Bilanss seisuga {dateLabel(period.to)}</h2>
        {[['Varad', statements.sheet.assets, statements.sheet.assetsCents], ['Kohustised', statements.sheet.liabilities, statements.sheet.liabilitiesCents], ['Omakapital', statements.sheet.equity, statements.sheet.equityCents]].map(([title, list, total]) => <section key={title}><h3>{title}</h3>{list.map((l) => <p key={l.line}><span>{l.line}</span><span>{euro(l.amountCents)}</span></p>)}<p className="total"><span>{title} kokku</span><span>{euro(total)}</span></p></section>)}
        <p className={`total ${statements.sheet.balanced ? 'is-ok' : 'is-off'}`}><span>Kohustised ja omakapital kokku</span><span>{euro(statements.sheet.liabilitiesCents + statements.sheet.equityCents)}</span></p>
      </Card>
      <Card className="accounting-card accounting-statement"><h2><BookOpen size={18} /> Kasumiaruanne {dateLabel(period.from)} – {dateLabel(period.to)}</h2>
        {[['Tulud', statements.result.income, statements.result.incomeCents], ['Kulud', statements.result.expense, statements.result.expenseCents]].map(([title, list, total]) => <section key={title}><h3>{title}</h3>{list.map((l) => <p key={l.line}><span>{l.line}</span><span>{euro(l.amountCents)}</span></p>)}<p className="total"><span>{title} kokku</span><span>{euro(total)}</span></p></section>)}
        <p className="total"><span>Kasum (kahjum)</span><span>{euro(statements.result.profitCents)}</span></p>
      </Card>
    </div> : null}

    {tab === 'chart' ? <Card className="accounting-card">
      <div className="accounting-card__search"><span>{accounts.length} kontot · Merit Aktiva kontoplaan</span><Button onClick={() => openAccount(null)}>+ Lisa konto</Button></div>
      <div className="students-table-wrap"><table className="students-table accounting-table"><thead><tr><th>Konto</th><th>Nimetus</th><th>Liik</th><th>Bilansi / kasumiaruande rida</th><th>Olek</th><th /></tr></thead>
        <tbody>{accounts.map((a) => <tr key={a.code} className={a.active === false ? 'is-reversed' : ''}><td><strong>{a.code}</strong></td><td>{a.name}</td><td>{accountTypeLabel(a.type)}</td><td>{a.reportLine}</td><td>{a.active === false ? <Badge tone="neutral">Suletud</Badge> : usedAccounts.has(a.code) ? <Badge tone="success">Kasutusel</Badge> : null}</td><td><Button variant="secondary" onClick={() => openAccount(a)}>Muuda</Button></td></tr>)}</tbody></table></div>
    </Card> : null}

    <Modal open={dialog === 'opening'} title="Algsaldod seisuga 01.01.2026" onClose={close} footer={<><Button variant="secondary" disabled={Boolean(busy)} onClick={close}>Loobu</Button><Button type="submit" form="accounting-opening-form" loading={busy === 'save'}>Salvesta algsaldod</Button></>}>
      <form id="accounting-opening-form" className="expense-form" onSubmit={submitOpening}>
        <p className="form-hint">Sisesta raamatupidaja 31.12.2025 käibeandmiku lõppsaldod: varad deebetisse, kohustised ja omakapital kreeditisse. Tulu- ja kulukontodel algsaldot ei ole.</p>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <LinesEditor lines={lines} setLines={setLines} accounts={accounts} />
      </form>
    </Modal>

    <Modal open={dialog === 'storno'} title={`Storno: kanne ${form.entry?.number || ''}`} onClose={close} footer={<><Button variant="secondary" disabled={Boolean(busy)} onClick={close}>Loobu</Button><Button variant="danger" type="submit" form="accounting-storno-form" loading={busy === 'save'}>Tee storno</Button></>}>
      <form id="accounting-storno-form" className="expense-form" onSubmit={submitStorno}>
        <p className="form-hint">Algne kanne jääb alles. Uus kanne pöörab deebeti ja kreediti ümber.</p>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <Input id="storno-date" label="Storno kuupäev" type="date" value={form.date || ''} required onChange={(event) => setForm({ ...form, date: event.target.value })} />
        <label className="textarea-field"><span>Põhjus *</span><textarea aria-label="Storno põhjus" rows="3" value={form.reason || ''} onChange={(event) => setForm({ ...form, reason: event.target.value })} /></label>
      </form>
    </Modal>

    <Modal open={dialog === 'delete'} title={`Kustuta kanne ${form.entry?.label || ''}`} onClose={close} footer={<><Button variant="secondary" disabled={Boolean(busy)} onClick={close}>Loobu</Button><Button variant="danger" type="submit" form="accounting-delete-form" loading={busy === 'save'}>Kustuta kanne</Button></>}>
      <form id="accounting-delete-form" className="expense-form" onSubmit={submitDelete}>
        <p className="form-hint">Kanne kaob registritest, kuid selle sisu, kustutaja, aeg ja põhjus jäävad ajalukku („Näita kustutatud”). Kande numbrit ei kasutata uuesti.</p>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <label className="textarea-field"><span>Põhjus *</span><textarea aria-label="Kustutamise põhjus" rows="3" value={form.reason || ''} onChange={(event) => setForm({ ...form, reason: event.target.value })} /></label>
      </form>
    </Modal>

    <Modal open={dialog === 'lock'} title="Sulge periood" onClose={close} footer={<><Button variant="secondary" disabled={Boolean(busy)} onClick={close}>Loobu</Button><Button type="submit" form="accounting-lock-form" loading={busy === 'save'}>Salvesta</Button></>}>
      <form id="accounting-lock-form" className="expense-form" onSubmit={submitLock}>
        <p className="form-hint">Kuni selle kuupäevani (k.a) ei saa kandeid ega ostuarveid lisada, muuta ega kustutada. Pärast seda parandatakse ainult uue kandega (storno või parandav kanne) hilisema kuupäevaga.</p>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <Input id="lock-date" label="Periood suletud kuni" type="date" value={form.lockedThrough || ''} onChange={(event) => setForm({ ...form, lockedThrough: event.target.value })} />
        <label className="textarea-field"><span>Põhjus (kohustuslik, kui periood avatakse uuesti)</span><textarea aria-label="Perioodi põhjus" rows="2" value={form.reason || ''} onChange={(event) => setForm({ ...form, reason: event.target.value })} /></label>
      </form>
    </Modal>

    <Modal open={dialog === 'account'} title={form.existing ? `Konto ${form.code}` : 'Lisa konto'} onClose={close} footer={<><Button variant="secondary" disabled={Boolean(busy)} onClick={close}>Loobu</Button><Button type="submit" form="accounting-account-form" loading={busy === 'save'}>Salvesta</Button></>}>
      <form id="accounting-account-form" className="expense-form" onSubmit={submitAccount}>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <div className="form-grid">
          <Input id="account-code" label="Konto nr" value={form.code || ''} required disabled={form.existing} onChange={(event) => setForm({ ...form, code: event.target.value.trim() })} />
          <Select id="account-type" label="Liik" value={form.type || 'expense'} disabled={form.existing} onChange={(event) => setForm({ ...form, type: event.target.value })}>{ACCOUNT_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>
          <Input id="account-name" className="form-grid__wide" label="Nimetus" value={form.name || ''} required onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <Input id="account-line" className="form-grid__wide" label="Bilansi / kasumiaruande rida" value={form.reportLine || ''} onChange={(event) => setForm({ ...form, reportLine: event.target.value })} />
        </div>
        {form.existing ? <label className="accounting-check"><input type="checkbox" checked={form.active === false} onChange={(event) => setForm({ ...form, active: !event.target.checked })} /> Konto on suletud (uusi kandeid sellele ei tehta; vanad jäävad alles)</label> : null}
      </form>
    </Modal>
  </div>;
}
