// Outfits for the pet, bought with stars the student earns by learning (stars = derived from growth, see
// petProgress). Purely cosmetic: the drawings are our own constants (petArt.accessorySvg), no user input.
export const SLOTS = { bg: 'Taust', hat: 'Müts', glasses: 'Prillid', neck: 'Kaela ümber' };

export const PET_ITEMS = [
  { id: 'bg-sky', slot: 'bg', name: 'Taevas', price: 5 },
  { id: 'flower', slot: 'hat', name: 'Lill', price: 8 },
  { id: 'cap', slot: 'hat', name: 'Nokamüts', price: 10 },
  { id: 'bow', slot: 'neck', name: 'Kikilips', price: 10 },
  { id: 'round', slot: 'glasses', name: 'Prillid', price: 12 },
  { id: 'sun', slot: 'glasses', name: 'Päikeseprillid', price: 15 },
  { id: 'bg-forest', slot: 'bg', name: 'Mets', price: 15 },
  { id: 'medal', slot: 'neck', name: 'Medal', price: 25 },
  { id: 'wizard', slot: 'hat', name: 'Võlurimüts', price: 30 },
  { id: 'bg-space', slot: 'bg', name: 'Kosmos', price: 35 },
  { id: 'crown', slot: 'hat', name: 'Kroon', price: 40 },
];
const BY_ID = new Map(PET_ITEMS.map((item) => [item.id, item]));
export const petItem = (id) => BY_ID.get(id) || null;

// only known items, one per slot
export function cleanWearing(wearing = {}) {
  return Object.fromEntries(Object.entries(wearing || {})
    .filter(([slot, id]) => SLOTS[slot] && petItem(id)?.slot === slot));
}

export function availableStars(progress, pet = {}) {
  return Math.max(0, (progress?.stars || 0) - (Number.isInteger(pet?.spentStars) ? pet.spentStars : 0));
}

export function canBuy(itemId, progress, pet = {}) {
  const item = petItem(itemId);
  if (!item) return { ok: false, reason: 'Tundmatu ese.' };
  if ((pet.owned || []).includes(itemId)) return { ok: false, reason: 'See on juba sinu oma.' };
  const left = availableStars(progress, pet);
  if (left < item.price) return { ok: false, reason: `Vaja on veel ${item.price - left} tähte.` };
  return { ok: true, reason: '' };
}

// the new pet outfit state after buying (and putting on) an item
export function buyItem(itemId, progress, pet = {}) {
  const check = canBuy(itemId, progress, pet);
  if (!check.ok) throw new Error(check.reason);
  const item = petItem(itemId);
  return {
    owned: [...(pet.owned || []), itemId],
    wearing: cleanWearing({ ...(pet.wearing || {}), [item.slot]: itemId }),
    spentStars: (Number.isInteger(pet.spentStars) ? pet.spentStars : 0) + item.price,
  };
}

export function toggleWear(itemId, pet = {}) {
  const item = petItem(itemId);
  if (!item || !(pet.owned || []).includes(itemId)) return cleanWearing(pet.wearing);
  const wearing = { ...(pet.wearing || {}) };
  if (wearing[item.slot] === itemId) delete wearing[item.slot];
  else wearing[item.slot] = itemId;
  return cleanWearing(wearing);
}
