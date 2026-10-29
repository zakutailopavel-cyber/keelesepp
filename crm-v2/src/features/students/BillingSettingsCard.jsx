import { Check, Lock, WalletCards } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Input, Select } from '../../components/ui/index.js';
import { BILLING_MODES, LESSON_MINUTES, validateRevenuePlan } from '../../services/firebase/revenuePlans.js';
import {
  DISCOUNT_HOURLY_RATES_CENTS, DISCOUNT_REASON_MAX, LEGACY_RATE, LEGACY_REASON_PLACEHOLDER, PRICE_TERMS, SAME_RATE,
  STANDARD_HOURLY_RATE_CENTS, discountChoiceOf, hourlyCentsFromLesson, lessonPricesFromTerms, priceTermsOf, rateLabel,
  validatePriceTerms,
} from '../finance/priceTerms.js';
import { mainSubject, subjectsOf } from './subjects.js';

const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format(Number(cents || 0) / 100);
const today = () => new Date().toLocaleDateString('sv-SE');
const STANDARD_TEXT = rateLabel(STANDARD_HOURLY_RATE_CENTS);
const legacyLabel = (hourlyCents) => `Varasem kokkulepe ${rateLabel(hourlyCents)}`;

// the stored plan, or the old card field (before the price moved to the private plan) read as a 60-minute price
function pricedPlan(plan, student) {
  if (plan?.lessonPriceCents) return plan;
  const cardCents = Math.round((Number(String(student?.lessonPrice ?? '').replace(',', '.')) || 0) * 100);
  return cardCents > 0 ? { ...(plan || {}), lessonPriceCents: cardCents, lessonMinutes: plan?.lessonMinutes || 60 } : plan;
}

function formOf(plan, student) {
  const priced = pricedPlan(plan, student);
  const terms = priceTermsOf(priced);
  const discount = terms.priceTerms === 'discount';
  const minutes = String(priced?.lessonMinutes || 60);
  return {
    priceTerms: terms.priceTerms,
    legacy: terms.legacy,
    // a fixed discount rate, or LEGACY_RATE for an old price that is none of them (kept until another is picked)
    hourlyRate: discount && priced?.lessonPriceCents ? discountChoiceOf(priced.lessonPriceCents, minutes) : '',
    legacyHourlyCents: priced?.lessonPriceCents ? hourlyCentsFromLesson(priced.lessonPriceCents, minutes) : 0,
    discountReason: terms.discountReason,
    lessonMinutes: minutes,
    weeklyLessons: String(plan?.weeklyLessons || student?.weeklyLessons || 1).replace('.', ','),
    billingMode: plan?.billingMode || 'advance',
    chargeNoShow: plan ? plan.chargeNoShow !== false : true,
    validFrom: today(),
    // further subjects of the card (owner 2026-10-20): own rate from the same choices (SAME_RATE = the card's) and length
    subjects: Object.fromEntries(subjectsOf(student || {}).filter((subject) => subject !== mainSubject(student || {})).map((subject) => {
      const own = priced?.subjectPrices?.[subject];
      const ownMinutes = own?.lessonMinutes || minutes;
      return [subject, {
        hourlyRate: discount && own?.lessonPriceCents ? discountChoiceOf(own.lessonPriceCents, ownMinutes) : SAME_RATE,
        legacyHourlyCents: own?.lessonPriceCents ? hourlyCentsFromLesson(own.lessonPriceCents, ownMinutes) : 0,
        lessonMinutes: String(ownMinutes),
      }];
    })),
  };
}

