import { describe, expect, it } from 'vitest';
import { MODULES, digest } from './gradingPin.digest.js';
import { GOLDEN } from './gradingPin.golden.js';

describe('grading is pinned to main', () => {
  Object.entries(MODULES).forEach(([name, mod]) => {
    it(`${name}: marks, score and progress of every sheet`, () => {
      expect(digest(mod)).toEqual(GOLDEN[name]);
    });
  });
});
