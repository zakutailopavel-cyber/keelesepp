import { describe, expect, it } from 'vitest';
import { ownErrors } from './reviewModel.js';

describe('own corrected sentences', () => {
  it('reads them from the word cards; a card that says the same is left out', () => {
    expect(ownErrors([
      { word: 'Ma läksin panka', translation: 'Sinu lause: Mina läksin pank' },
      { word: 'raha', translation: 'деньги' },
      { word: 'Sama lause', translation: 'Sinu lause: sama lause' },
    ])).toEqual([{ said: 'Mina läksin pank', corrected: 'Ma läksin panka' }]);
  });
});
