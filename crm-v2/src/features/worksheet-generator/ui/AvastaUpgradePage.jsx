import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../app/AuthContext.jsx';
import { Button, Card, ErrorState, LoadingState, PageHeader } from '../../../components/ui/index.js';
import { lessonWorksheetsService } from '../../../services/firebase/index.js';
import { ROLES } from '../../../utils/roles.js';
import { AVASTA_MODULE1_IDS, upgradeAvastaModule1Document } from '../admin/avastaModule1.js';

export default function AvastaUpgradePage({ repository = lessonWorksheetsService }) {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const isAdmin = user?.roles?.includes(ROLES.ADMIN);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const records = await Promise.all(AVASTA_MODULE1_IDS.map(async (lessonId) => {
        try {
          const record = await repository.load(lessonId, 'discover');
          const preview = upgradeAvastaModule1Document(lessonId, record.worksheetDoc);
          return { lessonId, record, preview, state: 'ready', message: '' };
        } catch (cause) {
          return { lessonId, record: null, preview: null, state: 'blocked', message: cause?.message || String(cause) };
        }
      }));
      setRows(records);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const blocked = useMemo(() => rows.filter((row) => row.state === 'blocked'), [rows]);
  const ready = rows.length === AVASTA_MODULE1_IDS.length && blocked.length === 0;

  const apply = async () => {
    if (!ready || applying) return;
    if (!window.confirm('Avaldada täiendatud Avasta töölehed a2b1-001–005? Olemasolevad plokid säilivad ja Harjuta/Kasuta ei muutu.')) return;
    setApplying(true);
    setError('');
    const next = [...rows];
    try {
      for (let index = 0; index < next.length; index += 1) {
        const row = next[index];
        next[index] = { ...row, state: 'saving', message: 'Avaldan…' };
        setRows([...next]);
        try {
          const saved = await repository.publish({
            lessonId: row.lessonId,
            worksheetId: 'discover',
            worksheetDoc: row.preview.document,
            user,
            baseUpdatedAt: row.record.worksheetDocUpdatedAt,
          });
          next[index] = {
            ...row,
            state: 'published',
            message: `Avaldatud · v${saved.worksheetDocVersion} · ${row.preview.after} plokki`,
            record: saved,
          };
        } catch (cause) {
          next[index] = { ...row, state: 'blocked', message: cause?.message || String(cause) };
          setRows([...next]);
          throw cause;
        }
        setRows([...next]);
      }
    } catch (cause) {
      setError(cause?.message || String(cause));
    } finally {
      setApplying(false);
    }
  };

  if (!isAdmin) return <ErrorState title="Puudub ligipääs" message="Seda hooldusvaadet saab kasutada ainult administraator." />;
  if (loading) return <LoadingState label="Kontrollin olemasolevaid Avasta töölehti…" />;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Õppevara · B1"
        title="Avasta kvaliteeditäiendus · moodul 1"
        description="a2b1-001–005. Säilitab olemasolevad plokid, lisab ainult puuduvad Avasta etapid ja avaldab sama discover-töölehe. Harjuta ja Kasuta jäävad puutumata."
      />
      {error ? <ErrorState title="Avaldamine peatus" message={error} /> : null}
      <Card>
        <div style={{ display: 'grid', gap: 12 }}>
          {rows.map((row) => (
            <div key={row.lessonId} style={{ display: 'grid', gridTemplateColumns: '130px 1fr auto', gap: 12, alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
              <b>{row.lessonId}</b>
              <div>
                {row.preview ? (
                  <>
                    <div><b>{row.preview.document.meta.title}</b> · {row.preview.before} → {row.preview.after} plokki</div>
                    <div className="form-hint">Lisatakse: {row.preview.added.length ? row.preview.added.join(', ') : 'midagi — nõuded on juba kaetud'} · tase B1 · {row.preview.document.meta.module}</div>
                  </>
                ) : <div>{row.message}</div>}
              </div>
              <div>{row.state === 'published' ? '✓ avaldatud' : row.state === 'blocked' ? '⚠ peatatud' : row.state === 'saving' ? '…' : 'valmis'}</div>
            </div>
          ))}
        </div>
      </Card>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Button onClick={apply} disabled={!ready || applying} loading={applying}>Rakenda ja avalda 001–005</Button>
        <Button variant="secondary" onClick={load} disabled={applying}>Kontrolli uuesti</Button>
        <span className="form-hint">Avaldamine peatub kohe, kui mõni leht puudub, on vahepeal muutunud või ületaks 9 plokki.</span>
      </div>
    </div>
  );
}
