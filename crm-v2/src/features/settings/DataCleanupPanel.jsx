import { Eraser } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card } from '../../components/ui/index.js';
import { homeworkService, maintenanceService, messagesService, scheduleService, studentsService, teachersService } from '../../services/firebase/index.js';
import { canonicalTeacherName } from '../../utils/teachers.js';

import { findCleanup, OLD_DAYS } from './cleanupModel.js';

function Section({ title, hint, rows, selected, onToggle, renderExtra, actionLabel, busy, onApply }) {
  const chosen = rows.filter((row) => selected.has(row.id));
  return (
    <section className="cleanup-section">
      <div className="cleanup-section__head"><h3>{title}</h3><Badge tone={rows.length ? 'warning' : 'success'}>{rows.length}</Badge></div>
      <p className="form-hint">{hint}</p>
      {rows.length ? (
        <>
          <ul className="cleanup-list">
            {rows.map((row) => (
              <li key={row.id}>
                <label><input type="checkbox" checked={selected.has(row.id)} onChange={() => onToggle(row.id)} /><span><strong>{row.label}</strong>{row.detail ? <small>{row.detail}</small> : null}</span></label>
                {renderExtra ? renderExtra(row) : null}
              </li>
            ))}
          </ul>
          <Button variant="secondary" loading={busy} disabled={!chosen.length} onClick={() => onApply(chosen)}>{actionLabel} ({chosen.length})</Button>
        </>
      ) : <p className="cleanup-ok">Korras.</p>}
    </section>
  );
}

