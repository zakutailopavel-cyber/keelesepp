import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, Modal } from '../../components/ui/index.js';
import { lessonChangeRequestsService, teacherAvailabilityService } from '../../services/firebase/index.js';
import { buildRequest, isLate, proposalSlots, slotLabel } from '../calendar/rescheduleModel.js';
import { localDate } from '../../utils/localDate.js';

const today = () => localDate();

/**
 * „Ei saa tulla?” — the student (or parent) either only reports the absence („Ma ei tule”) or picks up to three new
 * times from the teacher's free windows or writes one; a reason is optional. The lesson stays where it is until the
 * teacher answers (an absence is marked „Puudus (teatas ette)”).
 */
export default function RescheduleDialog({ lesson, student, user, role = 'student', busy = [], onClose, onSent, availabilityRepository = teacherAvailabilityService, requests = lessonChangeRequestsService }) {
  const [busyAtOpen] = useState(busy); // the student's own lessons when the dialog opened
  const [slots, setSlots] = useState(null);
  const [picked, setPicked] = useState([]);
  const [other, setOther] = useState('');
  const [reason, setReason] = useState('');
  const [absent, setAbsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    Promise.resolve().then(() => availabilityRepository.get(lesson.teacherUid))
      .then((availability) => live && setSlots(proposalSlots({ availability, lesson, from: today(), busy: busyAtOpen })))
      .catch(() => live && setSlots([]));
    return () => { live = false; };
  }, [availabilityRepository, lesson, busyAtOpen]);

  const toggle = (slot) => setPicked((current) => (current.some((item) => item.date === slot.date && item.time === slot.time)
    ? current.filter((item) => item.date !== slot.date || item.time !== slot.time)
    : current.length >= 3 ? current : [...current, slot]));

  const send = async () => {
    setError('');
    try {
      const request = buildRequest({ lesson, student, user, role, proposals: picked, other, reason, absent });
      setSaving(true);
      onSent?.(await requests.create(request));
    } catch (sendError) {
      setError(sendError?.message || 'Palvet ei saanud saata.');
    } finally { setSaving(false); }
  };

  const when = `${new Date(`${lesson.occurrenceDate}T12:00:00`).toLocaleDateString('et-EE', { weekday: 'long', day: 'numeric', month: 'long' })} kell ${lesson.time}`;
  return <Modal open title="Ei saa tunnile tulla?" onClose={onClose} footer={<>
    <Button variant="secondary" onClick={onClose} disabled={saving}>Jätan tunni alles</Button>
    <Button onClick={send} loading={saving}>{absent ? 'Saada teade' : 'Saada palve'}</Button>
  </>}>
    <p>Tund: <strong>{when}</strong>{lesson.teacher ? ` · ${lesson.teacher}` : ''}.</p>
    <div className="form-actions" role="group" aria-label="Mida soovid?">
      <Button variant={absent ? 'primary' : 'secondary'} aria-pressed={absent} onClick={() => setAbsent(true)}>Ma ei tule · uut aega pole vaja</Button>
      <Button variant={absent ? 'secondary' : 'primary'} aria-pressed={!absent} onClick={() => setAbsent(false)}>Soovin uut aega</Button>
    </div>
    {absent ? <p className="form-hint">Õpetaja saab teate, et sa sellesse tundi ei tule.</p> : <>
    <p className="form-hint">Vali kuni kolm uut aega õpetaja vabadest aegadest. Õpetaja kinnitab ühe neist.</p>
    {slots === null ? <p className="form-hint">Laen vabu aegu…</p> : slots.length ? <div className="form-actions" role="group" aria-label="Uued ajad">
      {slots.map((slot) => {
        const on = picked.some((item) => item.date === slot.date && item.time === slot.time);
        return <Button key={`${slot.date} ${slot.time}`} variant={on ? 'primary' : 'secondary'} aria-pressed={on} onClick={() => toggle(slot)}>{slotLabel(slot)}</Button>;
      })}
    </div> : <p className="form-hint">Õpetaja ei ole järgmiseks kaheks nädalaks vabu aegu märkinud. Kirjuta allpool, millal sulle sobiks.</p>}
    <div className="field"><label className="field__label" htmlFor="reschedule-other">Muu aeg (soovi korral)</label>
      <textarea id="reschedule-other" className="field__textarea" rows="2" value={other} onChange={(event) => setOther(event.target.value)} placeholder="Näiteks: reedel pärast kella 15" /></div>
    </>}
    <div className="field"><label className="field__label" htmlFor="reschedule-reason">Põhjus (soovi korral)</label>
      <textarea id="reschedule-reason" className="field__textarea" rows="2" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Näiteks: mul on kunstikool" /></div>
    {isLate(lesson) ? <p className="form-hint" role="note"><AlertTriangle size={15} aria-hidden="true" /> Tunnini on vähem kui 24 tundi: õpetaja võib selle tunni lugeda toimunuks.</p> : null}
    {error ? <p className="action-error" role="alert">{error}</p> : null}
  </Modal>;
}
