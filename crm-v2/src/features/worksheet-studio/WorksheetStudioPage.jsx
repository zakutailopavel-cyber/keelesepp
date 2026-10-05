/* global ResizeObserver, Blob, setTimeout, clearTimeout, structuredClone */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useAuth } from '../../app/AuthContext.jsx';
import { worksheetDocsService } from '../../services/firebase/index.js';
import Sheet from './engine/Sheet.jsx';
import { AssetContext } from './engine/assets.jsx';
import { BLOCKS, GROUPS, checkDocument, createBlock } from './engine/registry.js';
import { dropRun, moveRun } from './engine/look.js';
import { ASPECTS, newDocument, newId } from './engine/schema.js';
import { cropToFile, nearestAspect } from './engine/image.js';
import { originalFiles } from './conversion.js';
import OriginalPanel from './OriginalPanel.jsx';
import { sampleDocument } from './engine/sample.js';
import { BlockInspector, SheetInspector } from './editor/Inspector.jsx';
import { withHeight, withSpan } from './engine/layout.js';
import GoalEvidence from './GoalEvidence.jsx';
import { applyPrintA4 } from './printPage.js';
import './engine/sheet.css';
import './worksheetStudio.css';
import { addItem } from './engine/addItem.js';
import { emptyHistory, isTextTarget, parseWorksheetFile, pushHistory, redoHistory, undoHistory, useUnsavedGuard } from './editorHistory.js';
import { analyzeWorksheet } from './quality.js';
import { formalLetterDocument } from './engine/templates.js';

const DEFAULT_TITLE = newDocument().meta.title;


const MM = 3.7795;
const draftKey = (id) => `ks-worksheet-author-draft:${id || 'new'}`;
const readDraft = (key) => { try { return JSON.parse(window.localStorage.getItem(key) || 'null'); } catch { return null; } };

