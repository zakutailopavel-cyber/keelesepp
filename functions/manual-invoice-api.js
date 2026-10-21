const functions = require('firebase-functions/v1');
const { isDisabledProfile } = require('./auth-core');
const { appToday } = require('./local-date-core');
const admin = require('firebase-admin');
const crypto = require('crypto');
const { manualInvoiceInput, manualInvoiceRecord } = require('./manual-invoice-core');
const { monthlyInvoiceInput, monthlyInvoiceLines, monthlyInvoiceId } = require('./monthly-invoice-core');
const { invoiceCancellationError, wasSent } = require('./invoice-cancellation-core');
const { subjectName } = require('./student-enrollments-core');
const { sameCardsInput, monthlyItemsInput, planForSubject, combinedMonthlyRecord, combinedManualRecord, billsCardForMonth } = require('./combined-invoice-core');
const { tokenInvoiceInput, tokenInvoiceLines } = require('./lesson-tokens-core');

const db = admin.firestore();
const ALLOWED_ROLES = new Set(['admin', 'finance']);
// the owner's account is admin by e-mail everywhere else (firestore.rules superAdmin(), functions/index.js)
const SUPER_ADMIN_EMAILS = new Set(
  (process.env.SUPER_ADMIN_EMAILS || 'zakutailo.pavel@gmail.com')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean),
);
const DEFAULT_ALLOWED_ORIGINS = new Set([
  'https://keelesepp.vercel.app',
  'https://keelesepp-crm-v2.vercel.app',
  'https://crm.epkoolitus.ee',
  'https://epkoolitus.ee',
  'https://www.epkoolitus.ee',
  'http://localhost:3000',
  'http://localhost:5173',
]);

function applyCors(req, res) {
  const origin = req.get('Origin');
  // the same extra origins as functions/index.js (ALLOWED_ORIGINS; the emulator test server uses it)
  const extra = String(process.env.ALLOWED_ORIGINS || '').split(',').map((value) => value.trim()).filter(Boolean);
  if (origin && (DEFAULT_ALLOWED_ORIGINS.has(origin) || extra.includes(origin))) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Vary', 'Origin');
  }
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('X-Content-Type-Options', 'nosniff');
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function sendError(res, error) {
  const status = error.status || 500;
  if (status >= 500) console.error('Manual invoice error:', error);
  res.status(status).json({ error: status >= 500 ? 'Internal error' : error.message });
}

