'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const core = require('./subject-billing-core');

const card = { lessonPriceCents: 2000, lessonMinutes: 60, weeklyLessons: 2, billingMode: 'advance', chargeNoShow: true };

test('a plan without subjectBilling: every subject bills by the card (legacy plans unchanged)', () => {
  for (const subject of ['', 'Eesti keel', 'Matemaatika']) {
    assert.deepEqual(core.subjectBilling(card, subject, 'Eesti keel'), { billingMode: 'advance', weeklyLessons: 2, chargeNoShow: true, own: { billingMode: false, weeklyLessons: false, chargeNoShow: false } });
  }
  assert.equal(core.hasSubjectBilling(card), false);
  assert.deepEqual(core.cardMonthlyMode(card, ['Eesti keel', 'Matemaatika'], 'Eesti keel'), { mode: 'advance', monthlySubjects: ['Eesti keel', 'Matemaatika'], packageSubjects: [], mixedTiming: false });
  assert.deepEqual(core.cardMonthlyMode({ ...card, billingMode: 'package' }, ['Eesti keel'], 'Eesti keel'), { mode: 'package', monthlySubjects: [], packageSubjects: ['Eesti keel'], mixedTiming: false });
  // an old plan without billingMode bills „Kuu ette”, a plan without chargeNoShow charges the no-show
  assert.deepEqual(core.cardBilling({ lessonPriceCents: 1 }), { billingMode: 'advance', weeklyLessons: 0, chargeNoShow: true });
});

test('override → the subject’s own value; absent field → the card’s; the main subject is always the card', () => {
  const plan = { ...card, subjectBilling: { 'Inglise keel': { billingMode: 'package' }, Matemaatika: { weeklyLessons: 1, chargeNoShow: false }, 'Eesti keel': { billingMode: 'actual' } } };
  assert.deepEqual(core.subjectBilling(plan, 'Inglise keel', 'Eesti keel'), { billingMode: 'package', weeklyLessons: 2, chargeNoShow: true, own: { billingMode: true, weeklyLessons: false, chargeNoShow: false } });
  assert.deepEqual(core.subjectBilling(plan, 'Matemaatika', 'Eesti keel'), { billingMode: 'advance', weeklyLessons: 1, chargeNoShow: false, own: { billingMode: false, weeklyLessons: true, chargeNoShow: true } });
  // a stale entry for the main subject is ignored
  assert.equal(core.subjectBilling(plan, 'Eesti keel', 'Eesti keel').billingMode, 'advance');
  // the key matches regardless of case
  assert.equal(core.subjectBilling(plan, 'Inglise Keel', 'Eesti keel').billingMode, 'package');
  assert.deepEqual(core.planForSubjectBilling(plan, 'Matemaatika', 'Eesti keel'), { ...plan, billingMode: 'advance', weeklyLessons: 1, chargeNoShow: false });
});

test('invalid stored values are ignored (the card value applies)', () => {
  const plan = { ...card, subjectBilling: { Matemaatika: { billingMode: 'weekly', weeklyLessons: 0, chargeNoShow: 'no' }, Füüsika: null } };
  assert.deepEqual(core.subjectBillingOf(plan.subjectBilling), {});
  assert.equal(core.hasSubjectBilling(plan), false);
  assert.equal(core.subjectBilling(plan, 'Matemaatika', 'Eesti keel').billingMode, 'advance');
});

