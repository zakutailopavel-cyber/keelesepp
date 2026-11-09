import { CalendarCheck, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge, Button, Card, LoadingState, Select } from '../../components/ui/index.js';
import { teacherDigestService } from '../../services/firebase/teacherDigest.js';
import { firebaseErrorMessage } from '../../utils/firebaseErrors.js';

// Seaded → „Õpetajatele iganädalane märkimata tundide kiri” (owner 2026-11-09, on by default): every Monday at 08:00
// each teacher with past unmarked lessons gets the list of his own (from 2026-11-01) by e-mail and in the bell. Learners
// and parents never get it. The switch is written only by the server (/teacher-digest/settings); the test copy goes to
// the administrator's own address only. functions/teacher-unmarked-digest-*.js, docs/EMAIL_NOTIFICATIONS.md.
export default function TeacherDigestCard({ user, service = teacherDigestService }) {
  const [settings, setSettings] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [teacherUid, setTeacherUid] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let alive = true;
    service.getSettings().then((value) => { if (alive) setSettings(value); }).catch((err) => { if (alive) { setSettings({ weeklyUnmarked: true }); setError(firebaseErrorMessage(err)); } });
    Promise.resolve(service.listTeachers?.()).then((list) => { if (alive) setTeachers(list || []); }).catch(() => {});
    return () => { alive = false; };
  }, [service]);

  const toggle = async (weeklyUnmarked) => {
    setBusy('save'); setError(''); setNotice('');
    try {
      setSettings(await service.saveSettings({ weeklyUnmarked }));
      setNotice(weeklyUnmarked ? 'Nädalakiri on sees: järgmine esmaspäeval kell 08:00.' : 'Nädalakiri on välja lülitatud.');
    } catch (err) { setError(err.message || 'Salvestamine ebaõnnestus.'); } finally { setBusy(''); }
  };
  const sendTest = async () => {
    setBusy('test'); setError(''); setNotice('');
    try {
      const result = await service.sendTest({ teacherUid });
      setNotice(result.sent
        ? `Proovikiri (${result.teacherName}: ${result.total} märkimata) saadeti sinu aadressile ${user?.email || ''}.`
        : `${result.teacherName || 'Õpetajal'} pole märkimata tunde — kirja ei saadetud.`);
    } catch (err) { setError(err.message || 'Proovikirja ei saanud saata.'); } finally { setBusy(''); }
  };

  return (
    <Card className="teacher-digest-card">
      <div className="settings-icon"><CalendarCheck /></div>
      <h2>Õpetajatele iganädalane märkimata tundide kiri</h2>
      <p className="settings-copy">Igal esmaspäeval kell 08:00 saab iga õpetaja, kellel on märkimata tunde, e-kirja oma tundide nimekirjaga (alates 01.11.2026: kuupäev, kellaaeg, õpilane, õppeaine; arhiveeritud õpilased ja suletud perioodid ei lähe arvesse) ja sama teate kellukesse. Kiri läheb ainult õpetaja kinnitatud aadressile, kord nädalas. Õpilased ja vanemad seda ei saa.</p>
      {!settings ? <LoadingState inline className="form-hint" label="Laen…" /> : <>
        <label className="learner-emails-card__toggle">
          <input type="checkbox" checked={settings.weeklyUnmarked} disabled={busy === 'save'} onChange={(event) => toggle(event.target.checked)} aria-label="Õpetajatele iganädalane märkimata tundide kiri" />
          <span><span className="learner-emails-card__title"><strong>Saada õpetajatele</strong>{settings.weeklyUnmarked ? <Badge tone="success">sees</Badge> : <Badge>väljas</Badge>}</span><small>Esmaspäeviti 08:00</small></span>
        </label>
        <div className="settings-profile-form">
          <Select id="teacher-digest-teacher" label="Proovikiri: kelle kiri" value={teacherUid} onChange={(event) => setTeacherUid(event.target.value)}>
            <option value="">Kõige rohkem märkimata tunde</option>
            {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
          </Select>
          <Button variant="secondary" loading={busy === 'test'} onClick={sendTest}><Send size={16} /> Saada mulle proovikiri</Button>
        </div>
      </>}
      {notice ? <p className="form-hint" role="status">{notice}</p> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </Card>
  );
}
