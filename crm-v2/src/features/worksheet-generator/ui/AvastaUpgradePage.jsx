import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../app/AuthContext.jsx';
import { Button, Card, ErrorState, LoadingState, PageHeader } from '../../../components/ui/index.js';
import { lessonWorksheetsService } from '../../../services/firebase/index.js';
import { ROLES } from '../../../utils/roles.js';
import { AVASTA_MODULE1_IDS, upgradeAvastaModule1Document } from '../admin/avastaModule1.js';
import { AVASTA_MODULE2_IDS, upgradeAvastaModule2Document } from '../admin/avastaModule2.js';
import { AVASTA_MODULE3_IDS, upgradeAvastaModule3Document } from '../admin/avastaModule3.js';
import { AVASTA_MODULE4_IDS, upgradeAvastaModule4Document } from '../admin/avastaModule4.js';
import { AVASTA_MODULE5_IDS, upgradeAvastaModule5Document } from '../admin/avastaModule5.js';
import { AVASTA_MODULE6_IDS, upgradeAvastaModule6Document } from '../admin/avastaModule6.js';
import { AVASTA_MODULE7_IDS, upgradeAvastaModule7Document } from '../admin/avastaModule7.js';
import { AVASTA_MODULE8_IDS, upgradeAvastaModule8Document } from '../admin/avastaModule8.js';

const MISSING = 'Töölehte ei leitud.';
const MODULES = [
  { id: 'm1', title: 'A2 lähtepunkt ja igapäevaelu', ids: AVASTA_MODULE1_IDS, upgrade: upgradeAvastaModule1Document, allowCreate: false },
  { id: 'm2', title: 'Mina, pere ja suhted', ids: AVASTA_MODULE2_IDS, upgrade: upgradeAvastaModule2Document, allowCreate: false },
  { id: 'm3', title: 'Kodu, kohad ja linn', ids: AVASTA_MODULE3_IDS, upgrade: upgradeAvastaModule3Document, allowCreate: false },
  { id: 'm4', title: 'Aeg, plaanid ja kohustused', ids: AVASTA_MODULE4_IDS, upgrade: upgradeAvastaModule4Document, allowCreate: true },
  { id: 'm5', title: 'Lihtminevik ja kogemused', ids: AVASTA_MODULE5_IDS, upgrade: upgradeAvastaModule5Document, allowCreate: true },
  { id: 'm6', title: 'Toit ja teenindus', ids: AVASTA_MODULE6_IDS, upgrade: upgradeAvastaModule6Document, allowCreate: true },
  { id: 'm7', title: 'Tervis ja enesetunne', ids: AVASTA_MODULE7_IDS, upgrade: upgradeAvastaModule7Document, allowCreate: true },
  { id: 'm8', title: 'Õppimine ja kool', ids: AVASTA_MODULE8_IDS, upgrade: upgradeAvastaModule8Document, allowCreate: true },
];

