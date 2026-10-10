import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../app/AuthContext.jsx';
import { Button, Card, ErrorState, LoadingState, Modal, PageHeader } from '../../../components/ui/index.js';
import { lessonWorksheetsService } from '../../../services/firebase/lessonWorksheets.js';
import { ROLES } from '../../../utils/roles.js';
import { analyzeWorksheet } from '../../worksheet-studio/quality.js';
import { sheetMinutes } from '../../worksheet-studio/didactics/timeEstimate.js';
import { COURSE_MODULES, COURSES, PHASES, moduleNumber, moduleSheets } from '../admin/course/registry.js';
import { moduleProblems } from '../admin/course/quality.js';

const StudioSheetPreview = lazy(() => import('../../library/StudioSheetPreview.jsx'));
const MISSING = 'Töölehte ei leitud.';

// „Kursuse tootmine”: the B1 / B2 course sheets written in code (admin/course/*), checked by the quality gate, previewed
// as they print and published lesson by lesson into Õppevara. A sheet that already exists is replaced only after an
// explicit confirmation; nothing is written without the admin's click.
export default function CourseProductionPage({ repository = lessonWorksheetsService, modules = COURSE_MODULES }) {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes(ROLES.ADMIN);
  const [moduleId, setModuleId] = useState(modules[0]?.MODULE.id || '');
  const mod = modules.find((m) => m.MODULE.id === moduleId) || modules[0];
  const sheets = useMemo(() => (mod ? moduleSheets(mod) : {}), [mod]);
  const problems = useMemo(() => moduleProblems(sheets), [sheets]);
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    const next = {};
    try {
      for (const lessonId of Object.keys(sheets)) {
        for (const phase of Object.keys(sheets[lessonId])) {
          try { next[`${lessonId}:${phase}`] = await repository.load(lessonId, phase); }
          catch (cause) { if (cause?.message !== MISSING) throw cause; next[`${lessonId}:${phase}`] = null; }
        }
      }
      setRecords(next);
    } catch (cause) { setError(cause?.message || String(cause)); } finally { setLoading(false); }
  }, [repository, sheets]);
  useEffect(() => { if (isAdmin && mod) load(); }, [isAdmin, mod, load]);

  if (!isAdmin) return <ErrorState title="Puudub ligipääs" message="Seda vaadet saab kasutada ainult administraator." />;
  if (!mod) return <ErrorState title="Mooduleid pole" message="Kursuse tootmises pole veel ühtegi moodulit." />;

  const publishLesson = async (lessonId) => {
    const phases = Object.keys(sheets[lessonId]);
    const replacing = phases.filter((p) => records[`${lessonId}:${p}`]);
    const text = `Avaldada ${lessonId}: ${phases.map((p) => PHASES[p].label).join(' + ')}?${replacing.length ? `\n\nNB! Olemasolev leht asendatakse uue versiooniga: ${replacing.map((p) => PHASES[p].label).join(', ')}.` : ''}`;
    if (!window.confirm(text)) return;
    setBusy(lessonId); setError('');
    try {
      for (const phase of phases) {
        const saved = await repository.publish({
          lessonId, worksheetId: phase, worksheetDoc: sheets[lessonId][phase], user,
          baseUpdatedAt: records[`${lessonId}:${phase}`]?.worksheetDocUpdatedAt || '',
          role: phase, slot: PHASES[phase].slot, displayLabel: PHASES[phase].label, source: 'manual',
        });
        setRecords((r) => ({ ...r, [`${lessonId}:${phase}`]: saved }));
      }
    } catch (cause) { setError(cause?.message || String(cause)); await load(); } finally { setBusy(''); }
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Õppevara · kursuse tootmine" title="B1 ja B2 töölehed" description="Töölehed on kirjutatud koodis, läbivad kvaliteedikontrolli (konstruktori kontroll, taseme normid, vaheldus) ja avaldatakse tund haaval." />
      <Card>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }} role="radiogroup" aria-label="Moodul">
          {modules.map((m) => (
            <Button key={m.MODULE.id} variant={m.MODULE.id === mod.MODULE.id ? 'primary' : 'secondary'} role="radio" aria-checked={m.MODULE.id === mod.MODULE.id} onClick={() => setModuleId(m.MODULE.id)}>
              {COURSES[m.MODULE.course].label.split(' ·')[0]} · moodul {moduleNumber(m)} · {m.MODULE.title}
            </Button>
          ))}
        </div>
        <p className="form-hint" style={{ marginTop: 10 }}>
          {problems.length ? `⚠ Kvaliteedikontroll: ${problems.length} probleemi — avaldamine on lukus.` : '✓ Kvaliteedikontroll läbitud: vormid, taseme normid ja vaheldus on korras.'}
        </p>
        {problems.length ? <ul className="form-error">{problems.map((p, i) => <li key={i}>{p.lessonId} {p.phase}: {p.text}</li>)}</ul> : null}
      </Card>
      {error ? <ErrorState title="Viga" message={error} /> : null}
      {loading ? <LoadingState label="Kontrollin olemasolevaid töölehti…" /> : Object.entries(sheets).map(([lessonId, phases]) => (
        <Card key={lessonId}>
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div><h3 style={{ margin: 0 }}>{lessonId} · {mod.LESSONS[lessonId].title}</h3><span className="form-hint">{mod.LESSONS[lessonId].canDo}</span></div>
              <Button onClick={() => publishLesson(lessonId)} disabled={Boolean(busy) || problems.length > 0} loading={busy === lessonId}>Avalda tund</Button>
            </div>
            {Object.entries(phases).map(([phase, doc]) => {
              const record = records[`${lessonId}:${phase}`];
              const score = analyzeWorksheet(doc).didactics.score;
              return (
                <div key={phase} style={{ display: 'grid', gridTemplateColumns: '110px 1fr auto auto', gap: 12, alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  <b>{PHASES[phase].label}</b>
                  <span className="form-hint">{doc.blocks.length} plokki · {[...new Set(doc.blocks.map((b) => b.type))].join(', ')} · didaktika {score} · ≈ {sheetMinutes(doc)} min</span>
                  <span>{record ? `olemas v${record.worksheetDocVersion || 0}${record.publishedWorksheetDocVersion ? ' · avaldatud' : ''}` : 'uus'}</span>
                  <Button variant="secondary" onClick={() => setPreview({ lessonId, phase, doc })}>Vaata</Button>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
      <Modal open={Boolean(preview)} title={preview ? `${preview.lessonId} · ${PHASES[preview.phase].label}` : ''} onClose={() => setPreview(null)} className="modal--editor">
        {preview ? <Suspense fallback={<LoadingState label="Laen eelvaadet…" />}><StudioSheetPreview doc={preview.doc} /></Suspense> : null}
      </Modal>
    </div>
  );
}
