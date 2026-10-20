import { useState } from 'react';
import PollGrid from './PollGrid.jsx';
import { pollPayload } from './pollModel.js';
import './availabilityPoll.css';

const LEAD_URL = String(import.meta.env.VITE_WEBSITE_LEAD_API_URL || 'https://us-central1-keelesepp-5136b.cloudfunctions.net/websiteLeadApi');

const TEXT = {
  et: {
    title: 'Millal sulle tund sobib?',
    lead: 'Märgi tabelisse KÕIK ajad, mil saad tunnis tegelikult olla — mitte ainult kõige meelepärasemad. Mida rohkem aegu märgid, seda kiiremini leiame sulle õpetaja ja kindla tunniaja.',
    how: 'Puuduta tundi: roheline = sobib. Puuduta uuesti: ★ = sobib kõige paremini. Kolmas puudutus kustutab. Võid sõrme ka üle mitme tunni vedada. Päeva nimi märgib terve päeva.',
    days: { Mon: 'E', Tue: 'T', Wed: 'K', Thu: 'N', Fri: 'R', Sat: 'L', Sun: 'P' },
    legendOk: 'sobib', legendBest: 'sobib kõige paremini', marked: (n) => `Märgitud ${n} tundi nädalas`,
    name: 'Nimi', phone: 'Telefon', email: 'E-post', subject: 'Õppeaine', perWeek: 'Mitu tundi nädalas?', format: 'Kuidas?', comment: 'Lisainfo (valikuline)',
    formats: { online: 'Veebis', kohapeal: 'Kohapeal', mõlemad: 'Mõlemad sobivad' },
    subjects: { 'Eesti keel': 'Eesti keel', 'Inglise keel': 'Inglise keel', Matemaatika: 'Matemaatika', Muu: 'Muu' },
    send: 'Saada', sending: 'Saadan…', contactHint: 'Kirjuta telefon või e-post, et saaksime aja kokku leppida.',
    needSlots: 'Märgi tabelisse vähemalt üks sobiv aeg.', needName: 'Kirjuta oma nimi.', needContact: 'Kirjuta telefon või e-post.', failed: 'Saatmine ebaõnnestus. Proovi uuesti või kirjuta info@epkoolitus.ee.',
    tooMany: 'Liiga palju saatmisi. Proovi tunni aja pärast uuesti.',
    done: 'Aitäh! Saime sinu ajad kätte.', doneMore: 'Võtame sinuga ühendust, kui oleme õpetaja ja aja leidnud.',
  },
  ru: {
    title: 'Когда вам удобно заниматься?',
    lead: 'Отметьте в таблице ВСЁ время, когда вы реально можете быть на уроке, — а не только самое удобное. Чем больше вариантов вы отметите, тем быстрее мы подберём учителя и постоянное время.',
    how: 'Нажмите на час: зелёный = подходит. Нажмите ещё раз: ★ = подходит лучше всего. Третье нажатие снимает отметку. Можно провести пальцем по нескольким часам. Название дня отмечает весь день.',
    days: { Mon: 'Пн', Tue: 'Вт', Wed: 'Ср', Thu: 'Чт', Fri: 'Пт', Sat: 'Сб', Sun: 'Вс' },
    legendOk: 'подходит', legendBest: 'лучше всего', marked: (n) => `Отмечено часов в неделю: ${n}`,
    name: 'Имя', phone: 'Телефон', email: 'E-mail', subject: 'Предмет', perWeek: 'Сколько уроков в неделю?', format: 'Как удобнее?', comment: 'Комментарий (по желанию)',
    formats: { online: 'Онлайн', kohapeal: 'Очно', mõlemad: 'Подходит и так, и так' },
    subjects: { 'Eesti keel': 'Эстонский язык', 'Inglise keel': 'Английский язык', Matemaatika: 'Математика', Muu: 'Другое' },
    send: 'Отправить', sending: 'Отправляю…', contactHint: 'Укажите телефон или e-mail, чтобы мы могли договориться о времени.',
    needSlots: 'Отметьте в таблице хотя бы одно подходящее время.', needName: 'Напишите ваше имя.', needContact: 'Укажите телефон или e-mail.', failed: 'Не удалось отправить. Попробуйте ещё раз или напишите на info@epkoolitus.ee.',
    tooMany: 'Слишком много отправок. Попробуйте через час.',
    done: 'Спасибо! Ваше время получено.', doneMore: 'Мы свяжемся с вами, когда подберём учителя и время.',
  },
};

