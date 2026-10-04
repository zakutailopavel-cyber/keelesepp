'use strict';
// Registrations the automatic linking could not decide (possible duplicates) are listed for the administrator,
// who links the account to an existing card (/accounts/link) or creates a new card (/accounts/reviews/create-card).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const admin = require('firebase-admin');

const PROJECT = 'demo-keelesepp-finance';
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const functionsHost = process.env.FUNCTIONS_EMULATOR_HOST || '127.0.0.1:5001';

async function signUp(prefix) {
  const r = await fetch(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
  });
  const b = await r.json();
  return { token: b.idToken, uid: JSON.parse(Buffer.from(b.idToken.split('.')[1], 'base64url')).sub, email: b.email };
}
async function api(who, path, body = {}) {
  const r = await fetch(`http://${functionsHost}/${PROJECT}/us-central1/staffOperationsApi${path}`, {
    method: 'POST', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  return { status: r.status, body: await r.json().catch(() => ({})) };
}

test('pending link reviews: listed for admins only, a new card resolves the review', async () => {
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const db = admin.firestore();
  const owner = await signUp('review-admin');
  await db.doc(`users/${owner.uid}`).set({ role: 'admin', roles: ['admin'] });
  const teacher = await signUp('review-teacher');
  await db.doc(`users/${teacher.uid}`).set({ role: 'teacher' });
  const polina = await signUp('review-polina');
  await db.doc(`users/${polina.uid}`).set({ role: 'student', displayName: 'Polina Test', email: polina.email, approvalStatus: 'approved' });
  // the automatic linking stopped: a card with the same e-mail exists but the account e-mail is not verified
  await db.doc('students/existing-polina').set({ name: 'Polina Test', email: polina.email, active: true });
  const reviewId = `review-${polina.uid}`;
  await db.doc(`accountLinkReviews/${reviewId}`).set({
    uid: polina.uid, email: polina.email, displayName: 'Polina Test', relationship: 'student', childName: '',
    reason: 'email_not_verified', candidates: [{ id: 'existing-polina', name: 'Polina Test', email: polina.email, parentEmail: '' }],
    candidateStudentIds: ['existing-polina'], status: 'pending', firstDetectedAt: '2026-10-04T10:00:00Z', lastDetectedAt: '2026-10-04T10:00:00Z',
  });

  assert.equal((await api(teacher, '/accounts/reviews')).status, 403, 'teachers do not see account reviews');
  const listed = await api(owner, '/accounts/reviews');
  assert.equal(listed.status, 200);
  const review = listed.body.reviews.find((item) => item.id === reviewId);
  assert.ok(review, 'the pending review is listed');
  assert.equal(review.reasonText, 'Sama e-postiga kaart on olemas, kuid konto e-post ei ole kinnitatud');
  assert.equal(review.candidates[0].id, 'existing-polina');

  const created = await api(owner, '/accounts/reviews/create-card', { reviewId });
  assert.equal(created.status, 201, JSON.stringify(created.body));
  assert.equal(created.body.studentId, `self_${polina.uid}`);
  const card = (await db.doc(`students/self_${polina.uid}`).get()).data();
  assert.equal(card.linkedUserId, polina.uid);
  assert.equal(card.name, 'Polina Test');
  assert.equal(card.accountLinkSource, 'admin_review_new_card');
  assert.equal((await db.doc(`accountLinkReviews/${reviewId}`).get()).data().status, 'resolved');
  assert.ok((await db.doc(`users/${polina.uid}`).get()).data().linkedStudentIds.includes(`self_${polina.uid}`));
  assert.equal((await api(owner, '/accounts/reviews/create-card', { reviewId })).status, 409, 'decided only once');
  assert.ok(!(await api(owner, '/accounts/reviews')).body.reviews.some((item) => item.id === reviewId));

  const otherId = `review-dismiss-${polina.uid}`;
  await db.doc(`accountLinkReviews/${otherId}`).set({ uid: polina.uid, relationship: 'student', reason: 'email_multiple_students', status: 'pending', candidates: [] });
  assert.equal((await api(owner, '/accounts/reviews/dismiss', { reviewId: otherId })).status, 200);
  assert.equal((await db.doc(`accountLinkReviews/${otherId}`).get()).data().status, 'dismissed');
});
