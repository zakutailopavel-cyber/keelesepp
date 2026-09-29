/* global CustomEvent */
// Small in-page signals between the pet and the rest of the cabinet.
export const PET_EVENT = 'ks-pet-changed';
export const PET_QUIET_EVENT = 'ks-pet-quiet';
export const PET_CELEBRATE_EVENT = 'ks-pet-celebrate';

const send = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));

// the pet picker announces a choice, a change or an opt-out so the walking pet follows without a reload
export function announcePet(pet) { send(PET_EVENT, pet); }
// a worksheet being filled in asks the pet to stay silent; call with false when done
export function petQuiet(on) { send(PET_QUIET_EVENT, Boolean(on)); }
// after a submitted worksheet the pet celebrates (shown once the student is back from the worksheet)
export function petCelebrate({ xp = 15, goals = 0 } = {}) { send(PET_CELEBRATE_EVENT, { xp, goals }); }