async function requireFinanceUser(req) {
  const header = req.get('Authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) throw httpError(401, 'Firebase ID token required');
  let decoded;
  try {
    decoded = await admin.auth().verifyIdToken(match[1], true);
  } catch {
    throw httpError(401, 'Invalid Firebase ID token');
  }
  const profileSnap = await db.collection('users').doc(decoded.uid).get();
  const profile = profileSnap.exists ? profileSnap.data() : {};
  if (isDisabledProfile(profile) || profile.status === 'disabled') throw httpError(403, 'Account disabled');
  const roles = new Set([
    ...(Array.isArray(profile.roles) ? profile.roles : []),
    profile.role,
    ...(Array.isArray(decoded.roles) ? decoded.roles : []),
    decoded.role,
  ].filter(Boolean).map(String));
  if (SUPER_ADMIN_EMAILS.has(String(decoded.email || '').toLowerCase())) roles.add('admin');
  if (![...roles].some((role) => ALLOWED_ROLES.has(role))) {
    throw httpError(403, 'Finance or administrator access required');
  }
  return {
    uid: decoded.uid,
    email: String(decoded.email || '').toLowerCase(),
    name: profile.displayName || decoded.name || decoded.email || '',
    role: [...roles].sort().join(','),
  };
}

function cleanRequestId(value) {
  const requestId = String(value || '').trim();
  if (!/^[A-Za-z0-9_-]{12,120}$/.test(requestId)) throw httpError(400, 'Valid requestId required');
  return requestId;
}

// active students (the CRM keeps `active: true`, not a status field) with a hint to tell namesakes apart
async function listInvoiceStudents() {
  const snap = await db.collection('students').where('active', '==', true).get();
  return snap.docs
    .filter((doc) => !doc.data()?.convertedToParent)
    .map((doc) => {
      const data = doc.data() || {};
      const hint = [data.parentName, data.parentEmail || data.email, data.subject].map((value) => String(value || '').trim()).filter(Boolean).join(' · ');
      return { id: doc.id, name: String(data.name || '').trim(), hint };
    })
    .filter((student) => student.name)
    .sort((left, right) => left.name.localeCompare(right.name, 'et'));
}

async function createManualInvoice({ actor, values, requestId }) {
  let input;
  try {
    input = manualInvoiceInput(values);
  } catch (error) {
    throw httpError(400, error.message);
  }
  const mutationId = cleanRequestId(requestId);
  const signature = crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
  const invoiceRef = db.collection('invoices').doc(mutationId);
  const auditRef = db.collection('financialAudit').doc(mutationId);
  const studentRef = db.collection('students').doc(input.studentId);
  const counterRef = db.collection('meta').doc('invoiceCounter');
  const nowIso = new Date().toISOString();
  const todayIso = appToday(nowIso);

  return db.runTransaction(async (transaction) => {
    const existing = await transaction.get(invoiceRef);
    if (existing.exists) {
      if (existing.data().creationSignature !== signature) {
        throw httpError(409, 'requestId already used for a different invoice');
      }
      return { invoice: { id: existing.id, ...existing.data() }, idempotent: true };
    }

    const [studentSnap, counterSnap, dateLockSnap] = await Promise.all([
      transaction.get(studentRef),
      transaction.get(counterRef),
      transaction.get(db.collection('financialLockedDates').doc(todayIso)),
    ]);
    if (!studentSnap.exists) throw httpError(404, 'Student not found');
    if (dateLockSnap.exists) throw httpError(409, `Financial period ${todayIso.slice(0, 7)} is closed`);

    let nextSequence = (Number(counterSnap.data()?.seq) || 0) + 1;
    let invoiceNum = '';
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const candidate = `KS-${todayIso.slice(0, 4)}-${String(nextSequence).padStart(3, '0')}`;
      const collision = await transaction.get(db.collection('invoices').where('num', '==', candidate).limit(1));
      if (collision.empty) {
        invoiceNum = candidate;
        break;
      }
      nextSequence += 1;
    }
    if (!invoiceNum) throw httpError(409, 'Invoice counter requires numbering repair');

    const invoice = manualInvoiceRecord({
      input,
      student: studentSnap.data(),
      invoiceNum,
      nowIso,
      actor,
      requestId: mutationId,
      signature,
    });
    transaction.create(invoiceRef, invoice);
    transaction.set(counterRef, { seq: nextSequence, updatedAt: nowIso }, { merge: true });
    transaction.create(auditRef, {
      entityType: 'invoice',
      entityId: mutationId,
      action: 'invoice.created_manual',
      invoiceId: mutationId,
      invoiceNum,
      studentId: input.studentId,
      studentName: invoice.studentName,
      amountCents: input.amountCents,
      amount: input.amount,
      actor,
      reason: input.note || input.description,
      createdAt: nowIso,
      requestId: mutationId,
    });
    return { invoice: { id: mutationId, ...invoice }, idempotent: false };
  });
}

