import { ArrowDown, ArrowUp, History, Info, Lock, Replace, Trash2, Undo2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../../components/ui/index.js';
import { HISTORY_ACTIONS, SUPPLIER_ACCOUNTS, amount, dmy, entryActions, linesText, parseEuro } from './accountingReports.js';
import PartnerInput from './PartnerInput.jsx';
import {
  COL, COLUMNS, COLUMN_LABELS, SORT_KEYS, blankWorkingLine, cellText, cellValue, editableColumn, filterEntries, flatRows, inRange,
  moveCell, pasteIntoWorking, rangeTsv, replacementPreview, sameAsEntry, setCell, sortEntries, toWorking, workingProblem, workingValues,
} from './journalGrid.js';

// The päevaraamat as a spreadsheet (the accountant 2026-10-23: „функциональность и свобода действий как в Excel”,
// docs/ACCOUNTING.md „Päevaraamat kui tabel”). Every cell of an entry in an open period is typed in place; arrows,
// Tab, Enter move like Excel; Esc cancels. An entry is saved through financeApi when the cursor leaves it and D = K;
// otherwise it stays red with the difference. The legal guarantees stay on the server: history and audit of every
// change, the period lock, immutable numbers.
const REASON_KEY = 'keelesepp.accounting.correctionReason';
const readReason = () => { try { return globalThis.sessionStorage?.getItem(REASON_KEY) || ''; } catch { return ''; } };
const writeReason = (value) => { try { globalThis.sessionStorage?.setItem(REASON_KEY, value); } catch { /* private mode */ } };
const isMac = () => /Mac|iPhone|iPad/.test(globalThis.navigator?.platform || '');

const NO_FILTERS = { account: '', text: '', doc: '', sum: '', partner: '' };

export default function JournalGrid({ entries, accounts, suppliers = [], lockedThrough, readOnly, repository, onChanged, onNotice, sort, onSort, onDelete, onRestore, onStorno, onUndoStorno, draftSlot, blocked = false }) {
  const [filters, setFilters] = useState(NO_FILTERS);
  const [active, setActive] = useState(null);
  const [anchor, setAnchor] = useState(null);
  const [editing, setEditing] = useState(null);
  const [workings, setWorkings] = useState({});
  const [attempted, setAttempted] = useState(() => new Set());
  const [saving, setSaving] = useState(() => new Set());
  const [serverErrors, setServerErrors] = useState({});
  const [reason, setReasonState] = useState(readReason);
  const [undoStack, setUndoStack] = useState([]);
  const [replace, setReplace] = useState(null);
  const [openHistory, setOpenHistory] = useState(() => new Set());
  const [message, setMessage] = useState('');
  const gridRef = useRef(null);
  const editingRef = useRef(null);
  const workingsRef = useRef(workings);
  const activeEntryRef = useRef('');
  const cellRefs = useRef({});
  workingsRef.current = workings;
  editingRef.current = editing;

  const setReason = (value) => { setReasonState(value); writeReason(value); };
  const accountName = (code) => accounts.find((a) => String(a.code) === String(code))?.name || '';
  const byId = useMemo(() => new Map(entries.map((e) => [e.id, e])), [entries]);
  // an entry being edited stays visible even if the filter no longer matches it
  const visible = useMemo(() => {
    const matched = new Set(filterEntries(entries, filters).map((e) => e.id));
    return sortEntries(entries.filter((e) => matched.has(e.id) || workings[e.id]), sort);
  }, [entries, filters, sort, workings]);
  const rows = useMemo(() => flatRows(visible, workings), [visible, workings]);
  const live = visible.filter((e) => !e.deleted);
  const totals = { entries: live.length, lines: live.reduce((n, e) => n + e.lines.length, 0), debit: live.reduce((n, e) => n + e.debitCents, 0), credit: live.reduce((n, e) => n + e.creditCents, 0) };
  const canEditEntry = (entry) => !readOnly && !blocked && entry && entryActions(entry, lockedThrough).edit && !saving.has(entry.id);
  const workingOf = (entry) => workings[entry.id] || toWorking(entry.source);
  const problemOf = (entry, working = workings[entry.id], why = reason) => (working ? workingProblem(working, { origin: entry.origin, accounts, reason: why, lockedThrough, originalDate: entry.source.date }) : null);
  const pendingIds = Object.keys(workings);

  // ---- saving ----
  const save = async (entryId, { why = reason } = {}) => {
    const working = workingsRef.current[entryId];
    const entry = byId.get(entryId);
    if (!working || !entry) return true;
    if (sameAsEntry(working, entry.source)) { drop(entryId); return true; }
    const check = problemOf(entry, working, why);
    if (check.problem) { setAttempted((s) => new Set(s).add(entryId)); return false; }
    setSaving((s) => new Set(s).add(entryId));
    try {
      const before = workingValues(toWorking(entry.source));
      await repository.updateEntry(entryId, workingValues(working), why.trim());
      setUndoStack((stack) => [...stack.slice(-49), { kind: 'entry', entryId, label: entry.label, before, origin: entry.origin }]);
      onNotice?.(`Kanne ${entry.label} salvestati. Enne ja pärast on kande ajaloos.`);
      await onChanged();
      drop(entryId);
      return true;
    } catch (error) {
      setServerErrors((e) => ({ ...e, [entryId]: error.message || 'Salvestamine ebaõnnestus.' }));
      setAttempted((s) => new Set(s).add(entryId));
      return false;
    } finally {
      setSaving((s) => { const next = new Set(s); next.delete(entryId); return next; });
    }
  };
  const drop = (entryId) => {
    setWorkings((w) => { const next = { ...w }; delete next[entryId]; return next; });
    setAttempted((s) => { const next = new Set(s); next.delete(entryId); return next; });
    setServerErrors((e) => { const next = { ...e }; delete next[entryId]; return next; });
  };
  const saveAll = async () => { for (const id of Object.keys(workingsRef.current)) await save(id); };

  // leaving an entry saves it (when D = K); the cursor may leave an unbalanced entry, which then turns red
  const activeEntryId = active ? rows[active.row]?.entryId || '' : '';
  useEffect(() => {
    const previous = activeEntryRef.current;
    activeEntryRef.current = activeEntryId;
    if (previous && previous !== activeEntryId && workingsRef.current[previous]) save(previous);
  }, [activeEntryId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!active) return;
    const node = cellRefs.current[`${active.row}-${active.col}`];
    node?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }, [active]);

  // ---- editing ----
  const updateWorking = (entry, fn) => {
    setWorkings((w) => {
      const next = fn(w[entry.id] || toWorking(entry.source));
      const copy = { ...w };
      if (sameAsEntry(next, entry.source)) delete copy[entry.id]; else copy[entry.id] = next;
      return copy;
    });
    setServerErrors((e) => { if (!e[entry.id]) return e; const copy = { ...e }; delete copy[entry.id]; return copy; });
  };
  // a click, Enter or F2 opens the cell with its text selected (typing replaces it, arrows keep it); typing a
  // character opens it with that character
  const startEdit = (pos, initial) => {
    const row = rows[pos.row];
    const entry = row && byId.get(row.entryId);
    if (!entry || !canEditEntry(entry) || !editableColumn(row, pos.col, entry.origin)) return false;
    const working = workingOf(entry);
    const value = initial ?? (pos.col === COL.date ? dmy(working.date) : cellValue(working, row.line, pos.col));
    setEditing({ entryId: entry.id, line: row.line, col: pos.col, value: String(value ?? ''), select: initial === undefined, key: `${entry.id}|${row.line}|${pos.col}` });
    return true;
  };
  const commit = (edit = editingRef.current) => {
    if (!edit) return;
    editingRef.current = null; // the editor's blur (focus back to the grid) must not write it twice
    const entry = byId.get(edit.entryId);
    if (entry) updateWorking(entry, (w) => setCell(w, edit.line, edit.col, edit.value, { suppliers, picked: edit.picked || null }));
    setEditing(null);
  };
  const focusGrid = () => gridRef.current?.focus({ preventScroll: true });
  const go = (pos) => { setActive(pos); setAnchor(null); };

  const insertLine = (entry, line) => {
    if (!canEditEntry(entry)) return;
    updateWorking(entry, (w) => { const lines = [...w.lines]; lines.splice(line + 1, 0, blankWorkingLine()); return { ...w, lines }; });
  };
  const removeLine = (entry, line) => {
    if (!canEditEntry(entry) || line < 0) return;
    updateWorking(entry, (w) => ({ ...w, lines: w.lines.filter((_, i) => i !== line) }));
  };

  const undo = async () => {
    const item = undoStack[undoStack.length - 1];
    if (!item) return;
    setMessage('');
    try {
      const why = `Tagasivõtmine (Ctrl+Z)${reason.trim() ? `: ${reason.trim()}` : ''}`;
      if (item.kind === 'entry') await repository.updateEntry(item.entryId, item.before, why);
      else await repository.replaceAccount({ fromAccount: item.toAccount, toAccount: item.fromAccount, targets: item.targets, reason: why });
      setUndoStack((stack) => stack.slice(0, -1));
      onNotice?.(item.kind === 'entry' ? `Kande ${item.label} muudatus võeti tagasi (ajaloos on mõlemad).` : `Konto asendus ${item.fromAccount} → ${item.toAccount} võeti tagasi ${item.targets.length} kandes.`);
      await onChanged();
    } catch (error) {
      setMessage(error.message || 'Tagasivõtmine ebaõnnestus.');
    }
  };

  // ---- keyboard on the grid (not while a cell editor is open) ----
  const onGridKeyDown = (event) => {
    if (event.target !== gridRef.current) return;
    const mod = event.ctrlKey || event.metaKey;
    if (mod && (event.key === 'z' || event.key === 'Z') && !event.shiftKey) { event.preventDefault(); undo(); return; }
    if (!rows.length) return;
    const pos = active || { row: 0, col: 0 };
    const row = rows[pos.row];
    const entry = row && byId.get(row.entryId);
    if (mod && (event.key === '+' || event.key === '=') && event.shiftKey) { event.preventDefault(); if (entry) insertLine(entry, row.line); return; }
    if (event.key === 'Insert') { event.preventDefault(); if (entry) insertLine(entry, row.line); return; }
    if (mod && (event.key === '-' || event.key === 'Delete')) { event.preventDefault(); if (entry) removeLine(entry, row.line); return; }
    if (mod) return; // copy / paste: their own events
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const next = moveCell(pos, event.key, rows.length, { shift: event.shiftKey && event.key === 'Tab' });
      if (event.shiftKey && event.key.startsWith('Arrow')) { setAnchor(anchor || pos); setActive(next); } else go(next);
      return;
    }
    if (event.key === 'Enter' || event.key === 'F2') {
      event.preventDefault();
      if (!active) { go(pos); return; }
      if (!startEdit(pos) && event.key === 'Enter') go(moveCell(pos, 'Enter', rows.length, { shift: event.shiftKey }));
      return;
    }
    if (event.key === 'Escape') {
      if (anchor) { setAnchor(null); return; }
      if (entry && workings[entry.id]) { drop(entry.id); setMessage(`Kande ${entry.label} muudatused tühistati.`); }
      return;
    }
    if ((event.key === 'Delete' || event.key === 'Backspace') && entry && row.line >= 0 && canEditEntry(entry) && editableColumn(row, pos.col, entry.origin) && pos.col !== 1 && pos.col !== 2) {
      event.preventDefault();
      updateWorking(entry, (w) => setCell(w, row.line, pos.col, ''));
      return;
    }
    if (event.key.length === 1 && !event.altKey) {
      if (startEdit(pos, event.key)) event.preventDefault();
    }
  };

  // ---- keyboard inside a cell editor ----
  const finishEdit = (key, shift, edit = editingRef.current) => {
    const pos = active;
    commit(edit);
    const row = rows[pos.row];
    const entry = byId.get(row.entryId);
    const working = workingsRef.current[entry.id] || toWorking(entry.source);
    // Tab in the last cell of an entry's last line adds a line (like the manual entry rows)
    if (key === 'Tab' && !shift && pos.col === COLUMNS.length - 1 && row.line === working.lines.length - 1) {
      insertLine(entry, row.line);
      go({ row: pos.row + 1, col: 0 });
    } else {
      go(moveCell(pos, key, rows.length, { shift }));
    }
    focusGrid();
  };
  const onEditorKeyDown = (event) => {
    event.stopPropagation();
    if (event.key === 'Escape') { event.preventDefault(); editingRef.current = null; setEditing(null); focusGrid(); return; }
    if (['Enter', 'Tab', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      finishEdit(event.key, event.shiftKey);
    }
  };
  // a supplier picked from the partner list is written at once (Enter moves down, Tab right, a click stays)
  const onPartnerPick = (supplier, key) => {
    const edit = { ...editingRef.current, value: supplier.name, picked: supplier };
    if (key) { finishEdit(key, false, edit); return; }
    commit(edit);
    focusGrid();
  };

  // ---- mouse ----
  const onCellMouseDown = (event, pos) => {
    if (event.target.closest('button, input, a')) return;
    event.preventDefault();
    if (editingRef.current) commit(editingRef.current);
    focusGrid();
    if (event.shiftKey && active) { setAnchor(anchor || active); setActive(pos); return; }
    go(pos);
    startEdit(pos);
  };

  // ---- clipboard ----
  const textOf = (row, col) => {
    const entry = byId.get(row.entryId);
    const w = workings[entry.id];
    if (w && row.line >= 0 && col === 0) { const code = w.lines[row.line]?.account || ''; return `${code} ${accountName(code)}`.trim(); }
    return cellText(entry, w, row.line, col);
  };
  const onCopy = (event) => {
    if (event.target !== gridRef.current || !active) return;
    event.preventDefault();
    event.clipboardData.setData('text/plain', rangeTsv(rows, anchor || active, active, textOf));
    setMessage(anchor ? 'Valik kopeeriti (Exceli jaoks tabeldusmärkidega).' : '');
  };
  const onPaste = (event) => {
    if (event.target !== gridRef.current || !active) return;
    const row = rows[active.row];
    const entry = byId.get(row.entryId);
    if (!canEditEntry(entry)) { setMessage('Siia ei saa kleepida: kanne on suletud perioodis, storno või kustutatud.'); return; }
    event.preventDefault();
    const text = event.clipboardData.getData('text/plain');
    updateWorking(entry, (w) => pasteIntoWorking(w, row.line, active.col, text, entry.origin, suppliers));
  };
  // focus leaving the grid (another field, another part of the page) also leaves the entry: save it after the last
  // cell edit has been written into the working copy
  const [leaving, setLeaving] = useState('');
  useEffect(() => {
    if (!leaving) return;
    setLeaving('');
    if (workingsRef.current[leaving]) save(leaving);
  }, [leaving]); // eslint-disable-line react-hooks/exhaustive-deps
  const onGridBlur = (event) => {
    if (gridRef.current?.contains(event.relatedTarget)) return;
    if (activeEntryRef.current) setLeaving(activeEntryRef.current);
  };

  // ---- „Asenda konto” ----
  const preview = useMemo(() => (replace ? replacementPreview(visible, { from: replace.from, to: replace.to, lockedThrough }, accounts) : null), [replace, visible, lockedThrough, accounts]);
  const applyReplace = async () => {
    if (!preview || preview.problem || !preview.entries.length) return;
    if (!reason.trim()) { setMessage('Lisa „Paranduse põhjus” — see läheb iga kande ajalukku.'); return; }
    if (pendingIds.length) { setMessage('Salvesta või tühista (Esc) enne pooleli olevad parandused.'); return; }
    setReplace((r) => ({ ...r, busy: true }));
    setMessage('');
    try {
      const result = await repository.replaceAccount({ fromAccount: replace.from.trim(), toAccount: replace.to.trim(), entryIds: preview.entries.map((e) => e.id), reason: reason.trim() });
      const changed = result?.changed || [];
      if (changed.length) setUndoStack((stack) => [...stack.slice(-49), { kind: 'replace', fromAccount: replace.from.trim(), toAccount: replace.to.trim(), targets: changed.map((c) => ({ entryId: c.entryId, lineIndexes: c.lineIndexes })) }]);
      onNotice?.(`Konto ${replace.from.trim()} asendati kontoga ${replace.to.trim()} ${changed.length} kandes. Iga kande ajalukku jäi muudatus ja põhjus. Ctrl+Z võtab tagasi.`);
      setReplace(null);
      await onChanged();
    } catch (error) {
      setMessage(error.message || 'Asendamine ebaõnnestus.');
      setReplace((r) => (r ? { ...r, busy: false } : r));
    }
  };

  // ---- render ----
  const sortArrow = (col) => (SORT_KEYS[COLUMNS[col]] === sort.key ? (sort.dir === 'desc' ? <ArrowDown size={11} /> : <ArrowUp size={11} />) : null);
  let rowIndex = -1;
  const cellClass = (r, c, extra = '') => {
    const classes = [extra];
    if (active && active.row === r && active.col === c) classes.push('is-active');
    else if (anchor && inRange(anchor, active, r, c)) classes.push('is-selected');
    return classes.filter(Boolean).join(' ');
  };
  const editorFor = (r, c, label, extra = {}) => (editing && active && active.row === r && active.col === c
    ? c === COL.partner
      ? <PartnerInput suppliers={suppliers} label={`${label} (muuda)`} value={editing.value}
        onChange={(value) => setEditing({ ...editing, value, picked: null, select: false })} onPick={onPartnerPick} onKeyDown={onEditorKeyDown}
        inputProps={{ autoFocus: true, className: 'accounting-cell__editor', 'data-grid-editor': '1',
          onFocus: (event) => { if (editing.select) event.target.select(); },
          onBlur: () => { if (editingRef.current?.key === editing.key) commit(editingRef.current); } }} />
      : <input autoFocus className="accounting-cell__editor" aria-label={`${label} (muuda)`} value={editing.value} data-grid-editor="1" {...extra}
      onFocus={(event) => { if (editing.select) event.target.select(); else { const end = event.target.value.length; event.target.setSelectionRange?.(end, end); } }}
      onChange={(event) => setEditing({ ...editing, value: event.target.value, select: false })} onKeyDown={onEditorKeyDown}
      onBlur={() => { if (editingRef.current?.key === editing.key) commit(editingRef.current); }} />
    : null);
  const td = (r, c, content, { className = '', editable = false, title, colSpan, bad = false } = {}) => <td key={c} colSpan={colSpan} title={title}
    ref={(node) => { cellRefs.current[`${r}-${c}`] = node; }} data-cell={`${r}-${c}`} aria-selected={active?.row === r && active?.col === c}
    className={cellClass(r, c, `${className}${editable ? ' is-editable' : ''}${bad ? ' is-bad' : ''}`)} onMouseDown={(event) => onCellMouseDown(event, { row: r, col: c })}>
    {editorFor(r, c, COLUMN_LABELS[c], c === COL.account ? { list: 'journal-account-list' } : c >= COL.debit ? { inputMode: 'decimal' } : {}) ?? content}
  </td>;

  const modKey = isMac() ? 'Cmd' : 'Ctrl';
  const last = undoStack[undoStack.length - 1];

  return <div className="accounting-journal-grid">
    <datalist id="journal-account-list">{accounts.filter((a) => a.active !== false).map((a) => <option key={a.code} value={a.code}>{a.name}</option>)}</datalist>
    <div className="accounting-grid-tools">
      <div className="accounting-grid-tools__filters" role="search">
        <input aria-label="Filter: konto" placeholder="Konto" value={filters.account} onChange={(event) => setFilters({ ...filters, account: event.target.value })} />
        <input aria-label="Filter: tekst" placeholder="Tekst (sisu, kanne)" value={filters.text} onChange={(event) => setFilters({ ...filters, text: event.target.value })} />
        <input aria-label="Filter: dokument" placeholder="Dokument" value={filters.doc} onChange={(event) => setFilters({ ...filters, doc: event.target.value })} />
        <input aria-label="Filter: partner" placeholder="Partner" value={filters.partner} onChange={(event) => setFilters({ ...filters, partner: event.target.value })} />
        <input aria-label="Filter: summa" placeholder="Summa" inputMode="decimal" value={filters.sum} onChange={(event) => setFilters({ ...filters, sum: event.target.value })} />
        {Object.values(filters).some(Boolean) ? <button type="button" className="link-button" onClick={() => setFilters(NO_FILTERS)}>Tühjenda</button> : null}
      </div>
      {!readOnly ? <div className="accounting-grid-tools__edit">
        <label className="accounting-grid-tools__reason"><span>Paranduse põhjus</span><input aria-label="Paranduse põhjus" placeholder="soovi korral; läheb kande ajalukku" value={reason} onChange={(event) => setReason(event.target.value)} /></label>
        {pendingIds.length ? <Button variant="secondary" onClick={saveAll}>Salvesta muudatused ({pendingIds.length})</Button> : null}
        <Button variant="secondary" disabled={!last} title={`${modKey}+Z`} onClick={undo}><Undo2 size={15} /> Võta tagasi{last ? ` (${last.kind === 'entry' ? last.label : `${last.fromAccount} → ${last.toAccount}`})` : ''}</Button>
        <Button variant="secondary" aria-pressed={Boolean(replace)} onClick={() => setReplace(replace ? null : { from: filters.account.trim(), to: '' })}><Replace size={15} /> Asenda konto</Button>
      </div> : <p className="accounting-grid-tools__readonly">Ainult vaatamiseks{lockedThrough ? ` · periood suletud kuni ${dmy(lockedThrough)}` : ''}. Lahtreid saab valida ja kopeerida ({modKey}+C).</p>}
    </div>
    {replace ? <div className="accounting-replace" role="region" aria-label="Asenda konto">
      <input aria-label="Asendatav konto" list="journal-account-list" placeholder="konto, nt 3060" value={replace.from} onChange={(event) => setReplace({ ...replace, from: event.target.value.trim() })} />
      <span>→</span>
      <input aria-label="Uus konto" list="journal-account-list" placeholder="uus konto, nt 3000" value={replace.to} onChange={(event) => setReplace({ ...replace, to: event.target.value.trim() })} />
      <span className={preview?.problem ? 'is-off' : 'is-ok'} role="status">{preview?.problem || `Eelvaade: ${preview.entries.length} ${preview.entries.length === 1 ? 'kanne' : 'kannet'}, ${preview.lineCount} rida · D ${amount(preview.debitCents)} · K ${amount(preview.creditCents)} (filtri ja perioodi piires)`}{preview?.skipped.length ? ` · vahele jäetakse ${preview.skipped.length} (${[...new Set(preview.skipped.map((s) => s.why))].join(', ')})` : ''}</span>
      <Button disabled={Boolean(preview?.problem) || replace.busy || !reason.trim()} loading={replace.busy} title={!reason.trim() ? 'Lisa enne „Paranduse põhjus”' : ''} onClick={applyReplace}>Asenda {preview && !preview.problem ? `${preview.entries.length} kandes` : ''}</Button>
      <button type="button" className="link-button" onClick={() => setReplace(null)}>Loobu</button>
    </div> : null}
    {message ? <p className="accounting-grid-tools__message" role="alert">{message}<button type="button" aria-label="Sulge teade" onClick={() => setMessage('')}>×</button></p> : null}
    <div className="accounting-grid-wrap" ref={gridRef} tabIndex={0} role="grid" aria-label="Päevaraamat" aria-readonly={readOnly}
      onKeyDown={onGridKeyDown} onCopy={onCopy} onPaste={onPaste} onBlur={onGridBlur}>
      <table className={`accounting-grid accounting-journal${readOnly ? '' : ' is-sheet'}`}>
        <colgroup><col className="c-account" /><col className="c-date" /><col className="c-doc" /><col /><col className="c-partner" /><col className="c-num" /><col className="c-num" /></colgroup>
        <thead>
          <tr><th>Kanne</th><th>Kuupäev</th><th>Dokument</th><th /><th /><th /><th /></tr>
          <tr>{COLUMN_LABELS.map((label, c) => <th key={label} className={c >= COL.debit ? 'num' : ''} aria-sort={SORT_KEYS[COLUMNS[c]] === sort.key ? (sort.dir === 'desc' ? 'descending' : 'ascending') : 'none'}>
            <button type="button" className="accounting-sort" title="Sorteeri" onClick={() => onSort(SORT_KEYS[COLUMNS[c]])}>{label} {sortArrow(c)}</button></th>)}</tr>
        </thead>
        {draftSlot}
        {visible.map((entry) => {
          const can = entryActions(entry, lockedThrough);
          const editable = canEditEntry(entry);
          const working = workings[entry.id];
          const check = problemOf(entry);
          const red = Boolean(working && check?.problem && attempted.has(entry.id)) || Boolean(serverErrors[entry.id]);
          const historyOpen = openHistory.has(entry.id);
          rowIndex += 1;
          const head = rowIndex;
          const w = working || null;
          const lineCount = w ? w.lines.length : entry.lines.length;
          const lineRows = [];
          for (let i = 0; i < lineCount; i += 1) {
            rowIndex += 1;
            const r = rowIndex;
            const l = w ? w.lines[i] : entry.lines[i];
            const known = !w || !l.account || accounts.some((a) => String(a.code) === String(l.account) && a.active !== false);
            const badD = w && Number.isNaN(parseEuro(l.debit));
            const badK = w && Number.isNaN(parseEuro(l.credit));
            const unresolved = Boolean(l.partner && !l.partner.type && l.partner.name);
            lineRows.push(<tr key={i} className={active?.row === r ? 'is-active-row' : ''}>
              {td(r, 0, <span className="accounting-cell__account">
                {editable ? <span className="accounting-cell__rowtools">
                  <button type="button" aria-label={`Lisa rida pärast rida ${i + 1} (${entry.label})`} title={`Lisa rida (Insert või ${modKey}+Shift++)`} onClick={() => insertLine(entry, i)}>+</button>
                  <button type="button" aria-label={`Kustuta rida ${i + 1} (${entry.label})`} title={`Kustuta rida (${modKey}+−)`} onClick={() => removeLine(entry, i)}>×</button>
                </span> : null}
                {textOf({ entryId: entry.id, line: i }, 0)}{w && l.account && !known ? <small> konto puudub</small> : null}
              </span>, { editable, bad: !known })}
              {td(r, COL.date, dmy(w ? w.date : entry.date), { editable: editable && entry.origin !== 'opening' })}
              {td(r, COL.doc, w ? w.documentRef : entry.documentRef, { editable: editable && entry.origin !== 'opening' })}
              {td(r, COL.text, cellText(entry, w, i, COL.text), { editable })}
              {td(r, COL.partner, <>{cellText(entry, w, i, COL.partner)}{unresolved ? <small> pole tarnijate seas</small> : null}</>, { className: 'accounting-cell__partner', editable, bad: unresolved, title: l.partner?.type === 'customer' ? 'Klient (õpilase / maksja kaart)' : l.partner?.type === 'supplier' ? 'Tarnija' : undefined })}
              {td(r, COL.debit, cellText(entry, w, i, COL.debit), { className: 'num', editable, bad: badD })}
              {td(r, COL.credit, cellText(entry, w, i, COL.credit), { className: 'num', editable, bad: badK })}
            </tr>);
          }
          const sumD = w ? check.debit : entry.debitCents;
          const sumK = w ? check.credit : entry.creditCents;
          return <tbody key={entry.id} className={[entry.reversed || entry.deleted ? 'is-reversed' : '', w ? 'is-dirty' : '', red ? 'is-invalid' : ''].filter(Boolean).join(' ')}>
            <tr className={`accounting-grid__entry${active?.row === head ? ' is-active-row' : ''}`}>
              {td(head, 0, entry.label, { title: `CRM kanne ${entry.number}` })}
              {td(head, COL.date, dmy(w ? w.date : entry.date), { editable: editable && entry.origin !== 'opening' })}
              {td(head, COL.doc, w ? w.documentRef : entry.documentRef, { editable: editable && entry.origin !== 'opening' })}
              {td(head, COL.text, <>{entry.deleted ? <span className="accounting-tag">kustutatud</span> : null}{entry.corrected ? <span className="accounting-tag">parandatud</span> : null}<span className="accounting-cell__description">{w ? w.description : entry.description}</span></>, { editable })}
              <td colSpan="3" className={`${cellClass(head, COL.partner, 'accounting-grid__actions')}${active?.row === head && active?.col > COL.partner ? ' is-active' : ''}`} data-cell={`${head}-${COL.partner}`} ref={(node) => { [COL.partner, COL.debit, COL.credit].forEach((c) => { cellRefs.current[`${head}-${c}`] = node; }); }} onMouseDown={(event) => onCellMouseDown(event, { row: head, col: COL.partner })}>
                {entry.reversedByNumber ? <span>tühistatud: {entry.reversedByNumber}</span> : null}
                {can.locked && !entry.deleted ? <span title={`Periood suletud kuni ${dmy(lockedThrough)} — paranda uue kandega (storno või parandav kanne)`}><Lock size={12} /></span> : null}
                {saving.has(entry.id) ? <span>salvestan…</span> : null}
                {!readOnly && can.remove && !w ? <button type="button" className="link-button" onClick={() => onDelete(entry)}><Trash2 size={13} /> Kustuta</button> : null}
                {!readOnly && can.restore && onRestore ? <button type="button" className="link-button" onClick={() => onRestore(entry)}><Undo2 size={13} /> Taasta</button> : null}
                {!readOnly && can.storno ? <button type="button" className="link-button" onClick={() => onStorno(entry)}><Undo2 size={13} /> Storno</button> : null}
                {!readOnly && can.undoStorno && onUndoStorno ? <button type="button" className="link-button" onClick={() => onUndoStorno(entry)}><Undo2 size={13} /> Tühista ekslik storno</button> : null}
                {entry.history.length ? <button type="button" className="link-button" aria-expanded={historyOpen} onClick={() => setOpenHistory((s) => { const next = new Set(s); if (next.has(entry.id)) next.delete(entry.id); else next.add(entry.id); return next; })}><History size={13} /> Ajalugu ({entry.history.length})</button> : null}
              </td>
            </tr>
            {lineRows}
            <tr className="accounting-grid__subtotal"><td colSpan="5">{w ? <span className={red ? 'is-off' : 'accounting-grid__pending'} role={red ? 'alert' : undefined}>
              {serverErrors[entry.id] || check.problem || 'Muudetud — salvestub, kui liigud teise kandesse.'}{check.difference ? ` (D − K = ${amount(check.difference)})` : ''}
              {entry.origin !== 'manual' ? <>{' '}<input className="accounting-grid__reason" aria-label="Paranduse põhjus (see kanne)" placeholder="põhjus (soovi korral)" value={reason} onChange={(event) => setReason(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') save(entry.id); }} /></> : null}
              {' '}<button type="button" className="link-button" onClick={(event) => { const box = event.currentTarget.parentElement.querySelector('input'); save(entry.id).then((saved) => { if (saved === false) box?.focus(); }); }}>Salvesta</button>
              <button type="button" className="link-button" onClick={() => drop(entry.id)}>Tühista (Esc)</button>
            </span> : null}</td><td className="num">{amount(sumD)}</td><td className="num">{amount(sumK)}</td></tr>
            {historyOpen ? entry.history.map((h, i) => <tr key={`h${i}`} className="accounting-grid__history"><td colSpan="7">
              <strong>{HISTORY_ACTIONS[h.action] || h.action}</strong> {h.at ? new Date(h.at).toLocaleString('et-EE') : ''} · {h.by?.name || h.by?.email || '—'}{h.reason ? ` · „${h.reason}”` : ''}
              {h.before ? <div>enne: {dmy(h.before.date)} {h.before.documentRef} · {h.before.description} · {linesText(h.before.lines)}</div> : null}
              {h.after ? <div>pärast: {dmy(h.after.date)} {h.after.documentRef} · {h.after.description} · {linesText(h.after.lines)}</div> : null}
            </td></tr>) : null}
          </tbody>;
        })}
        <tfoot>
          <tr><td colSpan="5">Kokku {totals.entries} {totals.entries === 1 ? 'kanne' : 'kannet'}</td><td className="num">{amount(totals.debit)}</td><td className="num">{amount(totals.credit)}</td></tr>
          <tr><td colSpan="7">{totals.lines} {totals.lines === 1 ? 'kirje' : 'kirjet'}</td></tr>
        </tfoot>
      </table>
    </div>
    {!readOnly ? <p className="accounting-grid-tools__keys">Klõps või Enter / F2 / kirjutamine muudab lahtrit · nooled, Tab, Shift+Tab, Enter liiguvad · Esc tühistab · Insert või {modKey}+Shift++ lisab rea, {modKey}+− kustutab rea · Shift+klõps valib, {modKey}+C kopeerib Excelisse, {modKey}+V kleebib Excelist · {modKey}+Z võtab viimase salvestatud muudatuse tagasi</p> : null}
  </div>;
}
