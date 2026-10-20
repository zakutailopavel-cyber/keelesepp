import { useState } from 'react';
import PollGrid from './PollGrid.jsx';
import { PRESETS, pollPayload, summaryOf, withPreset } from './pollModel.js';
import './availabilityPoll.css';

const LEAD_URL = String(import.meta.env.VITE_WEBSITE_LEAD_API_URL || 'https://us-central1-keelesepp-5136b.cloudfunctions.net/websiteLeadApi');

const TEXT = {
  et: {
    title: 'Millal sulle tund sobib?',
    intro: 'Aita meil leida sulle õpetaja ja kindel tunniaeg. Selleks kulub umbes 2 minutit.',
    steps: [
      ['Märgi kõik sobivad ajad', 'Puuduta tunde tabelis. Võid sõrme ka üle mitme tunni vedada.'],
      ['Tähista parimad ★', 'Puuduta sama tundi uuesti — see on aeg, mis sobib kõige paremini.'],
      ['Saada', 'Kirjuta nimi ja telefon või e-post. Võtame sinuga ühendust.'],
    ],
    important: 'Palun märgi KÕIK ajad, mil saad tunnis tegelikult olla — mitte ainult kõige meelepärasemad. Mida rohkem aegu, seda kiiremini leiame sulle sobiva õpetaja.',
    days: { Mon: 'E', Tue: 'T', Wed: 'K', Thu: 'N', Fri: 'R', Sat: 'L', Sun: 'P' },
    dayLong: { Mon: 'Esmaspäev', Tue: 'Teisipäev', Wed: 'Kolmapäev', Thu: 'Neljapäev', Fri: 'Reede', Sat: 'Laupäev', Sun: 'Pühapäev' },
    parts: { morning: 'Hommik', day: 'Päev', evening: 'Õhtu' },
    quick: 'Kiirvalik:', presets: { weekdayEvenings: 'Tööpäeva õhtud 17–21', weekdayDays: 'Tööpäeviti 9–17', weekend: 'Nädalavahetus 10–18' }, clear: 'Tühjenda',
    legendOk: 'sobib', legendBest: 'sobib kõige paremini', marked: (n) => (n ? `Märgitud ${n} h nädalas` : 'Midagi pole veel märgitud'),
    summary: 'Sinu ajad', you: 'Sinu andmed',
    name: 'Nimi', phone: 'Telefon', email: 'E-post', subject: 'Mida soovid õppida?', perWeek: 'Mitu tundi nädalas?', format: 'Kuidas sulle sobib?', comment: 'Lisainfo (valikuline)', commentHint: 'Nt tase, eesmärk, eksam, mis kuust alates',
    formats: { online: 'Veebis', kohapeal: 'Kohapeal', mõlemad: 'Mõlemad sobivad' },
    subjects: { 'Eesti keel': 'Eesti keel', 'Inglise keel': 'Inglise keel', Matemaatika: 'Matemaatika', Muu: 'Muu' },
    send: 'Saada ajad', sending: 'Saadan…', contactHint: 'Piisab telefonist või e-postist.',
    privacy: 'Kasutame andmeid ainult tunniaja leidmiseks.', privacyLink: 'Privaatsus',
    needSlots: 'Märgi tabelisse vähemalt üks sobiv aeg.', needName: 'Kirjuta oma nimi.', needContact: 'Kirjuta telefon või e-post.', failed: 'Saatmine ebaõnnestus. Proovi uuesti või kirjuta info@epkoolitus.ee.',
    tooMany: 'Liiga palju saatmisi. Proovi tunni aja pärast uuesti.',
    done: 'Aitäh! Saime sinu ajad kätte.', doneMore: 'Võtame sinuga ühendust, kui oleme õpetaja ja aja leidnud — tavaliselt 1–2 tööpäeva jooksul.', again: 'Saada veel üks vastus',
  },
  ru: {
    title: 'Когда вам удобно заниматься?',
    intro: 'Помогите нам подобрать учителя и постоянное время урока. Это займёт около 2 минут.',
    steps: [
      ['Отметьте всё подходящее время', 'Нажимайте на часы в таблице. Можно провести пальцем по нескольким часам.'],
      ['Выделите лучшее ★', 'Нажмите на тот же час ещё раз — это время подходит больше всего.'],
      ['Отправьте', 'Укажите имя и телефон или e-mail. Мы свяжемся с вами.'],
    ],
    important: 'Пожалуйста, отметьте ВСЁ время, когда вы реально можете заниматься, — а не только самое удобное. Чем больше вариантов, тем быстрее мы найдём вам учителя.',
    days: { Mon: 'Пн', Tue: 'Вт', Wed: 'Ср', Thu: 'Чт', Fri: 'Пт', Sat: 'Сб', Sun: 'Вс' },
    dayLong: { Mon: 'Понедельник', Tue: 'Вторник', Wed: 'Среда', Thu: 'Четверг', Fri: 'Пятница', Sat: 'Суббота', Sun: 'Воскресенье' },
    parts: { morning: 'Утро', day: 'День', evening: 'Вечер' },
    quick: 'Быстрый выбор:', presets: { weekdayEvenings: 'Будни вечером 17–21', weekdayDays: 'Будни днём 9–17', weekend: 'Выходные 10–18' }, clear: 'Очистить',
    legendOk: 'подходит', legendBest: 'подходит лучше всего', marked: (n) => (n ? `Отмечено ${n} ч в неделю` : 'Пока ничего не отмечено'),
    summary: 'Ваше время', you: 'Ваши данные',
    name: 'Имя', phone: 'Телефон', email: 'E-mail', subject: 'Что хотите изучать?', perWeek: 'Сколько уроков в неделю?', format: 'Как вам удобнее?', comment: 'Комментарий (по желанию)', commentHint: 'Например: уровень, цель, экзамен, с какого месяца',
    formats: { online: 'Онлайн', kohapeal: 'Очно', mõlemad: 'Подходит и так, и так' },
    subjects: { 'Eesti keel': 'Эстонский язык', 'Inglise keel': 'Английский язык', Matemaatika: 'Математика', Muu: 'Другое' },
    send: 'Отправить время', sending: 'Отправляю…', contactHint: 'Достаточно телефона или e-mail.',
    privacy: 'Данные используются только для подбора времени урока.', privacyLink: 'Конфиденциальность',
    needSlots: 'Отметьте в таблице хотя бы одно подходящее время.', needName: 'Напишите ваше имя.', needContact: 'Укажите телефон или e-mail.', failed: 'Не удалось отправить. Попробуйте ещё раз или напишите на info@epkoolitus.ee.',
    tooMany: 'Слишком много отправок. Попробуйте через час.',
    done: 'Спасибо! Ваше время получено.', doneMore: 'Мы свяжемся с вами, когда подберём учителя и время, — обычно в течение 1–2 рабочих дней.', again: 'Отправить ещё один ответ',
  },
};

