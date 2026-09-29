/* global ResizeObserver, Blob, setTimeout, structuredClone */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useAuth } from '../../app/AuthContext.jsx';
import { worksheetDocsService } from '../../services/firebase/index.js';
import Sheet from './engine/Sheet.jsx';
import { AssetContext } from './engine/assets.jsx';
import { BLOCKS, GROUPS, checkDocument, createBlock } from './engine/registry.js';
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

const MM = 3.7795;

// Worksheet Studio: teachers assemble branded, interactive worksheets from blocks.
// Route: /library/worksheets/new  or  /library/worksheets/:lessonId (curriculumLessons document).
export default function WorksheetStudioPage({ repository = worksheetDocsService }) {
  const { lessonId } = useParams();
  const isNew = !lessonId || lessonId === 'new';
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doc, setDoc] = useState(null);
  const [source, setSource] = useState('');
  const [loadError, setLoadError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
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
  const canvasRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    let alive = true;
    if (isNew) {
      setDoc(newDocument());
      setSource('new');
      return undefined;
    }
    repository.load(lessonId)
      .then((res) => {
        if (!alive) return;
        const files = originalFiles(res.lesson);
        setDoc(res.document);
        setSource(res.source);
        setOriginal(files);
        if (files.length && res.source !== 'worksheetDoc') setLeftTab('original');
      })
      .catch((error) => { if (alive) setLoadError(error.message || 'Töölehte ei saanud avada.'); });
    return () => { alive = false; };
  }, [isNew, lessonId, repository]);

  // print styles hide the CRM shell only while the studio is open
  useEffect(() => {
    return applyPrintA4();
  }, []);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

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

  if (loadError) return <div className="page-content"><div className="ws-studio-error" role="alert">{loadError} <Link to="/library">Tagasi Õppevarasse</Link></div></div>;
  if (!doc) return <div className="page-content"><p className="ws-studio-loading">Laen töölehte…</p></div>;

  const change = (next) => { setDoc(next); setDirty(true); setNotice(''); };
  const setBlocks = (blocks) => change({ ...doc, blocks });
  const selected = doc.blocks.find((b) => b.id === selectedId);
  const updateBlock = (nb) => setBlocks(doc.blocks.map((b) => (b.id === nb.id ? nb : b)));
  const resizeBlock = (id, patch) => {
    const block = doc.blocks.find((b) => b.id === id);
    if (!block) return;
    updateBlock('span' in patch ? withSpan(block, patch.span) : withHeight(block, patch.minHeightMm));
  };
  const addBlock = (type) => {
    const b = createBlock(type);
    const at = selectedId ? doc.blocks.findIndex((x) => x.id === selectedId) + 1 : doc.blocks.length;
    const next = [...doc.blocks];
    next.splice(at, 0, b);
    setBlocks(next);
    setSelectedId(b.id);
  };
  const moveBlock = (id, dir) => {
    const i = doc.blocks.findIndex((b) => b.id === id);
    const j = i + dir;
    if (j < 0 || j >= doc.blocks.length) return;
    const next = [...doc.blocks];
    [next[i], next[j]] = [next[j], next[i]];
    setBlocks(next);
  };
  const dropMove = (fromId, toId) => {
    const next = [...doc.blocks];
    const [moved] = next.splice(next.findIndex((b) => b.id === fromId), 1);
    next.splice(next.findIndex((b) => b.id === toId), 0, moved);
    setBlocks(next);
  };
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
  const switchMode = (m) => { setMode(m); setEvidence(null); setResults({}); if (m !== 'edit') setSelectedId(null); };

  const check = () => {
    const res = checkDocument(doc, answers);
    setResults(res.results);
    setEvidence(res);
  };

  const save = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const res = await repository.save({ lessonId: isNew ? '' : lessonId, document: doc, user });
      setDirty(false);
      setSource('worksheetDoc');
      setNotice(`„${res.title}” salvestati.`);
      if (res.created) navigate(`/library/worksheets/${res.id}`, { replace: true });
    } catch (error) {
      setSaveError(error.message || 'Salvestamine ebaõnnestus.');
    } finally {
      setSaving(false);
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${doc.meta.title || 'tooleht'}.json`;
    a.click();
  };
  const importJson = async (file) => {
    try { change({ ...JSON.parse(await file.text()), id: doc.id }); setSelectedId(null); } catch { setSaveError('Fail ei ole kehtiv tööleht.'); }
  };

  return (
    <AssetContext.Provider value={assets}>
      <div className={`ws-studio mode-${mode}`}>
        <header className="st-bar">
          <Link className="st-back" to="/library"><Icons.ArrowLeft size={16} /> Õppevara</Link>
          <div className="st-title"><b>Töölehe konstruktor</b><span>{doc.meta.title}{dirty ? ' · salvestamata' : ''}</span></div>
          <div className="st-seg" role="tablist" aria-label="Vaade">
            {[['edit', 'Koosta'], ['interactive', 'Õpilase vaade'], ['print', 'Trükivaade']].map(([m, l]) => (
              <button type="button" role="tab" key={m} aria-pressed={mode === m} onClick={() => switchMode(m)}>{l}</button>
            ))}
          </div>
          <div className="st-actions">
            {mode === 'interactive' && <button type="button" className="st-btn primary" onClick={check}>Kontrolli vastuseid</button>}
            {mode === 'interactive' && <button type="button" className="st-btn" onClick={() => { setAnswers({}); setResults({}); setEvidence(null); }}>Tühjenda</button>}
            <button type="button" className="st-btn" onClick={() => { switchMode('print'); setTimeout(() => window.print(), 300); }}>PDF / Prindi</button>
            <details className="st-more">
              <summary className="st-btn">Fail ▾</summary>
              <div className="st-menu">
                <button type="button" onClick={() => { change({ ...sampleDocument(), id: doc.id }); setSelectedId(null); }}>Laadi näidisleht „Minu päev”</button>
                <button type="button" onClick={exportJson}>Salvesta faili (JSON)</button>
                <button type="button" onClick={() => fileRef.current?.click()}>Ava failist…</button>
              </div>
            </details>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => { if (e.target.files?.[0]) importJson(e.target.files[0]); e.target.value = ''; }} />
            <button type="button" className="st-btn primary" disabled={saving || (!dirty && !isNew)} onClick={save}>{saving ? 'Salvestan…' : 'Salvesta'}</button>
          </div>
        </header>
        {source === 'converted' && <div className="st-banner">See tööleht teisendati vanast vormingust uude kujundusse. Kontrolli ülesandeid ja salvesta. Vana versioon jääb alles.</div>}
        {saveError && <div className="st-banner error" role="alert">{saveError}</div>}
        {notice && <div className="st-banner ok" role="status">{notice}</div>}

        <div className="st-body">
          {mode === 'edit' && (
            <aside className={`st-palette ${leftTab === 'original' ? 'is-original' : ''}`} aria-label="Plokid">
              {original.length > 0 && (
                <div className="st-lefttabs" role="tablist">
                  <button type="button" role="tab" aria-pressed={leftTab === 'blocks'} onClick={() => setLeftTab('blocks')}>Plokid</button>
                  <button type="button" role="tab" aria-pressed={leftTab === 'original'} onClick={() => setLeftTab('original')}>Originaal</button>
                </div>
              )}
              {leftTab === 'original' && original.length > 0 ? <OriginalPanel files={original} onCut={cutPhoto} busy={cut.busy} error={cut.error} /> : palette.map(([g, defs]) => (
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
              ))}
            </aside>
          )}

          <main className="st-canvas" ref={canvasRef}>
            <div className="st-zoom" style={{ zoom: scale }}>
              <Sheet doc={doc} mode={mode} answers={answers} setAnswer={setAnswer} results={results} selectedId={selectedId} onSelect={setSelectedId} onMove={dropMove} onResize={resizeBlock} />
            </div>
            {evidence && <GoalEvidence doc={doc} evidence={evidence} />}
          </main>

          {mode === 'edit' && (
            <aside className="st-inspector" aria-label="Seaded">
              {selected ? (
                <BlockInspector key={selected.id} block={selected} doc={doc} update={updateBlock}
                  onDelete={() => { setBlocks(doc.blocks.filter((b) => b.id !== selected.id)); setSelectedId(null); }}
                  onDuplicate={() => { const copy = { ...structuredClone(selected), id: newId() }; const i = doc.blocks.findIndex((b) => b.id === selected.id); const next = [...doc.blocks]; next.splice(i + 1, 0, copy); setBlocks(next); setSelectedId(copy.id); }}
                  onMove={(dir) => moveBlock(selected.id, dir)} />
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
