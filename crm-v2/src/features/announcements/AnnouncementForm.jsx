import { Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button, Input, Modal, Select } from '../../components/ui/index.js';
import { AUDIENCE_LABELS, MODE_LABELS, cardMatches, formErrors, subjectsAndLevels } from './announcementModel.js';

const TYPES = [
  ['read', 'Loetud', 'Õpilane / vanem vajutab „Sain aru”.'],
  ['question', 'Küsimus', 'Kohustuslik vastus: vaba tekst või valikud.'],
  ['availability', 'Sobivad ajad', 'Märgib või kinnitab sobivad tunniajad (vanem iga lapse eest).'],
];

function Chips({ values, selected, onChange, label }) {
  if (!values.length) return null;
  const toggle = (value) => onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  return (
    <div className="announcement-form__chips" role="group" aria-label={label}>
      {values.map((value) => (
        <label key={value} className={selected.includes(value) ? 'is-on' : ''}>
          <input type="checkbox" checked={selected.includes(value)} onChange={() => toggle(value)} /> {value}
        </label>
      ))}
    </div>
  );
}

// the administrator writes or edits an announcement; saved as a draft or published at once
export default function AnnouncementForm({ open, initial, editing, students = [], onCancel, onSave }) {
  const [form, setForm] = useState(initial);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [tried, setTried] = useState(false);
  const errors = formErrors(form);
  const { subjects, levels } = useMemo(() => subjectsAndLevels(students), [students]);
  const reach = useMemo(() => students.filter((student) => cardMatches(form, student)).length, [form, students]);
  const set = (patch) => setForm((current) => ({ ...current, ...patch }));
  const setQuestion = (patch) => setForm((current) => ({ ...current, question: { ...current.question, ...patch } }));
  const found = useMemo(() => {
    const text = search.trim().toLocaleLowerCase('et');
    return students.filter((student) => form.studentIds.includes(student.id) || (text && student.name.toLocaleLowerCase('et').includes(text))).slice(0, 60);
  }, [form.studentIds, search, students]);

  const save = async (status) => {
    setTried(true);
    if (Object.keys(errors).length) return;
    setBusy(status); setError('');
    try { await onSave(form, status); } catch (caught) { setError(caught.message || 'Salvestamine ebaõnnestus.'); } finally { setBusy(''); }
  };
  const published = editing?.status === 'published';

  return (
    <Modal open={open} className="modal--announcement" title={editing ? 'Muuda teadet' : 'Uus teade'} onClose={onCancel} footer={<>
      <Button variant="secondary" disabled={Boolean(busy)} onClick={onCancel}>Loobu</Button>
      {!published ? <Button variant="secondary" loading={busy === 'draft'} disabled={Boolean(busy)} onClick={() => save('draft')}>Salvesta mustandina</Button> : null}
      <Button loading={busy === 'published'} disabled={Boolean(busy)} onClick={() => save('published')}>{published ? 'Salvesta' : 'Avalda'}</Button>
    </>}>
      <div className="announcement-form">
        {published ? <p className="data-notice">Teade on avaldatud: muudatus jõuab kohe õpilasteni. Juba antud vastused jäävad alles.</p> : null}
        <Input label="Pealkiri" value={form.title} maxLength={200} onChange={(event) => set({ title: event.target.value })} error={tried ? errors.title : ''} />
        <div className="textarea-field"><label htmlFor="announcement-body">Tekst</label>
          <textarea id="announcement-body" rows={6} maxLength={5000} value={form.body} onChange={(event) => set({ body: event.target.value })} className={tried && errors.body ? 'is-invalid' : ''} />
          <small>Lihtne tekst: reavahetused jäävad, https://… aadressid muutuvad linkideks. Kirjuta keeles, mida õpilased mõistavad (nt eesti ja vene keeles).</small>
          {tried && errors.body ? <span className="form-error">{errors.body}</span> : null}
        </div>

        <fieldset>
          <legend>Kellele</legend>
          <Select label="Saajad" value={form.audience} onChange={(event) => set({ audience: event.target.value })}>
            {Object.entries(AUDIENCE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
          {subjects.length > 1 ? <><span className="field__label">Aine (tühi = kõik)</span><Chips label="Aine" values={subjects} selected={form.subjects} onChange={(value) => set({ subjects: value })} /></> : null}
          {levels.length ? <><span className="field__label">Tase (tühi = kõik)</span><Chips label="Tase" values={levels} selected={form.levels} onChange={(value) => set({ levels: value })} /></> : null}
          <Input label="Ainult need õpilased (valikuline)" placeholder="Otsi nime järgi" value={search} onChange={(event) => setSearch(event.target.value)} />
          {found.length ? <div className="announcement-form__students">
            {found.map((student) => (
              <label key={student.id}><input type="checkbox" checked={form.studentIds.includes(student.id)} onChange={() => set({ studentIds: form.studentIds.includes(student.id) ? form.studentIds.filter((id) => id !== student.id) : [...form.studentIds, student.id] })} />
                {student.name} <small>{[student.subject, student.level].filter(Boolean).join(' · ')}</small></label>
            ))}
          </div> : null}
          <p className="announcement-form__reach">Sobib {reach} õpilase kaardile{form.studentIds.length ? ` (valitud ${form.studentIds.length})` : ''}. Täpne vastajate nimekiri (kontoga õpilased ja vanemad) on „Vastused” all.</p>
        </fieldset>

        <fieldset>
          <legend>Millal</legend>
          <div className="form-grid">
            <Input type="date" label="Alates" value={form.activeFrom} onChange={(event) => set({ activeFrom: event.target.value })} error={tried ? errors.activeFrom : ''} />
            <Input type="date" label="Kuni (tühi = kuni arhiveerimiseni)" value={form.activeTo} min={form.activeFrom} onChange={(event) => set({ activeTo: event.target.value })} error={tried ? errors.activeTo : ''} />
          </div>
        </fieldset>

        <fieldset>
          <legend>Mida õpilane / vanem peab tegema</legend>
          <div className="announcement-form__radios" role="radiogroup" aria-label="Vastuse tüüp">
            {TYPES.map(([value, label, hint]) => (
              <label key={value}><input type="radio" name="responseType" checked={form.responseType === value} onChange={() => set({ responseType: value })} /><span><strong>{label}</strong><small>{hint}</small></span></label>
            ))}
          </div>
          {form.responseType === 'question' ? <>
            <Select label="Vastuse viis" value={form.question.mode} onChange={(event) => setQuestion({ mode: event.target.value })}>
              {Object.entries(MODE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
            {form.question.mode !== 'text' ? <>
              <span className="field__label">Vastusevariandid</span>
              {form.question.options.map((option, index) => (
                <div className="announcement-form__option" key={index}>
                  <input aria-label={`Variant ${index + 1}`} value={option} maxLength={200} onChange={(event) => setQuestion({ options: form.question.options.map((item, at) => (at === index ? event.target.value : item)) })} />
                  <Button variant="secondary" aria-label={`Eemalda variant ${index + 1}`} disabled={form.question.options.length <= 2} onClick={() => setQuestion({ options: form.question.options.filter((_, at) => at !== index) })}><Trash2 size={15} /></Button>
                </div>
              ))}
              {form.question.options.length < 12 ? <Button variant="secondary" onClick={() => setQuestion({ options: [...form.question.options, ''] })}><Plus size={15} /> Lisa variant</Button> : null}
              {tried && errors.options ? <span className="form-error">{errors.options}</span> : null}
              <label className="announcement-form__check"><input type="checkbox" checked={form.question.allowOther} onChange={(event) => setQuestion({ allowOther: event.target.checked })} /><span>Lisa „Muu” oma tekstiga</span></label>
            </> : null}
          </> : null}
          {form.responseType !== 'read' ? (
            <label className="announcement-form__check"><input type="checkbox" checked={form.allowChange} onChange={(event) => set({ allowChange: event.target.checked })} />
              <span>Luba vastust hiljem muuta<small>Muidu on saadetud vastus lõplik.</small></span></label>
          ) : null}
        </fieldset>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
      </div>
    </Modal>
  );
}
