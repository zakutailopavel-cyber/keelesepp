/* global ResizeObserver, IntersectionObserver, Blob, setTimeout, clearTimeout, structuredClone */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { autoUpdate, flip, offset, shift, size, useFloating } from '@floating-ui/react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useAuth } from '../../app/AuthContext.jsx';
import { homeworkService, lessonWorksheetsService, libraryService, worksheetDocsService, worksheetTemplatesService } from '../../services/firebase/index.js';
import { mediaBankService } from '../../services/firebase/mediaBank.js';
import { languageToolsService } from '../../services/firebase/languageTools.js';
import MediaBankPanel from './MediaBankPanel.jsx';
import { assetKey, gapsFromText, tagsOf, vocabFromText, wordOrderFromText } from './mediaBank.js';
import ImageSearch from './editor/ImageSearch.jsx';
import Sheet, { BlockPreview } from './engine/Sheet.jsx';
import BlockLookMenus from './editor/BlockBar.jsx';
import BarMenu from './editor/BarMenu.jsx';
import { NO_DRAG, dropAction, hintFor } from './engine/dragIds.js';
import { DndContext, DragOverlay, PointerSensor, pointerWithin, rectIntersection, useDraggable, useSensor, useSensors } from '@dnd-kit/core';
import { dropSide } from './engine/look.js';
import { AssetContext } from './engine/assets.jsx';
import { BLOCKS, GROUPS, checkDocument, createBlock, isPaletteKey, paletteEntries } from './engine/registry.js';
import { dropAt, insertAt, moveRun, styleOf, styleSameType } from './engine/look.js';
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
import { MARK_KINDS, addMark } from './engine/marksModel.js';
import { VARIANTS, makeVariant } from './engine/variants.js';
import { setPath } from './engine/inlineEdit.js';
import { emptyHistory, isTextTarget, parseWorksheetFile, pushHistory, redoHistory, undoHistory, useUnsavedGuard } from './editorHistory.js';
import { analyzeWorksheet } from './quality.js';
import { SHEET_MINUTES } from './didactics/timeEstimate.js';
import TextToTasks from './editor/TextToTasks.jsx';
import { VOCABULARY_FOR, loadLevelForms } from './didactics/levelVocabulary.js';
import { levelKey } from './didactics/levels.js';
import InsightsPanel from './InsightsPanel.jsx';
import { addAlternative } from './engine/insights.js';
import { formalLetterDocument } from './engine/templates.js';

const DEFAULT_TITLE = newDocument().meta.title;


const MM = 3.7795;
const draftKey = (id) => `ks-worksheet-author-draft:${id || 'new'}`;
const readDraft = (key) => { try { return JSON.parse(window.localStorage.getItem(key) || 'null'); } catch { return null; } };

// Worksheet Studio: teachers assemble branded, interactive worksheets from blocks.
// Route: /library/worksheets/new  or  /library/worksheets/:lessonId (curriculumLessons document).
// A press on a block (not on its tools, fields or texts being edited) or on a palette item starts a drag after 6 px.
class SheetPointerSensor extends PointerSensor {
  static activators = [{
    eventName: 'onPointerDown',
    handler: ({ nativeEvent: event }) => event.isPrimary !== false && event.button === 0
      && (Boolean(event.target?.closest?.('.st-block')) || !event.target?.closest?.(NO_DRAG)),
  }];
}
// both pointer-inside (precise) and overlap (when the pointer is between cards)
const paletteLabel = (key) => paletteEntries().find((entry) => entry.key === key)?.label || '';
const collide = (args) => { const inside = pointerWithin(args); return inside.length ? inside : rectIntersection(args); };

