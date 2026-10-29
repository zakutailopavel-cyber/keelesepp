import { collection, deleteField, doc, getDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { cleanPerWeek } from '../../features/availability-poll/pollModel.js';

// „Sobivad ajad” on the student's card (owner 2026-10-21): the student or the parent marks in their own CRM page every
// hour that really suits a lesson; the administrator sees it on the card and gets a notification when it changes.
// One document per card: studentAvailability/{studentId}. Half-hour slots „Mon-16:00” as on the public /ajad page.
// `weeks` (owner 2026-10-29): a dated week that differs from the usual one, { 'YYYY-MM-DD' Monday: { slots, preferred } }
// (availability-poll/pollModel.js timesForWeek); at most MAX_WEEKS, past weeks are dropped when saving.
// `perWeek` (team 2026-10-29): lessons a week the learner wants, one number 1–7 per course, { 'eesti-keel': 2 }
// (pollModel.js perWeekKey); kept as it is when a save does not pass it.
export const MAX_WEEKS = 8;
const listOf = (value) => (Array.isArray(value) ? value.filter((slot) => typeof slot === 'string').slice(0, 336) : []);
function weeksOf(value) {
  if (!value || typeof value !== 'object') return {};
  return Object.fromEntries(Object.entries(value).filter(([monday, week]) => /^\d{4}-\d{2}-\d{2}$/.test(monday) && week && typeof week === 'object')
    .sort(([a], [b]) => a.localeCompare(b)).map(([monday, week]) => [monday, { slots: listOf(week.slots), preferred: listOf(week.preferred) }]));
}
const todayIso = () => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; };
const thisMonday = () => { const day = new Date(`${todayIso()}T12:00:00`); day.setDate(day.getDate() - ((day.getDay() + 6) % 7)); return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`; };
const clean = (value, max = 160) => String(value ?? '').trim().slice(0, max);
const dateOf = (value) => (typeof value?.toDate === 'function' ? value.toDate().toISOString() : clean(value, 40));

export function normalizeAvailability(id, data = {}) {
  return {
    id,
    studentId: clean(data.studentId || id),
    slots: Array.isArray(data.slots) ? data.slots : [],
    preferred: Array.isArray(data.preferred) ? data.preferred : [],
    weeks: weeksOf(data.weeks),
    perWeek: cleanPerWeek(data.perWeek),
    message: clean(data.message, 1000),
    changedAt: clean(data.changedAt, 40),
    changedByName: clean(data.changedByName),
    changedByRole: clean(data.changedByRole, 20),
    previousSlots: Array.isArray(data.previousSlots) ? data.previousSlots : [],
    previousPreferred: Array.isArray(data.previousPreferred) ? data.previousPreferred : [],
    reviewedAt: clean(data.reviewedAt, 40),
    reviewedByName: clean(data.reviewedByName),
    updatedAt: dateOf(data.updatedAt),
  };
}

// changed by the student / parent after the administrator last looked
export const needsReview = (item) => Boolean(item?.changedAt && item.changedByRole !== 'admin' && (!item.reviewedAt || item.reviewedAt < item.changedAt));

const roleOf = (user = {}) => (user.roles?.includes('admin') ? 'admin' : user.roles?.includes('parent') ? 'parent' : user.roles?.includes('student') ? 'student' : (user.roles?.[0] || ''));

export const studentAvailabilityService = {
  async get(studentId) {
    if (!studentId) return null;
    const { db } = requireFirebaseClient();
    const snap = await getDoc(doc(db, 'studentAvailability', studentId));
    return snap.exists() ? normalizeAvailability(snap.id, snap.data()) : null;
  },
  // the administrator: all cards; others pass their students' ids (the rules allow only those)
  async list(studentIds = null) {
    const { db } = requireFirebaseClient();
    if (studentIds) {
      const snaps = await Promise.all(studentIds.map((id) => getDoc(doc(db, 'studentAvailability', id)).catch(() => null)));
      return snaps.filter((snap) => snap?.exists()).map((snap) => normalizeAvailability(snap.id, snap.data()));
    }
    const snapshot = await getDocs(collection(db, 'studentAvailability'));
    return snapshot.docs.map((item) => normalizeAvailability(item.id, item.data()));
  },
  // `week`: the Monday of a dated week — its own times (`reset`: back to the usual week); without it the usual week
  async save(studentId, { slots = [], preferred = [], message = '', week = '', reset = false, perWeek }, user, previous = null) {
    if (!studentId) throw new Error('Õpilase kaart puudub.');
    const { db } = requireFirebaseClient();
    const role = roleOf(user);
    const times = { slots: slots.slice(0, 336), preferred: preferred.filter((slot) => slots.includes(slot)).slice(0, 336) };
    const kept = Object.fromEntries(Object.entries(previous?.weeks || {}).filter(([monday]) => monday >= thisMonday()));
    if (week) {
      if (reset) delete kept[week]; else kept[week] = times;
      if (Object.keys(kept).length > MAX_WEEKS) throw new Error(`Eraldi nädalaid saab märkida kuni ${MAX_WEEKS}.`);
    }
    const usual = week ? { slots: previous?.slots || [], preferred: previous?.preferred || [] } : times;
    const value = {
      studentId,
      slots: usual.slots,
      preferred: usual.preferred,
      // the whole map is replaced (mergeFields below), so a dropped or past week disappears
      weeks: Object.keys(kept).length ? kept : deleteField(),
      // the whole map is replaced too; not passed → the stored numbers stay (the field is not listed in mergeFields)
      ...(perWeek === undefined ? {} : { perWeek: Object.keys(cleanPerWeek(perWeek)).length ? cleanPerWeek(perWeek) : deleteField() }),
      message: clean(message, 1000),
      changedAt: new Date().toISOString(),
      changedByUid: user.uid,
      changedByName: clean(user.displayName || user.email),
      changedByRole: role,
      previousSlots: (week ? previous?.weeks?.[week]?.slots || previous?.slots || [] : previous?.slots || []).slice(0, 336),
      previousPreferred: (week ? previous?.weeks?.[week]?.preferred || previous?.preferred || [] : previous?.preferred || []).slice(0, 336),
      updatedAt: serverTimestamp(),
      // the administrator's own change needs no review
      ...(role === 'admin' ? { reviewedAt: new Date().toISOString(), reviewedByName: clean(user.displayName || user.email) } : {}),
    };
    // mergeFields: the listed fields are replaced whole (merge: true would merge `weeks` key by key and keep a removed
    // week); fields not listed — reviewedAt of the administrator — stay
    await setDoc(doc(db, 'studentAvailability', studentId), value, { mergeFields: Object.keys(value) });
    return normalizeAvailability(studentId, { ...previous, ...value, weeks: kept, perWeek: perWeek === undefined ? previous?.perWeek : cleanPerWeek(perWeek), updatedAt: value.changedAt });
  },
  async markReviewed(studentId, user) {
    const { db } = requireFirebaseClient();
    const value = { reviewedAt: new Date().toISOString(), reviewedByName: clean(user.displayName || user.email), updatedAt: serverTimestamp() };
    await setDoc(doc(db, 'studentAvailability', studentId), value, { merge: true });
    return value;
  },
};
