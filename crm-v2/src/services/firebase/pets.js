import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { PET_KINDS, validPetName } from '../../features/pet/petModel.js';
import { cleanWearing } from '../../features/pet/petItems.js';

// The student's own pet lives on their account document (users/{uid}.pet). The rule lets the user write only
// kind, name, chosenAt, tourDoneAt, hidden, optedOut, playedAt and the outfit (owned, wearing, spentStars). Growth is never
// stored: it is derived. `petProfiles/{uid}` is the public copy (kind, name, outfit) the teacher and parents see.
const FLAGS = ['tourDoneAt', 'hidden', 'optedOut', 'playedAt'];

export const petsService = {
  async get(uid) {
    if (!uid) return null;
    const { db } = requireFirebaseClient();
    const snapshot = await getDoc(doc(db, 'users', uid));
    const pet = snapshot.exists() ? snapshot.data().pet : null;
    if (!pet || typeof pet !== 'object') return null;
    return pet.kind && !PET_KINDS.includes(pet.kind) ? null : pet;
  },
  async save({ uid, kind, name, current = null }) {
    if (!uid) throw new Error('Konto puudub.');
    if (!PET_KINDS.includes(kind)) throw new Error('Vali sõber.');
    const error = validPetName(name);
    if (error) throw new Error(error);
    const { db } = requireFirebaseClient();
    const now = new Date().toISOString();
    const patch = { 'pet.kind': kind, 'pet.name': String(name).trim(), 'pet.chosenAt': now, 'pet.optedOut': false, updatedAt: now };
    await updateDoc(doc(db, 'users', uid), patch);
    return { ...(current || {}), kind, name: String(name).trim(), chosenAt: now, optedOut: false };
  },
  // outfit: owned items, worn items and stars spent (the rule only lets spentStars grow)
  async updateOutfit({ uid, current = null, owned, wearing, spentStars }) {
    if (!uid) throw new Error('Konto puudub.');
    const { db } = requireFirebaseClient();
    const clean = cleanWearing(wearing);
    const patch = { 'pet.wearing': clean, updatedAt: new Date().toISOString() };
    if (Array.isArray(owned)) patch['pet.owned'] = owned;
    if (Number.isInteger(spentStars)) patch['pet.spentStars'] = spentStars;
    await updateDoc(doc(db, 'users', uid), patch);
    return { ...(current || {}), ...(Array.isArray(owned) ? { owned } : {}), wearing: clean, ...(Number.isInteger(spentStars) ? { spentStars } : {}) };
  },
  // the public copy for the teacher and parents (written by the student, only for their own card)
  async publish({ uid, studentId, pet }) {
    if (!uid || !studentId || !pet?.kind || pet.optedOut) return;
    const { db } = requireFirebaseClient();
    await setDoc(doc(db, 'petProfiles', uid), {
      uid, studentId, kind: pet.kind, name: String(pet.name || '').trim().slice(0, 24),
      wearing: cleanWearing(pet.wearing), updatedAt: new Date().toISOString(),
    });
  },
  async listForStudents(studentIds = []) {
    const ids = studentIds.filter(Boolean).slice(0, 10);
    if (!ids.length) return [];
    const { db } = requireFirebaseClient();
    // one equality query per card: the rule checks the reader owns that card
    const snapshots = await Promise.all(ids.map((id) => getDocs(query(collection(db, 'petProfiles'), where('studentId', '==', id)))));
    return snapshots.flatMap((snapshot) => snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))).filter((pet) => PET_KINDS.includes(pet.kind));
  },
  // tourDoneAt (ISO string), hidden (bool), optedOut (bool), playedAt (ISO string, the last word game)
  // the simple numbers of the learner's recorded lessons and his own corrected sentences (written by the school Mac)
  async lessonStats(uid) {
    if (!uid) return [];
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'petLessonStats'), where('studentUid', '==', uid)));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 20);
  },
  async update({ uid, current = null, ...flags }) {
    if (!uid) throw new Error('Konto puudub.');
    const { db } = requireFirebaseClient();
    const patch = { updatedAt: new Date().toISOString() };
    FLAGS.filter((key) => key in flags).forEach((key) => { patch[`pet.${key}`] = flags[key]; });
    await updateDoc(doc(db, 'users', uid), patch);
    return { ...(current || {}), ...Object.fromEntries(FLAGS.filter((key) => key in flags).map((key) => [key, flags[key]])) };
  },
};
