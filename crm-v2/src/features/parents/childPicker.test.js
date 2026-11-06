import { describe, expect, it } from 'vitest';
import { childPickerGroups, isLinkableCard, matchesChildSearch } from './childPicker.js';

const cards = [
  { id: 'a', name: 'Mari Tamm', active: true, parentName: 'Ema Tamm' },
  { id: 'b', name: 'Liisa Vana', active: false, email: 'liisa@x.ee', phone: '+372 5123 4567', parentEmail: 'olga@x.ee' },
  { id: 'c', name: 'Prügi Kaart', active: false, deletedAt: '2026-11-05' },
  { id: 'd', name: 'Purged', active: false, purgedAt: '2026-11-01' },
  { id: 'e', name: 'Liidetud', active: false, mergedIntoStudentId: 'b' },
  { id: 'f', name: 'Vanem ise', active: true, convertedToParent: true },
];

describe('child picker (Oleksiy 2026-11-06)', () => {
  it('splits active and archived, never offers trashed / purged / merged / converted cards', () => {
    expect(childPickerGroups(cards)).toEqual({ active: [cards[0]], archived: [cards[1]] });
    expect(cards.filter(isLinkableCard).map((card) => card.id)).toEqual(['a', 'b']);
  });
  it('one search over name, e-mail, phone (digits too) and parent', () => {
    expect(childPickerGroups(cards, 'ema tamm').active).toEqual([cards[0]]);
    expect(childPickerGroups(cards, 'olga@').archived).toEqual([cards[1]]);
    expect(matchesChildSearch(cards[1], '51234567')).toBe(true);
    expect(matchesChildSearch(cards[1], 'LIISA@X')).toBe(true);
    expect(childPickerGroups(cards, 'prügi')).toEqual({ active: [], archived: [] });
  });
});
