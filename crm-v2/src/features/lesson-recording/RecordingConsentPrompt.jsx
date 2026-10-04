import { useState } from 'react';
import { Button, Modal } from '../../components/ui/index.js';
import { lessonRecordingsService } from '../../services/firebase/lessonRecordings.js';
import { consentQuestionFor } from './consentModel.js';

// One-time question on the first login of a student or parent: may the lessons be recorded and turned into text?
// The answer is stored on the student card with the person's own uid; staff can change it on the card later.
export default function RecordingConsentPrompt({ students = [], user, role = 'student', service = lessonRecordingsService }) {
  const [answered, setAnswered] = useState({});
  const [later, setLater] = useState(false);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const pending = consentQuestionFor(students, role).filter((student) => !(student.id in answered));
  const current = pending[0];
  if (!current || later || !user?.uid) return null;

  const answer = async (value) => {
    setSaving(value ? 'yes' : 'no');
    setError('');
    try {
      await service.answerConsent({ studentId: current.id, value, user });
      setAnswered((items) => ({ ...items, [current.id]: value }));
    } catch (nextError) {
      setError(nextError?.message || 'Vastust ei saanud salvestada. Proovi uuesti.');
    } finally {
      setSaving('');
    }
  };
  const name = role === 'parent' ? current.name : '';

  return <Modal open title="Tunni salvestamine · Запись урока" onClose={() => setLater(true)} footer={<>
    <Button variant="secondary" loading={saving === 'no'} disabled={Boolean(saving)} onClick={() => answer(false)}>Ei nõustu · Не согласен</Button>
    <Button loading={saving === 'yes'} disabled={Boolean(saving)} onClick={() => answer(true)}>Nõustun · Согласен</Button>
  </>}>
    <div className="consent-prompt">
      <p><strong>{name ? `${name}: ` : ''}kas KeeleSepp võib veebitunde salvestada?</strong></p>
      <p>Tunni heli muudetakse tekstiks, et õpetaja näeks pärast tundi, mida {name ? 'õpilane' : 'sa'} ütlesid ja mis vajab harjutamist.
        Salvestist näevad ainult õpetaja, {name ? 'õpilane' : 'sina'} ja kooli administraator. Heli kustutatakse 60 päeva pärast, tekst jääb õppeajalukku.
        Salvestamise ajal on tunniruumis näha „Tundi salvestatakse”.</p>
      <p lang="ru">{name ? `${name}: ` : ''}можно ли записывать онлайн-уроки? Звук урока превращается в текст, чтобы учитель после урока видел, что {name ? 'ученик говорил' : 'ты говорил(а)'} и что нужно потренировать.
        Запись видят только учитель, {name ? 'ученик' : 'ты'} и администратор школы. Звук удаляется через 60 дней, текст остаётся в истории обучения.</p>
      <p className="form-hint">Otsust saab hiljem muuta, kirjutades õpetajale. · Решение можно изменить позже, написав учителю.</p>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </div>
  </Modal>;
}