// Finance v2 §2: the month's invoice for one student (planned lessons + last month's difference).
// Only one active invoice per student and month; cancelled revisions keep their audit trail.
async function createMonthlyInvoice({ actor, values }) {
  let input;
  try {
    input = monthlyInvoiceInput(values);
  } catch (error) {
    throw httpError(400, error.message);
  }
  const baseInvoiceId = monthlyInvoiceId(input.studentId, input.month);
  const counterRef = db.collection('meta').doc('invoiceCounter');
  const nowIso = new Date().toISOString();
  const todayIso = appToday(nowIso);
  return db.runTransaction(async (transaction) => {
    const [studentSnap, planSnap, counterSnap, dateLockSnap, studentInvoicesSnap] = await Promise.all([
      transaction.get(db.collection('students').doc(input.studentId)),
      transaction.get(db.collection('studentRevenuePlans').doc(input.studentId)),
      transaction.get(counterRef),
      transaction.get(db.collection('financialLockedDates').doc(todayIso)),
      transaction.get(db.collection('invoices').where('studentId', '==', input.studentId)),
    ]);
    // a combined invoice (several cards of one payer) may already bill this card for the month
    const combinedSnap = await transaction.get(db.collection('invoices').where('studentIds', 'array-contains', input.studentId));
    const inCombined = combinedSnap.docs.find(doc => doc.data().combined && billsCardForMonth(doc.data(), input.studentId, input.month));
    if (inCombined) return { invoice: { id: inCombined.id, ...inCombined.data() }, idempotent: true };
    const monthInvoices = studentInvoicesSnap.docs.filter(doc => doc.data().planMonth === input.month);
    const activeInvoice = monthInvoices.find(doc => doc.data().status !== 'Tühistatud');
    if (activeInvoice) return { invoice: { id: activeInvoice.id, ...activeInvoice.data() }, idempotent: true };
    const revision = monthInvoices.length + 1;
    const invoiceId = revision === 1 ? baseInvoiceId : `${baseInvoiceId}-r${revision}`;
    const invoiceRef = db.collection('invoices').doc(invoiceId);
    const existing = await transaction.get(invoiceRef);
    if (existing.exists) throw httpError(409, 'Monthly invoice revision already exists');
    if (!studentSnap.exists) throw httpError(404, 'Student not found');
    if (dateLockSnap.exists) throw httpError(409, `Financial period ${todayIso.slice(0, 7)} is closed`);
    let priced;
    try {
      // one subject of a card with several (owner 2026-10-20): that subject's price, its name on the invoice
      const subject = subjectName(values.subject);
      const title = subject && !/keel/i.test(subject) ? 'Tunnid' : '';
      priced = monthlyInvoiceLines({ ...input, title }, planForSubject(planSnap.exists ? planSnap.data() : {}, subject));
      if (subject) priced = { ...priced, subject, lines: priced.lines.map((line) => ({ ...line, description: `${subject}: ${line.description}`, subject })) };
    } catch (error) {
      throw httpError(400, error.message);
    }
    let nextSequence = (Number(counterSnap.data()?.seq) || 0) + 1;
    let invoiceNum = '';
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const candidate = `KS-${todayIso.slice(0, 4)}-${String(nextSequence).padStart(3, '0')}`;
      const collision = await transaction.get(db.collection('invoices').where('num', '==', candidate).limit(1));
      if (collision.empty) {
        invoiceNum = candidate;
        break;
      }
      nextSequence += 1;
    }
    if (!invoiceNum) throw httpError(409, 'Invoice counter requires numbering repair');
    const signature = crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
    const base = manualInvoiceRecord({
      input: { studentId: input.studentId, description: priced.description, amountCents: priced.amountCents, amount: priced.amountCents / 100, due: input.due, note: input.correctionNote },
      student: studentSnap.data(),
      invoiceNum,
      nowIso,
      actor,
      requestId: invoiceId,
      signature,
    });
    const invoice = {
      ...base,
      paymentDueRule: 'monthly',
      lines: priced.lines,
      lessonCount: input.plannedUnits,
      lessonPriceCents: priced.priceCents,
      lessonPrice: priced.priceCents / 100,
      lessonMinutes: priced.minutes,
      billingMode: 'monthly_plan_v1',
      pricingMode: 'plan',
      planMonth: input.month,
      monthRevision: revision,
      plannedUnits: input.plannedUnits,
      correctionUnits: input.correctionUnits,
      ...(priced.subject ? { subject: priced.subject } : {}),
    };
    transaction.create(invoiceRef, invoice);
    transaction.set(counterRef, { seq: nextSequence, updatedAt: nowIso }, { merge: true });
    transaction.create(db.collection('financialAudit').doc(invoiceId), {
      entityType: 'invoice',
      entityId: invoiceId,
      action: 'invoice.created_monthly',
      invoiceId,
      invoiceNum,
      studentId: input.studentId,
      studentName: invoice.studentName,
      amountCents: priced.amountCents,
      amount: priced.amountCents / 100,
      actor,
      reason: `${input.month}: ${input.plannedUnits} planeeritud, parandus ${input.correctionUnits}`,
      createdAt: nowIso,
      requestId: invoiceId,
    });
    return { invoice: { id: invoiceId, ...invoice }, idempotent: false };
  });
}