// A palette tile: a small picture of the block (drawn once the tile scrolls into view) and its name; dragged onto
// the sheet or added with a click.
function PaletteItem({ id, onClick, title, theme = '', children }) {
  const { setNodeRef, listeners, isDragging } = useDraggable({ id: `new:${id}`, data: { kind: 'new', type: id } });
  const [seen, setSeen] = useState(false);
  const boxRef = useRef(null);
  useEffect(() => {
    const el = boxRef.current;
    if (!el || seen || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver((entries) => { if (entries.some((entry) => entry.isIntersecting)) { setSeen(true); io.disconnect(); } }, { rootMargin: '240px' });
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);
  const sample = useMemo(() => (seen ? createBlock(id) : null), [seen, id]);
  const setRef = (node) => { setNodeRef(node); boxRef.current = node; };
  return (
    <button type="button" ref={setRef} {...listeners} className={`st-block st-tile ${isDragging ? 'is-dragging' : ''}`} onClick={onClick} title={title}>
      <span className="st-thumb" aria-hidden="true">{sample ? <BlockPreview block={sample} theme={theme} /> : null}</span>
      <span className="st-tile-label">{children}</span>
    </button>
  );
}

export default function WorksheetStudioPage({ repository = worksheetDocsService, templates = worksheetTemplatesService, mediaBank = mediaBankService, speech = languageToolsService, resultsSource = homeworkService, backTo = '/library', backLabel = 'Õppevara', allowCopy = true, allowAssign = true, draftId = '', editorBase = '/library/worksheets', privateFor = '', renderTop = null, initialMode = 'edit' }) {
  const { lessonId } = useParams();
  const isNew = !lessonId || lessonId === 'new';
  const draftName = draftId || (isNew ? 'new' : lessonId);
  const { user } = useAuth();
  const navigate = useNavigate();
  // a draft handed over by another page (e.g. „Tee tööleht vigadest” in a lesson analysis): shown, not saved yet
  const handed = useLocation().state?.document || null;

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
  // the left drawer (blocks, bank, sheet, results) opens from the icon rail; a second click on the icon closes it
  const [leftOpen, setLeftOpen] = useState(true);
  // the selected block's content panel; closed with ×, opened again with „Sisu” on the block's bar
  const [panelOpen, setPanelOpen] = useState(true);
  // the selected block's settings float next to it (no fixed right column); the side can be switched
  // drag & drop (dnd-kit): what is dragged and where it would land (the lit line on the sheet)
  const [dragging, setDragging] = useState(null);
  const [dropHint, setDropHint] = useState(null);
  const sensors = useSensors(useSensor(SheetPointerSensor, { activationConstraint: { distance: 6 } }));
  const [popSide, setPopSide] = useState('right');
  // „Stiil” on the block's bar: a copied style can be pasted on other blocks
  const [copiedStyle, setCopiedStyle] = useState(null);
  // Floating UI: the panel sits beside the page at the height of the selected block (a virtual reference = the page's
  // left / right edges and the block's top / bottom), flips to the other side when there is no room, follows scrolling
  const { refs, floatingStyles, isPositioned } = useFloating({
    open: Boolean(selectedId),
    strategy: 'fixed',
    placement: popSide === 'right' ? 'right-start' : 'left-start',
    middleware: [
      offset(14),
      flip({ padding: 12 }),
      shift({ padding: 12, crossAxis: true }),
      size({ padding: 12, apply: ({ availableHeight, elements }) => { elements.floating.style.maxHeight = `${Math.max(260, Math.floor(availableHeight))}px`; } }),
    ],
    whileElementsMounted: autoUpdate,
  });
  useLayoutEffect(() => {
    const card = selectedId ? globalThis.document?.querySelector(`.ws-page [data-block="${selectedId}"]`) : null;
    if (!card) { refs.setPositionReference(null); return; }
    const page = card.closest('.ws-page') || card;
    refs.setPositionReference({
      contextElement: card,
      getBoundingClientRect: () => {
        const c = card.getBoundingClientRect();
        const p = page.getBoundingClientRect();
        return { x: p.left, y: c.top, left: p.left, right: p.right, top: c.top, bottom: c.bottom, width: p.width, height: c.height };
      },
    });
  }, [selectedId, doc?.blocks, mode]); // eslint-disable-line react-hooks/exhaustive-deps
  // hidden until placed, or it flashes in the top-left corner for a moment
  const popStyle = { ...floatingStyles, opacity: isPositioned ? 1 : 0 };
  const [cut, setCut] = useState({ busy: false, error: '' });
  const [history, setHistory] = useState(emptyHistory);
  const [baseUpdatedAt, setBaseUpdatedAt] = useState('');
  const [worksheetStatus, setWorksheetStatus] = useState('draft');
  const [version, setVersion] = useState(0);
  const [versions, setVersions] = useState([]);
  const [paletteQuery, setPaletteQuery] = useState('');
  const loadResults = useCallback((id) => resultsSource.listWorksheetResults(id), [resultsSource]);
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
  // the EKI level vocabularies for the didactic check, loaded lazily (≈290 kB)
  const [levelForms, setLevelForms] = useState(null);
  // only the vocabulary levels the sheet's level may use (A2: A1 + A2)
  const vocabularyLevels = (VOCABULARY_FOR[levelKey(doc?.meta?.level)] || []).join(',');
  useEffect(() => { let alive = true; loadLevelForms(vocabularyLevels ? vocabularyLevels.split(',') : []).then((forms) => { if (alive) setLevelForms(forms); }); return () => { alive = false; }; }, [vocabularyLevels]);
  // a notice is a short message in the corner that goes away by itself
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(''), 6500);
    return () => clearTimeout(timer);
  }, [notice]);
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
      if (handed?.schema === fresh.schema && Array.isArray(handed.blocks)) {
        setDoc(handed); setDirty(true); setDraftRestored(false); setSource('new'); setGeneration(null);
        setNotice('Mustand on valmis. Kontrolli laused üle, siis salvesta ja määra õpilasele.');
        return undefined;
      }
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
  }, [isNew, lessonId, draftName, navigate, repository, handed]);

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
    // Estonian voices (TartuNLP Neurokõne) for listening, dialogue and reading blocks
    ...(speech?.speak ? { speak: (request) => speech.speak(request) } : {}),
  }), [repository, docMeta, speech]); // eslint-disable-line react-hooks/exhaustive-deps

  const palette = useMemo(() => { const all = paletteEntries(); return GROUPS.map((g) => [g, all.filter((b) => b.group === g)]); }, []);
  const filteredPalette = useMemo(() => palette.map(([group, defs]) => [group, defs.filter((def) => !paletteQuery.trim() || `${def.label} ${def.hint || ''} ${def.group}`.toLocaleLowerCase('et').includes(paletteQuery.trim().toLocaleLowerCase('et')))]).filter(([, defs]) => defs.length), [palette, paletteQuery]);
  const quality = useMemo(() => analyzeWorksheet(doc || newDocument(), { forms: levelForms }), [doc, levelForms]);

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
  // the free layer of a block: arrows, callouts, free text, stickers, rings (engine/marksModel.js)
  const setMarks = (id, marks) => {
    const block = doc.blocks.find((b) => b.id === id);
    if (block) updateBlock({ ...block, marks });
  };
  const addMarkTo = (id, kind) => {
    const block = doc.blocks.find((b) => b.id === id);
    if (!block) return;
    const { block: next, mark } = addMark(block, kind);
    if (mark) { updateBlock(next); setSelectedId(id); }
  };
  // „Tulemused”: learners' results of this sheet; a common „wrong” answer can become a right one
  const addRightAnswer = (blockId, key, answer) => {
    const block = doc.blocks.find((b) => b.id === blockId);
    if (block) { updateBlock(addAlternative(block, key, answer)); setSelectedId(blockId); }
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
    setPanelOpen(true);
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
  const dropMove = (fromId, toId, side = 'before') => setBlocks(dropAt(doc.blocks, fromId, toId, side));
  // a block dragged from the palette lands where the lit line shows
  const dropNew = (type, toId, side = 'after') => {
    if (!isPaletteKey(type)) return;
    const b = createBlock(type);
    setBlocks(insertAt(doc.blocks, [b], toId, side));
    setSelectedId(b.id);
    setPanelOpen(true);
  };
  const dragStart = ({ active }) => { setDragging(active.data.current || null); setSelectedId(null); };
  const dragMove = ({ active, over, delta, activatorEvent }) => {
    const pointer = { x: (activatorEvent?.clientX || 0) + delta.x, y: (activatorEvent?.clientY || 0) + delta.y };
    const next = hintFor({ active: active.data.current, over: over ? { ...over.data.current, rect: over.rect } : null, pointer, dropSide });
    if (next?.id !== dropHint?.id || next?.side !== dropHint?.side) setDropHint(next);
  };
  const dragEnd = ({ active, over }) => {
    const action = dropAction({ active: active.data.current, overKind: over?.data.current?.kind, hint: dropHint });
    setDragging(null); setDropHint(null);
    if (action?.op === 'new') dropNew(action.type, action.toId, action.side);
    if (action?.op === 'move') dropMove(action.fromId, action.toId, action.side);
  };
  const dragCancel = () => { setDragging(null); setDropHint(null); };
  const dragLabel = dragging?.kind === 'new'
    ? (paletteLabel(dragging.type) || 'Plokk')
    : (() => { const b = doc?.blocks.find((x) => x.id === dragging?.id); return b ? (b.data?.title || BLOCKS[b.type]?.label || 'Plokk') : ''; })();
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
    setLeftTab('blocks');
    setLeftOpen(true);
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
        <BlockLookMenus block={block} update={updateBlock} onOpen={() => setSelectedId(block.id)} copiedStyle={copiedStyle}
          onCopyStyle={() => { setCopiedStyle(styleOf(block)); setNotice('Stiil kopeeritud. Vali teine plokk → Stiil → Kleebi stiil.'); }}
          onStyleAll={() => { setBlocks(styleSameType(doc.blocks, block)); setNotice(`Sama stiil kõigil „${BLOCKS[block.type]?.label || 'sama tüüpi'}” plokkidel.`); }} />
        <span className="ws-bar-sep" aria-hidden="true" />
        <button type="button" onClick={() => { setSelectedId(block.id); setPanelOpen(true); }} title="Ploki sisu ja ülesande seaded"><Icons.SlidersHorizontal aria-hidden="true" /> Sisu</button>
        <button type="button" onClick={() => duplicateBlock(block.id)} title="Kopeeri (Ctrl+D)" aria-label="Kopeeri"><Icons.Copy aria-hidden="true" /></button>
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
        <BarMenu ariaLabel="Joonista" title="Nool, mull, tekst, kleebis või ring lehe peale" icon={<Icons.PenTool aria-hidden="true" />} onOpen={() => setSelectedId(block.id)}>
          {(close) => MARK_KINDS.map(([kind, label, icon]) => { const Ico = Icons[icon] || Icons.Plus; return <button key={kind} type="button" role="menuitem" className="ws-bm-item" onClick={() => { addMarkTo(block.id, kind); close(); }}><Ico aria-hidden="true" /> {label}</button>; })}
        </BarMenu>
        {templates ? <button type="button" onClick={() => saveTemplate(block)} title="Salvesta see plokk mallina" aria-label="Mall"><Icons.BookmarkPlus aria-hidden="true" /></button> : null}
        <button type="button" onClick={() => moveBlock(block.id, -1)} disabled={index <= 0} title="Üles (Alt+↑)" aria-label="Liiguta üles"><Icons.ArrowUp aria-hidden="true" /></button>
        <button type="button" onClick={() => moveBlock(block.id, 1)} disabled={index >= doc.blocks.length - 1} title="Alla (Alt+↓)" aria-label="Liiguta alla"><Icons.ArrowDown aria-hidden="true" /></button>
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
  // „Toetav” / „Väljakutse”: an easier or harder copy of this sheet (engine/variants.js), saved as a new draft
  const saveVariant = async (level) => {
    closeMenu(); setSaving(true); setSaveError('');
    try {
      const { doc: variantDoc } = makeVariant({ ...doc, id: isNew ? '' : lessonId }, level);
      const res = await repository.save({ lessonId: '', document: variantDoc, user, status: 'draft' });
      navigate(`${editorBase}/${res.id}`);
    } catch (error) { setSaveError(error.message || 'Versiooni loomine ebaõnnestus.'); }
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

  const statusText = saving ? 'salvestan…' : dirty ? 'salvestamata' : savedAt ? `salvestatud ${new Date(savedAt).toLocaleTimeString('et-EE', { hour: '2-digit', minute: '2-digit' })}` : worksheetStatus === 'published' ? 'avaldatud' : 'mustand';
  const showResults = !isNew && typeof resultsSource?.listWorksheetResults === 'function';
  // the icon rail: one click opens the drawer on that tab, a click on the open tab closes it
  const railTabs = [
    ['blocks', 'Plokid', Icons.LayoutGrid],
    ['bank', 'Pank', Icons.Images],
    ['text', 'Tekstist', Icons.WandSparkles],
    ['sheet', 'Leht', Icons.FileText],
    ...(showResults ? [['results', 'Tulemused', Icons.ChartColumn]] : []),
    ...(original.length > 0 ? [['original', 'Originaal', Icons.ScanLine]] : []),
  ];
  const pickTab = (key) => { if (leftTab === key && leftOpen) setLeftOpen(false); else { setLeftTab(key); setLeftOpen(true); } };

  return (
    <AssetContext.Provider value={assets}>
      <div className={`ws-studio st-skin mode-${mode} ${focus ? 'is-focus' : ''}`}>
        <header className="st-bar">
          <Link className="st-back" to={backTo} title={backTo.startsWith('/library/lessons/') ? 'Tunni töölehed' : backLabel} aria-label={backTo.startsWith('/library/lessons/') ? 'Tunni töölehed' : backLabel}><Icons.ArrowLeft size={18} aria-hidden="true" /></Link>
          <div className="st-title"><span className="st-kicker">Töölehe konstruktor</span><b title={doc.meta.title}>{doc.meta.title}</b><span className={`st-status ${dirty ? 'is-dirty' : ''}`}>{statusText}{version ? ` · v${version}` : ''}</span></div>
          <div className="st-seg" role="tablist" aria-label="Vaade">
            {[['edit', 'Koosta', Icons.PenLine], ['interactive', 'Õpilase vaade', Icons.MonitorSmartphone], ['print', 'Trükivaade', Icons.Printer]].map(([m, l, Ico]) => (
              <button type="button" role="tab" key={m} aria-pressed={mode === m} onClick={() => switchMode(m)}><Ico size={15} aria-hidden="true" /><span>{l}</span></button>
            ))}
          </div>
          <div className="st-actions">
            {/* in the student or print view the way back to editing is one clear button */}
            {mode !== 'edit' && <button type="button" className="st-btn st-edit" onClick={() => switchMode('edit')}><Icons.PenLine size={16} aria-hidden="true" /> Muuda lehte</button>}
            {mode === 'interactive' && <button type="button" className="st-btn primary" onClick={check}>Kontrolli vastuseid</button>}
            {mode === 'interactive' && <button type="button" className="st-btn" onClick={() => { setAnswers({}); setResults({}); setEvidence(null); }}>Tühjenda</button>}
            <details className={`st-quality ${quality.ready ? 'ready' : ''}`}>
              <summary className="st-chip" title="Kvaliteedikontroll">{quality.ready ? <Icons.CircleCheck size={15} aria-hidden="true" /> : <Icons.CircleAlert size={15} aria-hidden="true" />}<span>{quality.ready ? 'Avaldamiseks valmis' : `${quality.errors.length} viga · ${quality.warnings.length} hoiatust`}</span>{quality.tips.length ? <em>{quality.tips.length}</em> : null}</summary>
              <div className="st-quality-pop">
                <b>{quality.ready ? `Avaldamiseks valmis · versioon ${version || 'uus'} · ${worksheetStatus === 'published' ? 'avaldatud' : 'mustand'}` : 'Kvaliteedikontroll'}</b>
                {quality.didactics ? <p className="st-didactic"><span>Didaktika · tase {quality.didactics.label}</span><b>{quality.didactics.score}%</b><i style={{ width: `${quality.didactics.score}%` }} /></p> : null}
                {quality.minutes ? <p className="st-didactic"><span>Tööaeg · terve tund {SHEET_MINUTES.min}–{SHEET_MINUTES.max} min</span><b>≈ {quality.minutes} min</b><i style={{ width: `${Math.min(100, Math.round((quality.minutes / SHEET_MINUTES.min) * 100))}%` }} /></p> : null}
                {quality.issues.length ? <ul>{quality.issues.map((issue) => <li className={issue.level} key={issue.code}><button type="button" className="st-issue" onClick={() => showIssue(issue)}>{issue.text}</button></li>)}</ul> : <p>Kõik kohustuslikud kontrollid on läbitud.</p>}
              </div>
            </details>
            {mode === 'edit' && <span className="st-group-btns">
              <button type="button" className="st-btn st-icon" disabled={!history.past.length} onClick={undo} title="Võta tagasi (Ctrl+Z)" aria-label="Võta tagasi"><Icons.Undo2 size={16} /></button>
              <button type="button" className="st-btn st-icon" disabled={!history.future.length} onClick={redo} title="Tee uuesti (Ctrl+Shift+Z)" aria-label="Tee uuesti"><Icons.Redo2 size={16} /></button>
            </span>}
            <details className="st-more" ref={menuRef}>
              <summary className="st-btn">Fail <Icons.ChevronDown size={14} aria-hidden="true" /></summary>
              <div className="st-menu">
                <button type="button" onClick={() => { closeMenu(); switchMode('print'); setTimeout(() => window.print(), 300); }}><Icons.Printer size={15} aria-hidden="true" /> PDF / Prindi</button>
                <button type="button" onClick={loadSample}>Laadi näidisleht „Minu päev”</button>
                <button type="button" onClick={loadFormalLetter}>Mall „Kiri linnavalitsusele”</button>
                {allowCopy ? <button type="button" onClick={saveCopy}>Tee töölehest koopia</button> : null}
                {allowCopy ? Object.entries(VARIANTS).map(([level, v]) => <button key={level} type="button" onClick={() => saveVariant(level)} title={v.hint}>{level === 'support' ? 'Tee lihtsam versioon (toetav)' : 'Tee raskem versioon (väljakutse)'}</button>) : null}
                {!isNew && <button type="button" onClick={loadVersions}>Versioonid ja taastamine…</button>}
                <button type="button" onClick={exportJson}>Salvesta faili (JSON)</button>
                <button type="button" onClick={() => { closeMenu(); fileRef.current?.click(); }}>Ava failist…</button>
              </div>
            </details>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => { if (e.target.files?.[0]) importJson(e.target.files[0]); e.target.value = ''; }} />
            <button type="button" className="st-btn st-icon" onClick={toggleFocus} aria-pressed={focus} title={focus ? 'Näita CRM-i menüüd' : 'Konstruktor kogu aknas'} aria-label={focus ? 'Näita menüüd' : 'Täisekraan'}>{focus ? <Icons.Minimize2 size={16} aria-hidden="true" /> : <Icons.Maximize2 size={16} aria-hidden="true" />}</button>
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
        {doc?.meta?.variant && VARIANTS[doc.meta.variant] ? <div className={`st-banner st-variant is-${doc.meta.variant}`} role="note"><b>{VARIANTS[doc.meta.variant].label}</b>{doc.meta.variantOf ? <> lehest <Link to={`${editorBase}/${doc.meta.variantOf}`}>algne leht</Link></> : null}{doc.meta.variantChanges?.length ? <span>: {doc.meta.variantChanges.join(' · ')}.</span> : null} Vaata üle ja salvesta.</div> : null}
        {saveError && <div className="st-banner error" role="alert">{saveError}</div>}
        {draftRestored && <div className="st-banner st-draft-note" role="status"><span>Taastasin selles brauseris automaatselt salvestatud mustandi.</span><button type="button" className="st-btn" onClick={() => { try { window.localStorage.removeItem(draftKey(draftName)); } catch { /* ignore */ } window.location.reload(); }}>Loobu mustandist</button></div>}
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

        <DndContext sensors={sensors} collisionDetection={collide} onDragStart={dragStart} onDragMove={dragMove} onDragEnd={dragEnd} onDragCancel={dragCancel} autoScroll={{ threshold: { x: 0, y: 0.18 }, acceleration: 14 }}>
        <div className="st-body">
          {mode === 'edit' && (
            <nav className="st-rail" role="tablist" aria-label="Tööriistad">
              {railTabs.map(([key, label, Ico]) => (
                <button type="button" role="tab" key={key} aria-pressed={leftOpen && leftTab === key} onClick={() => pickTab(key)} title={label}><Ico size={20} aria-hidden="true" /><span>{label}</span></button>
              ))}
            </nav>
          )}
          {mode === 'edit' && leftOpen && (
            <aside className={`st-palette ${leftTab === 'original' ? 'is-original' : ''}`} aria-label="Plokid">
              {leftTab === 'results' && !isNew ? <InsightsPanel lessonId={lessonId} doc={doc} load={loadResults} onSelect={(id) => setSelectedId(id)} onAddAlternative={addRightAnswer} />
              : leftTab === 'text' ? <TextToTasks onInsert={(blocks) => { insertBlocks(blocks); setNotice(`Tekstist lisati ${blocks.length} ülesannet. Vaata need üle.`); }} />
              : leftTab === 'sheet' ? <div className="st-sheetpanel"><SheetInspector doc={doc} setMeta={(patch) => change({ ...doc, meta: { ...doc.meta, ...patch } })} /></div>
              : leftTab === 'bank' ? <MediaBankPanel level={doc?.meta?.level || ''} service={mediaBank} isAdmin={Boolean(user?.roles?.includes?.('admin'))}
                onImage={pickBankImage} onText={pickBankText} onWebImage={pickWebImage}
                onIndex={(onProgress) => mediaBank.indexCurriculum({ library: libraryService, lessonWorksheets: lessonWorksheetsService, user, onProgress })} />
              : leftTab === 'original' && original.length > 0 ? <OriginalPanel files={original} onCut={cutPhoto} busy={cut.busy} error={cut.error} /> : <><div className="st-palette-search"><input ref={searchRef} className="ed-input" type="search" value={paletteQuery} onChange={(e) => setPaletteQuery(e.target.value)} placeholder="Otsi plokki…" aria-label="Otsi plokki" /></div><p className="st-palette-hint" title="Kiirklahvid: Ctrl+S salvesta, Ctrl+D kopeeri, Alt+↑/↓ liiguta, ↑/↓ vali, Delete kustuta, Esc."><Icons.MousePointerClick size={14} aria-hidden="true" /> Lohista plokk lehele. Topeltklõps lehel muudab teksti.</p>{myTemplates.length ? (
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
                  <div className="st-tiles">
                    {defs.map((d) => {
                      const Ico = Icons[d.icon] || Icons.Square;
                      return (
                        <PaletteItem key={d.key} id={d.key} theme={doc.meta.theme || ''} onClick={() => addBlock(d.key)} title={d.hint ? `${d.hint} — klõpsa või lohista lehele` : 'Klõpsa või lohista lehele'}>
                          <Ico size={14} aria-hidden="true" /><span>{d.label}</span>
                        </PaletteItem>
                      );
                    })}
                  </div>
                </div>
              ))}</>}
            </aside>
          )}

          <main className="st-canvas" ref={canvasRef}>
            <div className="st-zoom" style={{ zoom: scale }}>
              <Sheet doc={doc} mode={mode} answers={answers} setAnswer={setAnswer} results={results} selectedId={selectedId} onSelect={setSelectedId} dnd dropHint={dropHint} onResize={resizeBlock} onAddItem={addItemTo} onMarks={setMarks} onEditText={editText} renderToolbar={renderToolbar} onInsertAfter={insertAfter} />
            </div>
            {evidence && <GoalEvidence doc={doc} evidence={evidence} />}
          </main>

          {mode === 'edit' && (
            selected && panelOpen ? <aside ref={refs.setFloating} className={`st-inspector is-floating is-${popSide}`} aria-label="Seaded" style={popStyle} onClick={(e) => e.stopPropagation()}>
              <div className="st-pop-head"><b>{BLOCKS[selected.type]?.label || 'Plokk'}</b>
                <button type="button" className="ed-btn" onClick={() => setPopSide(popSide === 'right' ? 'left' : 'right')} title="Vii paneel teisele poole" aria-label="Vii paneel teisele poole"><Icons.ArrowLeftRight size={15} aria-hidden="true" /></button>
                <button type="button" className="ed-btn" onClick={() => setPanelOpen(false)} aria-label="Sulge seaded"><Icons.X size={15} aria-hidden="true" /></button>
              </div>
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
              ) : null}
            </aside> : null
          )}
        </div>
        <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' }}>
          {dragging ? <div className="st-drag-ghost"><Icons.GripVertical size={16} aria-hidden="true" /><span>{dragLabel}</span></div> : null}
        </DragOverlay>
        </DndContext>
        {notice && <div className="st-banner ok st-toast" role="status"><Icons.CircleCheck size={16} aria-hidden="true" />{notice}<button type="button" onClick={() => setNotice('')} aria-label="Sulge teade"><Icons.X size={14} aria-hidden="true" /></button></div>}
      </div>
    </AssetContext.Provider>
  );
}
