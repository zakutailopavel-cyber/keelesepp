import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../app/AuthContext.jsx';
import { Button, Card, ErrorState, LoadingState, PageHeader } from '../../../components/ui/index.js';
import { lessonWorksheetsService } from '../../../services/firebase/lessonWorksheets.js';
import { ROLES } from '../../../utils/roles.js';
import { buildModule1Worksheet, MODULE1_LESSON_IDS, MODULE1_PHASES, module1VocabularyCycle } from '../admin/module1ThreePhase.js';

const PHASE = {
  discover: { label: '1 Avasta', slot: 1 },
  practice: { label: '2 Harjuta', slot: 2 },
  transfer: { label: '3 Kasuta', slot: 3 },
};

const MISSING = 'Töölehte ei leitud.';

export default function Module1ThreePhasePage({ repository = lessonWorksheetsService }) {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState('');
  const [error, setError] = useState('');
  const isAdmin = user?.roles?.includes(ROLES.ADMIN);
  const cycle = useMemo(() => module1VocabularyCycle(), []);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const next = [];
      for (const lessonId of MODULE1_LESSON_IDS) {
        for (const phase of MODULE1_PHASES) {
          const worksheetDoc = buildModule1Worksheet(lessonId, phase);
          try {
            const record = await repository.load(lessonId, phase);
            next.push({ lessonId, phase, record, worksheetDoc, state: 'ready', message: `v${record.worksheetDocVersion || 0} → uus versioon` });
          } catch (cause) {
            if (cause?.message === MISSING) next.push({ lessonId, phase, record: null, worksheetDoc, state: 'ready', message: 'uus tööleht' });
            else next.push({ lessonId, phase, record: null, worksheetDoc, state: 'blocked', message: cause?.message || String(cause) });
          }
        }
      }
      setRows(next);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => MODULE1_LESSON_IDS.map((lessonId) => ({
    lessonId,
    rows: rows.filter((row) => row.lessonId === lessonId),
  })), [rows]);

  const publishLesson = async (lessonId) => {
    const lessonRows = rows.filter((row) => row.lessonId === lessonId);
    if (lessonRows.length !== 3 || lessonRows.some((row) => row.state === 'blocked') || publishing) return;
    if (!window.confirm(`Avaldada ${lessonId}: Avasta + Harjuta + Kasuta? Kõik kolm kirjutatakse uue kvaliteedistandardi järgi uue versioonina.`)) return;
    setPublishing(lessonId);
    setError('');
    const next = [...rows];
    try {
      for (const target of lessonRows) {
        const index = next.findIndex((row) => row.lessonId === target.lessonId && row.phase === target.phase);
        next[index] = { ...target, state: 'saving', message: 'Avaldan…' };
        setRows([...next]);
        const info = PHASE[target.phase];
        const saved = await repository.publish({
          lessonId: target.lessonId,
          worksheetId: target.phase,
          worksheetDoc: target.worksheetDoc,
          user,
          baseUpdatedAt: target.record?.worksheetDocUpdatedAt || '',
          role: target.phase,
          slot: info.slot,
          displayLabel: info.label,
          source: 'manual',
        });
        next[index] = { ...target, record: saved, state: 'published', message: `Avaldatud · v${saved.worksheetDocVersion} · ${target.worksheetDoc.blocks.length} plokki` };
        setRows([...next]);
      }
    } catch (cause) {
      setError(cause?.message || String(cause));
      await load();
    } finally {
      setPublishing('');
    }
  };

  if (!isAdmin) return <ErrorState title="Puudub ligipääs" message="Seda hooldusvaadet saab kasutada ainult administraator." />;
  if (loading) return <LoadingState label="Kontrollin mooduli 1 töölehti…" />;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Õppevara · A2 → B1"
        title="Moodul 1 · Avasta + Harjuta + Kasuta"
        description="001–005 koostatakse uue KeeleSepp standardi järgi: grammatiline selgroog, tsükliline sõnavara, 3 vormi + vene tõlge, vähemalt 5 küsimust küsimusplokis ja eri ülesandetüübid."
      />
      {error ? <ErrorState title="Avaldamine peatus" message={error} /> : null}
      <Card>
        <div style={{ display: 'grid', gap: 6 }}>
          <b>Grammatiline selgroog</b>
          <span className="form-hint">{cycle.grammar}</span>
          <b>Põhisõnavara</b>
          <span className="form-hint">{cycle.core.join(' · ')}</span>
        </div>
      </Card>
      {grouped.map((group) => {
        const ready = group.rows.length === 3 && group.rows.every((row) => row.state !== 'blocked');
        return (
          <Card key={group.lessonId}>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0 }}>{group.lessonId}</h3>
                  <div className="form-hint">{group.rows[0]?.worksheetDoc?.meta?.title || ''}</div>
                </div>
                <Button onClick={() => publishLesson(group.lessonId)} disabled={!ready || Boolean(publishing)} loading={publishing === group.lessonId}>
                  Avalda 3 etappi
                </Button>
              </div>
              {group.rows.map((row) => (
                <div key={row.phase} style={{ display: 'grid', gridTemplateColumns: '130px 1fr auto', gap: 12, alignItems: 'center', paddingBottom: 9, borderBottom: '1px solid var(--border)' }}>
                  <b>{PHASE[row.phase].label}</b>
                  <span>{row.worksheetDoc.blocks.length} plokki · {row.message}</span>
                  <span>{row.state === 'published' ? '✓ avaldatud' : row.state === 'blocked' ? '⚠' : row.state === 'saving' ? '…' : 'valmis'}</span>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Button variant="secondary" onClick={load} disabled={Boolean(publishing)}>Kontrolli uuesti</Button>
        <span className="form-hint">Avalda üks tund korraga, seejärel kontrolli kõiki kolme Õpilase vaates enne järgmise tunni avaldamist.</span>
      </div>
    </div>
  );
}
