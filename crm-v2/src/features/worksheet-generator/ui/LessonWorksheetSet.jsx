import { ArrowLeft, FilePenLine, RefreshCw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../../app/AuthContext.jsx';
import { Badge, Button, Card, ErrorState, LoadingState, PageHeader } from '../../../components/ui/index.js';
import { useAsyncData } from '../../../hooks/useAsyncData.js';
import { lessonWorksheetsService } from '../../../services/firebase/index.js';
import { ACTIVITY_CATALOG_VERSION, generateLessonBundle, GENERATOR_VERSION } from '../engine/generator.js';
import referenceProfile from '../fixtures/a2b1-016.generator-profile.json';
import '../generator.css';

const CORE = [
  { id: 'discover', label: '1 Avasta', slot: 1 },
  { id: 'practice', label: '2 Harjuta', slot: 2 },
  { id: 'transfer', label: '3 Kasuta', slot: 3 },
];

const profileFor = (lessonId) => lessonId === referenceProfile.lessonId ? referenceProfile : null;
const shortDate = (value) => value ? new Intl.DateTimeFormat('et-EE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';

export default function LessonWorksheetSet({ repository = lessonWorksheetsService }) {
  const { lessonId } = useParams();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const state = useAsyncData(async () => {
    const [lesson, sheets] = await Promise.all([repository.loadLesson(lessonId), repository.list(lessonId)]);
    return { lesson, sheets };
  }, [lessonId, repository]);

  if (state.loading) return <LoadingState label="Laen tunni töölehti…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;

  const lesson = state.data.lesson;
  const sheets = state.data.sheets;
  const byId = new Map(sheets.map((sheet) => [sheet.worksheetId || sheet.id, sheet]));
  const profile = profileFor(lessonId);

  const generate = async () => {
    const existing = CORE.map(({ id }) => byId.get(id)).filter(Boolean);
    if (existing.length && !globalThis.confirm(`Tunnil on juba ${existing.length} põhitöölehte. Genereerimine loob neist uue mustandiversiooni; avaldatud versioon jääb alles. Jätkata?`)) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const previousActivityIds = existing.flatMap((sheet) => sheet?.generation?.activityIds || []);
      const variant = Math.max(0, ...existing.map((sheet) => Number(sheet?.generation?.variant) || Number(sheet?.worksheetDocVersion) || 0)) + 1;
      const result = generateLessonBundle({
        lesson,
        profile,
        activityHistory: previousActivityIds,
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
          generation: {
            generatorVersion: sheet.generatorVersion,
            recipeId: sheet.recipeId,
            seed: sheet.seed,
            scope: 'lesson-bundle',
            phase: sheet.role,
            focusIds: sheet.focusIds,
            profileVersion: sheet.profileVersion,
            size: 'standard',
            activityIds: sheet.activityIds,
            activityCatalogVersion: ACTIVITY_CATALOG_VERSION,
            didacticPlanVersion: 1,
            variant,
          },
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

  return (
    <div className="page-content generator-set-page">
      <Link className="generator-back" to="/library"><ArrowLeft size={16} /> Õppevara</Link>
      <PageHeader eyebrow="Tunni töölehed" title={lesson.title || 'Õppetund'} description="Avasta loob konteksti, Harjuta kinnistab täpsust ja Kasuta viib õpitu rääkimisse või kirjutamisse." actions={<Button onClick={generate} loading={busy} disabled={!profile}><Sparkles size={17} /> {sheets.length ? 'Genereeri uus variant' : 'Genereeri 3 töölehte'}</Button>} />
      {!profile ? <div className="generator-message" role="status">Generaator pole selle tunni jaoks veel valmis. Praegu on kontrollitud profiil tunnil a2b1-016.</div> : null}
      {error ? <div className="generator-message is-error" role="alert">{error}</div> : null}
      {notice ? <div className="generator-message is-ok" role="status">{notice}</div> : null}
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
    </div>
  );
}
