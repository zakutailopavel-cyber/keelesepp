import { Check, GraduationCap, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/index.js';
import { missingDataService } from '../../services/firebase/missingData.js';
import PollGrid from '../availability-poll/PollGrid.jsx';
import { PRESETS, pollPayload, withPreset } from '../availability-poll/pollModel.js';
import {
  ADULT_GRADE, CLASS_OPTIONS, ERROR_TEXT, LANGUAGE_OPTIONS, cardErrors, cardQuestions, fieldLabel, kindOfGrade, payloadOf, profileErrors,
} from './missingDataModel.js';
import '../announcements/announcements.css';
import '../availability-poll/availabilityPoll.css';
import './missingData.css';

const WAIT_MS = 8000;
const DAYS = { Mon: 'E', Tue: 'T', Wed: 'K', Thu: 'N', Fri: 'R', Sat: 'L', Sun: 'P' };
const PRESET_LABELS = { weekdayEvenings: 'Tööpäeva õhtud 17–21', weekdayDays: 'Tööpäeviti 9–17', weekend: 'Nädalavahetus 10–18' };
const OPTIONAL = ' (soovi korral · по желанию)';

function FieldError({ code, id }) {
  return code ? <span className="form-error missing-data__error" id={id}>{ERROR_TEXT[code] || ERROR_TEXT.required}</span> : null;
}

function TimesField({ id, cells = {}, onChange, optional, error }) {
  return (
    <fieldset className="missing-data__field missing-data__times" aria-describedby={error ? `${id}-error` : undefined}>
      <legend>{fieldLabel('availability')}{optional ? OPTIONAL : ''}</legend>
      <p className="poll-important">Märgi KÕIK ajad, mil saad tunnis tegelikult olla. Puuduta tundi: sobib; uuesti: ★ sobib kõige paremini.<br />
        <span lang="ru">Отметьте ВСЕ часы, когда реально можете быть на уроке. Нажмите: подходит; ещё раз: ★ лучше всего.</span></p>
      <div className="poll-quick"><span>Kiirvalik:</span>{Object.entries(PRESETS).map(([key, preset]) => <button type="button" key={key} onClick={() => onChange(withPreset(cells, preset))}>{PRESET_LABELS[key]}</button>)}<button type="button" className="is-clear" onClick={() => onChange({})}>Tühjenda</button></div>
      <PollGrid cells={cells} onChange={onChange} dayNames={DAYS} partNames={{ morning: 'Hommik', day: 'Päev', evening: 'Õhtu' }} label={`Märgi sobivad ajad ${id}`} />
      <FieldError code={error} id={`${id}-error`} />
    </fieldset>
  );
}

function LanguageField({ id, value, onChange, optional, error }) {
  return (
    <fieldset className="missing-data__field missing-data__choices">
      <legend>{fieldLabel('language')}{optional ? OPTIONAL : ''}</legend>
      {LANGUAGE_OPTIONS.map((option) => (
        <label key={option.value} className={value === option.value ? 'is-picked' : ''}>
          <input type="radio" name={`${id}-language`} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
          <span>{option.label}</span>
        </label>
      ))}
      <FieldError code={error} id={`${id}-language-error`} />
    </fieldset>
  );
}

function TextField({ id, label, value, onChange, optional, error, type = 'text', autoComplete, inputMode }) {
  return (
    <label className="missing-data__field missing-data__text" htmlFor={id}>
      <span>{label}{optional ? OPTIONAL : ''}</span>
      <input id={id} type={type} value={value || ''} autoComplete={autoComplete} inputMode={inputMode} maxLength={200} aria-invalid={error ? 'true' : undefined} aria-describedby={error ? `${id}-error` : undefined} onChange={(event) => onChange(event.target.value)} />
      <FieldError code={error} id={`${id}-error`} />
    </label>
  );
}

function GradeField({ id, answer, update, withAdult, optional, error }) {
  const selected = answer.gradeYear ? 'year' : (answer.grade || '');
  return (
    <div className="missing-data__field missing-data__grade">
      <label htmlFor={`${id}-grade`}><span>{fieldLabel('grade')}{optional ? OPTIONAL : ''}</span></label>
      <select id={`${id}-grade`} value={selected} aria-invalid={error ? 'true' : undefined} onChange={(event) => {
        const value = event.target.value;
        update(value === 'year' ? { gradeYear: true, grade: '' } : { gradeYear: false, grade: value });
      }}>
        <option value="">Vali · Выберите</option>
        {withAdult ? <option value={ADULT_GRADE}>Täiskasvanu (18+) · Взрослый</option> : null}
        {CLASS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
        <option value="year">Kirjutan sünniaasta · Укажу год рождения</option>
      </select>
      {answer.gradeYear ? <input aria-label="Sünniaasta · Год рождения" inputMode="numeric" maxLength={4} placeholder="nt 2014" value={answer.grade || ''} onChange={(event) => update({ grade: event.target.value.replace(/\D/g, '') })} /> : null}
      <FieldError code={error} id={`${id}-grade-error`} />
    </div>
  );
}

function CardSection({ card, answer, errors, update, single }) {
  const { kind, items } = cardQuestions(card, answer);
  const optional = (item) => !card.required.includes(item);
  const id = `md-${card.studentId}`;
  const title = card.role === 'parent' ? `Laps · Ребёнок: ${card.studentName}` : single ? 'Sinu andmed · Ваши данные' : card.studentName;
  return (
    <section className="missing-data__card" aria-label={title}>
      <h2>{title}</h2>
      {items.includes('grade') ? <GradeField id={id} answer={answer} withAdult={Boolean(card.variants)} optional={optional('grade')} error={errors.grade} update={(patch) => {
        // choosing „Täiskasvanu” fills the account e-mail as the own e-mail
        const next = { ...patch };
        if (card.variants && kindOfGrade(patch.grade) === 'adult' && !answer.email && card.accountEmail) next.email = card.accountEmail;
        if (card.variants && kindOfGrade(patch.grade) === 'child' && answer.email === card.accountEmail) next.email = '';
        update(next);
      }} /> : null}
      {items.includes('parentName') ? <TextField id={`${id}-parent`} label={fieldLabel('parentName')} autoComplete="name" value={answer.parentName} optional={optional('parentName')} error={errors.parentName} onChange={(value) => update({ parentName: value })} /> : null}
      {items.includes('email') ? <TextField id={`${id}-email`} type="email" label={fieldLabel('email', kind)} autoComplete="email" inputMode="email" value={answer.email} optional={optional('email')} error={errors.email} onChange={(value) => update({ email: value })} /> : null}
      {items.includes('phone') ? <TextField id={`${id}-phone`} type="tel" label={fieldLabel('phone', kind)} autoComplete="tel" inputMode="tel" value={answer.phone} optional={optional('phone')} error={errors.phone} onChange={(value) => update({ phone: value })} /> : null}
      {items.includes('language') ? <LanguageField id={id} value={answer.language} optional={optional('language')} error={errors.language} onChange={(value) => update({ language: value })} /> : null}
      {items.includes('availability') ? <TimesField id={id} cells={answer.cells} optional={optional('availability')} error={errors.availability} onChange={(cells) => update({ cells, availability: pollPayload(cells) })} /> : null}
    </section>
  );
}

const initialAnswers = (questions) => Object.fromEntries(questions.cards.map((card) => [card.studentId, card.kind === 'adult' && card.ask.includes('email') && card.accountEmail ? { email: card.accountEmail } : {}]));

// „Puuduvad andmed” (owner 2026-10-25): after „Teated”, a student or parent fills what is missing on their card(s)
// before the CRM opens — only when something REQUIRED is missing (the administrator's setting). Optional items are
// shown in the same form. Logging out stays possible; if the server cannot be reached the CRM opens as usual.
export default function MissingDataGate({ enabled, user, onSignOut, service = missingDataService, children }) {
  const uid = user?.uid || '';
  const [state, setState] = useState({ uid: null, questions: null });
  const [answers, setAnswers] = useState({});
  const [profile, setProfile] = useState({});
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!enabled) return undefined;
    let alive = true;
    const finish = (questions) => {
      if (!alive) return;
      setState((current) => (current.uid === uid ? current : { uid, questions }));
      if (questions) setAnswers(initialAnswers(questions));
    };
    const timer = globalThis.setTimeout(() => finish(null), WAIT_MS);
    Promise.resolve().then(() => service.mine())
      .then((result) => finish(result && Array.isArray(result.cards) ? { ...result, profile: result.profile || { ask: [], required: [] } } : null))
      .catch(() => finish(null));
    return () => { alive = false; globalThis.clearTimeout(timer); };
  }, [enabled, service, uid]);

  if (!enabled) return children;
  if (state.uid !== uid) return <div className="announcement-gate announcement-gate--loading" role="status"><span className="state-spinner" aria-hidden="true" /> Laen… · Загрузка…</div>;
  const { questions } = state;
  if (done || !questions?.blocks) return children;

  const update = (studentId) => (patch) => setAnswers((current) => ({ ...current, [studentId]: { ...(current[studentId] || {}), ...patch } }));
  const count = Object.values(errors).reduce((sum, item) => sum + Object.keys(item || {}).length, 0);

  const submit = async (event) => {
    event.preventDefault();
    setFailure('');
    const found = Object.fromEntries(questions.cards.map((card) => [card.studentId, cardErrors(card, answers[card.studentId] || {})]).filter(([, value]) => Object.keys(value).length));
    const own = profileErrors(questions.profile, profile);
    if (Object.keys(own).length) found.profile = own;
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await service.save(payloadOf(questions, answers, profile));
      setDone(true);
    } catch (caught) {
      if (caught?.status === 400 && caught.details) { setErrors(caught.details); return; }
      setFailure(caught?.message || 'Salvestamine ebaõnnestus.');
    } finally { setBusy(false); }
  };

  const optional = (item) => !questions.profile.required.includes(item);
  const single = questions.cards.length === 1 && !questions.profile.ask.length;
  return (
    <div className="announcement-gate missing-data" role="dialog" aria-modal="true" aria-labelledby="missing-data-title">
      <header className="announcement-gate__bar">
        <span className="announcement-gate__brand"><GraduationCap size={20} /> KeeleSepp</span>
        <button type="button" className="announcement-gate__logout" onClick={onSignOut}><LogOut size={16} /> Logi välja · Выйти</button>
      </header>
      <main className="announcement-gate__body">
        <form className="announcement-gate__card missing-data__form" onSubmit={submit} noValidate>
          <span className="eyebrow">Puuduvad andmed · Недостающие данные</span>
          <h1 id="missing-data-title">Palun täida puuduvad andmed</h1>
          <p className="missing-data__lead">Kool vajab neid, et tunniaeg sobiks ja teated jõuaksid sinuni. Küsime ainult seda, mis kaardil puudub.<br />
            <span lang="ru">Школе нужны эти данные, чтобы подобрать время урока и связаться с вами. Спрашиваем только то, чего не хватает.</span></p>
          {questions.profile.ask.length ? (
            <section className="missing-data__card" aria-label="Sinu andmed · Ваши данные">
              <h2>Sinu andmed · Ваши данные</h2>
              {questions.profile.ask.includes('phone') ? <TextField id="md-profile-phone" type="tel" label="Sinu telefon · Ваш телефон" autoComplete="tel" inputMode="tel" value={profile.phone} optional={optional('phone')} error={errors.profile?.phone} onChange={(value) => setProfile((current) => ({ ...current, phone: value }))} /> : null}
              {questions.profile.ask.includes('language') ? <LanguageField id="md-profile" value={profile.language} optional={optional('language')} error={errors.profile?.language} onChange={(value) => setProfile((current) => ({ ...current, language: value }))} /> : null}
            </section>
          ) : null}
          {questions.cards.map((card) => <CardSection key={card.studentId} card={card} single={single} answer={answers[card.studentId] || {}} errors={errors[card.studentId] || {}} update={update(card.studentId)} />)}
          {count ? <p className="form-error" role="alert">Palun paranda märgitud väljad ({count}). · Исправьте отмеченные поля.</p> : null}
          {failure ? (
            <div className="missing-data__failure" role="alert">
              <p className="form-error">Ei õnnestunud salvestada · Не удалось сохранить: {failure}</p>
              <Button type="button" variant="secondary" onClick={() => setDone(true)}>Jätka praegu ilma · Продолжить без сохранения</Button>
            </div>
          ) : null}
          <div className="announcement-respond__actions">
            <Button type="submit" loading={busy}><Check size={17} /> Salvesta ja jätka · Сохранить</Button>
          </div>
        </form>
      </main>
    </div>
  );
}