export default function AvailabilityPollPage({ post = (body) => globalThis.fetch(LEAD_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }) }) {
  const [lang, setLang] = useState(() => (String(globalThis.navigator?.language || '').startsWith('ru') ? 'ru' : 'et'));
  const t = TEXT[lang];
  const [cells, setCells] = useState({});
  const [form, setForm] = useState({ name: '', phone: '', email: '', language: 'Eesti keel', lessonsPerWeek: '1', format: 'mõlemad', message: '', website: '' });
  const [state, setState] = useState({ busy: false, error: '', done: false });
  const marked = Object.values(cells).filter(Boolean).length;
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
    } catch (error) {
      setState({ busy: false, error: error.message && error.message !== 'Failed to fetch' ? error.message : t.failed, done: false });
    }
  };

  return (
    <main className="poll-page" lang={lang}>
      <header className="poll-page__head">
        <strong className="poll-page__brand">KeeleSepp</strong>
        <div className="poll-page__lang" role="group" aria-label="Keel / Язык">
          {['et', 'ru'].map((code) => <button type="button" key={code} aria-pressed={lang === code} onClick={() => setLang(code)}>{code.toUpperCase()}</button>)}
        </div>
      </header>
      {state.done ? (
        <section className="poll-page__done" role="status"><h1>{t.done}</h1><p>{t.doneMore}</p></section>
      ) : (
        <form onSubmit={submit} noValidate>
          <h1>{t.title}</h1>
          <p className="poll-page__lead">{t.lead}</p>
          <p className="poll-page__how">{t.how}</p>
          <div className="poll-page__legend"><span><i className="is-ok" /> {t.legendOk}</span><span><i className="is-best">★</i> {t.legendBest}</span><b>{t.marked(marked)}</b></div>
          <PollGrid cells={cells} onChange={setCells} dayNames={t.days} label={t.title} />
          <div className="poll-page__fields">
            <label><span>{t.name}</span><input value={form.name} autoComplete="name" maxLength={120} onChange={(e) => set({ name: e.target.value })} /></label>
            <label><span>{t.phone}</span><input value={form.phone} type="tel" autoComplete="tel" maxLength={40} onChange={(e) => set({ phone: e.target.value })} /></label>
            <label><span>{t.email}</span><input value={form.email} type="email" autoComplete="email" maxLength={200} onChange={(e) => set({ email: e.target.value })} /></label>
            <p className="poll-page__hint">{t.contactHint}</p>
            <label><span>{t.subject}</span><select value={form.language} onChange={(e) => set({ language: e.target.value })}>{Object.entries(t.subjects).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label><span>{t.perWeek}</span><select value={form.lessonsPerWeek} onChange={(e) => set({ lessonsPerWeek: e.target.value })}>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
            <fieldset><legend>{t.format}</legend>{Object.entries(t.formats).map(([value, label]) => <label key={value} className="poll-page__radio"><input type="radio" name="format" checked={form.format === value} onChange={() => set({ format: value })} /> {label}</label>)}</fieldset>
            <label><span>{t.comment}</span><textarea rows={3} maxLength={2000} value={form.message} onChange={(e) => set({ message: e.target.value })} /></label>
            <input className="poll-page__trap" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={(e) => set({ website: e.target.value })} />
          </div>
          {state.error ? <p className="poll-page__error" role="alert">{state.error}</p> : null}
          <button type="submit" className="poll-page__send" disabled={state.busy}>{state.busy ? t.sending : t.send}</button>
        </form>
      )}
    </main>
  );
}
