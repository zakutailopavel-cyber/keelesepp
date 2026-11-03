import { CheckCircle2, FileUp, Landmark, RefreshCw } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState, Select } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { dmy, euro } from './accountingReports.js';
import { CATEGORY_PRESETS, CHECK_LABELS, defaultBasis, linesByState, monthCheck, ruleBasis } from './bankBooks.js';

// Raamatupidamine → „Pank” (owner 2026-11-03, docs/ACCOUNTING.md „Pangapõhine raamatupidamine”): the company account's
// LHV statement is the source of the books' money. Import, confirm the suggestions, categorise lines without a document
// (once, or with a rule for the next months) and check the month against 1010. Nothing here writes an entry: the sync
// („Uuenda kanded”, run by onBooksChanged) books what is linked or categorised.
const thisMonth = () => new Date().toISOString().slice(0, 7);
const signedEuro = (line) => `${line.direction === 'D' ? '−' : '+'}${euro(line.amountCents)} €`;
const CONFIDENCE = { sure: ['Kindel', 'success'], likely: ['Soovitus', 'warning'], manual: ['Käsitsi', 'neutral'] };
const BASIS_LABELS = { account: 'sama konto (IBAN)', name: 'sama nimi', explanation: 'selgituse tekst' };

function CategoryRow({ line, accounts, readOnly, busy, onSave }) {
  const presets = CATEGORY_PRESETS[line.direction === 'D' ? 'D' : 'C'];
  const [account, setAccount] = useState('');
  const [withRule, setWithRule] = useState(false);
  const [basis, setBasis] = useState(defaultBasis(line));
  const preset = presets.find((p) => p.account === account);
  const known = accounts.find((a) => String(a.code) === account && a.active !== false);
  const save = () => onSave(line, { account, label: preset?.label || known?.name || '', rule: withRule ? ruleBasis(line, basis) : null });
  return <tr>
    <td>{dmy(line.date)}</td>
    <td><strong>{line.counterpartyName || '—'}</strong>{line.counterpartyAccount ? <><br /><small>{line.counterpartyAccount}</small></> : null}</td>
    <td className="num">{signedEuro(line)}</td>
    <td><small>{line.explanation || '—'}</small>{line.match?.reason ? <><br /><small className="field__hint">{line.match.reason}</small></> : null}</td>
    <td>{readOnly ? '—' : <div className="bank-books__category">
      <Select aria-label={`Kategooria ${line.id}`} value={preset ? account : ''} onChange={(event) => setAccount(event.target.value)}>
        <option value="">Vali kategooria…</option>
        {presets.map((p) => <option key={`${p.account}-${p.label}`} value={p.account}>{p.account} {p.label}</option>)}
      </Select>
      <input aria-label={`Konto ${line.id}`} className="bank-books__account" list="bank-books-accounts" placeholder="konto" value={account} onChange={(event) => setAccount(event.target.value.trim())} />
      <label className="accounting-check"><input type="checkbox" checked={withRule} onChange={(event) => setWithRule(event.target.checked)} /> Reegel</label>
      {withRule ? <Select aria-label={`Reegli alus ${line.id}`} value={basis} onChange={(event) => setBasis(event.target.value)}>
        {Object.entries(BASIS_LABELS).filter(([key]) => ruleBasis(line, key)).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </Select> : null}
      <Button variant="secondary" disabled={!known || account === '1010' || busy} onClick={save}>Kirjenda</Button>
    </div>}</td>
  </tr>;
}

export default function BankBooksPanel({ repository, entries = [], accounts = [], readOnly = false, waiting = null, onBooksChanged }) {
  const state = useAsyncData(() => repository.loadBank(), [repository]);
  const fileInput = useRef(null);
  const [month, setMonth] = useState(thisMonth());
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [sinceForm, setSinceForm] = useState(null);
  const [undo, setUndo] = useState(null);
  const [closing, setClosing] = useState('');
  const [review, setReview] = useState(null);

  const data = state.data || { lines: [], rules: [], balances: {}, bankBooksSince: '', imports: [] };
  const groups = useMemo(() => linesByState(data.lines), [data.lines]);
  const savedClosing = data.balances?.[month];
  const check = useMemo(() => monthCheck({ lines: data.lines, entries, month, closingCents: savedClosing ?? null }), [data.lines, entries, month, savedClosing]);

  const run = async (label, action, success) => {
    setBusy(label); setError('');
    try {
      const result = await action();
      if (success) setNotice(typeof success === 'function' ? success(result) : success);
      await state.reload();
      await onBooksChanged?.();
      return result;
    } catch (nextError) {
      setError(nextError.message || 'Toiming ebaõnnestus.');
      return null;
    } finally { setBusy(''); }
  };

  const importFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const text = await file.text();
    await run('import', () => repository.importBankStatement(text, file.name), (r) => `${file.name}: ${r.lines} rida (${r.imported} uut, ${r.duplicates} juba olemas) · seotud ${r.matched} · kinnitada ${r.review} · reegliga ${r.categorized} · ilma dokumendita ${r.unmatched}${r.errors?.length ? ` · ${r.errors.length} märkust` : ''}`);
  };
  const confirm = (line) => run(`confirm-${line.id}`, () => repository.confirmBankLine(line.id), 'Vaste kinnitatud: makse on CRM-is panga kuupäevaga.');
  const dismiss = (line) => run(`dismiss-${line.id}`, () => repository.dismissBankLine(line.id), 'Soovitus tagasi lükatud; vali rea kategooria.');
  const categorize = (line, values) => run(`cat-${line.id}`, () => repository.categorizeBankLine(line.id, values), (r) => `Kirjendatud kontole ${values.account}${r.rule ? `; reegel salvestatud${r.appliedToOthers ? `, rakendati veel ${r.appliedToOthers} reale` : ''}` : ''}.`);
  const uncategorize = () => run(`undo-${undo.lineId}`, () => repository.uncategorizeBankLine(undo.lineId, undo.reason), 'Kategooria tühistatud.').then(() => setUndo(null));
  const saveSince = (event) => { event.preventDefault(); run('since', () => repository.setBankBooks(sinceForm.since, sinceForm.reason), (r) => (r.bankBooks.since ? `Pangareegel kehtib alates ${dmy(r.bankBooks.since)}.` : 'Pangareegel on välja lülitatud.')).then((r) => r && setSinceForm(null)); };
  const saveClosing = () => {
    const cents = Math.round(Number(String(closing).replace(/\s/g, '').replace(',', '.')) * 100);
    if (!Number.isFinite(cents)) { setError('Lõppsaldo on vigane.'); return; }
    run('closing', () => repository.setBankClosingBalance(month, cents), 'Panga lõppsaldo salvestatud.').then(() => setClosing(''));
  };
  const loadReview = async () => {
    setBusy('review'); setError('');
    try { setReview(await repository.bankBooksReview('', `${month}-31`)); } catch (nextError) { setError(nextError.message || 'Ülevaade ebaõnnestus.'); } finally { setBusy(''); }
  };
  const ruleOff = (rule) => run(`rule-${rule.id}`, () => repository.saveBankRule(rule.id, { ...rule, active: !rule.active }), rule.active ? 'Reegel välja lülitatud.' : 'Reegel sisse lülitatud.');

  if (state.loading && !state.data) return <LoadingState label="Laen pangaridu…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;
  const inMonth = (line) => String(line.date).slice(0, 7) === month;
  const reviewLines = groups.review;
  const unmatched = groups.unmatched;
  const categorized = groups.categorized.filter(inMonth);
  const lastImport = data.imports[0];

  return <Card className="accounting-card bank-books" aria-label="Pangapõhine raamatupidamine">
    <datalist id="bank-books-accounts">{accounts.filter((a) => a.active !== false && String(a.code) !== '1010').map((a) => <option key={a.code} value={a.code}>{a.name}</option>)}</datalist>
    <div className="bank-books__head">
      <div>
        <h2>Pangapõhine raamatupidamine</h2>
        <p className="field__hint">
          {data.bankBooksSince
            ? <>Alates <strong>{dmy(data.bankBooksSince)}</strong> lähevad raamatupidamisse ainult arved ja maksed, mille raha on ettevõtte pangakontol (seotud väljavõtte reaga); sularaha nagu varem.</>
            : <>Pangareegel ei ole sisse lülitatud: kõik CRM-i arved ja maksed kirjendatakse nagu varem.</>}
          {lastImport ? <> Viimane väljavõte: {lastImport.fileName || '—'} ({dmy(lastImport.from)}–{dmy(lastImport.to)}).</> : null}
        </p>
      </div>
      {!readOnly ? <div className="bank-books__actions">
        <Button loading={busy === 'import'} onClick={() => fileInput.current?.click()}><FileUp size={17} /> Impordi LHV väljavõte (CSV)</Button>
        <input ref={fileInput} className="sr-only" type="file" accept=".csv,text/csv,text/plain" aria-label="LHV väljavõtte fail" onChange={importFile} />
        <Button variant="secondary" loading={busy === 'rematch'} onClick={() => run('rematch', () => repository.rematchBankLines(), (r) => `Seotud ${r.matched}, kinnitada ${r.review}, reegliga ${r.categorized}.`)}><RefreshCw size={16} /> Otsi vasteid uuesti</Button>
        <Button variant="secondary" onClick={() => setSinceForm({ since: data.bankBooksSince || `${thisMonth()}-01`, reason: '' })}>Pangareegel…</Button>
      </div> : null}
    </div>
    {sinceForm ? <form className="bank-books__since" onSubmit={saveSince}>
      <Input id="bank-books-since" label="Pangareegel kehtib alates (tühi = väljas)" type="date" value={sinceForm.since} onChange={(event) => setSinceForm({ ...sinceForm, since: event.target.value })} />
      <Input id="bank-books-reason" label="Põhjus" value={sinceForm.reason} onChange={(event) => setSinceForm({ ...sinceForm, reason: event.target.value })} />
      <Button type="submit" loading={busy === 'since'} disabled={!sinceForm.reason.trim()}>Salvesta</Button>
      <Button variant="secondary" type="button" onClick={() => setSinceForm(null)}>Loobu</Button>
      <p className="field__hint">Kehtib ainult uutele kannetele. Juba tehtud kandeid ei muudeta; varasemate kuude kontroll: „Varasemad kanded” allpool.</p>
    </form> : null}
    {notice ? <div className="success-notice" role="status">{notice}<button type="button" aria-label="Sulge teade" onClick={() => setNotice('')}>×</button></div> : null}
    {error ? <div className="expense-error" role="alert">{error}<button type="button" aria-label="Sulge veateade" onClick={() => setError('')}>×</button></div> : null}

    <section aria-label="Kinnita vasted">
      <h3>Kinnita vasted ({reviewLines.length})</h3>
      {reviewLines.length ? <div className="students-table-wrap"><table className="students-table accounting-table">
        <thead><tr><th>Kuupäev</th><th>Maksja</th><th className="num">Summa</th><th>Selgitus</th><th>Soovitus</th><th /></tr></thead>
        <tbody>{reviewLines.map((line) => {
          const [label, tone] = CONFIDENCE[line.match?.confidence] || CONFIDENCE.manual;
          const target = line.match?.allocations?.length ? line.match.allocations.map((a) => `${a.invoiceNum || 'arve'} ${euro(a.amountCents)} €`).join(', ') : line.match?.paymentIds?.length ? `${line.match.paymentIds.length} sisestatud makse` : line.match?.purchaseInvoiceId ? 'ostuarve makse' : line.match?.refundId ? 'tagastus' : '';
          return <tr key={line.id}>
            <td>{dmy(line.date)}</td>
            <td><strong>{line.counterpartyName || '—'}</strong></td>
            <td className="num">{signedEuro(line)}</td>
            <td><small>{line.explanation || '—'}</small></td>
            <td><Badge tone={tone}>{label}</Badge> {target}<br /><small className="field__hint">{line.match?.reason}{line.match?.error ? ` · ${line.match.error}` : ''}</small></td>
            <td>{readOnly ? null : <span className="bank-books__buttons">
              <Button loading={busy === `confirm-${line.id}`} onClick={() => confirm(line)}><CheckCircle2 size={16} /> Kinnita</Button>
              <Button variant="secondary" loading={busy === `dismiss-${line.id}`} onClick={() => dismiss(line)}>Pole see</Button>
            </span>}</td>
          </tr>;
        })}</tbody>
      </table></div> : <p className="field__hint">Kinnitamist ootavaid vasteid ei ole.</p>}
    </section>

    <section aria-label="Ilma dokumendita read">
      <h3>Ilma dokumendita read ({unmatched.length})</h3>
      <p className="field__hint">Raha, millel CRM-is arvet ega ostuarvet ei ole (Töötukassa, tunnitasu ilma arveta, omaniku ülekanne, palk, maksud, tellimused…). Vali kategooria üks kord; „Reegel” kirjendab järgmistel kuudel samad read ise.</p>
      {unmatched.length ? <div className="students-table-wrap"><table className="students-table accounting-table">
        <thead><tr><th>Kuupäev</th><th>Saaja / maksja</th><th className="num">Summa</th><th>Selgitus</th><th>Kategooria</th></tr></thead>
        <tbody>{unmatched.map((line) => <CategoryRow key={line.id} line={line} accounts={accounts} readOnly={readOnly} busy={busy === `cat-${line.id}`} onSave={categorize} />)}</tbody>
      </table></div> : <p className="field__hint">Kõik read on seotud või kirjendatud.</p>}
    </section>

    {waiting?.payments?.length ? <section aria-label="Ootab panka">
      <details>
        <summary><strong>Ootab panka ({waiting.payments.length} makset, {waiting.invoices} arvet)</strong></summary>
        <p className="field__hint">Käsitsi sisestatud maksed, mille taga ei ole veel ettevõtte pangarida. Need on CRM-is (õpilase saldo), kuid raamatupidamisse lähevad alles siis, kui väljavõtte rida nendega seotakse. Kui raha laekus FIE kontole või sularahas, märgi see Finantsides.</p>
        <div className="students-table-wrap"><table className="students-table accounting-table">
          <thead><tr><th>Kuupäev</th><th>Arve</th><th>Maksja</th><th>Viis</th><th className="num">Summa</th></tr></thead>
          <tbody>{waiting.payments.map((p) => <tr key={p.id}><td>{dmy(p.paidAt)}</td><td>{p.invoiceNum || '—'}</td><td>{p.payerName || '—'}</td><td>{p.method || 'bank'}</td><td className="num">{euro(p.amountCents)} €</td></tr>)}</tbody>
        </table></div>
      </details>
    </section> : null}

    <section aria-label="Kuu kontroll" className="bank-books__check">
      <div className="bank-books__check-head">
        <h3>Kuu kontroll: pank ja konto 1010</h3>
        <Input id="bank-books-month" label="Kuu" type="month" value={month} onChange={(event) => setMonth(event.target.value || thisMonth())} />
        {!readOnly ? <>
          <Input id="bank-books-closing" label={`Panga lõppsaldo ${month}`} inputMode="decimal" placeholder={savedClosing !== undefined ? euro(savedClosing) : '0,00'} value={closing} onChange={(event) => setClosing(event.target.value)} />
          <Button variant="secondary" loading={busy === 'closing'} disabled={!closing.trim()} onClick={saveClosing}>Salvesta saldo</Button>
        </> : null}
      </div>
      <dl className="bank-books__totals">
        <dt>Väljavõte</dt><dd>+{euro(check.totals.statementIn)} € / −{euro(check.totals.statementOut)} €</dd>
        <dt>Konto 1010 käive</dt><dd>+{euro(check.totals.booksIn)} € / −{euro(check.totals.booksOut)} €</dd>
        <dt>Käibe vahe</dt><dd className={check.totals.turnoverDifference ? 'is-off' : 'is-ok'}>{euro(check.totals.turnoverDifference)} €</dd>
        <dt>1010 saldo kuu lõpus</dt><dd>{euro(check.closingBooks)} €</dd>
        <dt>Panga lõppsaldo</dt><dd>{check.closingBank === null ? 'sisesta väljavõttelt' : `${euro(check.closingBank)} €`}</dd>
        <dt>Vahe</dt><dd className={check.difference ? 'is-off' : 'is-ok'}>{check.difference === null ? '—' : `${euro(check.difference)} €`}</dd>
      </dl>
      {check.ok ? <p className="bank-books__ok" role="status"><Landmark size={16} /> Kuu on korras: iga pangarida on kirjendatud ja saldo klapib.</p> : null}
      {check.rows.some((r) => r.status !== 'ok') ? <div className="students-table-wrap"><table className="students-table accounting-table" aria-label="Pangaread, mis ei klapi">
        <thead><tr><th>Kuupäev</th><th>Saaja / maksja</th><th className="num">Pank</th><th className="num">1010</th><th>Olek</th></tr></thead>
        <tbody>{check.rows.filter((r) => r.status !== 'ok').map((r) => <tr key={r.line.id}>
          <td>{dmy(r.line.date)}</td><td>{r.line.counterpartyName || '—'}<br /><small>{r.line.explanation}</small></td>
          <td className="num">{signedEuro(r.line)}</td><td className="num">{euro(r.bookedCents)} €</td><td><Badge tone={r.status === 'open' ? 'warning' : 'danger'}>{CHECK_LABELS[r.status]}</Badge></td>
        </tr>)}</tbody>
      </table></div> : null}
      {check.noLine.length ? <div className="students-table-wrap"><table className="students-table accounting-table" aria-label="Kanded 1010 ilma pangareata">
        <thead><tr><th>Kuupäev</th><th>Kanne</th><th>Sisu</th><th className="num">1010</th><th>Märkus</th></tr></thead>
        <tbody>{check.noLine.map(({ entry, movement, duplicateOf }) => <tr key={entry.id}>
          <td>{dmy(entry.date)}</td><td>{entry.number}</td><td><small>{entry.description}</small></td><td className="num">{euro(movement)} €</td>
          <td>{duplicateOf ? <Badge tone="danger">Topelt? sama raha: {duplicateOf.counterpartyName} {dmy(duplicateOf.date)}</Badge> : <Badge tone="warning">Pangarida puudub</Badge>}</td>
        </tr>)}</tbody>
      </table></div> : null}
      {!check.rows.length ? <EmptyState title="Selle kuu väljavõtet ei ole imporditud" description="Impordi LHV konto väljavõte CSV-na." /> : null}
    </section>

    <details>
      <summary><strong>Kirjendatud read {month} ({categorized.length})</strong></summary>
      {categorized.length ? <div className="students-table-wrap"><table className="students-table accounting-table">
        <thead><tr><th>Kuupäev</th><th>Saaja / maksja</th><th className="num">Summa</th><th>Konto</th><th /></tr></thead>
        <tbody>{categorized.map((line) => <tr key={line.id}>
          <td>{dmy(line.date)}</td><td>{line.counterpartyName}<br /><small>{line.explanation}</small></td><td className="num">{signedEuro(line)}</td>
          <td>{line.category?.account} {line.category?.label}{line.category?.ruleId ? <> · <small>reegel</small></> : null}</td>
          <td>{readOnly ? null : undo?.lineId === line.id
            ? <span className="bank-books__buttons"><input aria-label="Tühistamise põhjus" placeholder="põhjus" value={undo.reason} onChange={(event) => setUndo({ ...undo, reason: event.target.value })} /><Button variant="secondary" disabled={!undo.reason.trim()} loading={busy === `undo-${line.id}`} onClick={uncategorize}>Tühista</Button></span>
            : <Button variant="secondary" onClick={() => setUndo({ lineId: line.id, reason: '' })}>Tühista…</Button>}</td>
        </tr>)}</tbody>
      </table></div> : <p className="field__hint">Selles kuus kirjendatud ridu ei ole.</p>}
    </details>

    <details>
      <summary><strong>Reeglid ({data.rules.length})</strong></summary>
      {data.rules.length ? <div className="students-table-wrap"><table className="students-table accounting-table">
        <thead><tr><th>Suund</th><th>Tingimus</th><th>Konto</th><th>Olek</th><th /></tr></thead>
        <tbody>{data.rules.map((rule) => <tr key={rule.id}>
          <td>{rule.direction === 'D' ? 'Väljaminek' : rule.direction === 'C' ? 'Laekumine' : 'Mõlemad'}</td>
          <td>{[rule.counterpartyAccount && `konto ${rule.counterpartyAccount}`, rule.counterpartyName && `nimi „${rule.counterpartyName}”`, rule.explanation && `selgitus „${rule.explanation}”`].filter(Boolean).join(' · ')}</td>
          <td>{rule.account} {rule.label}</td>
          <td>{rule.active === false ? 'väljas' : 'sees'}</td>
          <td>{readOnly ? null : <Button variant="secondary" loading={busy === `rule-${rule.id}`} onClick={() => ruleOff(rule)}>{rule.active === false ? 'Lülita sisse' : 'Lülita välja'}</Button>}</td>
        </tr>)}</tbody>
      </table></div> : <p className="field__hint">Reegleid ei ole. Reegel tehakse rea kirjendamisel („Reegel”).</p>}
    </details>

    <details>
      <summary><strong>Varasemad kanded (üleminek)</strong></summary>
      <p className="field__hint">Ainult ülevaade: automaatkanded kuni {dmy(`${month}-01`)} kuu lõpuni, mida pangareegel ei teeks. Süsteem ei muuda midagi; raamatupidaja otsustab kande kaupa päevaraamatus pärast omaniku nõusolekut.</p>
      <Button variant="secondary" loading={busy === 'review'} onClick={loadReview}>Näita</Button>
      {review ? <ul className="bank-books__review">
        <li><strong>Laekumised ilma pangareata ({review.withoutBank.length})</strong>{review.withoutBank.slice(0, 50).map((i) => <div key={i.entryId}><small>{i.number} · {dmy(i.date)} · {i.invoiceNum} · {i.payerName} · {euro(i.totalCents)} €</small></div>)}</li>
        <li><strong>Kirjendatud muul päeval kui pangas ({review.dateDiffers.length})</strong>{review.dateDiffers.slice(0, 50).map((i) => <div key={i.entryId}><small>{i.number} · kanne {dmy(i.date)} · pank {dmy(i.bankDate)} · {i.invoiceNum} · {euro(i.totalCents)} €</small></div>)}</li>
        <li><strong>Müügiarved ilma laekumiseta ({review.salesWithoutMoney.length})</strong>{review.salesWithoutMoney.slice(0, 50).map((i) => <div key={i.entryId}><small>{i.number} · {dmy(i.date)} · {i.invoiceNum} · {euro(i.totalCents)} €</small></div>)}</li>
      </ul> : null}
    </details>
  </Card>;
}
