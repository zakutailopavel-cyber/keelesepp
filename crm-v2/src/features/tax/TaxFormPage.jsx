import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { isValidIsikukood } from './isikukood.js';
import './tax.css';

// The parents' form for INF 3 (owner 2026-10-22, docs/INF3.md): a one-time link from the school; the parent who pays for
// the lessons gives their own and the child's isikukood so the school can declare the paid training costs and the
// parent gets the income tax deduction. No login; the link expires in 60 days.
const API = String(import.meta.env.VITE_TAX_FORM_API_URL || 'https://us-central1-keelesepp-5136b.cloudfunctions.net/taxFormApi');

const TEXT = {
  et: {
    title: 'Andmed maksutagastuseks',
    intro: (name, school) => `Keeleõppe eest tasutud summa saab tuludeklaratsioonis maha arvata. Selleks esitab ${school} Maksu- ja Tolliametile vormi INF 3. Vormi jaoks on vaja tasuja ja õppija isikukoodi.`,
    student: (name) => `Õppija: ${name}`,
    payerName: 'Koolituse eest tasunud isiku ees- ja perekonnanimi',
    payerCode: 'Tasuja isikukood',
    studentCode: 'Õppija isikukood',
    adult: 'Õpin ise ja maksan ise (tasuja ja õppija on sama isik)',
    consent: 'Kinnitan, et andmed on õiged ja et olen koolituse eest tasunud isik.',
    privacy: 'Isikukoode kasutatakse ainult vormi INF 3 esitamiseks (tulumaksuseadus § 57¹). Neid näevad ainult kooli juhatus ja raamatupidaja.',
    send: 'Saada', sending: 'Saadan…',
    badCode: 'Isikukood ei ole õige. Kontrolli numbreid.', needName: 'Kirjuta tasuja nimi.', needConsent: 'Märgi kinnitus.',
    done: 'Aitäh! Andmed on salvestatud.', doneMore: 'Kool lisab need järgmise aasta alguses vormile INF 3. Maha arvatava summa näed oma eeltäidetud tuludeklaratsioonis.',
    expired: 'Link ei kehti enam. Palun küsi koolilt uus link.', failed: 'Saatmine ebaõnnestus. Proovi uuesti või kirjuta info@epkoolitus.ee.',
    already: 'Andmed on juba saadetud. Võid neid vajadusel parandada.',
  },
  ru: {
    title: 'Данные для налогового вычета',
    intro: (name, school) => `Сумму, оплаченную за изучение языка, можно вычесть в налоговой декларации. Для этого ${school} подаёт в Налоговый департамент форму INF 3. Для формы нужны личные коды плательщика и ученика.`,
    student: (name) => `Ученик: ${name}`,
    payerName: 'Имя и фамилия того, кто оплачивал обучение',
    payerCode: 'Личный код плательщика (isikukood)',
    studentCode: 'Личный код ученика (isikukood)',
    adult: 'Я сам учусь и сам плачу (плательщик и ученик — один человек)',
    consent: 'Подтверждаю, что данные верны и что обучение оплачивал(а) я.',
    privacy: 'Личные коды используются только для подачи формы INF 3 (закон о подоходном налоге, § 57¹). Их видят только руководство школы и бухгалтер.',
    send: 'Отправить', sending: 'Отправляю…',
    badCode: 'Личный код неверный. Проверьте цифры.', needName: 'Напишите имя плательщика.', needConsent: 'Отметьте подтверждение.',
    done: 'Спасибо! Данные сохранены.', doneMore: 'Школа включит их в форму INF 3 в начале следующего года. Сумму вычета вы увидите в предзаполненной декларации.',
    expired: 'Ссылка больше не действует. Попросите у школы новую.', failed: 'Не удалось отправить. Попробуйте ещё раз или напишите на info@epkoolitus.ee.',
    already: 'Данные уже отправлены. При необходимости их можно исправить.',
  },
};

