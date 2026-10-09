import { GRAMMAR_LEVEL, grammarFor, loadGrammarProfile } from './grammarProfile.js';

describe('EKI grammar profile', () => {
  it('has topics for every level and splits targets from what is already known', async () => {
    const profile = await loadGrammarProfile();
    expect(Object.keys(profile)).toEqual(['A1', 'A2', 'B1', 'B2', 'C1']);
    expect(profile.A2.length).toBeGreaterThan(50);
    expect(profile.A2[0]).toEqual(expect.objectContaining({ topic: expect.any(String), can: expect.stringMatching(/^Oskab/), category: expect.any(String) }));
    const b1 = grammarFor(profile, 'B1-');
    expect(b1.level).toBe('B1');
    expect(b1.known.length).toBe(profile.A1.length + profile.A2.length);
    expect(GRAMMAR_LEVEL['A2+']).toBe('A2');
  });
});
