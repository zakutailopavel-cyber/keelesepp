import { ArrowLeft, BookOpen, Download, FilePlus2, RefreshCw, Scale, Undo2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState, Modal, PageHeader, Select } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { accountingService } from '../../services/firebase/index.js';
import { downloadWorkbook, journalWorkbook, statementsWorkbook, trialBalanceWorkbook } from './accountingExcel.js';
import { ACCOUNT_TYPES, accountTypeLabel, balanceSheet, euro, incomeStatement, journalRows, ledger, parseEuro, trialBalance } from './accountingReports.js';
import './accounting.css';

// Raamatupidamine (owner 2026-10-22, docs/ACCOUNTING.md): päevaraamat, pearaamat, käibeandmik, bilanss and
// kasumiaruanne from the numbered entries; manual entries, stornos, opening balances and the chart of accounts.
const COMPANY = 'E&P Koolitus OÜ (17270880)';
const TABS = [
  ['journal', 'Päevaraamat'],
  ['ledger', 'Pearaamat'],
  ['trial', 'Käibeandmik'],
  ['statements', 'Bilanss ja kasumiaruanne'],
  ['chart', 'Kontoplaan'],
];
const ORIGIN = { auto: ['Automaatne', 'neutral'], manual: ['Käsitsi', 'info'], reversal: ['Storno', 'warning'], opening: ['Algsaldod', 'success'] };
const today = () => new Date().toISOString().slice(0, 10);
const dateLabel = (value) => (value ? new Date(`${value}T12:00:00`).toLocaleDateString('et-EE') : '—');
const blankLine = () => ({ account: '', debit: '', credit: '', note: '' });

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

const toLines = (lines) => lines.map((l) => ({ account: l.account, debitCents: parseEuro(l.debit) || 0, creditCents: parseEuro(l.credit) || 0, note: l.note })).filter((l) => l.account && (l.debitCents || l.creditCents));
const badAmount = (lines) => lines.some((l) => Number.isNaN(parseEuro(l.debit)) || Number.isNaN(parseEuro(l.credit)));

