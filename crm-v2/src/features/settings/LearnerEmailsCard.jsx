import { Eye, Mail, Save, Send } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Card, Input, Modal, Select } from '../../components/ui/index.js';
import { learnerEmailsService } from '../../services/firebase/learnerEmails.js';
import { firebaseErrorMessage } from '../../utils/firebaseErrors.js';
import { DAILY_HOURS, DEFAULT_TEXTS, EMAIL_TYPES, logRow, normalizeEmailSettings, TEXT_FIELDS, toggleType, unknownPlaceholders } from './learnerEmailModel.js';
import './learnerEmails.css';

// Seaded → „E-kirjad” (owner 2026-10-25): e-mails to students and parents. Every type is off until the administrator
// switches it on here; texts may be changed per type (empty = the default text), with placeholders. Invoices and
// payment reminders are separate (Finantsid). Rules: emailSettings/learner admin only. docs/EMAIL_NOTIFICATIONS.md.
export default function LearnerEmailsCard({ user, service = learnerEmailsService }) {
  const [settings, setSettings] = useState(null);
  const [log, setLog] = useState([]);
  const [open, setOpen] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [dirty, setDirty] = useState(false);
  const [preview, setPreview] = useState(null);

  const load = useCallback(async () => {
    try { setSettings(await service.getSettings()); } catch (err) { setSettings(normalizeEmailSettings({})); setError(firebaseErrorMessage(err)); }
    try { setLog(await service.listLog(30)); } catch { setLog([]); }
  }, [service]);
  useEffect(() => { load(); }, [load]);

  const change = (next) => { setSettings(next); setDirty(true); setNotice(''); };
  const setText = (id, key, value) => change({ ...settings, types: { ...settings.types, [id]: { ...settings.types[id], [key]: value } } });

  const save = async () => {
    setBusy('save'); setError(''); setNotice('');
    try {
      setSettings(await service.saveSettings(settings, user));
      setDirty(false);
      setNotice('E-kirjade seaded on salvestatud.');
    } catch (err) { setError(firebaseErrorMessage(err)); } finally { setBusy(''); }
  };

  const showPreview = async (id, language = 'both') => {
    setBusy(`preview-${id}`); setError('');
    try { setPreview({ id, language, ...(await service.preview(id, { language, settings })) }); } catch (err) { setError(err.message || 'Eelvaadet ei saanud teha.'); } finally { setBusy(''); }
  };
  const sendTest = async (id) => {
    setBusy(`test-${id}`); setError(''); setNotice('');
    try { await service.sendTest(id, { settings }); setNotice(`Proovikiri „${EMAIL_TYPES.find((type) => type.id === id)?.label}” saadeti sinu aadressile ${user.email || ''}.`); } catch (err) { setError(err.message || 'Proovikirja ei saanud saata.'); } finally { setBusy(''); }
  };

  const enabledCount = settings ? EMAIL_TYPES.filter(({ id }) => settings.types[id].enabled).length : 0;

  return (
    <Card className="learner-emails-card">
      <div className="settings-icon"><Mail /></div>
      <h2>E-kirjad õpilastele ja vanematele</h2>
      <p className="settings-copy">Teavitused e-postiga: tunni meeldetuletus, ümber tõstetud või ära jäänud tund, uus tunniplaan, kodutöö tähtaeg, kontrollitud töö ja teated. Iga kiri on eesti ja vene keeles (kui saaja pole ise keelt valinud) ning lõpus on link, millega saaja saab need kirjad endale välja lülitada. Arveid ja maksemeeldetuletusi see ei mõjuta. Kaardile, millel pole e-posti, kirja ei lähe.</p>
      {!settings ? <p className="form-hint">Laen…</p> : <>
        <p className="form-hint">{enabledCount ? `Sisse lülitatud: ${enabledCount} / ${EMAIL_TYPES.length}.` : 'Kõik kirjad on välja lülitatud — keegi ei saa midagi enne, kui lülitad siin sisse ja salvestad.'}</p>
        <div className="learner-emails-card__general">
          <Select id="learner-emails-hour" label="Igapäevaste meeldetuletuste kellaaeg" value={String(settings.dailyHour)} onChange={(event) => change({ ...settings, dailyHour: Number(event.target.value) })}>
            {DAILY_HOURS.map((hour) => <option key={hour} value={hour}>{`${String(hour).padStart(2, '0')}:00`}</option>)}
          </Select>
          <Input id="learner-emails-address" label="Kooli aadress (kohapealsete tundide kirjades)" maxLength="200" value={settings.siteAddress} placeholder="nt Pärnu mnt 10, Tallinn" onChange={(event) => change({ ...settings, siteAddress: event.target.value })} />
        </div>
        <ul className="learner-emails-card__types">
          {EMAIL_TYPES.map((type) => {
            const value = settings.types[type.id];
            const warnings = TEXT_FIELDS.flatMap(({ key }) => unknownPlaceholders(value[key], type.id));
            return <li key={type.id} className={value.enabled ? 'is-on' : ''}>
              <label className="learner-emails-card__toggle">
                <input type="checkbox" checked={value.enabled} onChange={(event) => change(toggleType(settings, type.id, event.target.checked))} aria-label={`${type.label}: saada`} />
                <span><span className="learner-emails-card__title"><strong>{type.label}</strong>{value.enabled ? <Badge tone="success">sees</Badge> : <Badge>väljas</Badge>}</span><small>{type.when}</small></span>
              </label>
              <div className="learner-emails-card__actions">
                <Button variant="secondary" onClick={() => setOpen(open === type.id ? '' : type.id)} aria-expanded={open === type.id}>{open === type.id ? 'Peida tekst' : 'Muuda teksti'}</Button>
                <Button variant="secondary" loading={busy === `preview-${type.id}`} onClick={() => showPreview(type.id)}><Eye size={16} /> Eelvaade</Button>
                <Button variant="secondary" loading={busy === `test-${type.id}`} onClick={() => sendTest(type.id)}><Send size={16} /> Saada proov mulle</Button>
              </div>
              {open === type.id ? <div className="learner-emails-card__texts">
                <p className="form-hint">Tühi väli = vaiketekst. Kasutada saab: {type.placeholders.map((name) => <code key={name}>{`{${name}}`}</code>)}</p>
                {TEXT_FIELDS.map(({ key, label, max }) => key.startsWith('subject')
                  ? <Input key={key} id={`learner-emails-${type.id}-${key}`} label={label} maxLength={max} value={value[key]} placeholder={DEFAULT_TEXTS[type.id][key]} onChange={(event) => setText(type.id, key, event.target.value)} />
                  : <div className="field" key={key}><label className="field__label" htmlFor={`learner-emails-${type.id}-${key}`}>{label}</label><textarea id={`learner-emails-${type.id}-${key}`} rows={2} maxLength={max} value={value[key]} placeholder={DEFAULT_TEXTS[type.id][key]} onChange={(event) => setText(type.id, key, event.target.value)} /></div>)}
                {warnings.length ? <p className="form-error" role="alert">Tundmatu asendus: {warnings.map((name) => `{${name}}`).join(', ')} — see jääb kirjast välja.</p> : null}
              </div> : null}
            </li>;
          })}
        </ul>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        {notice ? <p className="form-hint" role="status">{notice}</p> : null}
        <Button loading={busy === 'save'} disabled={!dirty} onClick={save}><Save size={17} /> Salvesta e-kirjade seaded</Button>
        <details className="learner-emails-card__log">
          <summary>Viimased kirjad ({log.length})</summary>
          {log.length ? <ul>{log.map(logRow).map((row) => <li key={row.id}><span>{row.at}</span> <strong>{row.kind}</strong> · {row.status}{row.detail ? ` · ${row.detail}` : ''}</li>)}</ul> : <p className="form-hint">Kirju pole veel saadetud.</p>}
        </details>
      </>}
      <Modal open={Boolean(preview)} title={preview ? `Eelvaade: ${EMAIL_TYPES.find((type) => type.id === preview.id)?.label}` : ''} onClose={() => setPreview(null)} className="learner-emails-preview"
        footer={<><Select id="learner-emails-preview-language" aria-label="Eelvaate keel" value={preview?.language || 'both'} onChange={(event) => showPreview(preview.id, event.target.value)}><option value="both">Eesti + vene</option><option value="et">Ainult eesti</option><option value="ru">Ainult vene</option></Select><span className="modal__footer-spacer" /><Button variant="secondary" onClick={() => setPreview(null)}>Sulge</Button></>}>
        {preview ? <>
          <p className="learner-emails-preview__subject"><span>Teema:</span> {preview.subject}</p>
          <iframe title="E-kirja eelvaade" sandbox="" srcDoc={preview.html} className="learner-emails-preview__frame" />
          <p className="form-hint">Näidisandmed (Mari Maasikas, õpetaja Kati Kask). Päris kirjas on saaja andmed.</p>
        </> : null}
      </Modal>
    </Card>
  );
}
