import { similarStudents } from './similarStudents.js';

const cards = [
  { id: 'a', name: 'Milan Grozovski', active: true },
  { id: 'b', name: 'Mari Tamm', active: true },
  { id: 'c', name: 'Milan', active: false },
  { id: 'd', name: 'Grozovski Milan', active: true },
];

it('finds the same child by the same name or the name plus a surname (Oleksiy 2026-10-24)', () => {
  expect(similarStudents('Milan', cards).map((card) => card.id)).toEqual(['a']);
  expect(similarStudents('milan  grozovski', cards).map((card) => card.id)).toEqual(['a', 'd']);
  expect(similarStudents('Mari', cards).map((card) => card.id)).toEqual(['b']);
  expect(similarStudents('Maria', cards)).toEqual([]);
  expect(similarStudents('Milan Grozovski', cards, { excludeId: 'a' }).map((card) => card.id)).toEqual(['d']);
  expect(similarStudents('', cards)).toEqual([]);
});
