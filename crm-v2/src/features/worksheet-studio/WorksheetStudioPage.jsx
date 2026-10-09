/* global ResizeObserver, Blob, setTimeout, clearTimeout, structuredClone */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useAuth } from '../../app/AuthContext.jsx';
import { lessonWorksheetsService, libraryService, worksheetDocsService, worksheetTemplatesService } from '../../services/firebase/index.js';
import { mediaBankService } from '../../services/firebase/mediaBank.js';
import MediaBankPanel from './MediaBankPanel.jsx';
import { assetKey, gapsFromText, tagsOf, vocabFromText, wordOrderFromText } from './mediaBank.js';
import ImageSearch from './editor/ImageSearch.jsx';
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
import { setPath } from './engine/inlineEdit.js';
import { emptyHistory, isTextTarget, parseWorksheetFile, pushHistory, redoHistory, undoHistory, useUnsavedGuard } from './editorHistory.js';
import { analyzeWorksheet } from './quality.js';
import { formalLetterDocument } from './engine/templates.js';

const DEFAULT_TITLE = newDocument().meta.title;


const MM = 3.7795;
const draftKey = (id) => `ks-worksheet-author-draft:${id || 'new'}`;
const readDraft = (key) => { try { return JSON.parse(window.localStorage.getItem(key) || 'null'); } catch { return null; } };

