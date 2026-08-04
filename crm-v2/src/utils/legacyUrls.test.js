import { legacyUrl } from './legacyUrls.js';

describe('legacyUrl', () => {
  it('keeps transitional tools on the configured legacy host', () => {
    expect(legacyUrl('/haldus-worksheet/', 'https://school.example/')).toBe('https://school.example/haldus-worksheet/');
  });
});
