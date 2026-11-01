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

// owner 2026-10-14 (Olena Polishchuk): a student who is also a parent — linking her as the parent of a child's card
// gives her both roles as signed claims, which the client and the server read (the profile keeps its one `role`)
test('a student linked as a parent keeps both roles as signed claims', async () => {
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const db = admin.firestore();
  const owner = await signUp('claims-admin');
  await db.doc(`users/${owner.uid}`).set({ role: 'admin', roles: ['admin'] });
  const olena = await signUp('claims-olena');
  await db.doc(`users/${olena.uid}`).set({ role: 'student', displayName: 'Olena Test', email: olena.email, approvalStatus: 'approved' });
  await db.doc('students/claims-lana').set({ name: 'Lana Test', grade: '1. klass', active: true });
  const linked = await api(owner, '/accounts/link', { uid: olena.uid, studentId: 'claims-lana', relationship: 'parent', requestId: `claims-${olena.uid}` });
  assert.ok(linked.status >= 200 && linked.status < 300, JSON.stringify(linked.body));
  const card = (await db.doc('students/claims-lana').get()).data();
  assert.equal(card.parentUid, olena.uid);
  assert.equal((await db.doc(`users/${olena.uid}`).get()).data().role, 'student', 'the protected one-role field stays');
  const claims = (await admin.auth().getUser(olena.uid)).customClaims || {};
  assert.deepEqual([...claims.roles].sort(), ['parent', 'student']);
});

// owner: the registering person chooses no teacher, the administrator assigns one on approval
test('approval: the teacher the administrator assigned goes on the new card; nobody else can be assigned', async () => {
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const db = admin.firestore();
  const owner = await signUp('approve-admin');
  await db.doc(`users/${owner.uid}`).set({ role: 'admin', roles: ['admin'] });
  const teacher = await signUp('approve-teacher');
  await db.doc(`users/${teacher.uid}`).set({ role: 'teacher', displayName: 'Jaan Kask' });
  const closed = await signUp('approve-closed');
  await db.doc(`users/${closed.uid}`).set({ role: 'teacher', displayName: 'Kinni Kask', disabled: true });
  const parent = await signUp('approve-parent');
  const childName = `Lena${parent.uid.slice(0, 6)}`;
  await db.doc(`users/${parent.uid}`).set({ role: 'parent', displayName: 'Mari Ema', email: parent.email, childName, preferredTeacher: 'Pavel', approvalStatus: 'pending' });

  const refused = await api(owner, '/accounts/approval', { uid: parent.uid, decision: 'approve', teacherUid: closed.uid });
  assert.equal(refused.status, 400, JSON.stringify(refused.body));
  assert.equal((await db.doc(`users/${parent.uid}`).get()).data().approvalStatus, 'pending', 'a refused teacher changes nothing');

  const approved = await api(owner, '/accounts/approval', { uid: parent.uid, decision: 'approve', teacherUid: teacher.uid });
  assert.equal(approved.status, 200, JSON.stringify(approved.body));
  assert.equal(approved.body.createdStudentIds.length, 1);
  const card = (await db.doc(`students/${approved.body.createdStudentIds[0]}`).get()).data();
  assert.equal(card.teacher, 'Jaan Kask');
  assert.equal(card.teacherUid, teacher.uid);
  assert.equal(card.parentUid, parent.uid);
  const profile = (await db.doc(`users/${parent.uid}`).get()).data();
  assert.equal(profile.assignedTeacherUid, teacher.uid);

  // without an assignment the card stays unassigned: the old default „Pavel” and the person's own wish are not used
  const other = await signUp('approve-other');
  const otherChild = `Kati${other.uid.slice(0, 6)}`;
  await db.doc(`users/${other.uid}`).set({ role: 'parent', displayName: 'Teine Ema', email: other.email, childName: otherChild, preferredTeacher: 'Pavel', approvalStatus: 'pending' });
  const plain = await api(owner, '/accounts/approval', { uid: other.uid, decision: 'approve' });
  assert.equal(plain.status, 200, JSON.stringify(plain.body));
  const plainCard = (await db.doc(`students/${plain.body.createdStudentIds[0]}`).get()).data();
  assert.equal(plainCard.teacher, '');
  assert.equal(plainCard.teacherUid, '');
});

test('a parent whose e-mail is on a card with another name: reviewed once, no duplicate after the decision', async () => {
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const db = admin.firestore();
  const owner = await signUp('dup-admin');
  await db.doc(`users/${owner.uid}`).set({ role: 'admin', roles: ['admin'] });
  const parent = await signUp('dup-parent');
  const cardId = `dup-card-${parent.uid}`;
  await db.doc(`students/${cardId}`).set({ name: 'Mark Ivanov', parentEmail: parent.email, active: true });
  await db.doc(`users/${parent.uid}`).set({ role: 'parent', displayName: 'Olga', email: parent.email, childName: 'Markus', approvalStatus: 'pending' });
  const ownCards = async () => (await db.collection('students').where('parentUid', '==', parent.uid).get()).docs.map((doc) => doc.id);

  const approved = await api(owner, '/accounts/approval', { uid: parent.uid, decision: 'approve' });
  assert.equal(approved.status, 200, JSON.stringify(approved.body));
  assert.deepEqual(approved.body.createdStudentIds, [], 'no card next to the one with the same e-mail');
  assert.equal(approved.body.reviewCount, 1);
  const listed = (await api(owner, '/accounts/reviews')).body.reviews.find((item) => item.uid === parent.uid);
  assert.equal(listed.reason, 'parent_email_other_child_name');
  assert.equal(listed.reasonText, 'Vanema e-postiga on teise nimega lapse kaart');

  const linked = await api(owner, '/accounts/link', { uid: parent.uid, studentId: cardId, relationship: 'parent', requestId: `dup-${parent.uid}` });
  assert.ok(linked.status >= 200 && linked.status < 300, JSON.stringify(linked.body));
  assert.equal((await db.doc(`accountLinkReviews/${listed.id}`).get()).data().status, 'resolved');

  // the next sign-in runs the linking again
  const again = await api(owner, '/accounts/bootstrap-admin', { uid: parent.uid });
  assert.equal(again.status < 300, true, JSON.stringify(again.body));
  assert.deepEqual(await ownCards(), [cardId], 'no duplicate card „Markus”');
  assert.equal((await db.doc(`accountLinkReviews/${listed.id}`).get()).data().status, 'resolved', 'the question is not asked again');
});
