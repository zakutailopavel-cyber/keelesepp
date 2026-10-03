import { ArrowLeft, BarChart3, Database, FilePenLine, PackagePlus, RefreshCw, Sparkles, Target } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../app/AuthContext.jsx';
import { Badge, Button, Card, ErrorState, LoadingState, PageHeader } from '../../../components/ui/index.js';
import { useAsyncData } from '../../../hooks/useAsyncData.js';
import { lessonWorksheetsService, levelVocabularyService } from '../../../services/firebase/index.js';
import { ACTIVITY_CATALOG_VERSION, generateFocusWorksheet, generateLessonBundle, GENERATOR_VERSION } from '../engine/generator.js';
import { FOCUS_PHASES, focusPhaseLabel, focusWorksheetId } from '../engine/focusWorksheet.js';
import { canCreateContentPackDraft, createContentPackDraft } from '../factory/factory.js';
import { generatorProfileForLesson, profileDraftForLesson, resolveGeneratorProfile } from '../profiles/index.js';
import ContentPackFactoryPanel from './ContentPackFactoryPanel.jsx';
import GeneratorProfileEditor from './GeneratorProfileEditor.jsx';
import '../generator.css';

const CORE = [
  { id: 'discover', label: '1 Avasta', slot: 1 },
  { id: 'practice', label: '2 Harjuta', slot: 2 },
  { id: 'transfer', label: '3 Kasuta', slot: 3 },
];