// the next free KS number inside the transaction (the same way as the one-card invoices)
async function nextInvoiceNumber(transaction, counterSnap, todayIso) {
  let nextSequence = (Number(counterSnap.data()?.seq) || 0) + 1;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const candidate = `KS-${todayIso.slice(0, 4)}-${String(nextSequence).padStart(3, '0')}`;
    const collision = await transaction.get(db.collection('invoices').where('num', '==', candidate).limit(1));
    if (collision.empty) return { invoiceNum: candidate, nextSequence };
    nextSequence += 1;
  }
  throw httpError(409, 'Invoice counter requires numbering repair');
}

// One invoice for the month's lessons of several cards of one payer (functions/combined-invoice-core.js): the price
// of every card comes from its private plan; a card already billed for the month (alone or combined) stops it.
async function createCombinedMonthlyInvoice({ actor, values }) {
  let ids;
  let items;
  let inputs;
  try {
    // one line per card and subject: a child's Estonian and maths come as two items of one card
    items = monthlyItemsInput(values.items);
    ids = [...new Set(items.map((item) => item.studentId))];
    inputs = values.items.map((item) => monthlyInvoiceInput({ ...item, month: values.month, due: values.due }));
  } catch (error) {
    throw httpError(error.status || 400, error.message);
  }
  const month = inputs[0].month;
  const due = inputs[0].due;
  // the same cards without subjects keep their old key (an invoice made before subjects is still found again)
  const keyParts = items.some((item) => item.subject) ? items.map((item) => `${item.studentId}#${item.subject}`) : ids;
  const key = crypto.createHash('sha256').update(`${month}|${[...keyParts].sort().join('|')}`).digest('hex').slice(0, 20);
  const counterRef = db.collection('meta').doc('invoiceCounter');
  const nowIso = new Date().toISOString();
  const todayIso = appToday(nowIso);
  return db.runTransaction(async (transaction) => {
    const cardSnaps = await Promise.all(ids.map((id) => transaction.get(db.collection('students').doc(id))));
    const planSnaps = await Promise.all(ids.map((id) => transaction.get(db.collection('studentRevenuePlans').doc(id))));
    const [counterSnap, dateLockSnap] = await Promise.all([transaction.get(counterRef), transaction.get(db.collection('financialLockedDates').doc(todayIso))]);
    const own = await transaction.get(db.collection('invoices').where('studentId', 'in', ids));
    const combinedOnes = await transaction.get(db.collection('invoices').where('studentIds', 'array-contains-any', ids));
    const missing = cardSnaps.find((snap) => !snap.exists);
    if (missing) throw httpError(404, 'Student not found');
    if (dateLockSnap.exists) throw httpError(409, `Financial period ${todayIso.slice(0, 7)} is closed`);
    const existing = [...own.docs, ...combinedOnes.docs];
    const sameCombined = existing.find((doc) => doc.id.startsWith(`monthly_combined_${month}_${key}`) && doc.data().status !== 'Tühistatud');
    if (sameCombined) return { invoice: { id: sameCombined.id, ...sameCombined.data() }, idempotent: true };
    for (const id of ids) {
      const billed = existing.find((doc) => billsCardForMonth(doc.data(), id, month));
      if (billed) {
        const name = cardSnaps.find((snap) => snap.id === id).data().name || id;
        throw httpError(409, `${name}: selle kuu arve on juba olemas (${billed.data().num || billed.id}).`);
      }
    }
    const revision = existing.filter((doc) => doc.id.startsWith(`monthly_combined_${month}_${key}`)).length + 1;
    const invoiceId = revision === 1 ? `monthly_combined_${month}_${key}` : `monthly_combined_${month}_${key}-r${revision}`;
    const { invoiceNum, nextSequence } = await nextInvoiceNumber(transaction, counterSnap, todayIso);
    const signature = crypto.createHash('sha256').update(JSON.stringify(inputs)).digest('hex');
    let invoice;
    try {
      invoice = combinedMonthlyRecord({
        month, due, invoiceNum, nowIso, actor, requestId: invoiceId, signature,
        parts: inputs.map((input, index) => {
          const at = ids.indexOf(items[index].studentId);
          return { card: { id: ids[at], ...cardSnaps[at].data() }, plan: planSnaps[at].exists ? planSnaps[at].data() : {}, subject: items[index].subject, plannedUnits: input.plannedUnits, correctionUnits: input.correctionUnits, correctionNote: input.correctionNote };
        }),
      });
    } catch (error) {
      throw httpError(error.status || 400, error.message);
    }
    invoice.monthRevision = revision;
    transaction.create(db.collection('invoices').doc(invoiceId), invoice);
    transaction.set(counterRef, { seq: nextSequence, updatedAt: nowIso }, { merge: true });
    transaction.create(db.collection('financialAudit').doc(invoiceId), {
      entityType: 'invoice', entityId: invoiceId, action: 'invoice.created_monthly_combined', invoiceId, invoiceNum,
      studentId: ids[0], studentIds: ids, studentName: invoice.studentName, amountCents: invoice.amountCents, amount: invoice.amount,
      actor, reason: `${month}: ${invoice.cardParts.map((part) => `${part.studentName} ${part.subject} ${part.plannedUnits}+${part.correctionUnits}`).join('; ')}`,
      createdAt: nowIso, requestId: invoiceId,
    });
    return { invoice: { id: invoiceId, ...invoice }, idempotent: false };
  });
}