export default function AvastaUpgradePage({ repository = lessonWorksheetsService }) {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingModule, setApplyingModule] = useState('');
  const [error, setError] = useState('');
  const isAdmin = user?.roles?.includes(ROLES.ADMIN);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const records = [];
      for (const module of MODULES) {
        for (const lessonId of module.ids) {
          try {
            const record = await repository.load(lessonId, 'discover');
            const preview = module.upgrade(lessonId, record.worksheetDoc);
            records.push({ lessonId, moduleId: module.id, moduleTitle: module.title, record, preview, state: 'ready', message: '' });
          } catch (cause) {
            if (module.allowCreate && cause?.message === MISSING) {
              const preview = module.upgrade(lessonId, null);
              records.push({ lessonId, moduleId: module.id, moduleTitle: module.title, record: null, preview, state: 'ready', message: 'Uus Avasta' });
            } else {
              records.push({ lessonId, moduleId: module.id, moduleTitle: module.title, record: null, preview: null, state: 'blocked', message: cause?.message || String(cause) });
            }
          }
        }
      }
      setRows(records);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => MODULES.map((module) => ({
    ...module,
    rows: rows.filter((row) => row.moduleId === module.id),
  })), [rows]);

  const applyModule = async (module) => {
    const moduleRows = rows.filter((row) => row.moduleId === module.id);
    const blocked = moduleRows.filter((row) => row.state === 'blocked');
    if (moduleRows.length !== module.ids.length || blocked.length || applyingModule) return;
    if (!window.confirm(`Avaldada Avasta töölehed ${module.ids[0]}–${module.ids.at(-1)}? Olemasolevad head plokid säilivad, puuduvad Avasta lehed luuakse. Harjuta/Kasuta ei muutu.`)) return;
    setApplyingModule(module.id);
    setError('');
    const next = [...rows];
    try {
      for (const target of moduleRows) {
        const index = next.findIndex((row) => row.lessonId === target.lessonId);
        next[index] = { ...target, state: 'saving', message: 'Avaldan…' };
        setRows([...next]);
        try {
          const fresh = !target.record;
          const saved = await repository.publish({
            lessonId: target.lessonId,
            worksheetId: 'discover',
            worksheetDoc: target.preview.document,
            user,
            baseUpdatedAt: target.record?.worksheetDocUpdatedAt || '',
            ...(fresh ? { role: 'discover', slot: 1, displayLabel: '1 Avasta', source: 'manual' } : {}),
          });
          next[index] = {
            ...target,
            state: 'published',
            message: `Avaldatud · v${saved.worksheetDocVersion} · ${target.preview.after} plokki`,
            record: saved,
          };
        } catch (cause) {
          next[index] = { ...target, state: 'blocked', message: cause?.message || String(cause) };
          setRows([...next]);
          throw cause;
        }
        setRows([...next]);
      }
    } catch (cause) {
      setError(cause?.message || String(cause));
    } finally {
      setApplyingModule('');
    }
  };

  if (!isAdmin) return <ErrorState title="Puudub ligipääs" message="Seda hooldusvaadet saab kasutada ainult administraator." />;
  if (loading) return <LoadingState label="Kontrollin olemasolevaid Avasta töölehti…" />;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Õppevara · B1"
        title="Avasta kvaliteeditäiendus · 001–040"
        description="001–015 täiendatakse olemasolevat sisu säilitades. 016–040 puhul täiendatakse olemasolevat Avasta lehte või luuakse puuduv leht täielikult. Harjuta ja Kasuta jäävad puutumata."
      />
      {error ? <ErrorState title="Avaldamine peatus" message={error} /> : null}
      {grouped.map((module) => {
        const blocked = module.rows.filter((row) => row.state === 'blocked');
        const ready = module.rows.length === module.ids.length && blocked.length === 0;
        return (
          <Card key={module.id}>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0 }}>{module.title}</h3>
                  <div className="form-hint">{module.ids[0]}–{module.ids.at(-1)}{module.allowCreate ? ' · loob puuduva Avasta' : ''}</div>
                </div>
                <Button onClick={() => applyModule(module)} disabled={!ready || Boolean(applyingModule)} loading={applyingModule === module.id}>
                  Rakenda ja avalda
                </Button>
              </div>
              {module.rows.map((row) => (
                <div key={row.lessonId} style={{ display: 'grid', gridTemplateColumns: '130px 1fr auto', gap: 12, alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                  <b>{row.lessonId}</b>
                  <div>
                    {row.preview ? (
                      <>
                        <div><b>{row.preview.document.meta.title}</b> · {row.preview.before} → {row.preview.after} plokki</div>
                        <div className="form-hint">{row.preview.created ? 'Luuakse uus Avasta' : `Lisatakse: ${row.preview.added.length ? row.preview.added.join(', ') : 'midagi — nõuded on juba kaetud'}`} · B1 · {row.preview.document.meta.module}</div>
                      </>
                    ) : <div>{row.message}</div>}
                  </div>
                  <div>{row.state === 'published' ? '✓ avaldatud' : row.state === 'blocked' ? '⚠ peatatud' : row.state === 'saving' ? '…' : 'valmis'}</div>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Button variant="secondary" onClick={load} disabled={Boolean(applyingModule)}>Kontrolli uuesti</Button>
        <span className="form-hint">Iga moodul avaldatakse eraldi. Avaldamine peatub kohe, kui leht on vahepeal muutunud või kvaliteedireeglid ei läbi kontrolli.</span>
      </div>
    </div>
  );
}