const shortDate = (value) => value ? new Intl.DateTimeFormat('et-EE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';

function generationMeta(sheet, { scope, variant, size = 'standard', levelVocabulary = null }) {
  return {
    generatorVersion: sheet.generatorVersion,
    recipeId: sheet.recipeId,
    seed: sheet.seed,
    scope,
    phase: sheet.phase,
    focusIds: sheet.focusIds,
    contextId: sheet.contextId,
    profileVersion: sheet.profileVersion,
    size,
    activityIds: sheet.activityIds,
    activityCatalogVersion: ACTIVITY_CATALOG_VERSION,
    didacticPlanVersion: 1,
    difficulty: sheet.difficulty,
    lessonDna: sheet.lessonDna,
    variant,
    levelVocabulary: levelVocabulary?.source ? { source: levelVocabulary.source, wordCount: levelVocabulary.wordCount || 0 } : null,
  };
}

export default function LessonWorksheetSet({ repository = lessonWorksheetsService, vocabularyRepository = levelVocabularyService }) {
  const { lessonId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [focusBusy, setFocusBusy] = useState(false);
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileEditing, setProfileEditing] = useState(false);
  const [factoryDraft, setFactoryDraft] = useState(null);
  const factoryQueryHandled = useRef(false);
  const [notice, setNotice] = useState('');
  const [difficulty, setDifficulty] = useState('core');
  const [focusId, setFocusId] = useState('');
  const [focusPhase, setFocusPhase] = useState('full');
  const [error, setError] = useState('');
  const state = useAsyncData(async () => {
    const [lesson, sheets, levelVocabulary] = await Promise.all([
      repository.loadLesson(lessonId),
      repository.list(lessonId),
      vocabularyRepository.load().catch((loadError) => ({
        lexicon: [],
        source: '',
        wordCount: 0,
        error: loadError?.message || 'Tasemesõnastikku ei saanud laadida.',
      })),
    ]);
    return { lesson, sheets, levelVocabulary };
  }, [lessonId, repository, vocabularyRepository]);

  useEffect(() => {
    const lesson = state.data?.lesson;
    if (!lesson || factoryQueryHandled.current || searchParams.get('factory') !== '1') return;
    factoryQueryHandled.current = true;
    setFactoryDraft(createContentPackDraft(lesson));
    setProfileEditing(false);
  }, [searchParams, state.data?.lesson]);

  if (state.loading) return <LoadingState label="Laen tunni töölehti…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;

  const lesson = state.data.lesson;
  const sheets = state.data.sheets;
  const byId = new Map(sheets.map((sheet) => [sheet.worksheetId || sheet.id, sheet]));
  const resolvedProfile = resolveGeneratorProfile(lessonId, lesson);
  const profile = generatorProfileForLesson(lessonId, lesson);
  const profileDraft = profileDraftForLesson(lessonId, lesson);
  const levelVocabulary = state.data.levelVocabulary || { lexicon: [], source: '', wordCount: 0 };
  const coreSheets = CORE.map(({ id }) => byId.get(id)).filter(Boolean);
  const focusSheets = sheets.filter((sheet) => sheet.role === 'focus');
  const selectedFocusId = focusId || profile?.focuses?.[0]?.id || '';
  const anyBusy = busy || focusBusy || profileBusy;

  const startFactory = () => {
    setFactoryDraft(createContentPackDraft(lesson));
    setProfileEditing(false);
  };


  const saveProfile = async (nextProfile, readiness) => {
    setProfileBusy(true); setError(''); setNotice('');
    try {
      await repository.saveGeneratorProfile({
        lessonId,
        profile: nextProfile,
        user,
        baseUpdatedAt: lesson.generatorProfileUpdatedAt || '',
      });
      setNotice(readiness.ready
        ? 'Generaatori sisupakett salvestati ja on genereerimiseks valmis.'
        : 'Generaatori sisupaketi mustand salvestati. Täida readiness nõuded enne genereerimist.');
      setProfileEditing(false);
      setFactoryDraft(null);
      state.reload();
    } catch (profileError) {
      setError(profileError.message || 'Generaatori sisupaketi salvestamine ebaõnnestus.');
    } finally {
      setProfileBusy(false);
    }
  };

  const generate = async () => {
    const existing = coreSheets;
    if (existing.length && !globalThis.confirm(`Tunnil on juba ${existing.length} põhitöölehte. Genereerimine loob neist uue mustandiversiooni; avaldatud versioon jääb alles. Jätkata?`)) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const previousActivityIds = existing.flatMap((sheet) => sheet?.generation?.activityIds || []);
      const variant = Math.max(0, ...existing.map((sheet) => Number(sheet?.generation?.variant) || Number(sheet?.worksheetDocVersion) || 0)) + 1;
      const result = generateLessonBundle({
        lesson,
        profile,
        levelLexicon: levelVocabulary.lexicon,
        activityHistory: previousActivityIds,
        difficulty,
        variant,
        seed: `${lessonId}:${profile.version}:${GENERATOR_VERSION}:${variant}`,
      });
      const blocking = result.diagnostics.filter((item) => item.severity === 'error');
      if (blocking.length || result.sheets.length !== 3) throw new Error(blocking.map((item) => item.message).join(' ') || 'Kolme töölehte ei saanud luua.');
      await Promise.all(result.sheets.map((sheet, index) => {
        const meta = CORE[index];
        const current = byId.get(meta.id);
        return repository.saveDraft({
          lessonId,
          worksheetId: meta.id,
          role: meta.id,
          slot: meta.slot,
          displayLabel: meta.label,
          worksheetDoc: sheet.worksheetDoc,
          user,
          baseUpdatedAt: current?.worksheetDocUpdatedAt || '',
          generation: generationMeta(sheet, { scope: 'lesson-bundle', variant, levelVocabulary }),
        });
      }));
      setNotice(`Kolm erinevat töölehte salvestati mustandina (variant ${variant}). Ava need kontrollimiseks ja avalda ükshaaval.`);
      state.reload();
    } catch (generationError) {
      setError(generationError.message || 'Töölehtede genereerimine ebaõnnestus.');
    } finally {
      setBusy(false);
    }
  };

  const generateFocus = async () => {
    if (!profile || !selectedFocusId) return;
    const focus = (profile.focuses || []).find((item) => item.id === selectedFocusId);
    if (!focus) {
      setError('Valitud fookust ei leitud.');
      return;
    }
    const worksheetId = focusWorksheetId({ focusIds: [selectedFocusId], phase: focusPhase });
    const current = byId.get(worksheetId);
    if (current && !globalThis.confirm(`Fookuse tööleht „${current.displayLabel || current.title}” on juba olemas. Loon sellest uue mustandiversiooni; avaldatud versioon jääb alles. Jätkata?`)) return;

    setFocusBusy(true); setError(''); setNotice('');
    try {
      const variant = Math.max(0, Number(current?.generation?.variant) || Number(current?.worksheetDocVersion) || 0) + 1;
      const result = generateFocusWorksheet({
        lesson,
        profile,
        levelLexicon: levelVocabulary.lexicon,
        focusIds: [selectedFocusId],
        phase: focusPhase,
        difficulty,
        variant,
        activityHistory: current?.generation?.activityIds || [],
        seed: `${lessonId}:${profile.version}:${GENERATOR_VERSION}:focus:${selectedFocusId}:${focusPhase}:${variant}`,
      });
      const blocking = result.diagnostics.filter((item) => item.severity === 'error');
      if (blocking.length || !result.sheet) throw new Error(blocking.map((item) => item.message).join(' ') || 'Fookuse töölehte ei saanud luua.');
      const sheet = result.sheet;
      const displayLabel = `${focus.label} · ${focusPhaseLabel(focusPhase)}`;
      await repository.saveDraft({
        lessonId,
        worksheetId,
        role: 'focus',
        slot: null,
        displayLabel,
        worksheetDoc: sheet.worksheetDoc,
        user,
        baseUpdatedAt: current?.worksheetDocUpdatedAt || '',
        generation: generationMeta(sheet, { scope: 'focus', variant, levelVocabulary }),
      });
      setNotice(`Fookuse tööleht „${displayLabel}” salvestati mustandina (variant ${variant}).`);
      state.reload();
    } catch (generationError) {
      setError(generationError.message || 'Fookuse töölehe genereerimine ebaõnnestus.');
    } finally {
      setFocusBusy(false);
    }
  };

  return (
    <div className="page-content generator-set-page">
      <Link className="generator-back" to="/library"><ArrowLeft size={16} /> Õppevara</Link>
      <PageHeader
        eyebrow="Tunni töölehed"
        title={lesson.title || 'Õppetund'}
        description="Avasta loob konteksti, Harjuta kinnistab täpsust ja Kasuta viib õpitu rääkimisse või kirjutamisse."
        actions={(
          <div className="generator-actions">
            <Link className="button button--secondary" to="/library/worksheet-generator"><BarChart3 size={17} /> Katvus</Link>
            {!lesson.generatorProfile && canCreateContentPackDraft(lesson) ? <Button variant="secondary" onClick={startFactory} disabled={anyBusy}><PackagePlus size={17} /> Loo sisupaketi mustand</Button> : null}
            <Button variant="secondary" onClick={() => setProfileEditing((value) => !value)} disabled={anyBusy}><Database size={17} /> Generaatori sisu</Button>
            <label className="generator-difficulty"><span>Raskus</span><select aria-label="Töölehtede raskus" value={difficulty} onChange={(event) => setDifficulty(event.target.value)} disabled={anyBusy}><option value="support">Support</option><option value="core">Core</option><option value="challenge">Challenge</option></select></label>
            <Button onClick={generate} loading={busy} disabled={!profile || focusBusy || profileBusy}><Sparkles size={17} /> {coreSheets.length ? 'Genereeri uus variant' : 'Genereeri 3 töölehte'}</Button>
          </div>
        )}
      />
      {!profile ? <div className="generator-message" role="status">Generaator pole selle tunni jaoks veel valmis. Ava „Generaatori sisu” ja täida sisupaketi readiness nõuded.</div> : null}
      {resolvedProfile.fallback && resolvedProfile.embeddedDraft ? <div className="generator-message is-warning" role="status">Õppetunni sisupaketi mustand pole veel valmis; genereerimine kasutab seni kontrollitud Git fallback’i.</div> : null}
      {levelVocabulary.error ? <div className="generator-message is-warning" role="status">Tasemesõnastik: {levelVocabulary.error} Tunni temaatiline sõnavara jääb kasutusse, kuid CEFR-audit on piiratud.</div> : null}
      {error ? <div className="generator-message is-error" role="alert">{error}</div> : null}
      {notice ? <div className="generator-message is-ok" role="status">{notice}</div> : null}


      {factoryDraft && !profileEditing ? <ContentPackFactoryPanel draft={factoryDraft} onEdit={() => setProfileEditing(true)} onCancel={() => setFactoryDraft(null)} /> : null}

      {profileEditing ? (
        <GeneratorProfileEditor
          key={factoryDraft ? `factory-${lessonId}` : lesson.generatorProfileUpdatedAt || profileDraft.source || 'new'}
          lesson={lesson}
          initialProfile={factoryDraft?.profile || profileDraft.profile}
          source={factoryDraft ? 'factory' : profileDraft.source}
          updatedAt={lesson.generatorProfileUpdatedAt || ''}
          onSave={saveProfile}
          saving={profileBusy}
          onCancel={() => setProfileEditing(false)}
        />
      ) : null}

      <div className="generator-sheet-grid">
        {CORE.map((meta) => {
          const sheet = byId.get(meta.id);
          return (
            <Card key={meta.id} className="generator-sheet-card">
              <div className="generator-sheet-head"><span>{meta.slot}</span><div><h2>{meta.label.replace(/^\d\s*/, '')}</h2><p>{meta.id === 'discover' ? 'Märka ja saa aru' : meta.id === 'practice' ? 'Harjuta täpsust' : 'Kasuta iseseisvalt'}</p></div></div>
              {sheet ? <><div className="generator-sheet-meta"><Badge tone={sheet.worksheetDocStatus === 'published' ? 'green' : 'yellow'}>{sheet.worksheetDocStatus === 'published' ? 'Avaldatud' : 'Mustand'}</Badge><span>{sheet.worksheetDoc?.blocks?.length || 0} plokki</span><span>v{sheet.worksheetDocVersion}</span></div><p className="generator-updated">Muudetud {shortDate(sheet.worksheetDocUpdatedAt)}</p><Link className="button button--primary" to={`/library/lessons/${encodeURIComponent(lessonId)}/worksheets/${meta.id}`}><FilePenLine size={16} /> Ava konstruktoris</Link></> : <div className="generator-empty"><RefreshCw size={20} /><p>Mustandit pole veel loodud.</p></div>}
            </Card>
          );
        })}
      </div>

      {profile && (
        <section className="generator-focus-section" aria-labelledby="focus-generator-title">
          <div className="generator-focus-heading">
            <div><Target size={20} aria-hidden="true" /><div><h2 id="focus-generator-title">Tööleht konkreetse fookuse järgi</h2><p>Loo eraldi leht ühe tunni fookuse harjutamiseks, ilma kolme põhitöölehte muutmata.</p></div></div>
          </div>
          <Card className="generator-focus-builder">
            <label><span>Fookus</span><select aria-label="Töölehe fookus" value={selectedFocusId} onChange={(event) => setFocusId(event.target.value)} disabled={anyBusy}>{(profile.focuses || []).map((focus) => <option value={focus.id} key={focus.id}>{focus.label}</option>)}</select></label>
            <label><span>Etapp</span><select aria-label="Fookuse töölehe etapp" value={focusPhase} onChange={(event) => setFocusPhase(event.target.value)} disabled={anyBusy}>{FOCUS_PHASES.map((phase) => <option value={phase.id} key={phase.id}>{phase.label}</option>)}</select></label>
            <Button onClick={generateFocus} loading={focusBusy} disabled={!selectedFocusId || busy}><Target size={16} /> Genereeri fookuse tööleht</Button>
          </Card>

          {focusSheets.length > 0 ? (
            <div className="generator-focus-grid">
              {focusSheets.map((sheet) => {
                const worksheetId = sheet.worksheetId || sheet.id;
                return (
                  <Card key={worksheetId} className="generator-focus-card">
                    <div><h3>{sheet.displayLabel || sheet.title}</h3><p>{sheet.generation?.difficulty || 'core'} · variant {sheet.generation?.variant || sheet.worksheetDocVersion || 1}</p></div>
                    <div className="generator-sheet-meta"><Badge tone={sheet.worksheetDocStatus === 'published' ? 'green' : 'yellow'}>{sheet.worksheetDocStatus === 'published' ? 'Avaldatud' : 'Mustand'}</Badge><span>{sheet.worksheetDoc?.blocks?.length || 0} plokki</span><span>v{sheet.worksheetDocVersion}</span></div>
                    <Link className="button button--primary" to={`/library/lessons/${encodeURIComponent(lessonId)}/worksheets/${encodeURIComponent(worksheetId)}`}><FilePenLine size={16} /> Ava konstruktoris</Link>
                  </Card>
                );
              })}
            </div>
          ) : <p className="generator-focus-empty">Eraldi fookuse töölehti pole veel loodud.</p>}
        </section>
      )}
    </div>
  );
}
