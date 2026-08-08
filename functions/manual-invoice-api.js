const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const crypto = require('crypto');
const { manualInvoiceInput, manualInvoiceRecord } = require('./manual-invoice-core');
const { buildAutomaticInvoicePreview } = require('./auto-invoice-preview');
const { createErpNextFinanceProvider } = require('./erpnext-finance-provider');
const {
  erpNextConfiguration,
  erpNextManualInvoiceView,
  financeProviderName,
  payerIdentity,
} = require('./finance-provider-router');

const db = admin.firestore();
const ALLOWED_ROLES = new Set(['admin', 'finance']);
const SUPER_ADMIN_EMAILS = new Set(['zakutailo.pavel@gmail.com']);
const DEFAULT_ALLOWED_ORIGINS = new Set([
  'https://keelesepp.vercel.app',
  'https://keelesepp-crm-v2.vercel.app',
  'https://keelesepp-5136b.web.app',
  'https://keelesepp-5136b.firebaseapp.com',
  'https://epkoolitus.ee',
  'https://www.epkoolitus.ee',
  'https://crm.epkoolitus.ee',
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
  res.status(status).json({ error: status >= 500 ? 'Sisemine viga' : error.message });
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
  if (profile.disabled === true || profile.status === 'disabled') throw httpError(403, 'Konto on keelatud');

  const email = String(decoded.email || '').trim().toLowerCase();
  const roles = new Set([
    profile.role,
    ...(Array.isArray(decoded.roles) ? decoded.roles : []),
    decoded.role,
  ].filter(Boolean).map((role) => String(role).trim().toLowerCase()));

  if (SUPER_ADMIN_EMAILS.has(email)) roles.add('admin');

  if (![...roles].some((role) => ALLOWED_ROLES.has(role))) {
    throw httpError(403, 'Sul puudub arvete loomise õigus');
  }
  return {
    uid: decoded.uid,
    email,
    name: profile.displayName || decoded.name || decoded.email || '',
    role: [...roles].sort().join(','),
  };
}

function cleanRequestId(value) {
  const requestId = String(value || '').trim();
  if (!/^[A-Za-z0-9_-]{12,120}$/.test(requestId)) throw httpError(400, 'Valid requestId required');
  return requestId;
}

async function listInvoiceStudents() {
  const [statusSnap, activeSnap] = await Promise.all([
    db.collection('students').where('status', '==', 'active').get(),
    db.collection('students').where('active', '==', true).get(),
  ]);
  const byId = new Map();
  [...statusSnap.docs, ...activeSnap.docs].forEach((doc) => {
    const data = doc.data() || {};
    const name = String(data.name || '').trim();
    if (!name) return;
    byId.set(doc.id, {
      id: doc.id,
      name,
      parentName: String(data.parentName || data.guardianName || '').trim(),
      payerName: String(data.payerName || data.companyName || data.parentName || data.guardianName || name).trim(),
    });
  });
  return [...byId.values()].sort((left, right) => left.name.localeCompare(right.name, 'et'));
}

function publicAutomaticInvoicePreview(data) {
  if (!data) return null;
  return {
    month: data.month || '',
    mode: data.mode || 'preview_only',
    totals: data.totals || { invoices: 0, lessons: 0, amountCents: 0, blocked: 0 },
    blocked: Array.isArray(data.blocked) ? data.blocked.map((item) => ({
      studentId: item.studentId || '',
      studentName: item.studentName || 'Õpilane',
      reason: item.reason || 'Kontroll vajalik',
    })) : [],
    generatedAt: data.generatedAt || '',
  };
}

async function getAutomaticInvoicePreview() {
  const snap = await db.collection('automationPreviews').doc('monthlyInvoices').get();
  return snap.exists ? publicAutomaticInvoicePreview(snap.data() || {}) : null;
}

async function refreshAutomaticInvoicePreview(actor) {
  const preview = await buildAutomaticInvoicePreview();
  const refreshed = {
    ...preview,
    refreshedManually: true,
    refreshedBy: actor,
  };
  await db.collection('automationPreviews').doc('monthlyInvoices').set(refreshed, { merge: false });
  return publicAutomaticInvoicePreview(refreshed);
}

async function createFirebaseManualInvoice({ actor, values, requestId }) {
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
  const todayIso = nowIso.slice(0, 10);

  return db.runTransaction(async (transaction) => {
    const existing = await transaction.get(invoiceRef);
    if (existing.exists) {
      if (existing.data().creationSignature !== signature) throw httpError(409, 'requestId already used for a different invoice');
      return { invoice: { id: existing.id, ...existing.data() }, idempotent: true, provider: 'firebase' };
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

    const invoice = manualInvoiceRecord({ input, student: studentSnap.data(), invoiceNum, nowIso, actor, requestId: mutationId, signature });
    transaction.create(invoiceRef, invoice);
    transaction.set(counterRef, { seq: nextSequence, updatedAt: nowIso }, { merge: true });
    transaction.create(auditRef, {
      entityType: 'invoice', entityId: mutationId, action: 'invoice.created_manual', invoiceId: mutationId, invoiceNum,
      studentId: input.studentId, studentName: invoice.studentName, amountCents: input.amountCents, amount: input.amount,
      actor, reason: input.note || input.description, createdAt: nowIso, requestId: mutationId, provider: 'firebase',
    });
    return { invoice: { id: mutationId, ...invoice }, idempotent: false, provider: 'firebase' };
  });
}

async function claimErpNextMutation({ mutationId, signature, input, actor, nowIso }) {
  const integrationRef = db.collection('financeIntegrations').doc(mutationId);
  const studentRef = db.collection('students').doc(input.studentId);
  const dateLockRef = db.collection('financialLockedDates').doc(nowIso.slice(0, 10));

  return db.runTransaction(async (transaction) => {
    const [existing, studentSnap, dateLockSnap] = await Promise.all([
      transaction.get(integrationRef),
      transaction.get(studentRef),
      transaction.get(dateLockRef),
    ]);
    if (!studentSnap.exists) throw httpError(404, 'Student not found');
    if (dateLockSnap.exists) throw httpError(409, `Financial period ${nowIso.slice(0, 7)} is closed`);

    if (existing.exists) {
      const data = existing.data() || {};
      if (data.creationSignature !== signature) throw httpError(409, 'requestId already used for a different invoice');
      if (data.status === 'completed' && data.invoice) {
        return { completed: true, invoice: data.invoice, student: studentSnap.data() };
      }
      if (data.status === 'pending') throw httpError(409, 'Invoice creation is already in progress');
    }

    transaction.set(integrationRef, {
      type: 'manual_invoice',
      provider: 'erpnext',
      status: 'pending',
      studentId: input.studentId,
      amountCents: input.amountCents,
      creationSignature: signature,
      requestId: mutationId,
      actor,
      startedAt: nowIso,
      updatedAt: nowIso,
    }, { merge: false });
    return { completed: false, student: studentSnap.data() };
  });
}

async function createErpNextManualInvoice({ actor, values, requestId, env = process.env, provider }) {
  let input;
  try {
    input = manualInvoiceInput(values);
  } catch (error) {
    throw httpError(400, error.message);
  }
  const config = erpNextConfiguration(env);
  if (!config.configured) throw httpError(503, `ERPNext finance is not configured: ${config.missing.join(', ')}`);

  const mutationId = cleanRequestId(requestId);
  const signature = crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
  const nowIso = new Date().toISOString();
  const claimed = await claimErpNextMutation({ mutationId, signature, input, actor, nowIso });
  if (claimed.completed) return { invoice: claimed.invoice, idempotent: true, provider: 'erpnext' };

  const integrationRef = db.collection('financeIntegrations').doc(mutationId);
  const auditRef = db.collection('financialAudit').doc(`erpnext_${mutationId}`);
  const erp = provider || createErpNextFinanceProvider({ env });
  const payer = payerIdentity(input.studentId, claimed.student);

  try {
    const draft = await erp.createInvoiceDraft({
      payer,
      studentId: input.studentId,
      month: nowIso.slice(0, 7),
      lessonIds: [],
      manualRequestId: mutationId,
      dueDate: input.due,
      postingDate: nowIso.slice(0, 10),
      lines: [{ description: input.description, amount: input.amount }],
      note: input.note,
    });
    const submitted = draft.invoice?.docstatus === 1
      ? { invoice: draft.invoice, idempotent: true }
      : await erp.submitInvoice(draft.invoice.id);
    const invoice = erpNextManualInvoiceView({
      invoice: submitted.invoice,
      input,
      studentId: input.studentId,
      student: claimed.student,
      payer,
      actor,
      billingKey: draft.billingKey,
      requestId: mutationId,
      nowIso,
    });

    await db.runTransaction(async (transaction) => {
      const current = await transaction.get(integrationRef);
      if (!current.exists || current.data()?.creationSignature !== signature) {
        throw httpError(409, 'ERPNext integration lock changed during invoice creation');
      }
      transaction.set(integrationRef, {
        ...current.data(),
        status: 'completed',
        invoice,
        erpNextInvoiceId: invoice.externalInvoiceId,
        billingKey: draft.billingKey,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: false });
      transaction.set(auditRef, {
        entityType: 'invoice', entityId: invoice.externalInvoiceId, action: 'invoice.created_manual',
        invoiceId: invoice.externalInvoiceId, invoiceNum: invoice.num, studentId: input.studentId,
        studentName: invoice.studentName, amountCents: input.amountCents, amount: input.amount,
        actor, reason: input.note || input.description, createdAt: nowIso, requestId: mutationId,
        provider: 'erpnext', billingKey: draft.billingKey,
      }, { merge: false });
    });

    return {
      invoice,
      idempotent: Boolean(draft.idempotent && submitted.idempotent),
      provider: 'erpnext',
    };
  } catch (error) {
    await integrationRef.set({
      status: 'failed',
      error: String(error?.message || error).slice(0, 500),
      updatedAt: new Date().toISOString(),
    }, { merge: true }).catch(() => {});
    throw error;
  }
}

async function createManualInvoice(args) {
  const provider = financeProviderName(args.env || process.env);
  if (provider === 'erpnext') return createErpNextManualInvoice(args);
  return createFirebaseManualInvoice(args);
}

async function financeProviderStatus(env = process.env) {
  const provider = financeProviderName(env);
  if (provider === 'firebase') return { provider, configured: true, connected: true };
  const config = erpNextConfiguration(env);
  if (!config.configured) return { provider, configured: false, connected: false, missing: config.missing };
  const status = await createErpNextFinanceProvider({ env }).status();
  return { ...status, configured: true };
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
    if (req.path === '/provider-status') {
      res.status(200).json({ status: await financeProviderStatus() });
      return;
    }
    if (req.path === '/automation-preview') {
      res.status(200).json({ preview: await getAutomaticInvoicePreview() });
      return;
    }
    if (req.path === '/automation-preview/refresh') {
      res.status(200).json({ preview: await refreshAutomaticInvoicePreview(actor) });
      return;
    }
    if (req.path !== '/create') {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const result = await createManualInvoice({ actor, values: req.body || {}, requestId: req.body?.requestId });
    res.status(result.idempotent ? 200 : 201).json(result);
  } catch (error) {
    sendError(res, error);
  }
});

module.exports = {
  manualInvoiceApi,
  createManualInvoice,
  createFirebaseManualInvoice,
  createErpNextManualInvoice,
  financeProviderStatus,
  listInvoiceStudents,
  getAutomaticInvoicePreview,
  refreshAutomaticInvoicePreview,
};
