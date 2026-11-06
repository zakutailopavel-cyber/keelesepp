import { Check, Lock, WalletCards } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Input, Select } from '../../components/ui/index.js';
import { BILLING_MODES, LESSON_MINUTES, validateRevenuePlan } from '../../services/firebase/revenuePlans.js';
import {
  CUSTOM_RATE, DISCOUNT_HOURLY_RATES_CENTS, DISCOUNT_REASON_MAX, GENERAL_RATE, LEGACY_REASON_PLACEHOLDER, PRICE_TERMS,
  SAME_RATE, STANDARD_HOURLY_RATE_CENTS, billedSubjectPrice, hourlyCentsFromLesson, lessonPricesFromTerms, priceTermsOf,
  rateChoiceOf, rateLabel, validatePriceTerms,
} from '../finance/priceTerms.js';
import { mainSubject, subjectsOf } from './subjects.js';
import { displayDate } from '../finance/finance.js';

const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format(Number(cents || 0) / 100);
const today = () => new Date().toLocaleDateString('sv-SE');
const STANDARD_TEXT = rateLabel(STANDARD_HOURLY_RATE_CENTS);
const NO_CHOICE = { hourlyRate: '', customRate: '', stored: false };
const slug = (text) => String(text).toLocaleLowerCase('et').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-');

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
  const extra = subjectsOf(student || {}).filter((subject) => subject !== mainSubject(student || {}));
  // with further subjects the card's own subject may stay at the standard rate while another is discounted
  const allowGeneral = extra.length > 0;
  return {
    priceTerms: terms.priceTerms,
    legacy: terms.legacy,
    allowGeneral,
    // a fixed rate, or „Muu” prefilled with a stored rate that is none of them (kept to the cent until edited)
    ...(discount && priced?.lessonPriceCents ? rateChoiceOf(priced.lessonPriceCents, minutes, { allowGeneral }) : NO_CHOICE),
    discountReason: terms.discountReason,
    lessonMinutes: minutes,
    weeklyLessons: String(plan?.weeklyLessons || student?.weeklyLessons || 1).replace('.', ','),
    billingMode: plan?.billingMode || 'advance',
    chargeNoShow: plan ? plan.chargeNoShow !== false : true,
    validFrom: today(),
    // further subjects of the card (owner 2026-10-20): the same choices plus „sama kui kaardil” and the standard rate
    subjects: Object.fromEntries(extra.map((subject) => {
      const own = priced?.subjectPrices?.[subject];
      const ownMinutes = own?.lessonMinutes || minutes;
      return [subject, {
        ...(discount && own?.lessonPriceCents ? rateChoiceOf(own.lessonPriceCents, ownMinutes, { allowGeneral: true }) : { ...NO_CHOICE, hourlyRate: SAME_RATE }),
        lessonMinutes: String(ownMinutes),
      }];
    })),
  };
}

