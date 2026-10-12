import { describe, expect, it } from 'vitest';
import { copyWithMark, markLabel, watermarkStyle } from './contentMark.js';

describe('content mark', () => {
  it('marks a student\'s screen with his name and e-mail, never staff', () => {
    expect(markLabel({ displayName: 'Mari Õpilane', email: 'mari@example.com', role: 'student' })).toBe('Mari Õpilane · mari@example.com · © EP Koolitus');
    expect(markLabel({ displayName: 'Pavel', email: 'p@x.ee', role: 'teacher' })).toBe('');
    expect(markLabel({ displayName: 'Pavel', roles: ['admin'] })).toBe('');
    expect(markLabel(null)).toBe('');
  });
  it('a watermark tile and a line on copied text; no markup from the name gets in', () => {
    const style = watermarkStyle(markLabel({ displayName: 'Mari <b>', email: 'm@x.ee', role: 'student' }));
    expect(style.backgroundImage).toContain('data:image/svg+xml');
    expect(decodeURIComponent(style.backgroundImage)).not.toContain('<b>');
    expect(watermarkStyle('')).toBeUndefined();
    expect(copyWithMark('Tere', 'Mari · m@x.ee · © EP Koolitus')).toBe('Tere\n\n— © EP Koolitus · Mari · m@x.ee · ainult isiklikuks õppimiseks');
    expect(copyWithMark('Tere', '')).toBe('Tere');
  });
});