const Chips = ({ name, value, options, onChange }) => (
  <div className="poll-chips" role="radiogroup" aria-label={name}>
    {options.map(([key, label]) => <button type="button" role="radio" key={key} aria-checked={value === key} className={value === key ? 'is-on' : ''} onClick={() => onChange(key)}>{label}</button>)}
  </div>
);

export default function AvailabilityPollPage({ post = (body) => globalThis.fetch(LEAD_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }) }) {
  const [lang, setLang] = useState(() => (String(globalThis.navigator?.language || '').startsWith('ru') ? 'ru' : 'et'));
  const t = TEXT[lang];
  const [cells, setCells] = useState({});
  const blank = { name: '', phone: '', email: '', language: 'Eesti keel', lessonsPerWeek: '1', format: 'mõlemad', message: '', website: '' };
  const [form, setForm] = useState(blank);
  const [state, setState] = useState({ busy: false, error: '', done: false });
  const marked = Object.values(cells).filter(Boolean).length;
  const summary = summaryOf(cells);
  const set = (patch) => setForm((current) => ({ ...current, ...patch }));

  const submit = async (event) => {
    event.preventDefault();
    if (!marked) { setState({ busy: false, error: t.needSlots, done: false }); return; }
    if (form.name.trim().length < 2) { setState({ busy: false, error: t.needName, done: false }); return; }
    if (!form.email.trim() && form.phone.replace(/\D/g, '').length < 5) { setState({ busy: false, error: t.needContact, done: false }); return; }
    setState({ busy: true, error: '', done: false });
    try {
      const response = await post({ source: 'availability', locale: lang, page: '/ajad', ...form, lessonsPerWeek: Number(form.lessonsPerWeek), ...pollPayload(cells) });
      if (response.status === 429) throw new Error(t.tooMany);
      if (!response.ok) throw new Error(t.failed);
      setState({ busy: false, error: '', done: true });
      globalThis.scrollTo?.({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setState({ busy: false, error: error.message && error.message !== 'Failed to fetch' ? error.message : t.failed, done: false });
    }
  };

  return (
    <div className="poll-page" lang={lang}>
      <header className="poll-top">
        <div className="poll-top__inner">
          <span className="poll-brand"><b>KeeleSepp</b><small>by EP Koolitus</small></span>
          <div className="poll-lang" role="group" aria-label="Keel / Язык">
            {['et', 'ru'].map((code) => <button type="button" key={code} aria-pressed={lang === code} onClick={() => setLang(code)}>{code.toUpperCase()}</button>)}
          </div>
        </div>
      </header>
      <main className="poll-main">
        {state.done ? (
          <section className="poll-card poll-done" role="status">
            <div className="poll-done__icon" aria-hidden="true">✓</div>
            <h1>{t.done}</h1>
            <p>{t.doneMore}</p>
            <button type="button" className="poll-link" onClick={() => { setCells({}); setForm(blank); setState({ busy: false, error: '', done: false }); }}>{t.again}</button>
          </section>
        ) : (
          <form onSubmit={submit} noValidate>
            <section className="poll-hero">
              <h1>{t.title}</h1>
              <p>{t.intro}</p>
              <ol className="poll-steps">{t.steps.map(([head, text], index) => <li key={head}><i>{index + 1}</i><span><b>{head}</b><small>{text}</small></span></li>)}</ol>
            </section>
            <p className="poll-important">{t.important}</p>

            <section className="poll-card">
              <div className="poll-quick"><span>{t.quick}</span>
                {Object.entries(PRESETS).map(([key, preset]) => <button type="button" key={key} onClick={() => setCells((current) => withPreset(current, preset))}>{t.presets[key]}</button>)}
                {marked ? <button type="button" className="is-clear" onClick={() => setCells({})}>{t.clear}</button> : null}
              </div>
              <div className="poll-legend"><span><i className="is-ok">✓</i> {t.legendOk}</span><span><i className="is-best">★</i> {t.legendBest}</span><b>{t.marked(marked)}</b></div>
              <PollGrid cells={cells} onChange={setCells} dayNames={t.days} partNames={t.parts} label={t.title} />
              {summary.length ? <div className="poll-summary"><h2>{t.summary}</h2><ul>{summary.map((row) => <li key={row.day}><b>{t.dayLong[row.day]}</b> {row.ranges.join(', ')}{row.best.length ? <em> ★ {row.best.join(', ')}</em> : null}</li>)}</ul></div> : null}
            </section>

            <section className="poll-card">
              <h2>{t.you}</h2>
              <div className="poll-fields">
                <label className="is-wide"><span>{t.name}</span><input value={form.name} autoComplete="name" maxLength={120} onChange={(e) => set({ name: e.target.value })} /></label>
                <label><span>{t.phone}</span><input value={form.phone} type="tel" autoComplete="tel" maxLength={40} onChange={(e) => set({ phone: e.target.value })} /></label>
                <label><span>{t.email}</span><input value={form.email} type="email" autoComplete="email" maxLength={200} onChange={(e) => set({ email: e.target.value })} /></label>
                <p className="poll-hint is-wide">{t.contactHint}</p>
                <div className="is-wide"><span className="poll-label">{t.subject}</span><Chips name={t.subject} value={form.language} options={Object.entries(t.subjects)} onChange={(language) => set({ language })} /></div>
                <div><span className="poll-label">{t.perWeek}</span><Chips name={t.perWeek} value={form.lessonsPerWeek} options={['1', '2', '3', '4', '5'].map((n) => [n, n])} onChange={(lessonsPerWeek) => set({ lessonsPerWeek })} /></div>
                <div><span className="poll-label">{t.format}</span><Chips name={t.format} value={form.format} options={Object.entries(t.formats)} onChange={(format) => set({ format })} /></div>
                <label className="is-wide"><span>{t.comment}</span><textarea rows={3} maxLength={2000} placeholder={t.commentHint} value={form.message} onChange={(e) => set({ message: e.target.value })} /></label>
                <input className="poll-trap" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={(e) => set({ website: e.target.value })} />
              </div>
            </section>

            {state.error ? <p className="poll-error" role="alert">{state.error}</p> : null}
            <div className="poll-send">
              <button type="submit" disabled={state.busy}>{state.busy ? t.sending : t.send}{marked && !state.busy ? <small>{t.marked(marked)}</small> : null}</button>
              <p>{t.privacy} <a href="https://www.epkoolitus.ee/privaatsus/" target="_blank" rel="noreferrer">{t.privacyLink}</a></p>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