// Finance v2 §1: the lesson price and billing settings of one student. Admin edits, finance role reads;
// teachers and parents never get this card (the price is stored only in studentRevenuePlans).
// Price terms (2026-10-29): „Üldtingimused” bills the standard hourly rate, „Soodustus” one of the fixed discount
// rates (20 / 15 / 12 €) or an own rate („Muu”), always with a reason; a stored price off these rates shows as „Muu”
// and stays as it is until the admin edits it.
export default function BillingSettingsCard({ student, plan, canEdit, onSave }) {
  const initial = useMemo(() => formOf(plan, student), [plan, student]);
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => { setForm(initial); setErrors({}); }, [initial]);

  const subjects = subjectsOf(student || {});
  const main = mainSubject(student || {});
  const [activeSubject, setActiveSubject] = useState(main);
  const tabRefs = useRef({});
  const priced = pricedPlan(plan, student);
  const prices = lessonPricesFromTerms(form, initial, priced);
  const general = form.priceTerms === 'general';
  const set = (patch) => { setForm((current) => ({ ...current, ...patch })); setMessage(''); };
  const setSubject = (subject, patch) => set({ subjects: { ...form.subjects, [subject]: { ...form.subjects[subject], ...patch } } });
  const save = async (event) => {
    event.preventDefault();
    const terms = validatePriceTerms(form, initial);
    // a rate error sits in a subject's tab: show the first such tab
    const wrong = subjects.find((subject) => (subject === main ? terms.errors.hourlyRate : terms.errors[`subject:${subject}`]));
    if (wrong) setActiveSubject(wrong);
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
      // also when only an old entry is stored (e.g. for the main subject): the saved map is exactly what the tabs show
      ...(Object.keys(form.subjects).length || Object.keys(plan?.subjectPrices || {}).length ? { subjectPrices: Object.fromEntries(Object.entries(prices.subjectPrices).map(([subject, own]) => [subject, { lessonPrice: String(own.lessonPriceCents / 100), lessonMinutes: String(own.lessonMinutes) }])) } : {}),
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
  const savedTerms = plan?.lessonPriceCents ? priceTermsOf(plan) : null;
  const priceLine = (cents, minutes) => `${money(cents)} / ${minutes} min`;
  const many = subjects.length > 1;
  const cardHourly = prices.hourlyRateCents ? rateLabel(prices.hourlyRateCents) : 'määramata';
  const rateChoices = (isMain) => [
    ...(isMain ? [] : [{ id: SAME_RATE, label: `Kaardi hind (${main}) · ${cardHourly}` }]),
    ...(!isMain || form.allowGeneral ? [{ id: GENERAL_RATE, label: `Üldtingimused ${STANDARD_TEXT}` }] : []),
    ...DISCOUNT_HOURLY_RATES_CENTS.map((cents) => ({ id: String(cents), label: rateLabel(cents) })),
    { id: CUSTOM_RATE, label: 'Muu' },
  ];
  // one subject of the card, edited the same way for every subject: the main subject's fields are the card's own
  // (lessonPriceCents / lessonMinutes), a further subject's are its subjectPrices entry
  const cardPrice = { lessonPriceCents: prices.lessonPriceCents, lessonMinutes: Number(form.lessonMinutes) || 60 };
  const subjectTab = (subject) => {
    if (subject === main) return { row: form, was: initial, patch: set, isMain: true, error: errors.hourlyRate, price: cardPrice, fallback: false };
    const own = prices.subjectPrices[subject];
    const row = form.subjects[subject] || {};
    // „Kaardi hind”: billed at the card's rate (left unwritten, or written at that rate by its own length)
    const same = !general && (row.hourlyRate ?? SAME_RATE) === SAME_RATE;
    return { row, was: initial.subjects[subject] || {}, patch: (patch) => setSubject(subject, patch), isMain: false, error: errors[`subject:${subject}`], price: own || cardPrice, fallback: same || !own };
  };
  const shownSubject = subjects.includes(activeSubject) ? activeSubject : subjects[0];
  const focusTab = (index) => {
    const next = subjects[(index + subjects.length) % subjects.length];
    setActiveSubject(next);
    tabRefs.current[next]?.focus();
  };
  const staleMainPrice = plan?.subjectPrices?.[main]?.lessonPriceCents ? plan.subjectPrices[main] : null;
  const shared = `${BILLING_MODES.find((mode) => mode.id === form.billingMode)?.label || form.billingMode} · ${form.weeklyLessons} tundi nädalas`;

  const tabPanel = (subject) => {
    const tab = subjectTab(subject);
    const choice = tab.row.hourlyRate ?? SAME_RATE;
    const custom = !general && choice === CUSTOM_RATE;
    const lesson = tab.price.lessonPriceCents;
    return <div className="billing-settings__panel" role="tabpanel" id={`billing-panel-${slug(subject)}`} aria-labelledby={`billing-tab-${slug(subject)}`} data-billing-subject={subject}>
      {general ? (
        <p className="billing-settings__auto" role="note">Tunni hind arvutatakse üldtariifist {STANDARD_TEXT}: <strong>{priceLine(lesson, tab.price.lessonMinutes)}</strong>.</p>
      ) : <fieldset className="billing-settings__switch" disabled={!canEdit}>
        <legend>Tunnitasu</legend>
        <div role="radiogroup" aria-label="Tunnitasu">
          {rateChoices(tab.isMain).map((item) => <label key={item.id || 'same'} className={choice === item.id ? 'is-active' : ''}>
            <input type="radio" name={`hourlyRate-${slug(subject)}`} value={item.id} checked={choice === item.id} onChange={() => tab.patch({ hourlyRate: item.id })} />
            {item.label}
          </label>)}
        </div>
        {custom ? null : tab.error ? <span className="field__error" role="alert">{tab.error}</span> : null}
      </fieldset>}
      {custom ? <Input label="Oma tunnitasu (€ / h)" inputMode="decimal" placeholder={tab.was.customRate || 'nt 18,50'} value={tab.row.customRate || ''} error={tab.error} disabled={!canEdit} onChange={(e) => tab.patch({ customRate: e.target.value })} /> : null}
      <Select label="Tunni pikkus" value={String(tab.row.lessonMinutes || '60')} disabled={!canEdit} onChange={(e) => tab.patch({ lessonMinutes: e.target.value })}>
        {LESSON_MINUTES.map((minutes) => <option key={minutes} value={minutes}>{minutes} min</option>)}
      </Select>
      {general ? null : <p className="billing-settings__lesson-price" data-billing-price={subject}>
        {!lesson ? <strong className="billing-settings__missing">Hind määramata</strong>
          : tab.fallback ? <>Oma hinda pole — arvel kehtib kaardi hind: <strong>{rateLabel(hourlyCentsFromLesson(lesson, tab.price.lessonMinutes))}</strong> · tund {priceLine(lesson, tab.price.lessonMinutes)}</>
          : <>Tunni hind: <strong>{priceLine(lesson, tab.price.lessonMinutes)}</strong> · tunnitasu {rateLabel(hourlyCentsFromLesson(lesson, tab.price.lessonMinutes))}</>}
        {tab.fallback && canEdit ? <> <Button type="button" variant="secondary" onClick={() => tab.patch({ hourlyRate: CUSTOM_RATE, customRate: '' })}>Määra oma hind</Button></> : null}
      </p>}
      {tab.isMain && staleMainPrice ? <p className="billing-settings__changed" role="note">Selle aine jaoks on salvestatud ka vana eraldi hind {priceLine(staleMainPrice.lessonPriceCents, staleMainPrice.lessonMinutes || 60)}: kuuarve võtab ülal oleva hinna, tunnipakett vana. „Salvesta” jätab alles ainult ülal oleva hinna.</p> : null}
      {many ? <p className="billing-settings__shared-note">Arveldus: {shared} — ühine kõigile ainetele (allpool).</p> : null}
    </div>;
  };

  return (
    <Card className="profile-wide billing-settings">
      <div className="section-heading">
        <div><span className="eyebrow"><Lock size={13} /> Näevad ainult administraator ja raamatupidaja</span><h2>Arveldus</h2></div>
        {plan?.lessonPriceCents ? <div className="billing-settings__summary">
          {many ? <ul className="billing-settings__saved">{subjects.map((subject) => {
            const billed = billedSubjectPrice(plan, subject, main);
            return <li key={subject}>{subject}: <strong>{priceLine(billed.lessonPriceCents, billed.lessonMinutes)}</strong>{billed.fallback ? ' (kaardi hind)' : ''}</li>;
          })}</ul> : <strong className="billing-settings__price">{priceLine(plan.lessonPriceCents, plan.lessonMinutes || 60)}</strong>}
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
        {general ? null : <div className="field billing-settings__reason">
          <label className="field__label" htmlFor="billing-discount-reason">Soodustuse põhjus</label>
          <textarea id="billing-discount-reason" rows={2} className={errors.discountReason ? 'is-invalid' : ''} maxLength={DISCOUNT_REASON_MAX} value={form.discountReason} disabled={!canEdit}
            placeholder={form.legacy && !form.discountReason ? LEGACY_REASON_PLACEHOLDER : 'nt mitu kursust, mitu last peres'}
            aria-invalid={errors.discountReason ? 'true' : undefined} onChange={(e) => set({ discountReason: e.target.value })} />
          <small>{String(form.discountReason || '').length} / {DISCOUNT_REASON_MAX}</small>
          {errors.discountReason ? <span className="field__error" role="alert">{errors.discountReason}</span> : null}
        </div>}
        {/* one tab per subject of the card (#bug 2026-11-06, Oleksiy): every subject edits its own rate and length */}
        <div className="billing-settings__tabs" role="tablist" aria-label="Ained">
          {subjects.map((subject, index) => {
            const tab = subjectTab(subject);
            const selected = subject === shownSubject;
            return <button key={subject} type="button" role="tab" id={`billing-tab-${slug(subject)}`} aria-controls={`billing-panel-${slug(subject)}`} aria-selected={selected} tabIndex={selected ? 0 : -1}
              ref={(node) => { tabRefs.current[subject] = node; }} className={`billing-settings__tab${selected ? ' is-active' : ''}`}
              onClick={() => setActiveSubject(subject)}
              onKeyDown={(event) => { if (event.key === 'ArrowRight') { event.preventDefault(); focusTab(index + 1); } if (event.key === 'ArrowLeft') { event.preventDefault(); focusTab(index - 1); } }}>
              <span>{subject}</span>
              <small>{tab.price.lessonPriceCents ? priceLine(tab.price.lessonPriceCents, tab.price.lessonMinutes) : 'Hind määramata'}</small>
              {tab.error ? <span className="billing-settings__tab-alert" title={tab.error}>!</span> : null}
            </button>;
          })}
        </div>
        {tabPanel(shownSubject)}
        {many ? <p className="billing-settings__shared-title">Ühine kõigile ainetele</p> : null}
        <Input label="Tunde nädalas" inputMode="decimal" value={form.weeklyLessons} error={errors.weeklyLessons} disabled={!canEdit} onChange={(e) => set({ weeklyLessons: e.target.value })} />
        <Select label="Arveldus" value={form.billingMode} disabled={!canEdit} onChange={(e) => set({ billingMode: e.target.value })}>
          {BILLING_MODES.map((mode) => <option key={mode.id} value={mode.id}>{mode.label}</option>)}
        </Select>
        <Input label="Kehtib alates" type="date" value={form.validFrom} disabled={!canEdit} onChange={(e) => set({ validFrom: e.target.value })} />
        <label className="billing-settings__check"><input type="checkbox" checked={form.chargeNoShow} disabled={!canEdit} onChange={(e) => set({ chargeNoShow: e.target.checked })} /> Ette teatamata puudumine on tasuline (erandi saab teha tunni juures)</label>
        {plan?.priceTermsChangedAt ? <p className="billing-settings__changed">Hinnatingimused muudetud {displayDate(String(plan.priceTermsChangedAt).slice(0, 10))}{plan.priceTermsChangedBy ? ` · ${plan.priceTermsChangedBy}` : ''}</p> : null}
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