// Worksheet Studio: teachers assemble branded, interactive worksheets from blocks.
// Route: /library/worksheets/new  or  /library/worksheets/:lessonId (curriculumLessons document).
export default function WorksheetStudioPage({ repository = worksheetDocsService, backTo = '/library', allowCopy = true, draftId = '', renderTop = null }) {
  const { lessonId } = useParams();
  const isNew = !lessonId || lessonId === 'new';
  const draftName = isNew ? 'new' : draftId || lessonId;
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doc, setDoc] = useState(null);
  const [source, setSource] = useState('');
  const [loadError, setLoadError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [generation, setGeneration] = useState(null);
  const [notice, setNotice] = useState('');
  const [saveError, setSaveError] = useState('');
  const [mode, setMode] = useState('edit');
  const [selectedId, setSelectedId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [evidence, setEvidence] = useState(null);
  const [scale, setScale] = useState(1);
  const [original, setOriginal] = useState([]);
  const [leftTab, setLeftTab] = useState('blocks');
  const [cut, setCut] = useState({ busy: false, error: '' });
  const [history, setHistory] = useState(emptyHistory);
  const [baseUpdatedAt, setBaseUpdatedAt] = useState('');
  const [worksheetStatus, setWorksheetStatus] = useState('draft');
  const [version, setVersion] = useState(0);
  const [versions, setVersions] = useState([]);
  const [paletteQuery, setPaletteQuery] = useState('');
  const [draftRestored, setDraftRestored] = useState(false);
  const lastPush = useRef(0);
  const canvasRef = useRef(null);
  const fileRef = useRef(null);
  const menuRef = useRef(null);
  useUnsavedGuard(dirty);

  useEffect(() => {
    let alive = true;
    if (isNew) {
      const fresh = newDocument();
      const local = readDraft(draftKey('new'));
      const restored = local?.document?.schema === fresh.schema;
      setDoc(restored ? local.document : fresh);
      setDraftRestored(restored);
      setDirty(restored);
      setSource('new');
      setGeneration(null);
      return undefined;
    }
    repository.load(lessonId)
      .then((res) => {
        if (!alive) return;
        if (res.source === 'new' && res.lesson?.roadmapManaged === true) {
          navigate(`/library/lessons/${encodeURIComponent(lessonId)}/worksheets/discover`, { replace: true });
          return;
        }
        const files = originalFiles(res.lesson);
        const local = readDraft(draftKey(draftName));
        const restored = local?.document?.schema === res.document.schema && Number(local.savedAt || 0) > (Date.parse(res.baseUpdatedAt || 0) || 0);
        setDoc(restored ? local.document : res.document);
        setDraftRestored(restored);
        setDirty(restored);
        setSource(res.source);
        setGeneration(res.generation || null);
        setBaseUpdatedAt(res.baseUpdatedAt || '');
        setWorksheetStatus(res.status || 'draft');
        setVersion(Number(res.version) || 0);
        setOriginal(files);
        if (files.length && res.source !== 'worksheetDoc') setLeftTab('original');
      })
      .catch((error) => { if (alive) setLoadError(error.message || 'Töölehte ei saanud avada.'); });
    return () => { alive = false; };
  }, [isNew, lessonId, draftName, navigate, repository]);

  useEffect(() => {
    if (!doc || !dirty) return undefined;
    const timer = setTimeout(() => {
      try { window.localStorage.setItem(draftKey(draftName), JSON.stringify({ savedAt: Date.now(), document: doc })); } catch { /* storage may be disabled */ }
    }, 700);
    return () => clearTimeout(timer);
  }, [doc, dirty, draftName]);

  // print styles hide the CRM shell only while the studio is open
  useEffect(() => {
    return applyPrintA4();
  }, []);

  // Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z or Ctrl+Y redo, Delete removes the selected block (outside text fields).
  const keysRef = useRef(null);
  useEffect(() => {
    const onKey = (event) => keysRef.current?.(event);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const fit = () => setScale(Math.max(0.3, Math.min(1, (el.clientWidth - 32) / (270 * MM))));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [doc === null]); // eslint-disable-line react-hooks/exhaustive-deps

  const assets = useMemo(() => ({
    image: (file) => repository.uploadImage(file),
    audio: (file) => repository.uploadAudio(file),
  }), [repository]);

  const palette = useMemo(() => GROUPS.map((g) => [g, Object.values(BLOCKS).filter((b) => b.group === g)]), []);
  const filteredPalette = useMemo(() => palette.map(([group, defs]) => [group, defs.filter((def) => !paletteQuery.trim() || `${def.label} ${def.group}`.toLocaleLowerCase('et').includes(paletteQuery.trim().toLocaleLowerCase('et')))]).filter(([, defs]) => defs.length), [palette, paletteQuery]);
  const quality = useMemo(() => analyzeWorksheet(doc || newDocument()), [doc]);

  if (loadError) return <div className="page-content"><div className="ws-studio-error" role="alert">{loadError} <Link to="/library">Tagasi Õppevarasse</Link></div></div>;
  if (!doc) return <div className="page-content"><p className="ws-studio-loading">Laen töölehte…</p></div>;

  // Every change is undoable; quick successive edits (typing in the inspector) form one undo step.
  const change = (next) => {
    const now = Date.now();
    if (now - lastPush.current > 800) setHistory((h) => pushHistory(h, doc));
    lastPush.current = now;
    setDoc(next); setDirty(true); setNotice('');
  };
  const undo = () => {
    const step = undoHistory(history, doc);
    if (!step) return;
    lastPush.current = 0;
    setDoc(step.doc); setHistory(step.history); setDirty(true); setNotice('');
    if (!step.doc.blocks.some((b) => b.id === selectedId)) setSelectedId(null);
  };
  const redo = () => {
    const step = redoHistory(history, doc);
    if (!step) return;
    lastPush.current = 0;
    setDoc(step.doc); setHistory(step.history); setDirty(true); setNotice('');
    if (!step.doc.blocks.some((b) => b.id === selectedId)) setSelectedId(null);
  };
  const closeMenu = () => { if (menuRef.current) menuRef.current.open = false; };
  const setBlocks = (blocks) => change({ ...doc, blocks });
  const selected = doc.blocks.find((b) => b.id === selectedId);
  const updateBlock = (nb) => setBlocks(doc.blocks.map((b) => (b.id === nb.id ? nb : b)));
  const canRegenerateSelected = Boolean(
    selected &&
    generation &&
    typeof repository.regenerateBlock === 'function' &&
    BLOCKS[selected.type]?.task &&
    /^gen_(discover|practice|transfer)_\d+$/.test(String(selected.id || '')),
  );
  const regenerateSelected = async () => {
    if (!canRegenerateSelected || regenerating) return;
    setRegenerating(true);
    setSaveError('');
    try {
      const result = await repository.regenerateBlock({
        document: doc,
        blockId: selected.id,
        generation,
      });
      if (!result?.block) throw new Error('Uut ülesandevarianti ei saanud luua.');
      updateBlock(result.block);
      setNotice(result.mode === 'activity'
        ? 'Ülesanne asendati sama fookuse ja raskusega teise ülesandetüübiga.'
        : 'Ülesande sisu genereeriti uuesti sama fookuse ja raskusega.');
    } catch (error) {
      setSaveError(error.message || 'Ülesande uuesti genereerimine ebaõnnestus.');
    } finally {
      setRegenerating(false);
    }
  };
  const resizeBlock = (id, patch) => {
    const block = doc.blocks.find((b) => b.id === id);
    if (!block) return;
    updateBlock('span' in patch ? withSpan(block, patch.span) : withHeight(block, patch.minHeightMm));
  };
  const addItemTo = (id) => {
    const block = doc.blocks.find((b) => b.id === id);
    if (block) updateBlock(addItem(block));
  };
  const addBlock = (type) => {
    const b = createBlock(type);
    const at = selectedId ? doc.blocks.findIndex((x) => x.id === selectedId) + 1 : doc.blocks.length;
    const next = [...doc.blocks];
    next.splice(at, 0, b);
    setBlocks(next);
    setSelectedId(b.id);
  };
  // joined blocks (look.js) move as one group
  const moveBlock = (id, dir) => setBlocks(moveRun(doc.blocks, id, dir));
  const dropMove = (fromId, toId) => setBlocks(dropRun(doc.blocks, fromId, toId));
  const cutPhoto = async (url, rect) => {
    setCut({ busy: true, error: '' });
    try {
      const { file, ratio } = await cropToFile(url, rect, 'originaalist');
      const img = await repository.uploadImage(file);
      const aspect = nearestAspect(ratio, ASPECTS);
      if (selected && 'img' in (selected.data || {})) {
        updateBlock({ ...selected, data: { ...selected.data, img, aspect } });
      } else {
        const b = createBlock('image');
        b.data = { ...b.data, img, aspect };
        const at = selectedId ? doc.blocks.findIndex((x) => x.id === selectedId) + 1 : doc.blocks.length;
        const next = [...doc.blocks];
        next.splice(at, 0, b);
        setBlocks(next);
        setSelectedId(b.id);
      }
      setCut({ busy: false, error: '' });
    } catch (error) {
      setCut({ busy: false, error: error.message || 'Väljalõige ebaõnnestus.' });
    }
  };
  const setAnswer = (k, v) => {
    setAnswers((a) => ({ ...a, [k]: v }));
    setResults((r) => { if (!r[k]) return r; const n = { ...r }; delete n[k]; return n; });
  };
  const deleteBlock = (id) => {
    const block = doc.blocks.find((b) => b.id === id);
    if (!block) return;
    lastPush.current = 0;
    setBlocks(doc.blocks.filter((b) => b.id !== id));
    setSelectedId(null);
    setNotice(`Plokk „${BLOCKS[block.type]?.label || 'plokk'}” kustutati. Tagasi saad selle nupuga „Võta tagasi” või Ctrl+Z.`);
  };
  keysRef.current = (event) => {
    if (mode !== 'edit' || isTextTarget(event.target)) return;
    const key = String(event.key || '').toLowerCase();
    if ((event.ctrlKey || event.metaKey) && key === 'z') { event.preventDefault(); if (event.shiftKey) redo(); else undo(); return; }
    if ((event.ctrlKey || event.metaKey) && key === 'y') { event.preventDefault(); redo(); return; }
    if ((key === 'delete' || key === 'backspace') && selectedId) { event.preventDefault(); deleteBlock(selectedId); }
  };
  const switchMode = (m) => { setMode(m); setEvidence(null); setResults({}); if (m !== 'edit') setSelectedId(null); };

  const check = () => {
    const res = checkDocument(doc, answers);
    setResults(res.results);
    setEvidence(res);
  };

  const save = async (nextStatus = 'draft') => {
    if (isNew && doc.meta.title.trim() === DEFAULT_TITLE) {
      setSelectedId(null);
      setSaveError('Anna töölehele pealkiri (paremal „Töölehe andmed” → Pealkiri), siis salvesta.');
      return;
    }
    if (nextStatus === 'published' && !quality.ready) {
      setSaveError('Avaldamiseks paranda kvaliteedikontrolli punased vead.');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const res = await repository.save({ lessonId: isNew ? '' : lessonId, document: doc, user, baseUpdatedAt, status: nextStatus });
      setDirty(false);
      setSource('worksheetDoc');
      setBaseUpdatedAt(res.updatedAt || '');
      setVersion(Number(res.version) || version);
      setWorksheetStatus(res.status || nextStatus);
      setDraftRestored(false);
      try { window.localStorage.removeItem(draftKey(draftName)); } catch { /* ignore */ }
      setNotice(nextStatus === 'published' ? `„${res.title}” avaldati (versioon ${res.version}).` : `„${res.title}” salvestati mustandina (versioon ${res.version}).`);
      if (res.created) navigate(`/library/worksheets/${res.id}`, { replace: true });
    } catch (error) {
      setSaveError(error.message || 'Salvestamine ebaõnnestus.');
    } finally {
      setSaving(false);
    }
  };

  const saveCopy = async () => {
    closeMenu(); setSaving(true); setSaveError('');
    try {
      const copy = { ...structuredClone(doc), id: newId(), meta: { ...doc.meta, title: `${doc.meta.title} – koopia` } };
      const res = await repository.save({ lessonId: '', document: copy, user, status: 'draft' });
      navigate(`/library/worksheets/${res.id}`);
    } catch (error) { setSaveError(error.message || 'Koopia loomine ebaõnnestus.'); }
    finally { setSaving(false); }
  };
  const loadVersions = async () => {
    closeMenu();
    if (isNew || typeof repository.listVersions !== 'function') return;
    try { setVersions(await repository.listVersions(lessonId)); } catch (error) { setSaveError(error.message || 'Versioone ei saanud laadida.'); }
  };

  const exportJson = () => {
    closeMenu();
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(doc.meta.title || 'tooleht').replace(/[\\/:*?"<>|]+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const importJson = async (file) => {
    closeMenu();
    const parsed = parseWorksheetFile(await file.text());
    if (!parsed) { setSaveError('See fail ei ole KeeleSepa tööleht (JSON). Tööleht jäi muutmata.'); return; }
    if (doc.blocks.length && !window.confirm(`Fail „${parsed.meta?.title || 'tööleht'}” asendab praeguse sisu. Jätkata?`)) return;
    setSaveError('');
    change({ ...parsed, id: doc.id }); setSelectedId(null);
  };
  const loadSample = () => {
    closeMenu();
    if (doc.blocks.length && !window.confirm('Näidisleht asendab praeguse lehe sisu. Jätkata? (Saad tagasi ka „Võta tagasi” nupuga.)')) return;
    lastPush.current = 0;
    change({ ...sampleDocument(), id: doc.id }); setSelectedId(null);
  };
  const loadFormalLetter = () => {
    closeMenu();
    if (doc.blocks.length && !window.confirm('Mall „Kiri linnavalitsusele” asendab praeguse sisu. Jätkata?')) return;
    lastPush.current = 0;
    change({ ...formalLetterDocument(), id: doc.id }); setSelectedId(null);
  };

  return (
    <AssetContext.Provider value={assets}>
      <div className={`ws-studio mode-${mode}`}>
        <header className="st-bar">
          <Link className="st-back" to={backTo}><Icons.ArrowLeft size={16} /> {backTo.startsWith('/library/lessons/') ? 'Tunni töölehed' : 'Õppevara'}</Link>
          <div className="st-title"><b>Töölehe konstruktor</b><span>{doc.meta.title}{dirty ? ' · salvestamata' : ''}</span></div>
          <div className="st-seg" role="tablist" aria-label="Vaade">
            {[['edit', 'Koosta'], ['interactive', 'Õpilase vaade'], ['print', 'Trükivaade']].map(([m, l]) => (
              <button type="button" role="tab" key={m} aria-pressed={mode === m} onClick={() => switchMode(m)}>{l}</button>
            ))}
          </div>
          <div className="st-actions">
            {mode === 'interactive' && <button type="button" className="st-btn primary" onClick={check}>Kontrolli vastuseid</button>}
            {mode === 'interactive' && <button type="button" className="st-btn" onClick={() => { setAnswers({}); setResults({}); setEvidence(null); }}>Tühjenda</button>}
            {mode === 'edit' && <button type="button" className="st-btn" disabled={!history.past.length} onClick={undo} title="Võta tagasi (Ctrl+Z)" aria-label="Võta tagasi"><Icons.Undo2 size={16} /></button>}
            {mode === 'edit' && <button type="button" className="st-btn" disabled={!history.future.length} onClick={redo} title="Tee uuesti (Ctrl+Shift+Z)" aria-label="Tee uuesti"><Icons.Redo2 size={16} /></button>}
            <button type="button" className="st-btn" onClick={() => { switchMode('print'); setTimeout(() => window.print(), 300); }}>PDF / Prindi</button>
            <details className="st-more" ref={menuRef}>
              <summary className="st-btn">Fail ▾</summary>
              <div className="st-menu">
                <button type="button" onClick={loadSample}>Laadi näidisleht „Minu päev”</button>
                <button type="button" onClick={loadFormalLetter}>Mall „Kiri linnavalitsusele”</button>
                {allowCopy ? <button type="button" onClick={saveCopy}>Tee töölehest koopia</button> : null}
                {!isNew && <button type="button" onClick={loadVersions}>Versioonid ja taastamine…</button>}
                <button type="button" onClick={exportJson}>Salvesta faili (JSON)</button>
                <button type="button" onClick={() => { closeMenu(); fileRef.current?.click(); }}>Ava failist…</button>
              </div>
            </details>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => { if (e.target.files?.[0]) importJson(e.target.files[0]); e.target.value = ''; }} />
            <button type="button" className="st-btn" disabled={saving || (!dirty && !isNew)} onClick={() => save('draft')}>{saving ? 'Salvestan…' : 'Salvesta'}</button>
            <button type="button" className="st-btn primary" disabled={saving || !quality.ready || (!dirty && worksheetStatus === 'published')} onClick={() => save('published')}>Avalda</button>
          </div>
        </header>
        {renderTop ? renderTop({ dirty }) : null}
        {source === 'converted' && <div className="st-banner">See tööleht teisendati vanast vormingust uude kujundusse. Kontrolli ülesandeid ja salvesta. Vana versioon jääb alles.</div>}
        {saveError && <div className="st-banner error" role="alert">{saveError}</div>}
        {notice && <div className="st-banner ok" role="status">{notice}</div>}
        {draftRestored && <div className="st-banner st-draft-note" role="status"><span>Taastasin selles brauseris automaatselt salvestatud mustandi.</span><button type="button" className="st-btn" onClick={() => { try { window.localStorage.removeItem(draftKey(draftName)); } catch { /* ignore */ } window.location.reload(); }}>Loobu mustandist</button></div>}
        <details className={`st-quality ${quality.ready ? 'ready' : ''}`}>
          <summary>{quality.ready ? `✓ Avaldamiseks valmis · versioon ${version || 'uus'} · ${worksheetStatus === 'published' ? 'avaldatud' : 'mustand'}` : `Kvaliteedikontroll: ${quality.errors.length} viga, ${quality.warnings.length} hoiatust`}</summary>
          {quality.issues.length ? <ul>{quality.issues.map((issue) => <li className={issue.level} key={issue.code}>{issue.text}</li>)}</ul> : <p>Kõik kohustuslikud kontrollid on läbitud.</p>}
        </details>
        {versions.length > 0 && <div className="st-banner"><strong>Versioonid:</strong> {versions.slice(0, 12).map((entry) => <button type="button" className="st-btn" key={entry.id} onClick={() => { if (window.confirm(`Taasta versioon ${entry.version} uue mustandina?`)) { change({ ...structuredClone(entry.worksheetDoc), id: doc.id }); setVersions([]); setNotice(`Versioon ${entry.version} laaditi redigeerimiseks. Salvesta see uue versioonina.`); } }}>v{entry.version} · {entry.status === 'published' ? 'avaldatud' : 'mustand'}</button>)}</div>}

        <div className="st-body">
          {mode === 'edit' && (
            <aside className={`st-palette ${leftTab === 'original' ? 'is-original' : ''}`} aria-label="Plokid">
              {original.length > 0 && (
                <div className="st-lefttabs" role="tablist">
                  <button type="button" role="tab" aria-pressed={leftTab === 'blocks'} onClick={() => setLeftTab('blocks')}>Plokid</button>
                  <button type="button" role="tab" aria-pressed={leftTab === 'original'} onClick={() => setLeftTab('original')}>Originaal</button>
                </div>
              )}
              {leftTab === 'original' && original.length > 0 ? <OriginalPanel files={original} onCut={cutPhoto} busy={cut.busy} error={cut.error} /> : <><div className="st-palette-search"><input className="ed-input" type="search" value={paletteQuery} onChange={(e) => setPaletteQuery(e.target.value)} placeholder="Otsi plokki…" aria-label="Otsi plokki" /></div>{filteredPalette.map(([g, defs]) => (
                <div key={g} className="st-group">
                  <div className="st-group-title">{g}</div>
                  {defs.map((d) => {
                    const Ico = Icons[d.icon] || Icons.Square;
                    return (
                      <button type="button" key={d.type} className="st-block" onClick={() => addBlock(d.type)} title="Lisa lehele">
                        <Ico size={16} aria-hidden="true" /><span>{d.label}</span>{d.task && <em>ülesanne</em>}
                      </button>
                    );
                  })}
                </div>
              ))}</>}
            </aside>
          )}

          <main className="st-canvas" ref={canvasRef}>
            <div className="st-zoom" style={{ zoom: scale }}>
              <Sheet doc={doc} mode={mode} answers={answers} setAnswer={setAnswer} results={results} selectedId={selectedId} onSelect={setSelectedId} onMove={dropMove} onResize={resizeBlock} onAddItem={addItemTo} />
            </div>
            {evidence && <GoalEvidence doc={doc} evidence={evidence} />}
          </main>

          {mode === 'edit' && (
            <aside className="st-inspector" aria-label="Seaded">
              {selected ? (
                <>
                  {canRegenerateSelected && (
                    <div className="st-regenerate">
                      <div><Icons.Sparkles size={16} aria-hidden="true" /><span><b>Genereeritud ülesanne</b><small>Sama fookus ja raskus; võimalusel teine ülesandetüüp, alati uus sisu.</small></span></div>
                      <button type="button" className="ed-btn" onClick={regenerateSelected} disabled={regenerating}>
                        {regenerating ? 'Genereerin…' : 'Genereeri uus variant'}
                      </button>
                    </div>
                  )}
                  <BlockInspector key={selected.id} block={selected} doc={doc} update={updateBlock}
                    onDelete={() => deleteBlock(selected.id)}
                    onDuplicate={() => { const copy = { ...structuredClone(selected), id: newId() }; const i = doc.blocks.findIndex((b) => b.id === selected.id); const next = [...doc.blocks]; next.splice(i + 1, 0, copy); setBlocks(next); setSelectedId(copy.id); }}
                    onMove={(dir) => moveBlock(selected.id, dir)} />
                </>
              ) : (
                <SheetInspector doc={doc} setMeta={(patch) => change({ ...doc, meta: { ...doc.meta, ...patch } })} />
              )}
            </aside>
          )}
        </div>
      </div>
    </AssetContext.Provider>
  );
}
