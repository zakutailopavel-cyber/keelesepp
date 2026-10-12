import { existsSync, statSync } from 'node:fs';
import cast from './cast.js';

const publicDir = `${globalThis.process.cwd()}/public`;

describe('recurring textbook cast portraits', () => {
  it('registers the six fixed characters in art-bible order with present, compact images and alt text', () => {
    expect(cast.map(({ name }) => name)).toEqual(['Anna', 'Markus', 'Liis', 'Viktor', 'Sofia', 'Jaan']);
    expect(cast.map(({ age }) => age)).toEqual([28, 34, 45, 63, 19, 38]);

    for (const person of cast) {
      const file = `${publicDir}${person.src}`;
      expect(existsSync(file), file).toBe(true);
      expect(statSync(file).size, file).toBeLessThanOrEqual(60 * 1024);
      expect(person.alt, person.id).toBeTruthy();
    }
  });
});