export default function AccountingPage({ repository = accountingService }) {
  const state = useAsyncData(() => repository.load(), [repository]);
  const [tab, setTab] = useState('journal');
  const [period, setPeriod] = useState({ from: `${today().slice(0, 4)}-01-01`, to: today() });
  const [ledgerAccount, setLedgerAccount] = useState('1010');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState({});
  const [lines, setLines] = useState([blankLine(), blankLine()]);
  const synced = useRef(false);

  const entries = useMemo(() => state.data?.entries || [], [state.data]);
  const accounts = useMemo(() => state.data?.accounts || [], [state.data]);
  const journal = useMemo(() => journalRows(entries, accounts, period).filter((e) => !query || `${e.number} ${e.description} ${e.documentRef} ${e.lines.map((l) => l.account).join(' ')}`.toLocaleLowerCase('et').includes(query.toLocaleLowerCase('et'))), [entries, accounts, period, query]);
  const trial = useMemo(() => trialBalance(entries, accounts, period), [entries, accounts, period]);
  const accountLedger = useMemo(() => ledger(entries, ledgerAccount, period, accounts), [entries, ledgerAccount, period, accounts]);
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

  const openEntry = () => { setDialog('entry'); setForm({ date: today(), description: '', documentRef: '' }); setLines([blankLine(), blankLine()]); setError(''); };
  const openOpening = () => { setDialog('opening'); setLines([blankLine(), blankLine(), blankLine()]); setError(''); };
  const openStorno = (entry) => { setDialog('storno'); setForm({ entry, date: today(), reason: '' }); setError(''); };
  const openAccount = (account) => { setDialog('account'); setForm(account ? { ...account, existing: true } : { code: '', name: '', type: 'expense', reportLine: '', active: true }); setError(''); };
  const close = () => { if (!busy) { setDialog(null); setError(''); } };

  const submitEntry = async (event) => {
    event.preventDefault();
    if (badAmount(lines)) { setError('Summa peab olema kujul 123,45.'); return; }
    if (await run('save', () => repository.createEntry({ ...form, lines: toLines(lines) }), (r) => `Kanne ${r.entry.number} salvestati.`)) setDialog(null);
  };
  const submitOpening = async (event) => {
    event.preventDefault();
    if (badAmount(lines)) { setError('Summa peab olema kujul 123,45.'); return; }
    if (await run('save', () => repository.setOpening(toLines(lines)), (r) => `Algsaldod salvestati (kanne ${r.entry.number}).`)) setDialog(null);
  };
  const submitStorno = async (event) => {
    event.preventDefault();
    if (!form.reason?.trim()) { setError('Lisa tühistamise põhjus.'); return; }
    if (await run('save', () => repository.reverse(form.entry.id, form.date, form.reason.trim()), (r) => `Storno ${r.entry.number} salvestati. Algne kanne jäi alles.`)) setDialog(null);
  };
  const submitAccount = async (event) => {
    event.preventDefault();
    const { existing: _existing, ...account } = form;
    if (await run('save', () => repository.saveAccount(account), `Konto ${account.code} salvestati.`)) setDialog(null);
  };
  const exportFile = () => {
    const stamp = `${period.from || 'algus'}_${period.to || today()}`;
    if (tab === 'trial') downloadWorkbook(trialBalanceWorkbook(trial, { company: COMPANY, period }), `kaibeandmik_${stamp}.xls`);
    else if (tab === 'statements') downloadWorkbook(statementsWorkbook(statements, { company: COMPANY, period }), `bilanss_kasumiaruanne_${stamp}.xls`);
    else downloadWorkbook(journalWorkbook(journalRows(entries, accounts, period), { company: COMPANY, period }), `paevaraamat_${stamp}.xls`);
  };

  if (state.loading && !state.data) return <LoadingState label="Laen raamatupidamist…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;

  const setYear = () => setPeriod({ from: `${today().slice(0, 4)}-01-01`, to: today() });
  const setMonth = () => setPeriod({ from: `${today().slice(0, 7)}-01`, to: today() });

  return <div className="page-content accounting-page">
    <Link className="back-link" to="/finance"><ArrowLeft size={17} /> Tagasi finantsidesse</Link>
    <PageHeader eyebrow="Finantsid" title="Raamatupidamine" description="Päevaraamat, pearaamat, käibeandmik, bilanss ja kasumiaruanne. Kanded tekivad arvetest, maksetest ja kuludest; käsitsi kanne ja storno jäävad ajalukku."
      actions={<>
        <Button variant="secondary" loading={busy === 'sync'} onClick={() => sync(false)}><RefreshCw size={17} /> Uuenda kanded</Button>
        <Button variant="secondary" onClick={openOpening}><Scale size={17} /> Algsaldod</Button>
        <Link className="button button--secondary" to="/finance/inf3">INF 3</Link>
        <Button onClick={openEntry}><FilePlus2 size={17} /> Lisa kanne</Button>
      </>} />
    {notice ? <div className="success-notice" role="status">{notice}<button aria-label="Sulge teade" onClick={() => setNotice('')}>×</button></div> : null}
    {error && !dialog ? <div className="expense-error" role="alert">{error}<button aria-label="Sulge veateade" onClick={() => setError('')}>×</button></div> : null}
    {!trial.balanced ? <div className="expense-error" role="alert">Käibeandmik ei ole tasakaalus — kontrolli kandeid.</div> : null}

    <Card className="accounting-toolbar">
      <nav className="accounting-tabs" aria-label="Raamatupidamise registrid">{TABS.map(([id, label]) => <button key={id} type="button" className={tab === id ? 'is-active' : ''} aria-pressed={tab === id} onClick={() => setTab(id)}>{label}</button>)}</nav>
      {tab !== 'chart' ? <div className="accounting-period">
        <Input id="accounting-from" label="Alates" type="date" value={period.from} onChange={(event) => setPeriod({ ...period, from: event.target.value })} />
        <Input id="accounting-to" label="Kuni" type="date" value={period.to} onChange={(event) => setPeriod({ ...period, to: event.target.value })} />
        <Button variant="secondary" onClick={setMonth}>Jooksev kuu</Button>
        <Button variant="secondary" onClick={setYear}>Jooksev aasta</Button>
        {tab !== 'ledger' ? <Button variant="secondary" onClick={exportFile}><Download size={17} /> Excel</Button> : null}
      </div> : null}
    </Card>

    {tab === 'journal' ? <Card className="accounting-card">
      <div className="accounting-card__search"><input aria-label="Otsi kannetest" placeholder="Otsi numbri, sisu, dokumendi või konto järgi…" value={query} onChange={(event) => setQuery(event.target.value)} /><span>{journal.length} kannet</span></div>
      {journal.length ? <div className="students-table-wrap"><table className="students-table accounting-table"><thead><tr><th>Nr</th><th>Kuupäev</th><th>Konto ja sisu</th><th>Konto</th><th className="num">Deebet</th><th className="num">Kreedit</th><th>Dokument</th><th /></tr></thead>
        <tbody>{journal.map((entry) => {
          const origin = ORIGIN[entry.origin] || [entry.origin, 'neutral'];
          const canReverse = (entry.origin === 'manual' || entry.origin === 'opening') && !entry.reversedBy;
          return [
            <tr key={entry.id} className={`accounting-entry${entry.reversedBy ? ' is-reversed' : ''}`}><td><strong>{entry.number}</strong></td><td>{dateLabel(entry.date)}</td><td colSpan="4"><strong>{entry.description}</strong> <Badge tone={origin[1]}>{origin[0]}</Badge>{entry.reversedBy ? <span> · tühistatud kandega {entry.reversedBy}</span> : null}</td><td>{entry.documentRef}</td><td>{canReverse ? <Button variant="secondary" onClick={() => openStorno(entry)}><Undo2 size={15} /> Storno</Button> : null}</td></tr>,
            ...entry.lines.map((l, i) => <tr key={`${entry.id}-${i}`} className="accounting-line"><td /><td /><td>{l.name}{l.note ? ` · ${l.note}` : ''}</td><td>{l.account}</td><td className="num">{l.debitCents ? euro(l.debitCents) : ''}</td><td className="num">{l.creditCents ? euro(l.creditCents) : ''}</td><td /><td /></tr>),
          ];
        })}</tbody></table></div> : <EmptyState title="Perioodis kandeid ei ole" description="Vali teine periood või vajuta „Uuenda kanded”." />}
    </Card> : null}

    {tab === 'ledger' ? <Card className="accounting-card">
      <div className="accounting-card__search"><Select id="ledger-account" label="Konto" value={ledgerAccount} onChange={(event) => setLedgerAccount(event.target.value)}>{accounts.filter((a) => usedAccounts.has(a.code)).map((a) => <option key={a.code} value={a.code}>{a.code} {a.name}</option>)}</Select></div>
      <div className="students-table-wrap"><table className="students-table accounting-table"><thead><tr><th>Kuupäev</th><th>Nr</th><th>Sisu</th><th>Dokument</th><th className="num">Deebet</th><th className="num">Kreedit</th><th className="num">Saldo</th></tr></thead>
        <tbody><tr className="accounting-entry"><td colSpan="6"><strong>Algsaldo</strong></td><td className="num">{euro(accountLedger.opening)}</td></tr>
          {accountLedger.rows.map((r, i) => <tr key={`${r.entryId}-${i}`}><td>{dateLabel(r.date)}</td><td>{r.number}</td><td>{r.description}</td><td>{r.documentRef}</td><td className="num">{r.debitCents ? euro(r.debitCents) : ''}</td><td className="num">{r.creditCents ? euro(r.creditCents) : ''}</td><td className="num">{euro(r.balance)}</td></tr>)}
          <tr className="accounting-entry"><td colSpan="6"><strong>Lõppsaldo</strong></td><td className="num"><strong>{euro(accountLedger.closing)}</strong></td></tr></tbody></table></div>
    </Card> : null}

    {tab === 'trial' ? <Card className="accounting-card">
      {trial.rows.length ? <div className="students-table-wrap"><table className="students-table accounting-table"><thead>
        <tr><th rowSpan="2">Konto nr</th><th rowSpan="2">Konto nimetus</th><th colSpan="2" className="num">Algsaldo</th><th colSpan="2" className="num">Käibed</th><th colSpan="2" className="num">Lõppsaldo</th></tr>
        <tr><th className="num">Deebet</th><th className="num">Kreedit</th><th className="num">Deebet</th><th className="num">Kreedit</th><th className="num">Deebet</th><th className="num">Kreedit</th></tr></thead>
        <tbody>{trial.rows.map((r) => <tr key={r.code}><td><button type="button" className="link-button" onClick={() => { setLedgerAccount(r.code); setTab('ledger'); }}>{r.code}</button></td><td>{r.name}</td>{[r.opening.debit, r.opening.credit, r.turnover.debit, r.turnover.credit, r.closing.debit, r.closing.credit].map((v, i) => <td key={i} className="num">{v ? euro(v) : ''}</td>)}</tr>)}
          <tr className="accounting-entry"><td /><td><strong>Kokku</strong></td>{[trial.total.opening.debit, trial.total.opening.credit, trial.total.turnover.debit, trial.total.turnover.credit, trial.total.closing.debit, trial.total.closing.credit].map((v, i) => <td key={i} className="num"><strong>{euro(v)}</strong></td>)}</tr></tbody></table></div>
        : <EmptyState title="Perioodis liikumisi ei ole" description="Vali teine periood." />}
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

    <Modal open={dialog === 'entry'} title="Lisa kanne" onClose={close} footer={<><Button variant="secondary" disabled={Boolean(busy)} onClick={close}>Loobu</Button><Button type="submit" form="accounting-entry-form" loading={busy === 'save'}>Salvesta kanne</Button></>}>
      <form id="accounting-entry-form" className="expense-form" onSubmit={submitEntry}>
        <p className="form-hint">Kannet ei saa hiljem muuta ega kustutada. Vea korral tee storno (RPS § 10).</p>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <div className="form-grid">
          <Input id="entry-date" label="Kuupäev" type="date" value={form.date || ''} required onChange={(event) => setForm({ ...form, date: event.target.value })} />
          <Input id="entry-document" label="Algdokument (nr / nimetus)" value={form.documentRef || ''} required onChange={(event) => setForm({ ...form, documentRef: event.target.value })} />
          <Input id="entry-description" className="form-grid__wide" label="Sisu" value={form.description || ''} required onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </div>
        <LinesEditor lines={lines} setLines={setLines} accounts={accounts} />
      </form>
    </Modal>

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
