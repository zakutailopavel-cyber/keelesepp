/* global ResizeObserver, IntersectionObserver, Blob, setTimeout, clearTimeout, structuredClone */
import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { lazyComponent } from '../../app/lazyComponent.js';
import { autoUpdate, flip, offset, shift, size, useFloating } from '@floating-ui/react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Icons } from './icons.js';
import { askConfirm, askText } from '../../components/ui/ConfirmHost.jsx';
import { useAuth } from '../../app/AuthContext.jsx';
import { homeworkService } from '../../services/firebase/homework.js';
import { lessonWorksheetsService } from '../../services/firebase/lessonWorksheets.js';
import { libraryService } from '../../services/firebase/library.js';
import { sheetReuseService } from '../../services/firebase/sheetReuse.js';
import { worksheetDocsService } from '../../services/firebase/worksheetDocs.js';
import { worksheetSheetTemplatesService } from '../../services/firebase/worksheetSheetTemplates.js';
import { worksheetTemplatesService } from '../../services/firebase/worksheetTemplates.js';
import { mediaBankService } from '../../services/firebase/mediaBank.js';
import { languageToolsService } from '../../services/firebase/languageTools.js';
import MediaBankPanel from './MediaBankPanel.jsx';
import AnswerKeyView from './AnswerKeyView.jsx';
// „Kogu” reads the whole course: its own chunk, loaded when the tab opens
const BlockLibraryPanel = lazyComponent(() => import('./BlockLibraryPanel.jsx'));
import { assetKey, gapsFromText, mediaAsset, tagsOf, vocabFromText, wordOrderFromText } from './mediaBank.js';
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
// „Suur tekst” draws the sheet as the phone / tablet column
import './engine/sheetFlow.css';
import './worksheetStudio.css';
import { addItem } from './engine/addItem.js';
import { KIND_LABEL as FREE_KIND_LABEL, MAX_ITEMS as MAX_FREE, CLIP_KEY as FREE_CLIP_KEY, PRESET_KEYS as FREE_PRESETS, PRESET_LABEL as FREE_PRESET_LABEL, presetItems, PAGE_W as FREE_PAGE_W, alignMany, clipOf, copyToPages, pasteClip, freeItemsOf, itemsInFrame, moveItem, moveMany, newFreeItem, restack, restackMany, spreadMany } from './engine/freeLayer.js';
import FreeFields, { FreeGroupFields } from './editor/FreeFields.jsx';
import { FIGURE_TEXT, MAX_FIGURES, figureParagraphs, figuresOf, figuresPatch, newFigure } from './engine/figureFloat.js';
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
import { CopyMoveDialog, TemplateDialog } from './editor/ReuseDialogs.jsx';
import { applyLessonTemplate, applySheetTemplate, lessonTemplatePlan, PHASE_SHEETS, phaseLabel } from './sheetReuse.js';
import { LoadingState } from '../../components/ui/index.js';
import { TABLET_QUERY, initialColumnView, rememberColumnView, screenMatches, useKeyboardSafeArea } from './editor/touchEditing.js';

// „Uus mallist”: the hard-coded sheets stay available next to the templates staff saved
const BUILT_IN_TEMPLATES = [
  { id: 'builtin:letter', title: 'Kiri linnavalitsusele', make: formalLetterDocument },
  { id: 'builtin:sample', title: 'Minu päev (näidisleht)', make: sampleDocument },
];

const DEFAULT_TITLE = newDocument().meta.title;


const MM = 3.7795;
// the blocks whose editor has a sound (AudioPick): a sound from the bank goes into the selected one
// the studio is a staff page: the text of a listening task opens with „Näita teksti” (not while editing)
const STAFF_TRANSCRIPTS = { role: 'staff' };
const AUDIO_BLOCKS = new Set(['listening', 'dialogue', 'reading', 'examlisten']);
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

