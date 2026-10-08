import { Check, Lock, WalletCards } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, Card, Input, Select } from '../../components/ui/index.js';
import { BILLING_MODES, LESSON_MINUTES, validateRevenuePlan } from '../../services/firebase/revenuePlans.js';

const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format(Number(cents || 0) / 100);
const today = () => new Date().toLocaleDateString('sv-SE');

function formOf(plan, student) {
  return {
    lessonPrice: plan?.lessonPriceCents ? String(plan.lessonPriceCents / 100).replace('.', ',') : student?.lessonPrice ? String(student.lessonPrice).replace('.', ',') : '',
    lessonMinutes: String(plan?.lessonMinutes || 60),
    weeklyLessons: String(plan?.weeklyLessons || student?.weeklyLessons || 1).replace('.', ','),
    billingMode: plan?.billingMode || 'advance',
    chargeNoShow: plan ? plan.chargeNoShow !== false : true,
    validFrom: today(),
  };
}

// Finance v2 §1: the lesson price and billing settings of one student. Admin edits, finance role reads;
// teachers and parents never get this card (the price is stored only in studentRevenuePlans).
export default function BillingSettingsCard({ student, plan, canEdit, onSave }) {
  const [form, setForm] = useState(() => formOf(plan, student));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => { setForm(formOf(plan, student)); }, [plan, student]);

  const set = (patch) => { setForm((current) => ({ ...current, ...patch })); setMessage(''); };
  const save = async (event) => {
    event.preventDefault();
    const validation = validateRevenuePlan(form);
    setErrors(validation.errors);
    if (!validation.valid) return;
    setSaving(true);
    try { await onSave(form); setMessage('Arveldusseaded salvestatud.'); }
    catch (error) { setErrors({ form: error.message || 'Salvestamine ebaõnnestus.' }); }
    finally { setSaving(false); }
  };
  const history = [...(plan?.priceHistory || [])].reverse();

  return (
    <Card className="profile-wide billing-settings">
      <div className="section-heading">
        <div><span className="eyebrow"><Lock size={13} /> Näevad ainult administraator ja raamatupidaja</span><h2>Arveldus</h2></div>
        {plan?.lessonPriceCents ? <strong className="billing-settings__price">{money(plan.lessonPriceCents)} / {plan.lessonMinutes || 60} min</strong> : <span className="billing-settings__missing">Hind määramata</span>}
      </div>
      <form className="billing-settings__form" onSubmit={save}>
        <Input label="Tunni hind (€)" inputMode="decimal" value={form.lessonPrice} error={errors.lessonPrice} disabled={!canEdit} onChange={(e) => set({ lessonPrice: e.target.value })} />
        <Select label="Tunni pikkus" value={form.lessonMinutes} disabled={!canEdit} onChange={(e) => set({ lessonMinutes: e.target.value })}>
          {LESSON_MINUTES.map((minutes) => <option key={minutes} value={minutes}>{minutes} min</option>)}
        </Select>
        <Input label="Tunde nädalas" inputMode="decimal" value={form.weeklyLessons} error={errors.weeklyLessons} disabled={!canEdit} onChange={(e) => set({ weeklyLessons: e.target.value })} />
        <Select label="Arveldus" value={form.billingMode} disabled={!canEdit} onChange={(e) => set({ billingMode: e.target.value })}>
          {BILLING_MODES.map((mode) => <option key={mode.id} value={mode.id}>{mode.label}</option>)}
        </Select>
        <Input label="Kehtib alates" type="date" value={form.validFrom} disabled={!canEdit} onChange={(e) => set({ validFrom: e.target.value })} />
        <label className="billing-settings__check"><input type="checkbox" checked={form.chargeNoShow} disabled={!canEdit} onChange={(e) => set({ chargeNoShow: e.target.checked })} /> Ette teatamata puudumine on tasuline (erandi saab teha tunni juures)</label>
        {errors.form ? <p className="action-error" role="alert">{errors.form}</p> : null}
        {canEdit ? <div className="billing-settings__actions">{message ? <span role="status"><Check size={16} /> {message}</span> : null}<Button type="submit" loading={saving}><WalletCards size={17} /> Salvesta</Button></div> : null}
      </form>
      {history.length ? (
        <details className="billing-settings__history"><summary>Varasemad hinnad ({history.length})</summary>
          <ul>{history.map((item, index) => <li key={index}>{money(item.lessonPriceCents)} / {item.lessonMinutes || 60} min · {item.validFrom || 'algusest'} – {item.validTo}</li>)}</ul>
        </details>
      ) : null}
    </Card>
  );
}
