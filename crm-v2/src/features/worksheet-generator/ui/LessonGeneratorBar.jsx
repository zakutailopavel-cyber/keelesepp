import { Settings2, Sparkles, Target } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/AuthContext.jsx';
import { useAsyncData } from '../../../hooks/useAsyncData.js';
import { lessonWorksheetsService, levelVocabularyService } from '../../../services/firebase/index.js';
import { FOCUS_PHASES } from '../engine/focusWorksheet.js';
import { generatorProfileForLesson } from '../profiles/index.js';
import { CORE_SHEETS, generateCoreSheets, generateFocusSheet } from './lessonGeneration.js';
import '../generator.css';

const UNSAVED = 'Töölehel on salvestamata muudatusi. Genereerimine laadib uue mustandi ja need muudatused lähevad kaotsi. Jätkata?';

// Lesson worksheets and the generator in one strip at the top of the worksheet constructor:
// switch between the lesson's sheets, pick difficulty, generate the three sheets or one focus sheet.
export default function LessonGeneratorBar({ lessonId, worksheetId, dirty = false, onGenerated, repository = lessonWorksheetsService, vocabularyRepository = levelVocabularyService }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState('core');
  const [focusId, setFocusId] = useState('');
  const [focusPhase, setFocusPhase] = useState('full');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const state = useAsyncData(async () => {
    const [lesson, sheets] = await Promise.all([repository.loadLesson(lessonId), repository.list(lessonId)]);
    return { lesson, sheets };
  }, [lessonId, repository]);
  const vocabularyState = useAsyncData(async () => vocabularyRepository.load().catch(() => ({ lexicon: [], source: '', wordCount: 0 })), [vocabularyRepository]);

  if (state.loading || state.error) return state.error ? <div className="lgb-bar"><span className="lgb-error" role="alert">{state.error.message}</span></div> : null;

  const { lesson, sheets } = state.data;
  const profile = generatorProfileForLesson(lessonId, lesson);
  const levelVocabulary = vocabularyState.data || { lexicon: [], source: '', wordCount: 0 };
  const ids = new Set(sheets.map((sheet) => sheet.worksheetId || sheet.id));
  const focusSheets = sheets.filter((sheet) => sheet.role === 'focus');
  const hasCore = CORE_SHEETS.some(({ id }) => ids.has(id));
  const selectedFocusId = focusId || profile?.focuses?.[0]?.id || '';
  const sheetPath = (id) => `/library/lessons/${encodeURIComponent(lessonId)}/worksheets/${encodeURIComponent(id)}`;
  const deps = () => ({ repository, lessonId, lesson, profile, sheets, levelVocabulary, difficulty, user });

  const run = async (kind, task) => {
    if (dirty && !globalThis.confirm(UNSAVED)) return;
    setBusy(kind); setError(''); setNotice('');
    try {
      await task();
      state.reload();
    } catch (generationError) {
      setError(generationError.message || 'Genereerimine ebaõnnestus.');
    } finally {
      setBusy('');
    }
  };

  const generate = () => {
    if (hasCore && !globalThis.confirm('Genereerimine loob kolmest põhitöölehest uue mustandiversiooni; avaldatud versioon jääb alles. Jätkata?')) return;
    run('core', async () => {
      const { variant } = await generateCoreSheets(deps());
      setNotice(`Kolm töölehte genereeriti (variant ${variant}).`);
      if (CORE_SHEETS.some(({ id }) => id === worksheetId)) onGenerated?.();
      else navigate(sheetPath('discover'));
    });
  };

  const generateFocus = (event) => {
    event.currentTarget.closest('details')?.removeAttribute('open');
    run('focus', async () => {
      const result = await generateFocusSheet({ ...deps(), focusId: selectedFocusId, phase: focusPhase });
      setNotice(`Fookuse tööleht „${result.displayLabel}” genereeriti (variant ${result.variant}).`);
      if (result.worksheetId === worksheetId) onGenerated?.();
      else navigate(sheetPath(result.worksheetId));
    });
  };

  return (
    <div className="lgb-bar" aria-label="Tunni töölehed ja generaator">
      <b className="lgb-lesson" title={lesson.title}>{lesson.title || 'Õppetund'}</b>
      <nav className="lgb-tabs" aria-label="Tunni töölehed">
        {CORE_SHEETS.map((meta) => (
          <Link key={meta.id} to={sheetPath(meta.id)} aria-current={meta.id === worksheetId ? 'page' : undefined} className={ids.has(meta.id) ? '' : 'is-empty'} title={meta.hint}>{meta.label}</Link>
        ))}
        {focusSheets.map((sheet) => {
          const id = sheet.worksheetId || sheet.id;
          return <Link key={id} to={sheetPath(id)} aria-current={id === worksheetId ? 'page' : undefined}><Target size={13} aria-hidden="true" /> {sheet.displayLabel || sheet.title}</Link>;
        })}
      </nav>
      <div className="lgb-actions">
        {profile ? (
          <>
            <select aria-label="Töölehtede raskus" value={difficulty} onChange={(event) => setDifficulty(event.target.value)} disabled={Boolean(busy)}><option value="support">Support</option><option value="core">Core</option><option value="challenge">Challenge</option></select>
            <button type="button" className="st-btn primary" onClick={generate} disabled={Boolean(busy)}><Sparkles size={15} aria-hidden="true" /> {busy === 'core' ? 'Genereerin…' : hasCore ? 'Genereeri 3 lehte uuesti' : 'Genereeri 3 töölehte'}</button>
            <details className="st-more lgb-focus">
              <summary className="st-btn"><Target size={15} aria-hidden="true" /> {busy === 'focus' ? 'Genereerin…' : 'Fookuse leht ▾'}</summary>
              <div className="st-menu lgb-focus-menu">
                <label><span>Fookus</span><select aria-label="Töölehe fookus" value={selectedFocusId} onChange={(event) => setFocusId(event.target.value)}>{(profile.focuses || []).map((focus) => <option value={focus.id} key={focus.id}>{focus.label}</option>)}</select></label>
                <label><span>Etapp</span><select aria-label="Fookuse töölehe etapp" value={focusPhase} onChange={(event) => setFocusPhase(event.target.value)}>{FOCUS_PHASES.map((phase) => <option value={phase.id} key={phase.id}>{phase.label}</option>)}</select></label>
                <button type="button" className="st-btn primary" onClick={generateFocus} disabled={!selectedFocusId || Boolean(busy)}>Genereeri fookuse tööleht</button>
              </div>
            </details>
          </>
        ) : <span className="lgb-muted">Generaator pole selle tunni jaoks valmis</span>}
        <Link className="st-btn" to={`/library/lessons/${encodeURIComponent(lessonId)}/worksheets`} title="Generaatori sisu ja katvus"><Settings2 size={15} aria-hidden="true" /> Seaded</Link>
      </div>
      {error ? <span className="lgb-error" role="alert">{error}</span> : null}
      {notice ? <span className="lgb-ok" role="status">{notice}</span> : null}
    </div>
  );
}
