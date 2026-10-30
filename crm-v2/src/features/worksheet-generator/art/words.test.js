import { existsSync, statSync } from 'node:fs';
import a2Words from './words/a2.js';

const publicDir = `${globalThis.process.cwd()}/public`;

describe('A2 word illustrations', () => {
  it('registers unique words with lesson coverage, alt text, and an image within the size budget', () => {
    expect(a2Words).toHaveLength(156);
    expect(new Set(a2Words.map((entry) => entry.id)).size).toBe(a2Words.length);

    for (const entry of a2Words) {
      const file = `${publicDir}${entry.src}`;
      expect(entry.id && entry.word && entry.alt && entry.lessonIds.length, entry.id).toBeTruthy();
      expect(existsSync(file), file).toBe(true);
      expect(statSync(file).size, file).toBeLessThanOrEqual(60 * 1024);
      expect(entry.src).toMatch(/^\/textbook-art\/words\/a2\/[a-z0-9-]+\.webp$/);
    }
  });
});