const send = (path, body) => globalThis.fetch(`${API}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(async (r) => ({ ok: r.ok, status: r.status, body: await r.json().catch(() => ({})) }));

export default function TaxFormPage({ post = send }) {
  const { token } = useParams();
  const [lang, setLang] = useState(() => (globalThis.navigator?.language || '').startsWith('ru') ? 'ru' : 'et');
  const t = TEXT[lang];
  const [info, setInfo] = useState(null);
  const [state, setState] = useState('loading');
  const [form, setForm] = useState({ payerName: '', payerCode: '', studentCode: '', adult: false, consent: false });
  const [error, setError] = useState('');

  useEffect(() => {
    post('/info', { token }).then((r) => {
      if (!r.ok) { setState('expired'); return; }
      setInfo(r.body); setState('form');
    }).catch(() => setState('failed'));
  }, [post, token]);

  const submit = async (event) => {
    event.preventDefault();
    const studentCode = form.studentCode.replace(/\s/g, '');
    const payerCode = form.adult ? studentCode : form.payerCode.replace(/\s/g, '');
    if (!form.payerName.trim()) { setError(t.needName); return; }
    if (!isValidIsikukood(payerCode) || !isValidIsikukood(studentCode)) { setError(t.badCode); return; }
    if (!form.consent) { setError(t.needConsent); return; }
    setError(''); setState('sending');
    const r = await post('/submit', { token, payerName: form.payerName.trim(), payerCode, studentCode, consent: true }).catch(() => ({ ok: false }));
    if (r.ok) setState('done');
    else { setState('form'); setError(r.status === 404 ? t.expired : r.body?.error || t.failed); }
  };

  return <main className="tax-form-page">
    <div className="tax-form-card">
      <div className="tax-form-lang">{['et', 'ru'].map((code) => <button key={code} type="button" className={lang === code ? 'is-active' : ''} onClick={() => setLang(code)}>{code.toUpperCase()}</button>)}</div>
      <h1>{t.title}</h1>
      {state === 'loading' ? <p>…</p> : null}
      {state === 'expired' ? <p role="alert">{t.expired}</p> : null}
      {state === 'failed' ? <p role="alert">{t.failed}</p> : null}
      {state === 'done' ? <div role="status"><p><strong>{t.done}</strong></p><p>{t.doneMore}</p></div> : null}
      {state === 'form' || state === 'sending' ? <form onSubmit={submit}>
        <p>{t.intro(info?.studentFirstName, info?.school || 'kool')}</p>
        <p className="tax-form-student">{t.student(info?.studentFirstName || '')}</p>
        {info?.submitted ? <p className="tax-form-note">{t.already}</p> : null}
        <label><span>{t.payerName}</span><input value={form.payerName} autoComplete="name" onChange={(event) => setForm({ ...form, payerName: event.target.value })} /></label>
        <label className="tax-form-check"><input type="checkbox" checked={form.adult} onChange={(event) => setForm({ ...form, adult: event.target.checked })} /> {t.adult}</label>
        {!form.adult ? <label><span>{t.payerCode}</span><input value={form.payerCode} inputMode="numeric" maxLength="13" onChange={(event) => setForm({ ...form, payerCode: event.target.value })} /></label> : null}
        <label><span>{t.studentCode}</span><input value={form.studentCode} inputMode="numeric" maxLength="13" onChange={(event) => setForm({ ...form, studentCode: event.target.value })} /></label>
        <label className="tax-form-check"><input type="checkbox" checked={form.consent} onChange={(event) => setForm({ ...form, consent: event.target.checked })} /> {t.consent}</label>
        {error ? <p className="tax-form-error" role="alert">{error}</p> : null}
        <button className="tax-form-submit" type="submit" disabled={state === 'sending'}>{state === 'sending' ? t.sending : t.send}</button>
        <p className="tax-form-privacy">{t.privacy}</p>
      </form> : null}
    </div>
  </main>;
}