// Worksheet Studio: teachers assemble branded, interactive worksheets from blocks.
// Route: /library/worksheets/new  or  /library/worksheets/:lessonId (curriculumLessons document).
export default function WorksheetStudioPage({ repository = worksheetDocsService, templates = worksheetTemplatesService, mediaBank = mediaBankService, backTo = '/library', backLabel = 'Õppevara', allowCopy = true, allowAssign = true, draftId = '', editorBase = '/library/worksheets', privateFor = '', renderTop = null, initialMode = 'edit' }) {
  const { lessonId } = useParams();
  const isNew = !lessonId || lessonId === 'new';
  const draftName = draftId || (isNew ? 'new' : lessonId);
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
  const [mode, setMode] = useState(initialMode);
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
  const searchRef = useRef(null);
  const saveRef = useRef(null);
  const [savedAt, setSavedAt] = useState(0);
  // alternatives of one generated task, flipped through on the sheet: list[0] is the task as it was
  const [variants, setVariants] = useState(null);
  const [comparing, setComparing] = useState(null);
  const [myTemplates, setMyTemplates] = useState([]);
  // focus mode: the constructor takes the whole window (CRM menu and top bar hidden); remembered in this browser
  const [focus, setFocus] = useState(() => { try { return window.localStorage.getItem('ks-studio-focus') !== 'off'; } catch { return true; } });
  const toggleFocus = () => setFocus((value) => { try { window.localStorage.setItem('ks-studio-focus', value ? 'off' : 'on'); } catch { /* storage may be disabled */ } return !value; });
  useUnsavedGuard(dirty);
  // own block templates (shared with all staff); the constructor works without them if they cannot be loaded
  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => templates?.list?.()).then((list) => { if (alive) setMyTemplates(list || []); }).catch(() => {});
    return () => { alive = false; };
  }, [templates]);
  useEffect(() => { setVariants((current) => (current && current.blockId !== selectedId ? null : current)); }, [selectedId]);
  // Autosave: a draft is written to the database 15 s after the last change (a published sheet is saved by hand,
  // so a half-done change never replaces what students see without the teacher deciding it).
  useEffect(() => {
    if (isNew || !dirty || mode !== 'edit' || worksheetStatus === 'published') return undefined;
    const timer = setTimeout(() => saveRef.current?.('draft', { auto: true }), 15000);
    return () => clearTimeout(timer);
  }, [doc, dirty, isNew, mode, worksheetStatus]);

  useEffect(() => {
    let alive = true;
    if (isNew) {
      const fresh = newDocument();
      const local = readDraft(draftKey(draftName));
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

  // every picture uploaded here also goes to the school's picture bank (with the sheet's level and title as tags)
  const bankImage = (img, { caption = '', credit = '', source = 'upload', name = '' } = {}) => {
    if (!img?.src || !mediaBank?.save) return;
    Promise.resolve().then(() => mediaBank.save({
      kind: 'image', key: assetKey('img', img.src), src: img.src, storagePath: img.storagePath || '', width: img.width, height: img.height,
      caption, credit, source, level: doc?.meta?.level || '', topic: doc?.meta?.title || '', sheetTitle: doc?.meta?.title || '',
      tags: tagsOf(caption, doc?.meta?.title || '', doc?.meta?.module || '', String(name).replace(/\.[^.]+$/, '')),
    }, user)).catch(() => {});
  };
  const docMeta = doc?.meta;
  const assets = useMemo(() => ({
    image: async (file) => { const img = await repository.uploadImage(file); bankImage(img, { name: file?.name }); return img; },
    audio: (file) => repository.uploadAudio(file),
  }), [repository, docMeta]); // eslint-disable-line react-hooks/exhaustive-deps

  const palette = useMemo(() => GROUPS.map((g) => [g, Object.values(BLOCKS).filter((b) => b.group === g)]), []);
  const filteredPalette = useMemo(() => palette.map(([group, defs]) => [group, defs.filter((def) => !paletteQuery.trim() || `${def.label} ${def.group}`.toLocaleLowerCase('et').includes(paletteQuery.trim().toLocaleLowerCase('et')))]).filter(([, defs]) => defs.length), [palette, paletteQuery]);
  const quality = useMemo(() => analyzeWorksheet(doc || newDocument()), [doc]);

  if (loadError) return <div className="page-content"><div className="ws-studio-error" role="alert">{loadError} <Link to={backTo}>Tagasi: {backLabel}</Link></div></div>;
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
  // text changed directly on the sheet: a block field, or the sheet header when blockId is null
  const editText = (blockId, path, text) => {
    if (!blockId) { change({ ...doc, meta: setPath(doc.meta, path, text) }); return; }
    const block = doc.blocks.find((b) => b.id === blockId);
    if (block) { updateBlock({ ...block, data: setPath(block.data, path, text) }); setSelectedId(blockId); }
  };
  const canRegenerateSelected = Boolean(
    selected &&
    generation &&
    typeof repository.regenerateBlock === 'function' &&
    BLOCKS[selected.type]?.task &&
    /^gen_(discover|practice|transfer)_\d+$/.test(String(selected.id || '')),
  );
  const regenerateSelected = async (difficulty = '') => {
    if (!canRegenerateSelected || regenerating) return;
    if (typeof repository.regenerateBlockOptions === 'function') {
      setRegenerating(true);
      setSaveError('');
      try {
        const original = variants?.blockId === selected.id ? variants.list[0] : selected;
        const document = { ...doc, blocks: doc.blocks.map((b) => (b.id === original.id ? original : b)) };
        const options = await repository.regenerateBlockOptions({ document, blockId: original.id, generation, difficulty });
        const list = [original, ...options];
        setVariants({ blockId: original.id, list, index: 1, difficulty });
        updateBlock(list[1]);
        setNotice(`Valmis ${options.length} uut varianti. Sirvi neid ploki kohal nooltega; „Algne” toob vana tagasi.`);
      } catch (error) {
        setSaveError(error.message || 'Ülesande uuesti genereerimine ebaõnnestus.');
      } finally {
        setRegenerating(false);
      }
      return;
    }
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
  // blocks made elsewhere (template, lesson words) go after the selected block, or to the end
  const insertBlocks = (blocks) => {
    if (!blocks.length) return;
    const fresh = blocks.map((b) => ({ ...structuredClone(b), id: newId() }));
    const at = selectedId ? doc.blocks.findIndex((x) => x.id === selectedId) + 1 : doc.blocks.length;
    const next = [...doc.blocks];
    next.splice(at, 0, ...fresh);
    setBlocks(next);
    setSelectedId(fresh[fresh.length - 1].id);
  };
  const saveTemplate = async (block) => {
    const title = window.prompt('Malli nimi (näha kõigile õpetajatele):', block.data?.title || BLOCKS[block.type]?.label || 'Mall');
    if (!title) return;
    try {
      const created = await templates.create({ title, block, user });
      setMyTemplates((list) => [created, ...list]);
      setNotice(`Mall „${created.title}” salvestati. Leiad selle vasakult „Mallid” alt.`);
    } catch (error) {
      setSaveError(error.message || 'Malli ei saanud salvestada.');
    }
  };
  const removeTemplate = async (template) => {
    if (!window.confirm(`Kustuta mall „${template.title}”?`)) return;
    try {
      await templates.remove(template.id);
      setMyTemplates((list) => list.filter((item) => item.id !== template.id));
    } catch (error) {
      setSaveError(error.message || 'Malli ei saanud kustutada.');
    }
  };
  const pickWebImage = async (file, credit) => {
    const img = await repository.uploadImage(file);
    bankImage(img, { caption: credit.caption, credit: credit.credit, source: 'openverse', name: file?.name });
    placeImage(img, credit.caption, credit);
    setNotice('Pilt lisati. Autor ja litsents on pildiallkirjas.');
  };
  // a picture from the bank or the internet: into the selected picture block, or a new picture block after it
  const placeImage = (img, caption = '', credit = null) => {
    const extra = credit ? { credit: credit.credit, creditSource: credit.source } : {};
    if (selected && 'img' in (selected.data || {})) {
      updateBlock({ ...selected, data: { ...selected.data, img, caption: selected.data.caption || caption, ...extra } });
      return;
    }
    const b = createBlock('image');
    b.data = { ...b.data, img, caption, ...extra };
    insertBlocks([b]);
  };
  const pickBankImage = (asset) => {
    placeImage({ src: asset.src, storagePath: asset.storagePath || '', width: asset.width || 0, height: asset.height || 0, focus: { x: 50, y: 50 } }, asset.credit ? asset.caption : '');
    setNotice('Pilt pangast lisati lehele.');
  };
  // a text from the bank: a reading block, and if wanted gaps / word order / vocabulary made from it
  const pickBankText = (asset, extras = []) => {
    const reading = createBlock('reading');
    reading.data = { ...reading.data, passageTitle: asset.title, passage: asset.text, questions: '' };
    const made = [reading];
    if (extras.includes('gaps')) { const b = createBlock('gaps'); b.data = { ...b.data, ...gapsFromText(asset.text) }; made.push(b); }
    if (extras.includes('wordorder')) { const b = createBlock('wordorder'); b.data = { ...b.data, ...wordOrderFromText(asset.text) }; made.push(b); }
    if (extras.includes('vocab')) { const b = createBlock('vocab'); b.data = { ...b.data, ...vocabFromText(asset.text) }; made.push(b); }
    insertBlocks(made);
    setNotice(`Tekst „${asset.title}” lisati${made.length > 1 ? ' koos ülesannetega' : ''}. Kirjuta lugemisele küsimused.`);
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
  const duplicateBlock = (id) => {
    const block = doc.blocks.find((b) => b.id === id);
    if (!block) return;
    const copy = { ...structuredClone(block), id: newId() };
    const i = doc.blocks.findIndex((b) => b.id === id);
    const next = [...doc.blocks];
    next.splice(i + 1, 0, copy);
    setBlocks(next);
    setSelectedId(copy.id);
  };
  // „+” under a block: the next block chosen on the left is added right after it
  const insertAfter = (id) => {
    setSelectedId(id);
    setNotice('Vali vasakult plokk – see lisatakse valitud ploki järele.');
    globalThis.setTimeout(() => searchRef.current?.focus(), 0);
  };
  // a quality issue clicked: select its block (or the sheet data) and bring it into view
  const showIssue = (issue) => {
    const blockId = String(issue.code || '').split(':')[0];
    const block = doc.blocks.find((b) => b.id === blockId);
    if (mode !== 'edit') switchMode('edit');
    setSelectedId(block ? block.id : null);
    globalThis.setTimeout(() => {
      const el = block ? document.querySelector(`.ws-page [data-block="${globalThis.CSS?.escape ? globalThis.CSS.escape(block.id) : block.id}"]`) : document.querySelector('.ws-page .ws-title');
      el?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    }, 0);
  };
  // versions: compare a saved version with the sheet and bring back one task or the whole sheet
  const versionDiff = (entry) => {
    const old = entry.worksheetDoc?.blocks || [];
    const now = new Map(doc.blocks.map((b) => [b.id, b]));
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    return old.map((block) => ({ block, state: !now.has(block.id) ? 'removed' : same(now.get(block.id), block) ? 'same' : 'changed' }))
      .filter((row) => row.state !== 'same');
  };
  const restoreTask = (block) => {
    const exists = doc.blocks.some((b) => b.id === block.id);
    if (exists) updateBlock(structuredClone(block));
    else {
      const old = comparing.worksheetDoc.blocks;
      const before = old.slice(0, old.findIndex((b) => b.id === block.id)).reverse().find((b) => doc.blocks.some((x) => x.id === b.id));
      const at = before ? doc.blocks.findIndex((b) => b.id === before.id) + 1 : 0;
      const next = [...doc.blocks];
      next.splice(at, 0, structuredClone(block));
      setBlocks(next);
    }
    setSelectedId(block.id);
    setNotice(`Ülesanne „${block.data?.title || BLOCKS[block.type]?.label || 'plokk'}” toodi tagasi versioonist ${comparing.version}. Salvesta, et see jääks.`);
  };
  const showVariant = (index) => {
    if (!variants) return;
    setVariants({ ...variants, index });
    updateBlock(variants.list[index]);
  };
  const renderToolbar = (block) => {
    const index = doc.blocks.findIndex((b) => b.id === block.id);
    const flipping = variants?.blockId === block.id;
    const canRegenerate = canRegenerateSelected && selected?.id === block.id;
    return (
      <>
        <button type="button" onClick={() => moveBlock(block.id, -1)} disabled={index <= 0} title="Üles (Alt+↑)" aria-label="Liiguta üles"><Icons.ArrowUp aria-hidden="true" /></button>
        <button type="button" onClick={() => moveBlock(block.id, 1)} disabled={index >= doc.blocks.length - 1} title="Alla (Alt+↓)" aria-label="Liiguta alla"><Icons.ArrowDown aria-hidden="true" /></button>
        <button type="button" onClick={() => duplicateBlock(block.id)} title="Kopeeri (Ctrl+D)"><Icons.Copy aria-hidden="true" /> Kopeeri</button>
        {canRegenerate && !flipping ? <button type="button" onClick={() => regenerateSelected()} disabled={regenerating} title="Sama fookus ja raskus, kolm uut varianti"><Icons.Sparkles aria-hidden="true" /> {regenerating ? 'Genereerin…' : 'Uus variant'}</button> : null}
        {canRegenerate && flipping ? (
          <>
            <button type="button" onClick={() => showVariant(variants.index - 1)} disabled={variants.index <= 0} aria-label="Eelmine variant"><Icons.ChevronLeft aria-hidden="true" /></button>
            <span className="ws-toolbar-count" aria-live="polite">{variants.index ? `Variant ${variants.index}/${variants.list.length - 1}` : 'Algne'}</span>
            <button type="button" onClick={() => showVariant(variants.index + 1)} disabled={variants.index >= variants.list.length - 1} aria-label="Järgmine variant"><Icons.ChevronRight aria-hidden="true" /></button>
            <select aria-label="Selle ülesande raskus" value={variants.difficulty || generation?.difficulty || 'core'} disabled={regenerating} onChange={(e) => regenerateSelected(e.target.value)}><option value="support">Support</option><option value="core">Core</option><option value="challenge">Challenge</option></select>
            <button type="button" onClick={() => showVariant(0)} disabled={!variants.index}>Algne</button>
          </>
        ) : null}
        {templates ? <button type="button" onClick={() => saveTemplate(block)} title="Salvesta see plokk mallina"><Icons.BookmarkPlus aria-hidden="true" /> Mall</button> : null}
        <button type="button" className="is-danger" onClick={() => deleteBlock(block.id)} title="Kustuta (Delete)" aria-label="Kustuta plokk"><Icons.Trash2 aria-hidden="true" /></button>
      </>
    );
  };
  keysRef.current = (event) => {
    const key = String(event.key || '').toLowerCase();
    if (mode === 'edit' && (event.ctrlKey || event.metaKey) && key === 's') { event.preventDefault(); if (dirty || isNew) save('draft'); return; }
    if (mode !== 'edit' || isTextTarget(event.target)) return;
    if ((event.ctrlKey || event.metaKey) && key === 'z') { event.preventDefault(); if (event.shiftKey) redo(); else undo(); return; }
    if ((event.ctrlKey || event.metaKey) && key === 'y') { event.preventDefault(); redo(); return; }
    if ((key === 'delete' || key === 'backspace') && selectedId) { event.preventDefault(); deleteBlock(selectedId); return; }
    if ((event.ctrlKey || event.metaKey) && key === 'd' && selectedId) { event.preventDefault(); duplicateBlock(selectedId); return; }
    if (event.altKey && (key === 'arrowup' || key === 'arrowdown') && selectedId) { event.preventDefault(); moveBlock(selectedId, key === 'arrowup' ? -1 : 1); return; }
    if (!event.altKey && !event.ctrlKey && !event.metaKey && (key === 'arrowup' || key === 'arrowdown') && selectedId) {
      const i = doc.blocks.findIndex((b) => b.id === selectedId);
      const next = doc.blocks[i + (key === 'arrowup' ? -1 : 1)];
      if (next) { event.preventDefault(); setSelectedId(next.id); }
      return;
    }
    if (key === 'escape' && selectedId) setSelectedId(null);
  };
  const switchMode = (m) => { setMode(m); setEvidence(null); setResults({}); if (m !== 'edit') setSelectedId(null); };

  const check = () => {
    const res = checkDocument(doc, answers);
    setResults(res.results);
    setEvidence(res);
  };

  const save = async (nextStatus = 'draft', { auto = false } = {}) => {
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
      const res = await repository.save({ lessonId: isNew ? '' : lessonId, document: doc, user, baseUpdatedAt, status: nextStatus, ...(generation ? { generation } : {}) });
      setDirty(false);
      setSource('worksheetDoc');
      setBaseUpdatedAt(res.updatedAt || '');
      setVersion(Number(res.version) || version);
      setWorksheetStatus(res.status || nextStatus);
      setDraftRestored(false);
      try { window.localStorage.removeItem(draftKey(draftName)); } catch { /* ignore */ }
      setSavedAt(Date.now());
      if (!auto) setNotice(nextStatus === 'published' ? (privateFor ? `„${res.title}” määrati õpilasele ${privateFor}.` : `„${res.title}” avaldati (versioon ${res.version}).`) : `„${res.title}” salvestati mustandina (versioon ${res.version}).`);
      if (res.created) navigate(`${editorBase}/${res.id}`, { replace: true });
    } catch (error) {
      setSaveError(auto ? `Automaatne salvestamine ebaõnnestus: ${error.message || 'tundmatu viga'}. Muudatused on selles brauseris alles.` : error.message || 'Salvestamine ebaõnnestus.');
    } finally {
      setSaving(false);
    }
  };
  saveRef.current = save;

  const saveCopy = async () => {
    closeMenu(); setSaving(true); setSaveError('');
    try {
      const copy = { ...structuredClone(doc), id: newId(), meta: { ...doc.meta, title: `${doc.meta.title} – koopia` } };
      const res = await repository.save({ lessonId: '', document: copy, user, status: 'draft' });
      navigate(`${editorBase}/${res.id}`);
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
      <div className={`ws-studio mode-${mode} ${focus ? 'is-focus' : ''}`}>
        <header className="st-bar">
          <Link className="st-back" to={backTo}><Icons.ArrowLeft size={16} /> {backTo.startsWith('/library/lessons/') ? 'Tunni töölehed' : backLabel}</Link>
          <div className="st-title"><b>Töölehe konstruktor</b><span>{doc.meta.title}{saving ? ' · salvestan…' : dirty ? ' · salvestamata' : savedAt ? ` · salvestatud ${new Date(savedAt).toLocaleTimeString('et-EE', { hour: '2-digit', minute: '2-digit' })}` : ''}</span></div>
          <div className="st-seg" role="tablist" aria-label="Vaade">
            {[['edit', 'Koosta'], ['interactive', 'Õpilase vaade'], ['print', 'Trükivaade']].map(([m, l]) => (
              <button type="button" role="tab" key={m} aria-pressed={mode === m} onClick={() => switchMode(m)}>{l}</button>
            ))}
          </div>
          <div className="st-actions">
            {/* in the student or print view the way back to editing is one clear button */}
            {mode !== 'edit' && <button type="button" className="st-btn st-edit" onClick={() => switchMode('edit')}><Icons.PenLine size={16} aria-hidden="true" /> Muuda lehte</button>}
            {mode === 'interactive' && <button type="button" className="st-btn primary" onClick={check}>Kontrolli vastuseid</button>}
            {mode === 'interactive' && <button type="button" className="st-btn" onClick={() => { setAnswers({}); setResults({}); setEvidence(null); }}>Tühjenda</button>}
            {mode === 'edit' && <button type="button" className="st-btn" disabled={!history.past.length} onClick={undo} title="Võta tagasi (Ctrl+Z)" aria-label="Võta tagasi"><Icons.Undo2 size={16} /></button>}
            {mode === 'edit' && <button type="button" className="st-btn" disabled={!history.future.length} onClick={redo} title="Tee uuesti (Ctrl+Shift+Z)" aria-label="Tee uuesti"><Icons.Redo2 size={16} /></button>}
            <button type="button" className="st-btn" onClick={toggleFocus} aria-pressed={focus} title={focus ? 'Näita CRM-i menüüd' : 'Konstruktor kogu aknas'}>{focus ? <Icons.Minimize2 size={16} aria-hidden="true" /> : <Icons.Maximize2 size={16} aria-hidden="true" />}<span className="st-btn-label">{focus ? 'Näita menüüd' : 'Täisekraan'}</span></button>
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
            {allowAssign && !isNew && worksheetStatus === 'published' && !dirty ? <Link className="st-btn" to={`/library?assign=${encodeURIComponent(lessonId)}`}>Määra õpilastele</Link> : null}
            <button type="button" className="st-btn primary" disabled={saving || !quality.ready || (!dirty && worksheetStatus === 'published')} onClick={() => save('published')}>{privateFor ? 'Määra õpilasele' : 'Avalda'}</button>
          </div>
        </header>
        {renderTop ? renderTop({
          dirty,
          doc,
          insertBlocks,
          // a generated sheet shown in the editor first: nothing is saved until „Salvesta” (or autosave), Ctrl+Z undoes it
          replaceDocument: (next, nextGeneration) => {
            change({ ...next, id: doc.id });
            if (nextGeneration) setGeneration(nextGeneration);
            setSelectedId(null);
            setVariants(null);
            setNotice('Uus variant on lehel. Kui meeldib, salvesta; kui ei, „Võta tagasi” (Ctrl+Z) toob eelmise tagasi.');
          },
        }) : null}
        {privateFor && <div className="st-banner" role="note">Isiklik tööleht: {privateFor}. Salvestatud mustandit näevad ainult õpetajad. Õpilane saab töölehe pärast nuppu „Määra õpilasele”.</div>}
        {source === 'converted' && <div className="st-banner">See tööleht teisendati vanast vormingust uude kujundusse. Kontrolli ülesandeid ja salvesta. Vana versioon jääb alles.</div>}
        {saveError && <div className="st-banner error" role="alert">{saveError}</div>}
        {notice && <div className="st-banner ok" role="status">{notice}</div>}
        {draftRestored && <div className="st-banner st-draft-note" role="status"><span>Taastasin selles brauseris automaatselt salvestatud mustandi.</span><button type="button" className="st-btn" onClick={() => { try { window.localStorage.removeItem(draftKey(draftName)); } catch { /* ignore */ } window.location.reload(); }}>Loobu mustandist</button></div>}
        <details className={`st-quality ${quality.ready ? 'ready' : ''}`}>
          <summary>{quality.ready ? `✓ Avaldamiseks valmis · versioon ${version || 'uus'} · ${worksheetStatus === 'published' ? 'avaldatud' : 'mustand'}` : `Kvaliteedikontroll: ${quality.errors.length} viga, ${quality.warnings.length} hoiatust`}</summary>
          {quality.issues.length ? <ul>{quality.issues.map((issue) => <li className={issue.level} key={issue.code}><button type="button" className="st-issue" onClick={() => showIssue(issue)}>{issue.text}</button></li>)}</ul> : <p>Kõik kohustuslikud kontrollid on läbitud.</p>}
        </details>
        {versions.length > 0 && <div className="st-banner"><strong>Versioonid:</strong> {versions.slice(0, 12).map((entry) => <button type="button" className={`st-btn ${comparing?.id === entry.id ? 'primary' : ''}`} key={entry.id} onClick={() => setComparing(comparing?.id === entry.id ? null : entry)}>v{entry.version} · {entry.status === 'published' ? 'avaldatud' : 'mustand'}</button>)} <button type="button" className="st-btn" onClick={() => { setVersions([]); setComparing(null); }}>Sulge</button></div>}
        {comparing && (() => {
          const rows = versionDiff(comparing);
          return (
            <div className="st-banner st-compare" role="region" aria-label={`Versioon ${comparing.version} võrreldes praegusega`}>
              <strong>Versioon {comparing.version} võrreldes praegusega:</strong>
              {rows.length ? <ul>{rows.map(({ block, state }) => <li key={block.id}><span>{state === 'removed' ? 'Kustutatud' : 'Muudetud'}: {block.data?.title || BLOCKS[block.type]?.label || 'plokk'}</span> <button type="button" className="st-btn" onClick={() => restoreTask(block)}>Too see ülesanne tagasi</button></li>)}</ul> : <span> ülesanded on samad.</span>}
              <button type="button" className="st-btn" onClick={() => { if (window.confirm(`Taasta kogu versioon ${comparing.version} uue mustandina?`)) { change({ ...structuredClone(comparing.worksheetDoc), id: doc.id }); setVersions([]); setComparing(null); setNotice(`Versioon ${comparing.version} laaditi redigeerimiseks. Salvesta see uue versioonina.`); } }}>Taasta kogu leht</button>
            </div>
          );
        })()}

        <div className="st-body">
          {mode === 'edit' && (
            <aside className={`st-palette ${leftTab === 'original' ? 'is-original' : ''}`} aria-label="Plokid">
              <div className="st-lefttabs" role="tablist">
                <button type="button" role="tab" aria-pressed={leftTab === 'blocks'} onClick={() => setLeftTab('blocks')}>Plokid</button>
                <button type="button" role="tab" aria-pressed={leftTab === 'bank'} onClick={() => setLeftTab('bank')}>Pank</button>
                {original.length > 0 ? <button type="button" role="tab" aria-pressed={leftTab === 'original'} onClick={() => setLeftTab('original')}>Originaal</button> : null}
              </div>
              {leftTab === 'bank' ? <MediaBankPanel level={doc?.meta?.level || ''} service={mediaBank} isAdmin={Boolean(user?.roles?.includes?.('admin'))}
                onImage={pickBankImage} onText={pickBankText} onWebImage={pickWebImage}
                onIndex={(onProgress) => mediaBank.indexCurriculum({ library: libraryService, lessonWorksheets: lessonWorksheetsService, user, onProgress })} />
              : leftTab === 'original' && original.length > 0 ? <OriginalPanel files={original} onCut={cutPhoto} busy={cut.busy} error={cut.error} /> : <><div className="st-palette-search"><input ref={searchRef} className="ed-input" type="search" value={paletteQuery} onChange={(e) => setPaletteQuery(e.target.value)} placeholder="Otsi plokki…" aria-label="Otsi plokki" /></div><p className="st-palette-hint">Teksti muutmiseks tee lehel topeltklõps. Kiirklahvid: Ctrl+S salvesta, Ctrl+D kopeeri, Alt+↑/↓ liiguta, ↑/↓ vali, Delete kustuta, Esc.</p>{myTemplates.length ? (
                <div className="st-group st-templates">
                  <div className="st-group-title">Mallid</div>
                  <ul>{myTemplates.filter((t) => !paletteQuery || t.title.toLowerCase().includes(paletteQuery.toLowerCase())).map((t) => (
                    <li key={t.id}>
                      <button type="button" className="st-block" onClick={() => insertBlocks([t.block])} title={`Lisa mall lehele${t.ownerName ? ` · ${t.ownerName}` : ''}`}><Icons.Bookmark size={16} aria-hidden="true" /><span>{t.title}</span></button>
                      {t.ownerUid === user?.uid || user?.roles?.includes?.('admin') ? <button type="button" className="st-template-del" onClick={() => removeTemplate(t)} aria-label={`Kustuta mall ${t.title}`}>×</button> : null}
                    </li>
                  ))}</ul>
                </div>
              ) : null}{filteredPalette.map(([g, defs]) => (
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
              <Sheet doc={doc} mode={mode} answers={answers} setAnswer={setAnswer} results={results} selectedId={selectedId} onSelect={setSelectedId} onMove={dropMove} onResize={resizeBlock} onAddItem={addItemTo} onEditText={editText} renderToolbar={renderToolbar} onInsertAfter={insertAfter} />
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
                      <button type="button" className="ed-btn" onClick={() => regenerateSelected()} disabled={regenerating}>
                        {regenerating ? 'Genereerin…' : 'Genereeri uus variant'}
                      </button>
                    </div>
                  )}
                  {'img' in (selected.data || {}) ? <ImageSearch key={`img-${selected.id}`} onPick={pickWebImage} /> : null}
                  <BlockInspector key={selected.id} block={selected} doc={doc} update={updateBlock}
                    onDelete={() => deleteBlock(selected.id)}
                    onDuplicate={() => duplicateBlock(selected.id)}
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
