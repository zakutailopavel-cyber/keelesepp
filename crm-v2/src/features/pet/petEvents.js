/* global CustomEvent */
// The pet picker announces a new choice so the walking pet appears without a reload.
export const PET_EVENT = 'ks-pet-changed';
export function announcePet(pet) {
  window.dispatchEvent(new CustomEvent(PET_EVENT, { detail: pet }));
}
