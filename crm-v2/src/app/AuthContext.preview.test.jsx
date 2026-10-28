import { describe, expect, it } from 'vitest';
import { mayPreview } from './AuthContext.jsx';

describe('read-only view of a student (owner 2026-10-27)', () => {
  it('an admin opens any view, a teacher only a student card, others none', () => {
    expect(mayPreview(['admin'], { user: { uid: 'p1' } })).toBe(true);
    expect(mayPreview(['teacher'], { user: { uid: 's1' }, studentId: 's1' })).toBe(true);
    expect(mayPreview(['teacher'], { user: { uid: 'p1' } })).toBe(false);
    expect(mayPreview(['student'], { studentId: 's1' })).toBe(false);
    expect(mayPreview(undefined, { studentId: 's1' })).toBe(false);
  });
});