test('card monthly mode: package subjects get no monthly line; actual cannot share a row with advance / current', () => {
  const subjects = ['Eesti keel', 'Inglise keel', 'Matemaatika'];
  const mixed = { ...card, subjectBilling: { 'Inglise keel': { billingMode: 'package' } } };
  assert.deepEqual(core.cardMonthlyMode(mixed, subjects, 'Eesti keel'), { mode: 'advance', monthlySubjects: ['Eesti keel', 'Matemaatika'], packageSubjects: ['Inglise keel'], mixedTiming: false });
  const allPackage = { ...card, billingMode: 'package', subjectBilling: {} };
  assert.equal(core.cardMonthlyMode(allPackage, subjects, 'Eesti keel').mode, 'package');
  // main on packages, the others current: the row is „current”
  const mainPackage = { ...card, billingMode: 'package', subjectBilling: { 'Inglise keel': { billingMode: 'current' }, Matemaatika: { billingMode: 'advance' } } };
  assert.deepEqual(core.cardMonthlyMode(mainPackage, subjects, 'Eesti keel'), { mode: 'current', monthlySubjects: ['Inglise keel', 'Matemaatika'], packageSubjects: ['Eesti keel'], mixedTiming: false });
  const actualAndPackage = { ...card, billingMode: 'actual', subjectBilling: { 'Inglise keel': { billingMode: 'package' }, Matemaatika: { billingMode: 'actual' } } };
  assert.deepEqual(core.cardMonthlyMode(actualAndPackage, subjects, 'Eesti keel'), { mode: 'actual', monthlySubjects: ['Eesti keel', 'Matemaatika'], packageSubjects: ['Inglise keel'], mixedTiming: false });
  const actualAndAdvance = { ...card, subjectBilling: { Matemaatika: { billingMode: 'actual' } } };
  assert.equal(core.cardMonthlyMode(actualAndAdvance, subjects, 'Eesti keel').mixedTiming, true);
});

test('forecast: card price × card weekly, plus own weekly lessons of further subjects at their price', () => {
  assert.equal(core.weeklyForecastCents(card), 4000);
  assert.equal(core.weeklyForecastCents({ ...card, subjectPrices: { Matemaatika: { lessonPriceCents: 3000 } } }), 4000);
  assert.equal(core.weeklyForecastCents({ ...card, subjectPrices: { Matemaatika: { lessonPriceCents: 3000 } }, subjectBilling: { Matemaatika: { weeklyLessons: 1.5 }, 'Inglise keel': { weeklyLessons: 1 } } }), 4000 + 4500 + 2000);
  assert.equal(core.weeklyForecastCents(null), 0);
});

test('the browser copy (crm-v2 finance/subjectBilling.js) gives the same answers', async () => {
  const client = await import(pathToFileURL(path.join(__dirname, '../crm-v2/src/features/finance/subjectBilling.js')).href);
  const plans = [
    card,
    { ...card, billingMode: 'package', chargeNoShow: false },
    { ...card, subjectBilling: { 'Inglise keel': { billingMode: 'package', weeklyLessons: 1 }, Matemaatika: { chargeNoShow: false, billingMode: 'actual' } }, subjectPrices: { Matemaatika: { lessonPriceCents: 2500 } } },
    { ...card, billingMode: 'actual', subjectBilling: { 'inglise keel': { billingMode: 'current' }, Bad: { weeklyLessons: 99 } } },
    {},
  ];
  const subjects = [[], ['Eesti keel'], ['Eesti keel', 'Inglise keel'], ['Eesti keel', 'Inglise keel', 'Matemaatika'], ['Matemaatika', 'Inglise keel']];
  assert.deepEqual(client.BILLING_MODE_IDS, core.BILLING_MODE_IDS);
  for (const plan of plans) {
    assert.deepEqual(client.cardBilling(plan), core.cardBilling(plan));
    assert.deepEqual(client.subjectBillingOf(plan.subjectBilling), core.subjectBillingOf(plan.subjectBilling));
    assert.equal(client.hasSubjectBilling(plan), core.hasSubjectBilling(plan));
    assert.equal(client.weeklyForecastCents(plan), core.weeklyForecastCents(plan));
    for (const list of subjects) {
      for (const main of ['Eesti keel', 'Matemaatika']) {
        assert.deepEqual(client.cardMonthlyMode(plan, list, main), core.cardMonthlyMode(plan, list, main));
        for (const subject of ['', ...list]) assert.deepEqual(client.subjectBilling(plan, subject, main), core.subjectBilling(plan, subject, main));
      }
    }
  }
});