export default function WorksheetStudioPage({ repository = worksheetDocsService, templates = worksheetTemplatesService, sheetTemplates = worksheetSheetTemplatesService, reuse = sheetReuseService, lessonSheets = lessonWorksheetsService, mediaBank = mediaBankService, speech = languageToolsService, resultsSource = homeworkService, backTo = '/library', backLabel = 'Õppevara', allowCopy = true, allowAssign = true, draftId = '', editorBase = '/library/worksheets', privateFor = '', renderTop = null, initialMode = 'edit', publishLock = null }) {
  // worksheetId: the lesson's Avasta / Harjuta / Kasuta sheet (/library/lessons/:lessonId/worksheets/:worksheetId)
  const { lessonId, worksheetId } = useParams();
  const isNew = !lessonId || lessonId === 'new';
  const draftName = draftId || (isNew ? 'new' : lessonId);
  const { user } = useAuth();
  const navigate = useNavigate();
  // a draft handed over by another page (e.g. „Tee tööleht vigadest” in a lesson analysis): shown, not saved yet
  const location = useLocation();
  const handed = location.state?.document || null;
  // „?plokk=<blockId>” (right-click „Muuda ülesannet” on a task, e.g. in the Õpik): that block opens selected in edit mode
  const focusBlockId = new globalThis.URLSearchParams(location.search).get('plokk') || '';
  const focusedBlock = useRef('');

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
  // „Vaba kiht” (Õpik only): the selected free item of the page (engine/freeLayer.js); a block and a free item are
  // never selected at the same time
  const [selectedFreeId, setSelectedFreeId] = useState(null);
  // more free items selected with it (Shift / Ctrl + tap, or „Vali mitu” on a touch screen)
  const [extraFreeIds, setExtraFreeIds] = useState([]);
  const [multiTap, setMultiTap] = useState(false);
  // „Muuda tausta”: the back layer (items behind the blocks) comes over the blocks to be moved and sized
  const [backFront, setBackFront] = useState(false);
  // how many free items wait on the free-layer clipboard (kept in the browser, shared by all lessons)
  const [clipCount, setClipCount] = useState(() => { try { return JSON.parse(globalThis.localStorage?.getItem(FREE_CLIP_KEY) || '[]').length || 0; } catch { return 0; } });
  const [pageCount, setPageCount] = useState(1);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [evidence, setEvidence] = useState(null);
  const [scale, setScale] = useState(1);
  const [original, setOriginal] = useState([]);
  const [leftTab, setLeftTab] = useState('blocks');
  // the left drawer (blocks, bank, sheet, results) opens from the icon rail; a second click on the icon closes it
  // on a tablet it starts closed, so the page gets the screen's width (editor/touchEditing.js)
  const [leftOpen, setLeftOpen] = useState(() => !screenMatches(TABLET_QUERY));
  // „Suur tekst”: edit the sheet as one column at its real text size (a tablet) instead of the shrunken A4 page
  const [column, setColumn] = useState(initialColumnView);
  const toggleColumn = () => setColumn((value) => { rememberColumnView(!value); return !value; });
  const studioRef = useRef(null);
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
    open: Boolean(selectedId || selectedFreeId),
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
    const card = selectedId ? globalThis.document?.querySelector(`.ws-page [data-block="${selectedId}"]`)
      : selectedFreeId ? globalThis.document?.querySelector(`.ws-page [data-free="${selectedFreeId}"]`) : null;
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
  }, [selectedId, selectedFreeId, doc?.blocks, doc?.free, mode]); // eslint-disable-line react-hooks/exhaustive-deps
  // a tablet: the block's settings open as a sheet over the lower half of the screen — a block tapped there moves up
  useEffect(() => {
    if (!selectedId || !panelOpen || mode !== 'edit' || !screenMatches(TABLET_QUERY)) return;
    const id = globalThis.CSS?.escape ? globalThis.CSS.escape(selectedId) : selectedId;
    const card = globalThis.document?.querySelector(`.st-canvas [data-block="${id}"]`);
    if (card && card.getBoundingClientRect().top > (globalThis.innerHeight || 0) * 0.42) card.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
  }, [selectedId, panelOpen, mode]);
  // hidden until placed, or it flashes in the top-left corner for a moment
  const popStyle = { ...floatingStyles, opacity: isPositioned ? 1 : 0 };
  const [cut, setCut] = useState({ busy: false, error: '' });
  const [history, setHistory] = useState(emptyHistory);
  const [baseUpdatedAt, setBaseUpdatedAt] = useState('');
  const [worksheetStatus, setWorksheetStatus] = useState('draft');
  const [version, setVersion] = useState(0);
  const [versions, setVersions] = useState([]);
  const [paletteQuery, setPaletteQuery] = useState('');
  const scopeResultsTo = user?.roles?.includes?.('admin') ? '' : (user?.uid || '');
  const loadResults = useCallback((id) => resultsSource.listWorksheetResults(id, scopeResultsTo ? { scopeTeacherUid: scopeResultsTo } : {}), [resultsSource, scopeResultsTo]);
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
  // „Kopeeri / Teisalda…” (the block) and „Uus mallist” dialogs
  const [copying, setCopying] = useState(null);
  const [pickTemplate, setPickTemplate] = useState(false);
  // focus mode: the constructor takes the whole window (CRM menu and top bar hidden); remembered in this browser
  const [focus, setFocus] = useState(() => { try { return window.localStorage.getItem('ks-studio-focus') !== 'off'; } catch { return true; } });
  const toggleFocus = () => setFocus((value) => { try { window.localStorage.setItem('ks-studio-focus', value ? 'off' : 'on'); } catch { /* storage may be disabled */ } return !value; });
  useUnsavedGuard(dirty);
  useKeyboardSafeArea(studioRef, doc !== null);
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
    // the canvas's own side padding is left free, or the page runs a few px past it and the canvas scrolls sideways
    const fit = () => {
      const css = globalThis.getComputedStyle?.(el);
      const sides = css ? (parseFloat(css.paddingLeft) || 0) + (parseFloat(css.paddingRight) || 0) : 0;
      setScale(Math.max(0.3, Math.min(1, (el.clientWidth - Math.max(32, sides + 4)) / (270 * MM))));
    };
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
  // and so does every sound (uploaded, recorded, made by the Estonian voice) and every uploaded video
  const bankMedia = (kind, item) => {
    if (!item?.src || !mediaBank?.save) return;
    Promise.resolve().then(() => mediaBank.save({
      ...mediaAsset(kind, item, { tags: [doc?.meta?.title || '', doc?.meta?.module || ''] }),
      // VoiceRecorder names its files „haal-…”, SpeakPanel „neurokone-…”
      source: /^haal-/.test(item.name || '') ? 'recording' : /^neurokone-/.test(item.name || '') ? 'tts' : 'upload', level: doc?.meta?.level || '', topic: doc?.meta?.title || '', sheetTitle: doc?.meta?.title || '',
    }, user)).catch(() => {});
  };
  const docMeta = doc?.meta;
  const assets = useMemo(() => ({
    image: async (file) => { const img = await repository.uploadImage(file); bankImage(img, { name: file?.name }); return img; },
    audio: async (file) => { const audio = await repository.uploadAudio(file); bankMedia('audio', audio); return audio; },
    ...(repository.uploadVideo ? { video: async (file) => { const video = await repository.uploadVideo(file); bankMedia('video', video); return video; } } : {}),
    // Estonian voices (TartuNLP Neurokõne) for listening, dialogue and reading blocks
    ...(speech?.speak ? { speak: (request) => speech.speak(request) } : {}),
  }), [repository, docMeta, speech]); // eslint-disable-line react-hooks/exhaustive-deps

  const palette = useMemo(() => { const all = paletteEntries(); return GROUPS.map((g) => [g, all.filter((b) => b.group === g)]); }, []);
  const filteredPalette = useMemo(() => palette.map(([group, defs]) => [group, defs.filter((def) => !paletteQuery.trim() || `${def.label} ${def.hint || ''} ${def.group}`.toLocaleLowerCase('et').includes(paletteQuery.trim().toLocaleLowerCase('et')))]).filter(([, defs]) => defs.length), [palette, paletteQuery]);
  const quality = useMemo(() => analyzeWorksheet(doc || newDocument(), { forms: levelForms }), [doc, levelForms]);

  useEffect(() => {
    if (!doc || !focusBlockId || focusedBlock.current === focusBlockId) return undefined;
    focusedBlock.current = focusBlockId;
    if (!doc.blocks.some((b) => b.id === focusBlockId)) return undefined;
    setMode('edit');
    setSelectedId(focusBlockId);
    globalThis.setTimeout(() => {
      const id = globalThis.CSS?.escape ? globalThis.CSS.escape(focusBlockId) : focusBlockId;
      document.querySelector(`.ws-page [data-block="${id}"]`)?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    }, 60);
    return undefined;
  }, [doc, focusBlockId]);

  if (loadError) return <div className="page-content"><div className="ws-studio-error" role="alert">{loadError} <Link to={backTo}>Tagasi: {backLabel}</Link></div></div>;
  if (!doc) return <div className="page-content"><LoadingState label="Laen töölehte…" /></div>;

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
    if (!(step.doc.free || []).some((f) => f?.id === selectedFreeId)) clearFree();
    else setExtraFreeIds(extraFreeIds.filter((id) => (step.doc.free || []).some((f) => f?.id === id)));
  };
  const redo = () => {
    const step = redoHistory(history, doc);
    if (!step) return;
    lastPush.current = 0;
    setDoc(step.doc); setHistory(step.history); setDirty(true); setNotice('');
    if (!step.doc.blocks.some((b) => b.id === selectedId)) setSelectedId(null);
    if (!(step.doc.free || []).some((f) => f?.id === selectedFreeId)) clearFree();
    else setExtraFreeIds(extraFreeIds.filter((id) => (step.doc.free || []).some((f) => f?.id === id)));
  };
  const closeMenu = () => { if (menuRef.current) menuRef.current.open = false; };
  const setBlocks = (blocks) => change({ ...doc, blocks });
  const selected = doc.blocks.find((b) => b.id === selectedId);
  const updateBlock = (nb) => setBlocks(doc.blocks.map((b) => (b.id === nb.id ? nb : b)));
  // the free layer (Õpik): add / change / restack / copy / delete; every change is one undoable change of doc.free
  const freeItems = freeItemsOf(doc);
  const selectedFree = freeItems.find((item) => item.id === selectedFreeId) || null;
  const canFree = worksheetId === 'opik' || freeItems.length > 0;
  const setFree = (items) => change({ ...doc, free: items.length ? items : null });
  const freeSel = selectedFreeId ? [selectedFreeId, ...extraFreeIds.filter((id) => id !== selectedFreeId && freeItems.some((it) => it.id === id))] : [];
  const freeGroup = freeSel.length > 1 ? freeItems.filter((it) => freeSel.includes(it.id)) : [];
  function clearFree() { setSelectedFreeId(null); setExtraFreeIds([]); }
  const selectBlock = (id) => { setSelectedId(id); if (id) clearFree(); };
  // `additive`: add the item to the selection, or take it out if it is in
  const selectFree = (id, additive = false) => {
    setSelectedId(null); setPanelOpen(true);
    if (additive && selectedFreeId) {
      if (freeSel.includes(id)) { const rest = freeSel.filter((x) => x !== id); setSelectedFreeId(rest[0] || null); setExtraFreeIds(rest.slice(1)); }
      else setExtraFreeIds([...freeSel.slice(1), id]);
      return;
    }
    setSelectedFreeId(id); setExtraFreeIds([]);
  };
  // Selection frame (2026-11-14): Shift + drag on the page (or any drag with „Vali mitu” on, or a drag that starts on
  // the bare page) draws a frame; every free item of that page it touches joins the selection.
  const startFrame = (event) => {
    if (mode !== 'edit' || !canFree || event.button > 0 || isTextTarget(event.target)) return;
    const page = event.target.closest?.('.ws-page');
    if (!page || event.target.closest('[data-free], button, a, input, select, textarea, [contenteditable="true"]')) return;
    if (!(event.shiftKey || multiTap || event.target === page)) return;
    event.preventDefault(); event.stopPropagation();
    const pages = [...(canvasRef.current?.querySelectorAll('.ws-page') || [])];
    const pageIndex = pages.indexOf(page);
    const rect = page.getBoundingClientRect();
    const perPx = FREE_PAGE_W / Math.max(1, rect.width);
    const at = (e) => ({ x: (e.clientX - rect.left) * perPx, y: (e.clientY - rect.top) * perPx });
    const start = at(event);
    const band = globalThis.document.createElement('div');
    band.className = 'ws-free-band';
    page.appendChild(band);
    const draw = (end) => Object.assign(band.style, { left: `${Math.min(start.x, end.x)}mm`, top: `${Math.min(start.y, end.y)}mm`, width: `${Math.abs(end.x - start.x)}mm`, height: `${Math.abs(end.y - start.y)}mm` });
    draw(start);
    const onMove = (e) => draw(at(e));
    const onUp = (e) => {
      globalThis.removeEventListener('pointermove', onMove);
      globalThis.removeEventListener('pointerup', onUp);
      globalThis.removeEventListener('pointercancel', onUp);
      band.remove();
      if (e.type !== 'pointerup') return;
      const end = at(e);
      if (Math.abs(end.x - start.x) + Math.abs(end.y - start.y) < 2) return; // a tap, not a frame
      const caught = itemsInFrame(freeItems, pageIndex, pages.length, { x0: start.x, y0: start.y, x1: end.x, y1: end.y });
      if (!caught.length) return;
      const all = [...freeSel, ...caught.filter((id) => !freeSel.includes(id))];
      setSelectedId(null); setPanelOpen(true);
      setSelectedFreeId(all[0]); setExtraFreeIds(all.slice(1));
    };
    globalThis.addEventListener('pointermove', onMove);
    globalThis.addEventListener('pointerup', onUp);
    globalThis.addEventListener('pointercancel', onUp);
  };
  const groupChange = (items) => { lastPush.current = 0; setFree(items); };
  const moveGroup = (dx, dy) => groupChange(moveMany(freeItems, freeSel, dx, dy));
  const alignGroup = (how) => groupChange(alignMany(freeItems, freeSel, how));
  const spreadGroup = (axis) => groupChange(spreadMany(freeItems, freeSel, axis));
  const restackGroup = (how) => groupChange(restackMany(freeItems, freeSel, how));
  const duplicateGroup = () => {
    if (freeItems.length + freeGroup.length > MAX_FREE) { setNotice(`Vabas kihis võib olla kuni ${MAX_FREE} elementi.`); return; }
    let top = Math.max(...freeItems.map((i) => i.z));
    const copies = [...freeGroup].sort((a, b) => a.z - b.z).map((it) => ({ ...moveItem(it, 6, 6), id: newFreeItem(it.kind).id, z: (top += 1), locked: false }));
    groupChange([...freeItems, ...copies]);
    lastPush.current = 0;
    setSelectedFreeId(copies[0].id); setExtraFreeIds(copies.slice(1).map((c) => c.id));
  };
  const deleteGroup = () => {
    const gone = freeGroup.filter((it) => !it.locked).map((it) => it.id);
    groupChange(freeItems.filter((it) => !gone.includes(it.id)));
    const kept = freeSel.filter((id) => !gone.includes(id));
    setSelectedFreeId(kept[0] || null); setExtraFreeIds(kept.slice(1));
  };
  const changeFree = (id, next) => { lastPush.current = 0; setFree(freeItems.map((item) => (item.id === id ? { ...item, ...next } : item))); };
  const patchFree = (patch) => selectedFree && setFree(freeItems.map((item) => (item.id === selectedFree.id ? { ...item, ...patch } : item)));
  // a new item goes on the page in the middle of the screen
  const pageInView = () => {
    const pages = [...(canvasRef.current?.querySelectorAll('.ws-page') || [])];
    const mid = (globalThis.innerHeight || 0) / 2;
    const index = pages.findIndex((page) => { const r = page.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; });
    return Math.max(0, index);
  };
  const addFree = (kind, patch = {}) => {
    if (freeItems.length >= MAX_FREE) { setNotice(`Vabas kihis võib olla kuni ${MAX_FREE} elementi.`); return; }
    const item = newFreeItem(kind, pageInView(), freeItems, patch);
    lastPush.current = 0;
    setFree([...freeItems, item]);
    lastPush.current = 0; // the next edit of it is its own undo step
    selectFree(item.id);
    setNotice('Lohista element lehel paika, suurus nurgast. Plokid selle alt ei liigu.');
  };
  // copies on other pages of this sheet; the clipboard for another page or another lesson's Õpik
  const selectMany = (ids) => { if (!ids.length) return; setSelectedId(null); setPanelOpen(true); setSelectedFreeId(ids[0]); setExtraFreeIds(ids.slice(1)); };
  const copyFreeToPage = (to) => {
    const made = copyToPages(freeItems, freeSel, to, pageCount);
    if (!made.ids.length) { setNotice(`Vabas kihis võib olla kuni ${MAX_FREE} elementi.`); return; }
    groupChange(made.items);
    lastPush.current = 0;
    selectMany(made.ids);
    setNotice(`${made.ids.length === 1 ? 'Koopia on' : `${made.ids.length} koopiat on`} ${to === 'all' ? 'teistel lehtedel' : `${to + 1}. lehel`} samas kohas.${made.full ? ` Kõik ei mahtunud: kuni ${MAX_FREE} elementi.` : ''}`);
  };
  const clipFree = () => {
    const clip = clipOf(freeItems, freeSel);
    if (!clip.length) return;
    try { globalThis.localStorage?.setItem(FREE_CLIP_KEY, JSON.stringify(clip)); } catch { setNotice('Lõikelauale ei saanud kopeerida (brauser ei luba).'); return; }
    setClipCount(clip.length);
    setNotice(`${clip.length === 1 ? 'Element' : `${clip.length} elementi`} lõikelaual. Kleebi: vali leht ja vajuta „Kleebi” (või Ctrl+V) — ka teise tunni Õpikus.`);
  };
  const pasteFree = () => {
    let clip = [];
    try { clip = JSON.parse(globalThis.localStorage?.getItem(FREE_CLIP_KEY) || '[]'); } catch { clip = []; }
    if (!Array.isArray(clip) || !clip.length) { setNotice('Lõikelaud on tühi.'); return; }
    const made = pasteClip(freeItems, clip, pageInView());
    if (!made.ids.length) { setNotice(`Vabas kihis võib olla kuni ${MAX_FREE} elementi.`); return; }
    groupChange(made.items);
    lastPush.current = 0;
    selectMany(made.ids);
    setNotice(made.full ? `Kõik ei mahtunud: vabas kihis võib olla kuni ${MAX_FREE} elementi.` : 'Kleebitud lehele, mis on ekraani keskel.');
  };
  const duplicateFree = () => {
    if (!selectedFree || freeItems.length >= MAX_FREE) return;
    const copy = { ...moveItem(selectedFree, 6, 6), id: newFreeItem(selectedFree.kind).id, z: Math.max(...freeItems.map((i) => i.z)) + 1, locked: false };
    lastPush.current = 0;
    setFree([...freeItems, copy]);
    lastPush.current = 0;
    selectFree(copy.id);
  };
  const deleteFree = () => { if (!selectedFree) return; lastPush.current = 0; setFree(freeItems.filter((item) => item.id !== selectedFree.id)); clearFree(); };
  const restackFree = (how) => { if (!selectedFree) return; lastPush.current = 0; setFree(restack(freeItems, selectedFree.id, how)); };
  const addPreset = (key) => {
    const made = presetItems(key, pageInView(), freeItems);
    if (!made.length) { setNotice(`Vabas kihis võib olla kuni ${MAX_FREE} elementi.`); return; }
    groupChange([...freeItems, ...made]);
    lastPush.current = 0;
    selectMany(made.map((it) => it.id));
    setNotice('Kujundus on lehel ja valitud: lohista see paika, siis vali üks element ja muuda (pildil „Vaheta foto”, tekstil topeltklõps).');
  };
  const behindGroup = (on) => groupChange(freeItems.map((it) => (freeSel.includes(it.id) ? { ...it, behind: on } : it)));
  const freeEdit = { selectedId: selectedFreeId, selectedIds: freeSel, multi: multiTap, backFront, onSelect: selectFree, onChange: changeFree, onMoveMany: moveGroup };
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
  // a block's own data changed on the sheet (a picture in a text moved, resized or locked): one undo step
  const patchBlockData = (id, patch) => {
    const block = doc.blocks.find((b) => b.id === id);
    if (!block) return;
    lastPush.current = 0;
    updateBlock({ ...block, data: { ...block.data, ...patch } });
    setSelectedId(id);
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
  // blocks made elsewhere (template, lesson words, „Kogu”) go after the selected block, or to the end; the goals they
  // use come along when this sheet has no goal with that key
  const insertBlocks = (blocks, { goals = {} } = {}) => {
    if (!blocks.length) return;
    const fresh = blocks.map((b) => ({ ...structuredClone(b), id: newId() }));
    const at = selectedId ? doc.blocks.findIndex((x) => x.id === selectedId) + 1 : doc.blocks.length;
    const next = [...doc.blocks];
    next.splice(at, 0, ...fresh);
    const missing = Object.fromEntries(Object.entries(goals).filter(([key]) => !doc.meta?.goals?.[key] && fresh.some((b) => b.goal === key)));
    change({ ...doc, ...(Object.keys(missing).length ? { meta: { ...doc.meta, goals: { ...(doc.meta?.goals || {}), ...missing } } } : {}), blocks: next });
    setSelectedId(fresh[fresh.length - 1].id);
  };
  // „Kopeeri / Teisalda…” done: a move takes the block off this sheet and saves the draft (the copy is already saved)
  const copyDone = ({ mode: how, label }) => {
    const block = copying;
    setCopying(null);
    if (how !== 'move' || !block) { setNotice(`Ülesanne kopeeriti ${label} (mustand).`); return; }
    lastPush.current = 0;
    const next = { ...doc, blocks: doc.blocks.filter((b) => b.id !== block.id) };
    change(next);
    setSelectedId(null);
    setNotice(`Ülesanne teisaldati ${label} (mustand).${isNew ? ' Salvesta see leht, et see siit ka eemalduks.' : ''}`);
    if (!isNew) globalThis.setTimeout(() => saveRef.current?.('draft', { auto: true, document: next }), 0);
  };
  // „Uus mallist”: one sheet replaces this one in the editor (undoable); a lesson template also fills the empty phases
  const isLessonPage = Boolean(worksheetId) && !isNew;
  const takeSheetTemplate = async (templateDoc, title) => {
    if (doc.blocks.length && !(await askConfirm(`Mall „${title}” asendab selle lehe sisu. Jätkata? (Saad tagasi ka „Võta tagasi” nupuga.)`, { confirmLabel: 'Asenda' }))) return;
    setPickTemplate(false);
    lastPush.current = 0;
    change(applySheetTemplate(templateDoc, doc)); setSelectedId(null);
    setNotice(`Mall „${title}” on lehel. Vaata see üle ja salvesta.`);
  };
  const takeLessonTemplate = async (template) => {
    setSaveError('');
    try {
      const records = await lessonSheets.list(lessonId);
      const existing = Object.fromEntries(PHASE_SHEETS.map((p) => [p.id, records.find((r) => (r.worksheetId || r.id) === p.id) || null]));
      const plan = lessonTemplatePlan(template, existing, worksheetId);
      const current = plan.find((row) => row.action === 'current');
      const lines = plan.map((row) => `${row.label}: ${row.action === 'current' ? `see leht${doc.blocks.length ? ' (asendab sisu)' : ''}` : row.action === 'fill' ? 'uus mustand' : `jääb alles (${row.reason})`}`);
      if (!plan.some((row) => row.action !== 'skip')) { setSaveError('Mallis pole ühtegi lehte, mida saaks sellesse tundi panna: kõigil lehtedel on juba plokid.'); return; }
      if (!(await askConfirm(`Mall „${template.title}”:\n${lines.join('\n')}\n\nMidagi ei avaldata. Jätkata?`, { confirmLabel: 'Kasuta malli' }))) return;
      setPickTemplate(false);
      const { done, failed } = await applyLessonTemplate({ repository: lessonSheets, lessonId, plan, existing, user });
      reuse?.forget?.(lessonId);
      if (current) { lastPush.current = 0; change(applySheetTemplate(current.sheet.doc, doc)); setSelectedId(null); }
      setNotice(`Mall „${template.title}”: ${[current ? `${phaseLabel(worksheetId)} on redaktoris (salvesta)` : '', done.length ? `mustandina salvestati ${done.join(', ')}` : ''].filter(Boolean).join('; ')}.`);
      if (failed.length) setSaveError(`Mõnda lehte ei saanud salvestada: ${failed.join('; ')}`);
    } catch (error) {
      setSaveError(error.message || 'Malli ei saanud kasutada.');
    }
  };
  // „Salvesta mallina”: this sheet, or the whole lesson (the latest draft of each phase sheet, this one as in the editor)
  const saveSheetTemplate = async () => {
    closeMenu();
    const title = await askText('Malli nimi (näha kõigile õpetajatele):', { initial: doc.meta.title || 'Mall', title: 'Salvesta mallina' });
    if (!title) return;
    try {
      const created = await sheetTemplates.create({ kind: 'sheet', title, sheets: [{ phase: worksheetId || '', doc }], user });
      setNotice(`Leht salvestati mallina „${created.title}”. Leiad selle „Fail” → „Uus mallist…”.`);
    } catch (error) { setSaveError(error.message || 'Malli ei saanud salvestada.'); }
  };
  const saveLessonTemplate = async () => {
    closeMenu();
    try {
      const records = await lessonSheets.list(lessonId);
      const sheets = PHASE_SHEETS.map((p) => {
        if (p.id === worksheetId) return { phase: p.id, label: p.label, doc };
        const record = records.find((r) => (r.worksheetId || r.id) === p.id);
        return record?.worksheetDoc?.blocks?.length ? { phase: p.id, label: p.label, doc: record.worksheetDoc } : null;
      }).filter(Boolean);
      const title = await askText(`Tunni malli nimi (${sheets.map((x) => x.label).join(', ')}; näha kõigile õpetajatele):`, { initial: doc.meta.title || 'Tunni mall', title: 'Salvesta tunni mallina' });
      if (!title) return;
      const created = await sheetTemplates.create({ kind: 'lesson', title, sheets, user });
      setNotice(`Tund salvestati mallina „${created.title}” (${sheets.length} lehte).`);
    } catch (error) { setSaveError(error.message || 'Malli ei saanud salvestada.'); }
  };
  const saveTemplate = async (block) => {
    const title = await askText('Malli nimi (näha kõigile õpetajatele):', { initial: block.data?.title || BLOCKS[block.type]?.label || 'Mall', title: 'Salvesta mallina' });
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
    if (!(await askConfirm(`Kustuta mall „${template.title}”?`, { confirmLabel: 'Kustuta', danger: true }))) return;
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
  // a sound from the bank: into the selected block that has a sound, else a new listening block after it
  const pickBankAudio = (asset) => {
    const audio = { src: asset.src, storagePath: asset.storagePath || '', name: asset.title || asset.caption || '' };
    if (selected && AUDIO_BLOCKS.has(selected.type)) {
      updateBlock({ ...selected, data: { ...selected.data, audio } });
    } else {
      const b = createBlock('listening');
      b.data = { ...b.data, audio, title: asset.caption ? `Kuula: ${asset.caption}` : b.data.title };
      insertBlocks([b]);
    }
    setNotice('Heli pangast lisati lehele.');
  };
  // a video from the bank: into the selected video block, else a new video block
  const pickBankVideo = (asset) => {
    const file = /^https:\/\/firebasestorage\./.test(asset.src) || asset.storagePath ? { src: asset.src, storagePath: asset.storagePath || '', name: asset.title || '' } : null;
    const patch = file ? { file, url: '' } : { url: asset.src, file: null };
    if (selected?.type === 'video') {
      updateBlock({ ...selected, data: { ...selected.data, ...patch, caption: selected.data.caption || asset.caption || '' } });
    } else {
      const b = createBlock('video');
      b.data = { ...b.data, ...patch, caption: asset.caption || '' };
      insertBlocks([b]);
    }
    setNotice('Video pangast lisati lehele.');
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
  // „Määra õpilastele” opens Õppevara with the published sheet; the block bar's „Määra” sends one task of it (&plokk=)
  const canAssign = allowAssign && !isNew && worksheetStatus === 'published' && !dirty;
  const assignUrl = `/library?assign=${encodeURIComponent(lessonId)}${worksheetId ? `&leht=${encodeURIComponent(worksheetId)}` : ''}`;
  // „Teksti sisse”: a picture block next to a text or a reading text (the next one, else the one before) becomes one of
  // its pictures (up to MAX_FIGURES)
  const wrapTarget = (block) => {
    if (block.type !== 'image') return null;
    const i = doc.blocks.findIndex((b) => b.id === block.id);
    return [doc.blocks[i + 1], doc.blocks[i - 1]].find((b) => b && FIGURE_TEXT[b.type] && figuresOf(b.data).length < MAX_FIGURES) || null;
  };
  const wrapIntoText = (block) => {
    const target = wrapTarget(block);
    if (!target) return;
    const before = doc.blocks.indexOf(target) < doc.blocks.indexOf(block);
    const d = block.data || {};
    const figures = figuresOf(target.data);
    const figure = { ...newFigure(d.img || null), caption: d.caption || '', alt: d.alt || '', shape: d.shape || 'rect', border: d.border || 'none', side: figures.length % 2 ? 'left' : 'right', at: before ? Math.max(0, figureParagraphs(target.type, target.data).length - 1) : 0 };
    lastPush.current = 0;
    setBlocks(doc.blocks.filter((b) => b.id !== block.id).map((b) => (b.id === target.id ? { ...b, data: { ...b.data, ...figuresPatch([...figures, figure]) } } : b)));
    setSelectedId(target.id);
    setNotice('Pilt on teksti sees. Lohista seda ✥-st, laius nurgast, 🔓 lukustab. „Võta tagasi” toob ploki tagasi.');
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
        {wrapTarget(block) ? <button type="button" onClick={() => wrapIntoText(block)} title="Pane pilt kõrvaloleva teksti sisse — tekst voolab pildi ümber"><Icons.WrapText aria-hidden="true" /> Teksti sisse</button> : null}
        <button type="button" onClick={() => duplicateBlock(block.id)} title="Kopeeri (Ctrl+D)" aria-label="Kopeeri"><Icons.Copy aria-hidden="true" /></button>
        {reuse && !privateFor ? <button type="button" onClick={() => setCopying(block)} title="Kopeeri või teisalda tunni teisele lehele" aria-label="Teisalda või kopeeri teisele lehele…"><Icons.FolderInput aria-hidden="true" /></button> : null}
        {canAssign && BLOCKS[block.type]?.task ? <button type="button" onClick={() => navigate(`${assignUrl}&plokk=${encodeURIComponent(block.id)}`)} title="Määra ainult see ülesanne õpilastele"><Icons.Send aria-hidden="true" /> Määra</button> : null}
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
    if ((event.ctrlKey || event.metaKey) && key === 'c' && freeSel.length && !globalThis.getSelection?.()?.toString()) { event.preventDefault(); clipFree(); return; }
    if ((event.ctrlKey || event.metaKey) && key === 'v' && canFree && clipCount) { event.preventDefault(); pasteFree(); return; }
    if (freeGroup.length) {
      if (key === 'delete' || key === 'backspace') { event.preventDefault(); deleteGroup(); return; }
      if ((event.ctrlKey || event.metaKey) && key === 'd') { event.preventDefault(); duplicateGroup(); return; }
      if (key === 'escape') { clearFree(); return; }
      if (!event.ctrlKey && !event.metaKey && key.startsWith('arrow')) {
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        moveGroup(key === 'arrowleft' ? -step : key === 'arrowright' ? step : 0, key === 'arrowup' ? -step : key === 'arrowdown' ? step : 0);
        return;
      }
    }
    if ((key === 'delete' || key === 'backspace') && selectedFree && !selectedFree.locked) { event.preventDefault(); deleteFree(); return; }
    if ((event.ctrlKey || event.metaKey) && key === 'd' && selectedFree) { event.preventDefault(); duplicateFree(); return; }
    if (key === 'escape' && selectedFreeId) { clearFree(); return; }
    if (!event.ctrlKey && !event.metaKey && key.startsWith('arrow') && selectedFree && !selectedFree.locked) {
      event.preventDefault();
      const step = event.shiftKey ? 10 : 1;
      changeFree(selectedFree.id, moveItem(selectedFree, key === 'arrowleft' ? -step : key === 'arrowright' ? step : 0, key === 'arrowup' ? -step : key === 'arrowdown' ? step : 0));
      return;
    }
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

  const save = async (nextStatus = 'draft', { auto = false, document: toSave = doc } = {}) => {
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
      const res = await repository.save({ lessonId: isNew ? '' : lessonId, document: toSave, user, baseUpdatedAt, status: nextStatus, ...(generation ? { generation } : {}) });
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
    if (doc.blocks.length && !(await askConfirm(`Fail „${parsed.meta?.title || 'tööleht'}” asendab praeguse sisu. Jätkata?`, { confirmLabel: 'Asenda' }))) return;
    setSaveError('');
    change({ ...parsed, id: doc.id }); setSelectedId(null);
  };
  const loadSample = async () => {
    closeMenu();
    if (doc.blocks.length && !(await askConfirm('Näidisleht asendab praeguse lehe sisu. Jätkata? (Saad tagasi ka „Võta tagasi” nupuga.)', { confirmLabel: 'Asenda' }))) return;
    lastPush.current = 0;
    change({ ...sampleDocument(), id: doc.id }); setSelectedId(null);
  };
  const loadFormalLetter = async () => {
    closeMenu();
    if (doc.blocks.length && !(await askConfirm('Mall „Kiri linnavalitsusele” asendab praeguse sisu. Jätkata?', { confirmLabel: 'Asenda' }))) return;
    lastPush.current = 0;
    change({ ...formalLetterDocument(), id: doc.id }); setSelectedId(null);
  };

  const columnView = column && mode === 'edit';
  const touchHint = screenMatches('(pointer: coarse)');
  const statusText = saving ? 'salvestan…' : dirty ? 'salvestamata' : savedAt ? `salvestatud ${new Date(savedAt).toLocaleTimeString('et-EE', { hour: '2-digit', minute: '2-digit' })}` : worksheetStatus === 'published' ? 'avaldatud' : 'mustand';
  const showResults = !isNew && typeof resultsSource?.listWorksheetResults === 'function';
  // the icon rail: one click opens the drawer on that tab, a click on the open tab closes it
  const railTabs = [
    ['blocks', 'Plokid', Icons.LayoutGrid],
    ['bank', 'Pank', Icons.Images],
    ['library', 'Kogu', Icons.LibraryBig],
    ['text', 'Tekstist', Icons.WandSparkles],
    ['sheet', 'Leht', Icons.FileText],
    ...(showResults ? [['results', 'Tulemused', Icons.ChartColumn]] : []),
    ...(original.length > 0 ? [['original', 'Originaal', Icons.ScanLine]] : []),
  ];
  const pickTab = (key) => { if (leftTab === key && leftOpen) setLeftOpen(false); else { setLeftTab(key); setLeftOpen(true); } };

  return (
    <AssetContext.Provider value={assets}>
      <div ref={studioRef} className={`ws-studio st-skin mode-${mode} ${focus ? 'is-focus' : ''} ${mode === 'edit' && selected && panelOpen ? 'has-panel' : ''} ${columnView ? 'is-column' : ''}`}>
        <header className="st-bar">
          <Link className="st-back" to={backTo} title={backTo.startsWith('/library/lessons/') ? 'Tunni töölehed' : backLabel} aria-label={backTo.startsWith('/library/lessons/') ? 'Tunni töölehed' : backLabel}><Icons.ArrowLeft size={18} aria-hidden="true" /></Link>
          <div className="st-title"><span className="st-kicker">Töölehe konstruktor</span><b title={doc.meta.title}>{doc.meta.title}</b><span className={`st-status ${dirty ? 'is-dirty' : ''}`}>{statusText}{version ? ` · v${version}` : ''}</span></div>
          <div className="st-seg" role="tablist" aria-label="Vaade">
            {[['edit', 'Koosta', Icons.PenLine], ['interactive', 'Õpilase vaade', Icons.MonitorSmartphone], ['print', 'Trükivaade', Icons.Printer], ['key', 'Õpetaja võti', Icons.ListChecks]].map(([m, l, Ico]) => (
              <button type="button" role="tab" key={m} aria-pressed={mode === m} onClick={() => switchMode(m)}><Ico size={15} aria-hidden="true" /><span>{l}</span></button>
            ))}
          </div>
          <div className="st-actions">
            {/* in the student or print view the way back to editing is one clear button */}
            {mode !== 'edit' && <button type="button" className="st-btn st-edit" onClick={() => switchMode('edit')}><Icons.PenLine size={16} aria-hidden="true" /> Muuda lehte</button>}
            {mode === 'interactive' && <button type="button" className="st-btn primary" onClick={check}>Kontrolli vastuseid</button>}
            {mode === 'interactive' && <button type="button" className="st-btn" onClick={() => { setAnswers({}); setResults({}); setEvidence(null); }}>Tühjenda</button>}
            <details className={`st-quality ${quality.ready ? 'ready' : ''}`}>
              <summary className="st-chip" title="Kvaliteedikontroll">{quality.ready ? <Icons.CircleCheck size={15} aria-hidden="true" /> : <Icons.CircleAlert size={15} aria-hidden="true" />}<span className="st-chip-text">{quality.ready ? 'Avaldamiseks valmis' : `${quality.errors.length} viga · ${quality.warnings.length} hoiatust`}</span>{quality.tips.length ? <em>{quality.tips.length}</em> : null}</summary>
              <div className="st-quality-pop">
                <b>{quality.ready ? `Avaldamiseks valmis · versioon ${version || 'uus'} · ${worksheetStatus === 'published' ? 'avaldatud' : 'mustand'}` : 'Kvaliteedikontroll'}</b>
                {quality.didactics ? <p className="st-didactic"><span>Didaktika · tase {quality.didactics.label}</span><b>{quality.didactics.score}%</b><i style={{ width: `${quality.didactics.score}%` }} /></p> : null}
                {quality.minutes ? <p className="st-didactic"><span>Tööaeg · terve tund {SHEET_MINUTES.min}–{SHEET_MINUTES.max} min</span><b>≈ {quality.minutes} min</b><i style={{ width: `${Math.min(100, Math.round((quality.minutes / SHEET_MINUTES.min) * 100))}%` }} /></p> : null}
                {quality.issues.length ? <ul>{quality.issues.map((issue) => <li className={issue.level} key={issue.code}><button type="button" className="st-issue" onClick={() => showIssue(issue)}>{issue.text}</button></li>)}</ul> : <p>Kõik kohustuslikud kontrollid on läbitud.</p>}
              </div>
            </details>
            {mode === 'edit' && <button type="button" className="st-btn st-icon st-column-toggle" aria-pressed={column} aria-label="Suur tekst" onClick={toggleColumn} title={column ? 'Lehe plokid ühes veerus, tekst loetavas suuruses. Vajuta, et näha A4 lehte nagu trükis.' : 'Näita lehte ühes veerus suure tekstiga (tahvel)'}><Icons.ALargeSmall size={18} aria-hidden="true" /></button>}
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
                {sheetTemplates ? <button type="button" onClick={() => { closeMenu(); setPickTemplate(true); }}>Uus mallist…</button> : null}
                {sheetTemplates && !privateFor ? <button type="button" onClick={saveSheetTemplate}>Salvesta leht mallina…</button> : null}
                {sheetTemplates && isLessonPage ? <button type="button" onClick={saveLessonTemplate}>Salvesta terve tund mallina…</button> : null}
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
            {canAssign ? <Link className="st-btn" to={assignUrl}>Määra õpilastele</Link> : null}
            {/* `publishLock` (the Õpik page for a teacher, owner 2026-11-11): „Salvesta” sends the change to the admin, who publishes */}
            {publishLock
              ? <span className="st-chip st-publish-lock" title={publishLock.title}>{publishLock.label}</span>
              : <button type="button" className="st-btn primary" disabled={saving || !quality.ready || (!dirty && worksheetStatus === 'published')} onClick={() => save('published')}>{privateFor ? 'Määra õpilasele' : 'Avalda'}</button>}
          </div>
        </header>
        {renderTop ? renderTop({
          dirty,
          doc,
          insertBlocks,
          // a generated sheet shown in the editor first: nothing is saved until „Salvesta” (or autosave), Ctrl+Z undoes it
          // the Õpik review: the admin sees the waiting change against what students see now (the versions comparison)
          compareWith: (entry) => setComparing(entry),
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
        {mode === 'edit' && !doc.blocks.length && sheetTemplates ? <div className="st-banner st-empty-start" role="note"><span>Leht on tühi. Alusta plokkidest vasakult või mallist{isLessonPage ? ' — tunni mall täidab ka tunni tühjad lehed' : ''}.</span><button type="button" className="st-btn" onClick={() => setPickTemplate(true)}>Uus mallist…</button></div> : null}
        {draftRestored && <div className="st-banner st-draft-note" role="status"><span>Taastasin selles brauseris automaatselt salvestatud mustandi.</span><button type="button" className="st-btn" onClick={() => { try { window.localStorage.removeItem(draftKey(draftName)); } catch { /* ignore */ } window.location.reload(); }}>Loobu mustandist</button></div>}
        {versions.length > 0 && <div className="st-banner"><strong>Versioonid:</strong> {versions.slice(0, 12).map((entry) => <button type="button" className={`st-btn ${comparing?.id === entry.id ? 'primary' : ''}`} key={entry.id} onClick={() => setComparing(comparing?.id === entry.id ? null : entry)}>v{entry.version} · {entry.status === 'published' ? 'avaldatud' : 'mustand'}</button>)} <button type="button" className="st-btn" onClick={() => { setVersions([]); setComparing(null); }}>Sulge</button></div>}
        {comparing && (() => {
          const rows = versionDiff(comparing);
          return (
            <div className="st-banner st-compare" role="region" aria-label={`Versioon ${comparing.version} võrreldes praegusega`}>
              <strong>Versioon {comparing.version} võrreldes praegusega:</strong>
              {rows.length ? <ul>{rows.map(({ block, state }) => <li key={block.id}><span>{state === 'removed' ? 'Kustutatud' : 'Muudetud'}: {block.data?.title || BLOCKS[block.type]?.label || 'plokk'}</span> <button type="button" className="st-btn" onClick={() => restoreTask(block)}>Too see ülesanne tagasi</button></li>)}</ul> : <span> ülesanded on samad.</span>}
              <button type="button" className="st-btn" onClick={async () => { if (await askConfirm(`Taasta kogu versioon ${comparing.version} uue mustandina?`, { confirmLabel: 'Taasta' })) { change({ ...structuredClone(comparing.worksheetDoc), id: doc.id }); setVersions([]); setComparing(null); setNotice(`Versioon ${comparing.version} laaditi redigeerimiseks. Salvesta see uue versioonina.`); } }}>Taasta kogu leht</button>
              <button type="button" className="st-btn" onClick={() => setComparing(null)}>Sulge võrdlus</button>
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
              : leftTab === 'library' ? <Suspense fallback={<LoadingState inline className="ed-hint" label="Laen kogu…" />}><BlockLibraryPanel level={doc?.meta?.level || ''} currentLessonId={isLessonPage ? lessonId : ''} {...(reuse ? { saved: reuse } : {})} onInsert={(blocks, extra) => { insertBlocks(blocks, extra); setNotice('Kogust lisati ülesanne. Vaata see üle.'); }} /></Suspense>
              : leftTab === 'bank' ? <MediaBankPanel level={doc?.meta?.level || ''} service={mediaBank} isAdmin={Boolean(user?.roles?.includes?.('admin'))}
                onImage={pickBankImage} onText={pickBankText} onWebImage={pickWebImage} onAudio={pickBankAudio} onVideo={pickBankVideo}
                onIndex={(onProgress) => mediaBank.indexCurriculum({ library: libraryService, lessonWorksheets: lessonWorksheetsService, user, onProgress })} />
              : leftTab === 'original' && original.length > 0 ? <OriginalPanel files={original} onCut={cutPhoto} busy={cut.busy} error={cut.error} /> : <><div className="st-palette-search"><input ref={searchRef} className="ed-input" type="search" value={paletteQuery} onChange={(e) => setPaletteQuery(e.target.value)} placeholder="Otsi plokki…" aria-label="Otsi plokki" /></div><p className="st-palette-hint" title="Kiirklahvid: Ctrl+S salvesta, Ctrl+D kopeeri, Alt+↑/↓ liiguta, ↑/↓ vali, Delete kustuta, Esc."><Icons.MousePointerClick size={14} aria-hidden="true" /> {touchHint ? 'Puuduta plokki, et see lisada. Lehel: puuduta plokki, siis selle teksti, et teksti muuta.' : 'Lohista plokk lehele. Topeltklõps lehel muudab teksti.'}</p>{canFree ? (
                <div className="st-group st-free">
                  <div className="st-group-title">Vaba kiht (Õpik)</div>
                  <p className="st-palette-hint">Pane pilt, kujund, tekst, joon või nool ükskõik kuhu lehel — kihiti üksteise peale.</p>
                  <div className="st-free-add">
                    <button type="button" className="ed-btn" onClick={() => addFree('image')}><Icons.Image size={14} aria-hidden="true" /> Pilt</button>
                    <button type="button" className="ed-btn" onClick={() => addFree('shape')}><Icons.Circle size={14} aria-hidden="true" /> Kujund</button>
                    <button type="button" className="ed-btn" onClick={() => addFree('text')}><Icons.Type size={14} aria-hidden="true" /> Tekstikast</button>
                    <button type="button" className="ed-btn" onClick={() => addFree('line')}><Icons.Minus size={14} aria-hidden="true" /> Joon</button>
                    <button type="button" className="ed-btn" onClick={() => addFree('line', { heads: 'end' })}><Icons.MoveRight size={14} aria-hidden="true" /> Nool</button>
                    <button type="button" className="ed-btn" onClick={() => addFree('text', { shape: 'bubble', fill: 'white', border: 'ink', bold: false, text: 'Tere!', x: 90, w: 90, h: 50, align: 'center' })}><Icons.MessageCircle size={14} aria-hidden="true" /> Jutumull</button>
                    <button type="button" className="ed-btn" onClick={() => addFree('text', { shape: 'burst', fill: 'lime', text: 'Uus!', x: 105, w: 60, h: 60, size: 16, font: 'head' })}><Icons.Sparkles size={14} aria-hidden="true" /> Kleeps</button>
                    <button type="button" className="ed-btn" onClick={() => addFree('text', { shape: 'ribbon', fill: 'navy', text: 'Pealkiri', x: 65, w: 140, h: 24, size: 16, font: 'head', align: 'center' })}><Icons.Bookmark size={14} aria-hidden="true" /> Lint</button>
                  </div>
                  <div className="st-group-title st-free-presets-title">Valmis kujundused</div>
                  <div className="st-free-add st-free-presets">
                    {FREE_PRESETS.map((key) => <button key={key} type="button" className="ed-btn" onClick={() => addPreset(key)}>{FREE_PRESET_LABEL[key]}</button>)}
                  </div>
                  <button type="button" className="ed-btn st-free-multi" aria-pressed={multiTap} onClick={() => setMultiTap(!multiTap)} title="Sees olles lisab iga puudutus elemendi valikusse ja lohistus lehel joonistab valikuraami (arvutis: Shift + klõps, Shift + lohista)"><Icons.SquareDashed size={14} aria-hidden="true" /> Vali mitu{multiTap ? ': sees' : ''}</button>
                  {freeItems.some((it) => it.behind) ? <button type="button" className="ed-btn st-free-multi" aria-pressed={backFront} onClick={() => setBackFront(!backFront)} title="Teksti taga olevad elemendid tulevad plokkide peale, et neid liigutada; uuesti vajutades lähevad tagasi"><Icons.Layers size={14} aria-hidden="true" /> Muuda tausta{backFront ? ': sees' : ''}</button> : null}
                  {clipCount ? <button type="button" className="ed-btn st-free-multi" onClick={pasteFree} title="Kleebi lõikelaualt lehele, mis on ekraani keskel (Ctrl+V)"><Icons.ClipboardPaste size={14} aria-hidden="true" /> Kleebi ({clipCount})</button> : null}
                </div>
              ) : null}{myTemplates.length ? (
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

          {/* „Suur tekst”: the column of sheetFlow.css (`ws-narrow`), the same blocks at their real text size */}
          <main className={`st-canvas ${columnView ? 'ws-narrow' : ''} ${multiTap && canFree && mode === 'edit' ? 'is-free-multi' : ''}`} ref={canvasRef} onPointerDownCapture={columnView ? undefined : startFrame}>
            {/* the answer key is a plain page at its own size, not the A4 sheet scaled to the canvas */}
            <div className="st-zoom" style={{ zoom: mode === 'key' || columnView ? 1 : scale, '--st-scale': mode === 'key' || columnView ? 1 : scale }}>
              {mode === 'key' ? <AnswerKeyView doc={doc} /> : <Sheet doc={doc} mode={mode} answers={answers} setAnswer={setAnswer} results={results} selectedId={selectedId} onSelect={(id) => { selectBlock(id); if (!id) clearFree(); }} dnd dropHint={dropHint} onResize={columnView ? undefined : resizeBlock} onAddItem={addItemTo} onMarks={setMarks} onEditText={editText} renderToolbar={renderToolbar} onInsertAfter={insertAfter} transcripts={STAFF_TRANSCRIPTS} flow={columnView} onPatch={patchBlockData} freeEdit={freeEdit} onPageCount={setPageCount} />}
            </div>
            {evidence && <GoalEvidence doc={doc} evidence={evidence} />}
          </main>

          {mode === 'edit' && selectedFree && panelOpen ? (
            <aside ref={refs.setFloating} className={`st-inspector is-floating is-${popSide}`} aria-label="Vaba elemendi seaded" style={popStyle} onClick={(e) => e.stopPropagation()}>
              <div className="st-pop-head"><b>Vaba kiht · {freeGroup.length ? `${freeGroup.length} valitud` : FREE_KIND_LABEL[selectedFree.kind]}</b>
                <button type="button" className="ed-btn" onClick={() => setPopSide(popSide === 'right' ? 'left' : 'right')} title="Vii paneel teisele poole" aria-label="Vii paneel teisele poole"><Icons.ArrowLeftRight size={15} aria-hidden="true" /></button>
                <button type="button" className="ed-btn" onClick={() => setPanelOpen(false)} aria-label="Sulge seaded"><Icons.X size={15} aria-hidden="true" /></button>
              </div>
              {freeGroup.length ? <FreeGroupFields items={freeGroup} pages={pageCount} onBehind={behindGroup} onToPage={copyFreeToPage} onClip={clipFree} onAlign={alignGroup} onSpread={spreadGroup} onLayer={restackGroup} onDuplicate={duplicateGroup} onDelete={deleteGroup} onClear={clearFree} />
                : <FreeFields key={selectedFree.id} item={selectedFree} pages={pageCount} set={patchFree}
                  onLayer={restackFree}
                  onDuplicate={duplicateFree} onDelete={deleteFree} onToPage={copyFreeToPage} onClip={clipFree} />}
            </aside>
          ) : null}
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
        {copying ? <CopyMoveDialog block={copying} doc={doc} lessonId={isNew ? '' : lessonId} worksheetId={worksheetId || ''} reuse={reuse} user={user} onClose={() => setCopying(null)} onDone={copyDone} /> : null}
        {pickTemplate ? <TemplateDialog service={sheetTemplates} user={user} builtIns={BUILT_IN_TEMPLATES} lessonPage={isLessonPage} onClose={() => setPickTemplate(false)} onUseSheet={takeSheetTemplate} onUseLesson={takeLessonTemplate} /> : null}
        {notice && <div className="st-banner ok st-toast" role="status"><Icons.CircleCheck size={16} aria-hidden="true" />{notice}<button type="button" onClick={() => setNotice('')} aria-label="Sulge teade"><Icons.X size={14} aria-hidden="true" /></button></div>}
      </div>
    </AssetContext.Provider>
  );
}
