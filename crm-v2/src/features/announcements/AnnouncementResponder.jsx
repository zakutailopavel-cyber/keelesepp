import { Check, Pencil, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/index.js';
import { studentAvailabilityService } from '../../services/firebase/studentAvailability.js';
import PollGrid from '../availability-poll/PollGrid.jsx';
import { PRESETS, cellsOf, pollPayload, withPreset } from '../availability-poll/pollModel.js';
import { availabilityText, when } from './announcementModel.js';
import '../availability-poll/availabilityPoll.css';

const DAYS = { Mon: 'E', Tue: 'T', Wed: 'K', Thu: 'N', Fri: 'R', Sat: 'L', Sun: 'P' };
const PRESET_LABELS = { weekdayEvenings: 'Tööpäeva õhtud 17–21', weekdayDays: 'Tööpäeviti 9–17', weekend: 'Nädalavahetus 10–18' };

function answerSummary(announcement, response) {
  if (announcement.responseType === 'read') return 'Loetud · Прочитано';
  if (announcement.responseType === 'availability') return availabilityText(response.slots, response.preferred) || '—';
  const answer = response.answer || {};
  return [answer.text, ...(answer.choices || []), answer.other ? `Muu · Другое: ${answer.other}` : ''].filter(Boolean).join('; ');
}

// One announcement's answer: „Sain aru”, a question, or the suitable lesson times. In the gate it starts open; in the
// „Teated” list it shows the sent answer and opens again only when the administrator allowed changing it.
export default function AnnouncementResponder({ item, user, service, availabilityService = studentAvailabilityService, onAnswered }) {
  const { announcement, target, response } = item;
  const [editing, setEditing] = useState(!response);
  const [text, setText] = useState(response?.answer?.text || '');
  const [choices, setChoices] = useState(response?.answer?.choices || []);
  const [other, setOther] = useState(response?.answer?.other || '');
  const [times, setTimes] = useState(null); // { cells, saved }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isTimes = announcement.responseType === 'availability';
  const { mode, options = [], allowOther } = announcement.question || {};

  useEffect(() => {
    if (!isTimes || !editing || times) return undefined;
    let alive = true;
    Promise.resolve().then(() => availabilityService.get(target.studentId)).then((saved) => {
      if (alive) setTimes({ cells: saved ? cellsOf(saved.slots, saved.preferred) : {}, saved: saved || null });
    }).catch(() => { if (alive) setTimes({ cells: {}, saved: null }); });
    return () => { alive = false; };
  }, [availabilityService, editing, isTimes, target.studentId, times]);

  const answer = () => {
    if (announcement.responseType !== 'question') return {};
    if (mode === 'text') return { text: text.trim() };
    return { choices, other: allowOther ? other.trim() : '' };
  };
  const ready = (() => {
    if (announcement.responseType === 'read') return true;
    if (isTimes) return Boolean(times && Object.values(times.cells).some(Boolean));
    if (mode === 'text') return Boolean(text.trim());
    const count = choices.length + (allowOther && other.trim() ? 1 : 0);
    return mode === 'single' ? count === 1 : count > 0;
  })();

  const submit = async () => {
    setBusy(true); setError('');
    try {
      if (isTimes) await availabilityService.save(target.studentId, { ...pollPayload(times.cells), message: times.saved?.message || '' }, user, times.saved);
      await service.respond({ announcementId: announcement.id, targetKey: target.key, answer: answer() });
      setEditing(false);
      onAnswered?.(item, { ...answer() });
    } catch (caught) {
      setError(`Ei õnnestunud · Не удалось: ${caught.message || ''}`);
    } finally { setBusy(false); }
  };

  const pick = (option) => {
    if (mode === 'single') { setChoices([option]); setOther(''); return; }
    setChoices((current) => (current.includes(option) ? current.filter((value) => value !== option) : [...current, option]));
  };

  if (!editing && response) {
    return (
      <div className="announcement-answer">
        <span className="eyebrow">Sinu vastus · Ваш ответ</span>
        <p>{answerSummary(announcement, response)}</p>
        <small className="form-hint">{when(response.updatedAt || response.answeredAt)}{response.answeredByName ? ` · ${response.answeredByName}` : ''}</small>
        {announcement.allowChange ? <Button variant="secondary" onClick={() => setEditing(true)}><Pencil size={15} /> Muuda vastust · Изменить ответ</Button> : null}
      </div>
    );
  }

  return (
    <div className="announcement-respond">
      {announcement.responseType === 'question' && mode === 'text' ? (
        <label className="announcement-respond__text"><span>Sinu vastus · Ваш ответ</span>
          <textarea rows={4} maxLength={2000} value={text} onChange={(event) => setText(event.target.value)} /></label>
      ) : null}
      {announcement.responseType === 'question' && mode !== 'text' ? (
        <fieldset className="announcement-respond__choices">
          <legend>{mode === 'single' ? 'Vali üks · Выберите один вариант' : 'Vali kõik sobivad · Выберите все подходящие'}</legend>
          {options.map((option) => (
            <label key={option} className={choices.includes(option) ? 'is-picked' : ''}>
              <input type={mode === 'single' ? 'radio' : 'checkbox'} name={`answer-${announcement.id}-${target.key}`} checked={choices.includes(option)} onChange={() => pick(option)} />
              <span>{option}</span>
            </label>
          ))}
          {allowOther ? (
            <label className="announcement-respond__other"><span>Muu · Другое</span>
              <input value={other} maxLength={500} onChange={(event) => { setOther(event.target.value); if (mode === 'single' && event.target.value) setChoices([]); }} /></label>
          ) : null}
        </fieldset>
      ) : null}
      {isTimes ? (
        <div className="announcement-respond__times">
          <p className="poll-important">Märgi KÕIK ajad, mil saad tunnis tegelikult olla. Puuduta tundi: sobib; uuesti: ★ sobib kõige paremini.<br />
            <span lang="ru">Отметьте ВСЕ часы, когда реально можете быть на уроке. Нажмите: подходит; ещё раз: ★ лучше всего.</span></p>
          {times ? <>
            {times.saved ? <p className="form-hint">Varem märgitud ajad on juba sees — kontrolli ja kinnita. · Ранее отмеченное время уже внесено — проверьте и подтвердите.</p> : null}
            <div className="poll-quick"><span>Kiirvalik:</span>{Object.entries(PRESETS).map(([key, preset]) => <button type="button" key={key} onClick={() => setTimes((current) => ({ ...current, cells: withPreset(current.cells, preset) }))}>{PRESET_LABELS[key]}</button>)}<button type="button" className="is-clear" onClick={() => setTimes((current) => ({ ...current, cells: {} }))}>Tühjenda</button></div>
            <PollGrid cells={times.cells} onChange={(cells) => setTimes((current) => ({ ...current, cells }))} dayNames={DAYS} partNames={{ morning: 'Hommik', day: 'Päev', evening: 'Õhtu' }} label="Märgi sobivad ajad" />
          </> : <p className="form-hint">Laen… · Загрузка…</p>}
        </div>
      ) : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className="announcement-respond__actions">
        {announcement.responseType === 'read'
          ? <Button loading={busy} onClick={submit}><Check size={17} /> Sain aru · Понятно</Button>
          : <Button loading={busy} disabled={!ready} onClick={submit}>{isTimes ? <Check size={17} /> : <Send size={16} />} {isTimes ? 'Kinnita ajad · Подтвердить время' : 'Saada vastus · Отправить ответ'}</Button>}
        {response && editing ? <Button variant="secondary" disabled={busy} onClick={() => setEditing(false)}>Loobu · Отмена</Button> : null}
      </div>
    </div>
  );
}
