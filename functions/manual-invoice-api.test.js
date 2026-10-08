"use strict";

const test = require('node:test');
const assert = require('node:assert/strict');
const admin = require('firebase-admin');
const rewire = require('rewire');

if (!admin.apps.length) admin.initializeApp({ projectId: 'demo-finance-cancellation' });
const api = rewire('./manual-invoice-api.js');

function fakeDatabase(invoice) {
  const writes = [];
  const ref = (collection, id) => ({ collection, id });
  const db = {
    collection(name) {
      return {
        doc: (id) => ref(name, id),
        where: (field, operator, value) => ({ collection: name, field, operator, value }),
      };
    },
    async runTransaction(callback) {
      return callback({
        async get(target) {
          if (target.collection === 'invoices') return { exists: true, id: target.id, data: () => invoice };
          if (target.collection === 'payments' || target.collection === 'creditNotes') return { docs: [] };
          return { exists: false };
        },
        set: (target, value) => writes.push({ type: 'set', target, value }),
        create: (target, value) => writes.push({ type: 'create', target, value }),
      });
    },
  };
  return { db, writes };
}

test('cancellation zeros active balance but preserves invoice and appends an audit record', async () => {
  const { db, writes } = fakeDatabase({ status: 'Ootel', billingMode: 'monthly_plan_v1', num: 'KS-2026-084', date: '2026-10-08', amountCents: 9000, paidAmountCents: 0, lines: [] });
  const restore = api.__set__('db', db);
  try {
    const result = await api.cancelInvoice({ actor: { uid: 'admin', role: 'admin' }, invoiceId: 'invoice-1', reason: 'Koostatud vale õpilase jaoks', requestId: 'cancel-invoice-1' });
    assert.equal(result.idempotent, false);
    assert.equal(writes.length, 2);
    assert.equal(writes[0].target.collection, 'invoices');
    assert.equal(writes[0].value.status, 'Tühistatud');
    assert.equal(writes[0].value.effectiveAmountCents, 0);
    assert.equal(writes[0].value.balanceDueCents, 0);
    assert.equal(writes[1].target.collection, 'financialAudit');
    assert.equal(writes[1].value.action, 'invoice.cancelled');
    assert.equal(writes[1].value.originalAmountCents, 9000);
  } finally { restore(); }
});

test('finance role cannot cancel an invoice', async () => {
  await assert.rejects(api.cancelInvoice({ actor: { uid: 'finance', role: 'finance' }, invoiceId: 'invoice-1', reason: 'Koostatud vale õpilase jaoks', requestId: 'cancel-invoice-2' }), { status: 403 });
});

test('a cancelled monthly invoice can be replaced with a new numbered revision', async () => {
  const writes = [];
  const cancelled = { id: 'monthly_s1_2026-10', data: () => ({ studentId: 's1', planMonth: '2026-10', status: 'Tühistatud' }) };
  const db = {
    collection(name) {
      return {
        doc: (id) => ({ collection: name, id }),
        where: (field, operator, value) => ({ collection: name, field, operator, value, limit: () => ({ collection: name, field, operator, value }) }),
      };
    },
    async runTransaction(callback) {
      return callback({
        async get(target) {
          if (target.collection === 'students') return { exists: true, data: () => ({ name: 'Mari', parentEmail: 'mari@example.ee' }) };
          if (target.collection === 'studentRevenuePlans') return { exists: true, data: () => ({ lessonPriceCents: 2500, lessonMinutes: 60 }) };
          if (target.collection === 'meta') return { exists: true, data: () => ({ seq: 84 }) };
          if (target.collection === 'invoices' && target.field === 'studentId') return { docs: [cancelled] };
          if (target.collection === 'invoices' && target.field === 'num') return { empty: true };
          return { exists: false };
        },
        create: (target, value) => writes.push({ type: 'create', target, value }),
        set: (target, value) => writes.push({ type: 'set', target, value }),
      });
    },
  };
  const restore = api.__set__('db', db);
  try {
    const result = await api.createMonthlyInvoice({ actor: { uid: 'admin', role: 'admin' }, values: { studentId: 's1', month: '2026-10', due: '2026-10-10', plannedUnits: 4 } });
    assert.equal(result.idempotent, false);
    assert.equal(result.invoice.id, 'monthly_s1_2026-10-r2');
    assert.equal(result.invoice.monthRevision, 2);
    assert.equal(result.invoice.num, 'KS-2026-085');
    assert.equal(writes[0].target.id, 'monthly_s1_2026-10-r2');
  } finally { restore(); }
});