// One manual charge for several cards of one payer (e.g. course materials for two subjects)
async function createCombinedManualInvoice({ actor, values, requestId }) {
  let ids;
  let base;
  let amounts;
  try {
    ids = sameCardsInput(values.items);
    base = manualInvoiceInput({ studentId: ids[0], description: values.description, amount: values.items[0]?.amount, due: values.due, note: values.note });
    amounts = values.items.map((item) => manualInvoiceInput({ studentId: item.studentId, description: values.description, amount: item.amount, due: values.due }).amountCents);
  } catch (error) {
    throw httpError(error.status || 400, error.message);
  }
  const mutationId = cleanRequestId(requestId);
  const signature = crypto.createHash('sha256').update(JSON.stringify({ ids, amounts, description: base.description, due: base.due, note: base.note })).digest('hex');
  const invoiceRef = db.collection('invoices').doc(mutationId);
  const counterRef = db.collection('meta').doc('invoiceCounter');
  const nowIso = new Date().toISOString();
  const todayIso = appToday(nowIso);
  return db.runTransaction(async (transaction) => {
    const existing = await transaction.get(invoiceRef);
    if (existing.exists) {
      if (existing.data().creationSignature !== signature) throw httpError(409, 'requestId already used for a different invoice');
      return { invoice: { id: existing.id, ...existing.data() }, idempotent: true };
    }
    const cardSnaps = await Promise.all(ids.map((id) => transaction.get(db.collection('students').doc(id))));
    const [counterSnap, dateLockSnap] = await Promise.all([transaction.get(counterRef), transaction.get(db.collection('financialLockedDates').doc(todayIso))]);
    if (cardSnaps.some((snap) => !snap.exists)) throw httpError(404, 'Student not found');
    if (dateLockSnap.exists) throw httpError(409, `Financial period ${todayIso.slice(0, 7)} is closed`);
    const { invoiceNum, nextSequence } = await nextInvoiceNumber(transaction, counterSnap, todayIso);
    let invoice;
    try {
      invoice = combinedManualRecord({
        description: base.description, due: base.due, note: base.note, invoiceNum, nowIso, actor, requestId: mutationId, signature,
        parts: ids.map((id, index) => ({ card: { id, ...cardSnaps[index].data() }, amountCents: amounts[index] })),
      });
    } catch (error) {
      throw httpError(error.status || 400, error.message);
    }
    transaction.create(invoiceRef, invoice);
    transaction.set(counterRef, { seq: nextSequence, updatedAt: nowIso }, { merge: true });
    transaction.create(db.collection('financialAudit').doc(mutationId), {
      entityType: 'invoice', entityId: mutationId, action: 'invoice.created_manual_combined', invoiceId: mutationId, invoiceNum,
      studentId: ids[0], studentIds: ids, studentName: invoice.studentName, amountCents: invoice.amountCents, amount: invoice.amount,
      actor, reason: base.note || base.description, createdAt: nowIso, requestId: mutationId,
    });
    return { invoice: { id: mutationId, ...invoice }, idempotent: false };
  });
}

