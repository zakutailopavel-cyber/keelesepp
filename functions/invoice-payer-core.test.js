"use strict";

// Bug 2026-11-04: a manual invoice stored studentName / payerName „Jekaterina” and no e-mail while the e-mail went to
// the card's parent address. One resolution now decides both the stored payer and the recipient.

const test = require('node:test');
const assert = require('node:assert/strict');
const admin = require('firebase-admin');
const rewire = require('rewire');
const { cardPayerEmail, invoicePayerSnapshot, invoiceRecipient } = require('./invoice-payer-core');
const { manualInvoiceInput, manualInvoiceRecord } = require('./manual-invoice-core');
const { invoiceParties } = require('./invoice-document');

if (!admin.apps.length) admin.initializeApp({ projectId: 'demo-invoice-payer' });

test('a child card: the parent pays, the parent e-mail is stored as payer and parent e-mail', () => {
  const snap = invoicePayerSnapshot({ name: ' Mari  Tamm ', parentName: 'Ema Tamm', parentEmail: 'Ema@Example.ee', email: 'mari@example.ee' });
  assert.equal(snap.studentName, 'Mari Tamm');
  assert.equal(snap.payerName, 'Ema Tamm');
  assert.equal(snap.parentName, 'Ema Tamm');
  assert.equal(snap.payerEmail, 'Ema@Example.ee');
  assert.equal(snap.parentEmail, 'Ema@Example.ee');
  assert.equal(snap.payerEmailLower, 'ema@example.ee');
  assert.equal(snap.parentEmailLower, 'ema@example.ee');
});

test('the Jekaterina card: no parent name, parent e-mail set → full name as payer, the e-mail stored', () => {
  const card = { name: 'Jekaterina Lesnikova', parentName: '', parentEmail: 'lesnikovajekaterina@gmail.com', email: '' };
  const snap = invoicePayerSnapshot(card);
  assert.equal(snap.studentName, 'Jekaterina Lesnikova');
  assert.equal(snap.payerName, 'Jekaterina Lesnikova');
  assert.equal(snap.parentName, '');
  assert.equal(snap.payerEmail, 'lesnikovajekaterina@gmail.com');
  assert.equal(snap.parentEmailLower, 'lesnikovajekaterina@gmail.com');
  // the e-mail goes exactly where the snapshot says
  assert.equal(invoiceRecipient(snap, card), snap.payerEmail);
});

test('an adult who pays himself: his own name and e-mail', () => {
  const snap = invoicePayerSnapshot({ name: 'Aleksandr Smirnov', email: 'aleks@example.ee' });
  assert.equal(snap.payerName, 'Aleksandr Smirnov');
  assert.equal(snap.payerEmail, 'aleks@example.ee');
  assert.equal(snap.parentEmail, 'aleks@example.ee');
});

test('billingEmail is used when the card has no payer / parent e-mail; an explicit payer e-mail wins', () => {
  assert.equal(cardPayerEmail({ billingEmail: 'arved@firma.ee', email: 'self@example.ee' }), 'arved@firma.ee');
  assert.equal(cardPayerEmail({ parentEmail: 'ema@example.ee', billingEmail: 'arved@firma.ee' }), 'ema@example.ee');
  assert.equal(cardPayerEmail({ payerEmail: 'firma@example.ee', parentEmail: 'ema@example.ee' }), 'firma@example.ee');
  // an invalid value is skipped, not stored
  assert.equal(cardPayerEmail({ parentEmail: 'not an e-mail', email: 'self@example.ee' }), 'self@example.ee');
});

test('no e-mail on the card: the linked parent account e-mail is stored (the same one the e-mail falls back to)', () => {
  const snap = invoicePayerSnapshot({ name: 'Mia Kask', linkedParentId: 'p1' }, { linkedAccountEmail: 'isa@example.ee' });
  assert.equal(snap.payerEmail, 'isa@example.ee');
  assert.equal(snap.parentUid, 'p1');
  assert.equal(invoicePayerSnapshot({ name: 'Mia Kask' }).payerEmail, '');
  assert.equal(invoicePayerSnapshot({}).studentName, '—');
});

test('an issued invoice keeps its own recipient even when the card changed', () => {
  assert.equal(invoiceRecipient({ payerEmail: 'old@example.ee' }, { parentEmail: 'new@example.ee' }), 'old@example.ee');
  assert.equal(invoiceRecipient({ payerEmail: '' }, { parentEmail: 'new@example.ee' }), 'new@example.ee');
});

