import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { PET_KINDS, validPetName } from '../../features/pet/petModel.js';

// The student's own pet lives on their account document (users/{uid}.pet); the rule lets a user write only
// { kind, name, chosenAt } with a known kind and a short name. Growth is never stored: it is derived.
export const petsService = {
  async get(uid) {
    if (!uid) return null;
    const { db } = requireFirebaseClient();
    const snapshot = await getDoc(doc(db, 'users', uid));
    const pet = snapshot.exists() ? snapshot.data().pet : null;
    return pet && PET_KINDS.includes(pet.kind) ? pet : null;
  },
  async save({ uid, kind, name }) {
    if (!uid) throw new Error('Konto puudub.');
    if (!PET_KINDS.includes(kind)) throw new Error('Vali sõber.');
    const error = validPetName(name);
    if (error) throw new Error(error);
    const { db } = requireFirebaseClient();
    const now = new Date().toISOString();
    const pet = { kind, name: String(name).trim(), chosenAt: now };
    await updateDoc(doc(db, 'users', uid), { pet, updatedAt: now });
    return pet;
  },
};
