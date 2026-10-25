import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { learnerEmailsService } from '../../services/firebase/learnerEmails.js';
import './emailPreferences.css';

// /e-kirjad/<token> — the link at the bottom of every e-mail to students and parents (docs/EMAIL_NOTIFICATIONS.md).
// No login: the signed link names one address. The recipient turns the school's notification e-mails (reminders,
// lesson changes, schedule, homework, announcements) off or on again and picks the language. Invoices and payment
// reminders still come — they are not optional.
const TEXT = {
  et: {
    title: 'KeeleSepa e-kirjad',
    loading: 'Laen…',
    address: (email) => `Aadress: ${email}`,
    intro: 'Kool saadab teavitusi: tunni meeldetuletus, muutunud või ära jäänud tund, uus tunniplaan, kodutöö tähtaeg, kontrollitud töö ja teated.',
    receive: 'Saada mulle neid teavitusi',
    language: 'Kirjade keel',
    both: 'Eesti ja vene', et: 'Ainult eesti', ru: 'Ainult vene',
    save: 'Salvesta', saving: 'Salvestan…',
    savedOn: 'Salvestatud. Teavitused tulevad sellele aadressile.',
    savedOff: 'Salvestatud. Teavitusi sellele aadressile enam ei saadeta.',
    note: 'Arved ja maksemeeldetuletused tulevad edasi: need ei ole teavitused. Küsimused: info@epkoolitus.ee.',
    invalid: 'See link ei kehti. Kasuta linki viimasest kirjast või kirjuta info@epkoolitus.ee.',
    failed: 'Salvestamine ebaõnnestus. Proovi uuesti.',
  },
  ru: {
    title: 'Письма KeeleSepp',
    loading: 'Загрузка…',
    address: (email) => `Адрес: ${email}`,
    intro: 'Школа присылает уведомления: напоминание об уроке, перенос или отмена урока, новое расписание, срок домашнего задания, проверенная работа и объявления.',
    receive: 'Присылать мне эти уведомления',
    language: 'Язык писем',
    both: 'Эстонский и русский', et: 'Только эстонский', ru: 'Только русский',
    save: 'Сохранить', saving: 'Сохраняю…',
    savedOn: 'Сохранено. Уведомления будут приходить на этот адрес.',
    savedOff: 'Сохранено. Уведомления на этот адрес больше не придут.',
    note: 'Счета и напоминания об оплате продолжат приходить: это не уведомления. Вопросы: info@epkoolitus.ee.',
    invalid: 'Ссылка недействительна. Используйте ссылку из последнего письма или напишите на info@epkoolitus.ee.',
    failed: 'Не удалось сохранить. Попробуйте ещё раз.',
  },
};

export default function EmailPreferencesPage({ service = learnerEmailsService }) {
  const { token = '' } = useParams();
  const [lang, setLang] = useState('et');
  const [state, setState] = useState('loading');
  const [info, setInfo] = useState(null);
  const [form, setForm] = useState({ receive: true, language: 'both' });
  const [saved, setSaved] = useState('');
  const t = TEXT[lang];

  useEffect(() => {
    let alive = true;
    service.preferenceStatus(token).then((status) => {
      if (!alive) return;
      setInfo(status);
      setForm({ receive: !status.optOut, language: status.language || 'both' });
      if (status.language === 'ru') setLang('ru');
      setState('ready');
    }).catch(() => { if (alive) setState('invalid'); });
    return () => { alive = false; };
  }, [service, token]);

  const submit = async (event) => {
    event.preventDefault();
    setState('saving'); setSaved('');
    try {
      const status = await service.savePreferences(token, { optOut: !form.receive, language: form.language });
      setInfo(status);
      setSaved(status.optOut ? 'off' : 'on');
      setState('ready');
    } catch { setState('failed'); }
  };

  return <main className="email-prefs-page">
    <div className="email-prefs-card">
      <div className="email-prefs-lang">{['et', 'ru'].map((code) => <button key={code} type="button" className={lang === code ? 'is-active' : ''} aria-pressed={lang === code} onClick={() => setLang(code)}>{code.toUpperCase()}</button>)}</div>
      <h1>{t.title}</h1>
      {state === 'loading' ? <p>{t.loading}</p> : null}
      {state === 'invalid' ? <p className="email-prefs-error" role="alert">{t.invalid}</p> : null}
      {info && state !== 'invalid' ? <form onSubmit={submit}>
        <p className="email-prefs-address">{t.address(info.email)}</p>
        <p>{t.intro}</p>
        <label className="email-prefs-check"><input type="checkbox" checked={form.receive} onChange={(event) => { setForm({ ...form, receive: event.target.checked }); setSaved(''); }} /> {t.receive}</label>
        <fieldset className="email-prefs-language" disabled={!form.receive}>
          <legend>{t.language}</legend>
          {['both', 'et', 'ru'].map((code) => <label key={code}><input type="radio" name="email-language" value={code} checked={form.language === code} onChange={() => { setForm({ ...form, language: code }); setSaved(''); }} /> {t[code]}</label>)}
        </fieldset>
        {state === 'failed' ? <p className="email-prefs-error" role="alert">{t.failed}</p> : null}
        {saved ? <p className="email-prefs-saved" role="status">{saved === 'off' ? t.savedOff : t.savedOn}</p> : null}
        <button className="email-prefs-submit" type="submit" disabled={state === 'saving'}>{state === 'saving' ? t.saving : t.save}</button>
        <p className="email-prefs-note">{t.note}</p>
      </form> : null}
    </div>
  </main>;
}