test('manualInvoiceRecord stores the full snapshot', () => {
  const input = manualInvoiceInput({ studentId: 's-jek', description: 'Kursused', amount: 270, due: '2026-11-10' });
  const record = manualInvoiceRecord({
    input, invoiceNum: 'KS-2026-600', nowIso: '2026-11-04T10:00:00Z', actor: 'admin', requestId: 'r1', signature: 's',
    student: { name: 'Jekaterina Lesnikova', parentName: '', parentEmail: 'lesnikovajekaterina@gmail.com', email: '' },
  });
  assert.equal(record.studentName, 'Jekaterina Lesnikova');
  assert.equal(record.payerName, 'Jekaterina Lesnikova');
  assert.equal(record.payerEmail, 'lesnikovajekaterina@gmail.com');
  assert.equal(record.payerEmailLower, 'lesnikovajekaterina@gmail.com');
  assert.equal(record.parentEmail, 'lesnikovajekaterina@gmail.com');
  assert.equal(record.parentEmailLower, 'lesnikovajekaterina@gmail.com');
  assert.equal(record.billingMode, 'manual_charge_v1');
});

test('createManualInvoice reads the linked parent account only when the card has no e-mail, and stores it', async () => {
  const api = rewire('./manual-invoice-api.js');
  const writes = [];
  const reads = [];
  const card = { name: 'Mia Kask', linkedParentId: 'parent-1', parentName: 'Isa Kask' };
  const db = {
    collection(name) {
      return { doc: (id) => ({ collection: name, id }), where: (field, operator, value) => ({ collection: name, field, operator, value, limit: () => ({ collection: name, field, operator, value }) }) };
    },
    async runTransaction(callback) {
      return callback({
        async get(target) {
          reads.push(`${target.collection}/${target.id || target.field}`);
          if (target.collection === 'students') return { exists: true, data: () => card };
          if (target.collection === 'users') return { exists: true, data: () => ({ email: 'isa@example.ee' }) };
          if (target.collection === 'meta') return { exists: true, data: () => ({ seq: 10 }) };
          if (target.collection === 'invoices' && target.field === 'num') return { empty: true };
          return { exists: false };
        },
        create: (target, value) => writes.push({ target, value }),
        set: (target, value) => writes.push({ target, value }),
      });
    },
  };
  const restore = api.__set__('db', db);
  try {
    const result = await api.createManualInvoice({ actor: { uid: 'admin', role: 'admin' }, values: { studentId: 's1', description: 'Kursused', amount: 270, due: '2026-11-10' }, requestId: 'manual_invoice-test-0001' });
    assert.equal(result.invoice.payerName, 'Isa Kask');
    assert.equal(result.invoice.payerEmail, 'isa@example.ee');
    assert.equal(result.invoice.parentEmailLower, 'isa@example.ee');
    assert.ok(reads.includes('users/parent-1'));
    assert.equal(writes.find((write) => write.target.collection === 'invoices').value.payerEmail, 'isa@example.ee');
    // a card with its own e-mail never reads the account
    reads.length = 0;
    card.parentEmail = 'ema@example.ee';
    const second = await api.createManualInvoice({ actor: { uid: 'admin', role: 'admin' }, values: { studentId: 's1', description: 'Kursused', amount: 270, due: '2026-11-10' }, requestId: 'manual_invoice-test-0002' });
    assert.equal(second.invoice.payerEmail, 'ema@example.ee');
    assert.ok(!reads.some((read) => read.startsWith('users/')));
  } finally { restore(); }
});

test('the PDF of an old invoice without a payer e-mail shows the address it was sent to', () => {
  const old = { studentName: 'Jekaterina', payerName: 'Jekaterina', payerEmail: '', parentEmail: '', emailRecipient: 'lesnikovajekaterina@gmail.com' };
  const parties = invoiceParties(old, { name: 'Jekaterina Lesnikova', parentEmail: 'changed@example.ee' });
  assert.equal(parties.payerName, 'Jekaterina');
  assert.equal(parties.payerEmail, 'lesnikovajekaterina@gmail.com');
  // a stored payer e-mail still wins
  assert.equal(invoiceParties({ ...old, payerEmail: 'pere@example.ee' }, {}).payerEmail, 'pere@example.ee');
});
