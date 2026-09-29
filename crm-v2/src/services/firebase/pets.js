import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { PET_KINDS, validPetName } from '../../features/pet/petModel.js';

// The student's own pet lives on their account document (users/{uid}.pet). The rule lets the user write only
// kind, name, chosenAt, tourDoneAt, hidden and optedOut. Growth is never stored: it is derived.
const FLAGS = ['tourDoneAt', 'hidden', 'optedOut'];

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
  // tourDoneAt (ISO string), hidden (bool), optedOut (bool)
  async update({ uid, current = null, ...flags }) {
    if (!uid) throw new Error('Konto puudub.');
    const { db } = requireFirebaseClient();
    const patch = { updatedAt: new Date().toISOString() };
    FLAGS.filter((key) => key in flags).forEach((key) => { patch[`pet.${key}`] = flags[key]; });
    await updateDoc(doc(db, 'users', uid), patch);
    return { ...(current || {}), ...Object.fromEntries(FLAGS.filter((key) => key in flags).map((key) => [key, flags[key]])) };
  },
};