export default function DataCleanupPanel({ user, repositories = { students: studentsService, schedule: scheduleService, homework: homeworkService, messages: messagesService, maintenance: maintenanceService, teachers: teachersService } }) {
  const [found, setFound] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selected, setSelected] = useState({ noTeacher: new Set(), topics: new Set(), oldHomework: new Set(), conversations: new Set() });
  const [teachers, setTeachers] = useState({});
  const [staff, setStaff] = useState([]);

  const search = async () => {
    setLoading(true); setError(''); setNotice('');
    try {
      const [studentsResult, schedule, lessons, homework, messages, staffList] = await Promise.all([
        repositories.students.list({ pageSize: 500, exhaustive: true }),
        repositories.schedule.list(),
        repositories.maintenance.listLessons(),
        repositories.homework.list(),
        repositories.messages.list(),
        repositories.teachers.list().catch(() => []),
      ]);
      setStaff((staffList || []).map((item) => canonicalTeacherName(item.name)).filter(Boolean));
      const result = findCleanup({ students: studentsResult.items || [], schedule, lessons, homework, messages, userUid: user?.uid || '' });
      setFound(result);
      setTeachers(Object.fromEntries(result.noTeacher.map((row) => [row.id, row.suggestion])));
      setSelected({
        noTeacher: new Set(result.noTeacher.filter((row) => row.suggestion).map((row) => row.id)),
        topics: new Set(result.topics.map((row) => row.id)),
        oldHomework: new Set(result.oldHomework.map((row) => row.id)),
        conversations: new Set(result.conversations.map((row) => row.id)),
      });
    } catch (searchError) {
      setError(searchError.message || 'Andmeid ei saanud laadida.');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (key) => (id) => setSelected((current) => {
    const next = new Set(current[key]);
    if (next.has(id)) next.delete(id); else next.add(id);
    return { ...current, [key]: next };
  });

  const run = async (key, question, task, done) => {
    if (!globalThis.confirm(question)) return;
    setBusy(key); setError(''); setNotice('');
    try {
      await task();
      await search();
      // after the new search: it clears old messages
      setNotice(done);
    } catch (runError) {
      setError(runError.message || 'Muudatust ei saanud teha.');
    } finally {
      setBusy('');
    }
  };

  const allTeachers = found ? [...new Set([...found.noTeacher.map((row) => row.suggestion), ...staff].filter(Boolean))] : [];

  return (
    <Card className="cleanup-card">
      <div className="settings-icon"><Eraser /></div>
      <h2>Andmete korrastus</h2>
      <p className="settings-copy">Leiab õpetajata õpilased, tühjad teemad „Uus tööleht”, ammu aegunud kodutööd ja testvestlused. Muudetakse ainult märgitud read, iga toiming küsib kinnitust ja jääb tegevuste logisse.</p>
      <Button variant="secondary" loading={loading} onClick={search}>{found ? 'Otsi uuesti' : 'Otsi korrastamist vajavad andmed'}</Button>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {notice ? <p className="success-notice" role="status">{notice}</p> : null}
      {found ? (
        <div className="cleanup-sections">
          <Section
            title="Õpetajata õpilased"
            hint="Õpetaja pakutakse kalendri tundide järgi. Ilma tundideta õpilasel vali õpetaja ise või jäta märkimata."
            rows={found.noTeacher}
            selected={selected.noTeacher}
            onToggle={toggle('noTeacher')}
            renderExtra={(row) => (
              <select aria-label={`Õpetaja: ${row.label}`} value={teachers[row.id] || ''} onChange={(event) => setTeachers((current) => ({ ...current, [row.id]: event.target.value }))}>
                <option value="">— vali —</option>
                {[...new Set([row.suggestion, ...allTeachers].filter(Boolean))].map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            )}
            actionLabel="Määra õpetaja"
            busy={busy === 'noTeacher'}
            onApply={(rows) => {
              const ready = rows.filter((row) => teachers[row.id]);
              return run('noTeacher', `Määran õpetaja ${ready.length} õpilasele?`, async () => {
                for (const row of ready) await repositories.students.update(row.id, { teacher: teachers[row.id] });
              }, `Õpetaja määrati ${ready.length} õpilasele.`);
            }}
          />
          <Section
            title="Teema „Uus tööleht”"
            hint="Tühja töölehe vaikimisi nimi on jäänud tunni teemaks. Teema tühjendatakse, tund ja selle märge jäävad."
            rows={found.topics}
            selected={selected.topics}
            onToggle={toggle('topics')}
            actionLabel="Tühjenda teema"
            busy={busy === 'topics'}
            onApply={(rows) => run('topics', `Tühjendan ${rows.length} tunni teema?`, () => repositories.maintenance.clearLessonTopics(rows.map((row) => row.lesson), user), `${rows.length} tunni teema tühjendati.`)}
          />
          <Section
            title={`Aegunud kodutööd (tähtaeg üle ${OLD_DAYS} päeva tagasi)`}
            hint="Märgitakse „Suletud”: kodutöö jääb alles, kuid ei ole enam avatud ega hilinenud."
            rows={found.oldHomework}
            selected={selected.oldHomework}
            onToggle={toggle('oldHomework')}
            actionLabel="Sulge"
            busy={busy === 'oldHomework'}
            onApply={(rows) => run('oldHomework', `Suleme ${rows.length} vana kodutööd?`, () => repositories.maintenance.closeHomework(rows.map((row) => row.item), user), `${rows.length} kodutööd suleti.`)}
          />
          <Section
            title="Testvestlused"
            hint="Vestlused, mille nimes või tekstis on „test”, „smoke” või „outbound”. Nende sõnumid kustutatakse jäädavalt."
            rows={found.conversations}
            selected={selected.conversations}
            onToggle={toggle('conversations')}
            actionLabel="Kustuta vestlused"
            busy={busy === 'conversations'}
            onApply={(rows) => {
              const ids = rows.flatMap((row) => row.messageIds);
              return run('conversations', `Kustutan jäädavalt ${rows.length} vestlust (${ids.length} sõnumit)?`, () => repositories.maintenance.deleteMessages(ids, user, rows.map((row) => row.label).join(', ')), `${rows.length} testvestlust kustutati.`);
            }}
          />
        </div>
      ) : null}
    </Card>
  );
}
