import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button, IconButton, Input, Modal, Select } from '../../components/ui/index.js';
import { localDate } from '../../utils/localDate.js';
import { CORE_SKILLS } from './skillGrades.js';
import { PAPER_TEMPLATES, templateById } from './paperWork.js';
import './reviewLayout.css';

const fromTemplate = (template) => ({
  template: template.id,
  title: template.id === 'free' ? '' : template.title,
  parts: template.parts.map((part) => ({ ...part, points: '' })),
  skills: [...template.skills],
});

// „Lisa paberil töö”: the points of a work done on paper; after saving it opens in the usual review window
// (grade, skills, comment), where the measured skills move the skill map (paperWork.js).
export default function PaperWorkModal({ student, user, repository, onClose, onCreated }) {
  const [form, setForm] = useState(() => ({ ...fromTemplate(PAPER_TEMPLATES[0]), date: localDate() }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const template = templateById(form.template);
  const setPart = (index, patch) => setForm((value) => ({ ...value, parts: value.parts.map((part, at) => (at === index ? { ...part, ...patch } : part)) }));
  const toggleSkill = (skill) => setForm((value) => ({ ...value, skills: value.skills.includes(skill) ? value.skills.filter((item) => item !== skill) : [...value.skills, skill] }));
  const sum = form.parts.reduce((total, part) => total + (Number(String(part.points).replace(',', '.')) || 0), 0);
  const max = form.parts.reduce((total, part) => total + (Number(part.max) || 0), 0);

  const save = async () => {
    setSaving(true); setError('');
    try {
      const created = await repository.addPaperWork({ student, user, title: form.title, date: form.date, parts: form.parts, skills: form.skills, note: template.note });
      onCreated?.(created);
    } catch (saveError) {
      setError(saveError.message || 'Tööd ei saanud salvestada.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open title="Lisa paberil töö" onClose={onClose}
      footer={<>{error ? <span className="form-error review-error" role="alert">{error}</span> : null}<Button variant="secondary" onClick={onClose}>Loobu</Button><Button loading={saving} onClick={save}>Salvesta ja hinda</Button></>}>
      <div className="paper-form">
        <Select label="Töö liik" value={form.template} onChange={(event) => setForm((value) => ({ ...fromTemplate(templateById(event.target.value)), date: value.date }))}>
          {PAPER_TEMPLATES.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
        </Select>
        <p className="form-hint">{template.note}</p>
        <Input label="Töö nimi" value={form.title} onChange={(event) => setForm((value) => ({ ...value, title: event.target.value }))} placeholder="nt Kontrolltöö: kiri sõbrale" />
        <Input label="Kuupäev" type="date" value={form.date} onChange={(event) => setForm((value) => ({ ...value, date: event.target.value }))} />
        <div role="group" aria-label="Punktid">
          {form.parts.map((part, index) => (
            <div className="paper-form__row" key={index}>
              <Input label={index ? '' : 'Osa'} aria-label={`Osa ${index + 1}`} value={part.label} onChange={(event) => setPart(index, { label: event.target.value })} />
              <Input label={index ? '' : 'Punktid'} aria-label={`Punktid: ${part.label || index + 1}`} inputMode="decimal" value={part.points} onChange={(event) => setPart(index, { points: event.target.value })} />
              <Input label={index ? '' : 'Max'} aria-label={`Max: ${part.label || index + 1}`} inputMode="decimal" value={part.max} onChange={(event) => setPart(index, { max: event.target.value })} />
              <IconButton label="Eemalda osa" disabled={form.parts.length < 2} onClick={() => setForm((value) => ({ ...value, parts: value.parts.filter((_, at) => at !== index) }))}><Trash2 size={16} /></IconButton>
            </div>
          ))}
          <Button variant="secondary" onClick={() => setForm((value) => ({ ...value, parts: [...value.parts, { label: '', points: '', max: 5 }] }))}><Plus size={15} /> Lisa osa</Button>
        </div>
        <p><strong>Kokku: {sum} / {max}{max ? ` · ${Math.round((sum / max) * 100)}%` : ''}</strong></p>
        <div role="group" aria-label="Mida punktid mõõdavad">
          <span className="field__label">Mida punktid mõõdavad (see oskus liigub arengukaardil punktide poole)</span>
          <div className="review-templates">{CORE_SKILLS.map((skill) => (
            <label key={skill} className="checkbox-field"><input type="checkbox" checked={form.skills.includes(skill)} onChange={() => toggleSkill(skill)} /> {skill}</label>
          ))}</div>
        </div>
      </div>
    </Modal>
  );
}
