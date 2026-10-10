const functions = require('firebase-functions/v1');
const { appToday } = require('./local-date-core');
const admin = require('firebase-admin');
const crypto = require('crypto');
const { manualInvoiceInput, manualInvoiceRecord } = require('./manual-invoice-core');
const { monthlyInvoiceInput, monthlyInvoiceLines, monthlyInvoiceId } = require('./monthly-invoice-core');
const { invoiceCancellationError } = require('./invoice-cancellation-core');

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
  if (origin && DEFAULT_ALLOWED_ORIGINS.has(origin)) {
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
  if (profile.disabled === true || profile.status === 'disabled') throw httpError(403, 'Account disabled');
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
      priced = monthlyInvoiceLines(input, planSnap.exists ? planSnap.data() : {});
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

async function cancelInvoice({ actor, invoiceId, reason, requestId }) {
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
    const reasonBlocked = invoiceCancellationError(invoice, paymentsSnap.docs.map(doc => doc.data()), creditNotesSnap.docs.map(doc => doc.data()));
    if (reasonBlocked) throw httpError(409, reasonBlocked);
    transaction.set(invoiceRef, {
      status: 'Tühistatud', paymentStatus: 'voided', effectiveAmountCents: 0, effectiveAmount: 0,
      balanceDueCents: 0, balanceDue: 0, parentPaymentStatus: 'voided', cancelledAt: nowIso, cancelledBy: actor,
      cancellationReason: cleanReason, cancellationRequestId: mutationId,
    }, { merge: true });
    transaction.create(auditRef, {
      entityType: 'invoice', entityId: cleanInvoiceId, invoiceId: cleanInvoiceId,
      invoiceNum: invoice.num || '', action: 'invoice.cancelled', actor,
      originalAmountCents: Number(invoice.amountCents || 0), reason: cleanReason,
      createdAt: nowIso, requestId: mutationId,
    });
    return { invoiceId: cleanInvoiceId, idempotent: false };
  });
}

const manualInvoiceApi = functions.https.onRequest(async (req, res) => {
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
    if (req.path === '/monthly') {
      const result = await createMonthlyInvoice({ actor, values: req.body || {} });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === '/cancel') {
      const result = await cancelInvoice({ actor, invoiceId: req.body?.invoiceId, reason: req.body?.reason, requestId: req.body?.requestId });
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

module.exports = { manualInvoiceApi, createManualInvoice, createMonthlyInvoice, cancelInvoice, listInvoiceStudents };