// Lesson tokens (functions/lesson-tokens-core.js): an invoice for N lessons at the card's plan price. The credits
// reach the card only after payment, when the administrator confirms (financeApi /invoices/tokens/credit).
async function createTokenInvoice({ actor, values, requestId }) {
  let input;
  try { input = tokenInvoiceInput(values); } catch (error) { throw httpError(error.status || 400, error.message); }
  const mutationId = cleanRequestId(requestId);
  const signature = crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
  const invoiceRef = db.collection('invoices').doc(mutationId);
  const counterRef = db.collection('meta').doc('invoiceCounter');
  const nowIso = new Date().toISOString();
  const todayIso = appToday(nowIso);
  return db.runTransaction(async (transaction) => {
    const existing = await transaction.get(invoiceRef);
    if (existing.exists) {
      if (existing.data().creationSignature !== signature) throw httpError(409, 'requestId already used for a different invoice');
      return { invoice: { id: existing.id, ...existing.data() }, idempotent: true };
    }
    const [studentSnap, planSnap, counterSnap, dateLockSnap] = await Promise.all([
      transaction.get(db.collection('students').doc(input.studentId)),
      transaction.get(db.collection('studentRevenuePlans').doc(input.studentId)),
      transaction.get(counterRef),
      transaction.get(db.collection('financialLockedDates').doc(todayIso)),
    ]);
    if (!studentSnap.exists) throw httpError(404, 'Student not found');
    if (dateLockSnap.exists) throw httpError(409, `Financial period ${todayIso.slice(0, 7)} is closed`);
    const student = studentSnap.data();
    let priced;
    try { priced = tokenInvoiceLines({ lessons: input.lessons, plan: planSnap.exists ? planSnap.data() : {}, subject: String(student.subject || '').trim() }); } catch (error) { throw httpError(error.status || 400, error.message); }
    const { invoiceNum, nextSequence } = await nextInvoiceNumber(transaction, counterSnap, todayIso);
    const base = manualInvoiceRecord({
      input: { studentId: input.studentId, description: priced.description, amountCents: priced.amountCents, amount: priced.amountCents / 100, due: input.due, note: input.note },
      student, invoiceNum, nowIso, actor, requestId: mutationId, signature,
    });
    const invoice = {
      ...base,
      lines: priced.lines,
      billingMode: 'lesson_tokens_v1',
      pricingMode: 'plan',
      lessonCount: input.lessons,
      lessonPriceCents: priced.priceCents,
      lessonPrice: priced.priceCents / 100,
      lessonMinutes: priced.minutes,
      tokenCredits: input.lessons,
      tokenStatus: 'pending',
    };
    transaction.create(invoiceRef, invoice);
    transaction.set(counterRef, { seq: nextSequence, updatedAt: nowIso }, { merge: true });
    transaction.create(db.collection('financialAudit').doc(mutationId), {
      entityType: 'invoice', entityId: mutationId, action: 'invoice.created_lesson_tokens', invoiceId: mutationId, invoiceNum,
      studentId: input.studentId, studentName: invoice.studentName, amountCents: priced.amountCents, amount: priced.amountCents / 100,
      tokenCredits: input.lessons, actor, reason: input.note || priced.description, createdAt: nowIso, requestId: mutationId,
    });
    return { invoice: { id: mutationId, ...invoice }, idempotent: false };
  });
}