// Finance v2 §1: the lesson price and billing settings of one student. Admin edits, finance role reads;
// teachers and parents never get this card (the price is stored only in studentRevenuePlans).
// Price terms (2026-10-29): „Üldtingimused” bills the standard hourly rate, „Soodustus” one of the fixed discount
// rates (20 / 15 / 12 €) with a reason; an old price off these rates stays as it is until the admin picks one.
export default function BillingSettingsCard({ student, plan, canEdit, onSave }) {
  const initial = useMemo(() => formOf(plan, student), [plan, student]);
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => { setForm(initial); setErrors({}); }, [initial]);

  const priced = pricedPlan(plan, student);
  const prices = lessonPricesFromTerms(form, priced);
  const general = form.priceTerms === 'general';
  const set = (patch) => { setForm((current) => ({ ...current, ...patch })); setMessage(''); };
  const setSubject = (subject, patch) => set({ subjects: { ...form.subjects, [subject]: { ...form.subjects[subject], ...patch } } });
  const save = async (event) => {
    event.preventDefault();
    const terms = validatePriceTerms(form, initial);
    const values = {
      lessonPrice: String(prices.lessonPriceCents / 100),
      lessonMinutes: form.lessonMinutes,
      weeklyLessons: form.weeklyLessons,
      billingMode: form.billingMode,
      chargeNoShow: form.chargeNoShow,
      validFrom: form.validFrom,
      priceTerms: form.priceTerms,
      hourlyRateCents: prices.hourlyRateCents,
      discountReason: general ? '' : String(form.discountReason || '').trim(),
      ...(Object.keys(form.subjects).length ? { subjectPrices: Object.fromEntries(Object.entries(prices.subjectPrices).map(([subject, own]) => [subject, { lessonPrice: String(own.lessonPriceCents / 100), lessonMinutes: String(own.lessonMinutes) }])) } : {}),
    };
    const check = terms.valid ? validateRevenuePlan(values) : { valid: false, errors: {} };
    setErrors({ ...terms.errors, ...(check.errors.weeklyLessons ? { weeklyLessons: check.errors.weeklyLessons } : {}) });
    if (!terms.valid || !check.valid) return;
    setSaving(true);
    try { await onSave(values); setMessage('Arveldusseaded salvestatud.'); }
    catch (error) { setErrors({ form: error.message || 'Salvestamine ebaõnnestus.' }); }
    finally { setSaving(false); }
  };
  const history = [...(plan?.priceHistory || [])].reverse();
  const extraSubjects = Object.keys(form.subjects || {});
  const savedTerms = plan?.lessonPriceCents ? priceTermsOf(plan) : null;
  const priceLine = (cents, minutes) => `${money(cents)} / ${minutes} min`;
  // the old price is offered only where it was stored (it cannot be picked anew)
  const mainChoices = [...DISCOUNT_HOURLY_RATES_CENTS.map((cents) => ({ id: String(cents), label: rateLabel(cents) })),
    ...(initial.hourlyRate === LEGACY_RATE ? [{ id: LEGACY_RATE, label: legacyLabel(initial.legacyHourlyCents) }] : [])];

  return (
    <Card className="profile-wide billing-settings">
      <div className="section-heading">
        <div><span className="eyebrow"><Lock size={13} /> Näevad ainult administraator ja raamatupidaja</span><h2>Arveldus</h2></div>
        {plan?.lessonPriceCents ? <div className="billing-settings__summary">
          <strong className="billing-settings__price">{priceLine(plan.lessonPriceCents, plan.lessonMinutes || 60)}</strong>
          <span className={`billing-settings__terms billing-settings__terms--${savedTerms.priceTerms}`}>{savedTerms.priceTerms === 'general' ? `Üldtingimused · ${STANDARD_TEXT}` : 'Soodustus'}</span>
        </div> : <span className="billing-settings__missing">Hind määramata</span>}
      </div>
      <form className="billing-settings__form" onSubmit={save}>
        <fieldset className="billing-settings__switch" disabled={!canEdit}>
          <legend>Hinnatingimused</legend>
          <div role="radiogroup" aria-label="Hinnatingimused">
            {PRICE_TERMS.map((item) => <label key={item.id} className={form.priceTerms === item.id ? 'is-active' : ''}>
              <input type="radio" name="priceTerms" value={item.id} checked={form.priceTerms === item.id} onChange={() => set({ priceTerms: item.id })} />
              {item.id === 'general' ? `${item.label} · ${STANDARD_TEXT}` : item.label}
            </label>)}
          </div>
        </fieldset>
        {general ? (
          <p className="billing-settings__auto" role="note">Tunni hind arvutatakse üldtariifist {STANDARD_TEXT}: <strong>{priceLine(prices.lessonPriceCents, form.lessonMinutes)}</strong>.</p>
        ) : <>
          <fieldset className="billing-settings__switch" disabled={!canEdit}>
            <legend>Tunnitasu</legend>
            <div role="radiogroup" aria-label="Tunnitasu">
              {mainChoices.map((item) => <label key={item.id} className={form.hourlyRate === item.id ? 'is-active' : ''}>
                <input type="radio" name="hourlyRate" value={item.id} checked={form.hourlyRate === item.id} onChange={() => set({ hourlyRate: item.id })} />
                {item.label}
              </label>)}
            </div>
            {errors.hourlyRate ? <span className="field__error" role="alert">{errors.hourlyRate}</span> : null}
          </fieldset>
          <div className="field billing-settings__reason">
            <label className="field__label" htmlFor="billing-discount-reason">Soodustuse põhjus</label>
            <textarea id="billing-discount-reason" rows={2} className={errors.discountReason ? 'is-invalid' : ''} maxLength={DISCOUNT_REASON_MAX} value={form.discountReason} disabled={!canEdit}
              placeholder={form.legacy && !form.discountReason ? LEGACY_REASON_PLACEHOLDER : 'nt mitu kursust, mitu last peres'}
              aria-invalid={errors.discountReason ? 'true' : undefined} onChange={(e) => set({ discountReason: e.target.value })} />
            <small>{String(form.discountReason || '').length} / {DISCOUNT_REASON_MAX}</small>
            {errors.discountReason ? <span className="field__error" role="alert">{errors.discountReason}</span> : null}
          </div>
        </>}
        <Select label={extraSubjects.length ? `Tunni pikkus · ${mainSubject(student || {})}` : 'Tunni pikkus'} value={form.lessonMinutes} disabled={!canEdit} onChange={(e) => set({ lessonMinutes: e.target.value })}>
          {LESSON_MINUTES.map((minutes) => <option key={minutes} value={minutes}>{minutes} min</option>)}
        </Select>
        {general ? null : <p className="billing-settings__lesson-price">Tunni hind: <strong>{prices.lessonPriceCents ? priceLine(prices.lessonPriceCents, form.lessonMinutes) : '—'}</strong></p>}
        {extraSubjects.map((subject) => {
          const own = prices.subjectPrices[subject];
          const row = form.subjects[subject] || {};
          const was = initial.subjects[subject] || {};
          return <div className="billing-settings__subject" key={subject}>
            {general ? null : <Select label={`Tunnitasu · ${subject}`} value={row.hourlyRate ?? SAME_RATE} error={errors[`subject:${subject}`]} disabled={!canEdit} onChange={(e) => setSubject(subject, { hourlyRate: e.target.value })}>
              <option value={SAME_RATE}>sama kui kaardil</option>
              {DISCOUNT_HOURLY_RATES_CENTS.map((cents) => <option key={cents} value={String(cents)}>{rateLabel(cents)}</option>)}
              {was.hourlyRate === LEGACY_RATE ? <option value={LEGACY_RATE}>{legacyLabel(was.legacyHourlyCents)}</option> : null}
            </Select>}
            <Select label={`Tunni pikkus · ${subject}`} value={row.lessonMinutes || '60'} disabled={!canEdit} onChange={(e) => setSubject(subject, { lessonMinutes: e.target.value })}>
              {LESSON_MINUTES.map((minutes) => <option key={minutes} value={minutes}>{minutes} min</option>)}
            </Select>
            <p className="billing-settings__lesson-price">{subject}: <strong>{own ? priceLine(own.lessonPriceCents, own.lessonMinutes) : `kaardi hind ${priceLine(prices.lessonPriceCents, form.lessonMinutes)}`}</strong></p>
          </div>;
        })}
        <Input label="Tunde nädalas" inputMode="decimal" value={form.weeklyLessons} error={errors.weeklyLessons} disabled={!canEdit} onChange={(e) => set({ weeklyLessons: e.target.value })} />
        <Select label="Arveldus" value={form.billingMode} disabled={!canEdit} onChange={(e) => set({ billingMode: e.target.value })}>
          {BILLING_MODES.map((mode) => <option key={mode.id} value={mode.id}>{mode.label}</option>)}
        </Select>
        <Input label="Kehtib alates" type="date" value={form.validFrom} disabled={!canEdit} onChange={(e) => set({ validFrom: e.target.value })} />
        <label className="billing-settings__check"><input type="checkbox" checked={form.chargeNoShow} disabled={!canEdit} onChange={(e) => set({ chargeNoShow: e.target.checked })} /> Ette teatamata puudumine on tasuline (erandi saab teha tunni juures)</label>
        {plan?.priceTermsChangedAt ? <p className="billing-settings__changed">Hinnatingimused muudetud {String(plan.priceTermsChangedAt).slice(0, 10)}{plan.priceTermsChangedBy ? ` · ${plan.priceTermsChangedBy}` : ''}</p> : null}
        {errors.form ? <p className="action-error" role="alert">{errors.form}</p> : null}
        {canEdit ? <div className="billing-settings__actions">{message ? <span role="status"><Check size={16} /> {message}</span> : null}<Button type="submit" loading={saving}><WalletCards size={17} /> Salvesta</Button></div> : null}
      </form>
      {history.length ? (
        <details className="billing-settings__history"><summary>Varasemad hinnad ({history.length})</summary>
          <ul>{history.map((item, index) => <li key={index}>{money(item.lessonPriceCents)} / {item.lessonMinutes || 60} min · {item.validFrom || 'algusest'} – {item.validTo}{item.priceTerms === 'discount' ? ` · soodustus${item.discountReason ? `: ${item.discountReason}` : ''}` : item.priceTerms === 'general' ? ' · üldtingimused' : ''}</li>)}</ul>
        </details>
      ) : null}
    </Card>
  );
}
