import { useCallback, useEffect, useMemo, useState } from 'react';
import { Mic } from 'lucide-react';
import { Button, Card } from '../../components/ui/index.js';
import { lessonRecordingsService } from '../../services/firebase/lessonRecordings.js';
import { studentBoardService } from '../../services/firebase/studentBoard.js';
import LessonsCard from './TranscriptView.jsx';
import { lessonTimeline } from './lessonTimeline.js';

// Student card → "Õppetöö": consent for lesson recording and the recorded lessons with their text.
export default function StudentRecordingsPanel({ student, user, isAdmin = false, service = lessonRecordingsService, boardService = studentBoardService }) {
  const [consent, setConsent] = useState(student.recordingConsent === true);
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState({ loading: true, error: '', items: [] });

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    Promise.resolve().then(() => service.listForStudent({ studentId: student.id, user, isAdmin }))
      .then((items) => setState({ loading: false, error: '', items }))
      .catch((err) => setState({ loading: false, error: err.message || 'Salvestisi ei saanud laadida.', items: [] }));
  }, [isAdmin, service, student.id, user]);
  useEffect(() => { load(); }, [load]);
  // board lesson pages, so every lesson row can open its own page of the board
  const [pages, setPages] = useState([]);
  useEffect(() => {
    try { return boardService.subscribePages(student.id, setPages, () => setPages([])); } catch { return undefined; }
  }, [boardService, student.id]);
  const rows = useMemo(() => lessonTimeline(state.items, pages), [pages, state.items]);

  const toggle = async () => {
    setSaving(true);
    try { const r = await service.setConsent({ studentId: student.id, value: !consent, user }); setConsent(r.recordingConsent); }
    catch (err) { setState((s) => ({ ...s, error: err.message || 'Nõusolekut ei saanud salvestada.' })); }
    finally { setSaving(false); }
  };

  return (
    <>
      <Card className="profile-wide">
        <div className="section-heading"><div><span className="eyebrow">Tunni salvestamine</span><h2>{consent ? 'Nõusolek on olemas' : 'Nõusolekut ei ole'}</h2></div><Mic size={22} aria-hidden="true" /></div>
        <p className="form-hint">Live Classroomis saab tundi salvestada ainult siis, kui õpilane (alaealise puhul lapsevanem) on nõus. Salvestamise ajal näeb õpilane märki „Tundi salvestatakse”. Heli kustutatakse 60 päeva pärast, tekst jääb.</p>
        <div><Button variant={consent ? 'secondary' : 'primary'} loading={saving} onClick={toggle}>{consent ? 'Tühista nõusolek' : 'Märgi nõusolek saadud'}</Button></div>
      </Card>
      <div className="profile-wide"><LessonsCard rows={rows} studentId={student.id} loading={state.loading} error={state.error} onReload={load} /></div>
    </>
  );
}