async function cancelInvoice({ actor, invoiceId, reason, requestId, afterSending = false }) {
  const mutationId = cleanRequestId(requestId);
  const cleanInvoiceId = String(invoiceId || '').trim();
  const cleanReason = String(reason || '').trim().slice(0, 500);
  if (!cleanInvoiceId || cleanInvoiceId.length > 160) throw httpError(400, 'Invoice id required');
  if (cleanReason.length < 10) throw httpError(400, 'Cancellation reason must have at least 10 characters');
  if (!actor.role.split(',').includes('admin')) throw httpError(403, 'Administrator access required');
  const invoiceRef = db.collection('invoices').doc(cleanInvoiceId);
  const auditRef = db.collection('financialAudit').doc(mutationId);
  const nowIso = new Date().toISOString();
  return db.runTransaction(async transaction => {
    const existingAudit = await transaction.get(auditRef);
    if (existingAudit.exists) {
      if (existingAudit.data().action !== 'invoice.cancelled' || existingAudit.data().invoiceId !== cleanInvoiceId || existingAudit.data().reason !== cleanReason) throw httpError(409, 'requestId already used');
      return { invoiceId: cleanInvoiceId, idempotent: true };
    }
    const invoiceSnap = await transaction.get(invoiceRef);
    if (!invoiceSnap.exists) throw httpError(404, 'Invoice not found');
    const invoice = invoiceSnap.data();
    const [paymentsSnap, creditNotesSnap, issueLockSnap, todayLockSnap] = await Promise.all([
      transaction.get(db.collection('payments').where('invoiceId', '==', cleanInvoiceId)),
      transaction.get(db.collection('creditNotes').where('invoiceId', '==', cleanInvoiceId)),
      transaction.get(db.collection('financialLockedDates').doc(String(invoice.date || '').slice(0, 10))),
      transaction.get(db.collection('financialLockedDates').doc(appToday(nowIso))),
    ]);
    if (issueLockSnap.exists || todayLockSnap.exists) throw httpError(409, 'Financial period is closed');
    const reasonBlocked = invoiceCancellationError(invoice, paymentsSnap.docs.map(doc => doc.data()), creditNotesSnap.docs.map(doc => doc.data()), { afterSending: afterSending === true });
    if (reasonBlocked) throw httpError(409, reasonBlocked);
    transaction.set(invoiceRef, {
      status: 'Tühistatud', paymentStatus: 'voided', effectiveAmountCents: 0, effectiveAmount: 0,
      balanceDueCents: 0, balanceDue: 0, parentPaymentStatus: 'voided', cancelledAt: nowIso, cancelledBy: actor,
      cancellationReason: cleanReason, cancellationRequestId: mutationId,
      ...(wasSent(invoice) ? { cancelledAfterSending: true } : {}),
    }, { merge: true });
    transaction.create(auditRef, {
      entityType: 'invoice', entityId: cleanInvoiceId, invoiceId: cleanInvoiceId,
      invoiceNum: invoice.num || '', action: 'invoice.cancelled', actor,
      originalAmountCents: Number(invoice.amountCents || 0), reason: cleanReason,
      ...(wasSent(invoice) ? { wasSent: true, sentTo: invoice.emailRecipient || invoice.payerEmail || invoice.parentEmail || '' } : {}),
      createdAt: nowIso, requestId: mutationId,
    });
    return { invoiceId: cleanInvoiceId, idempotent: false };
  });
}

// 1 GB like financeApi / invoiceApi (index.js): the monthly invoice preview took up to 8 s on the default instance
const manualInvoiceApi = functions.runWith({ memory: "1GB" }).https.onRequest(async (req, res) => {
  applyCors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST required' });
    return;
  }
  try {
    const actor = await requireFinanceUser(req);
    if (req.path === '/students') {
      res.status(200).json({ students: await listInvoiceStudents() });
      return;
    }
    if (req.path === '/monthly-combined') {
      const result = await createCombinedMonthlyInvoice({ actor, values: req.body || {} });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === '/create-tokens') {
      const result = await createTokenInvoice({ actor, values: req.body || {}, requestId: req.body?.requestId });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === '/create-combined') {
      const result = await createCombinedManualInvoice({ actor, values: req.body || {}, requestId: req.body?.requestId });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === '/monthly') {
      const result = await createMonthlyInvoice({ actor, values: req.body || {} });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === '/cancel') {
      const result = await cancelInvoice({ actor, invoiceId: req.body?.invoiceId, reason: req.body?.reason, requestId: req.body?.requestId, afterSending: req.body?.afterSending === true });
      res.status(200).json(result);
      return;
    }
    if (req.path !== '/create') {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const result = await createManualInvoice({
      actor,
      values: req.body || {},
      requestId: req.body?.requestId,
    });
    res.status(result.idempotent ? 200 : 201).json(result);
  } catch (error) {
    sendError(res, error);
  }
});

module.exports = { manualInvoiceApi, createManualInvoice, createMonthlyInvoice, createTokenInvoice, cancelInvoice, listInvoiceStudents };
