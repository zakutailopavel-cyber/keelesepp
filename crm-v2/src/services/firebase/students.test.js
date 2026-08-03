import { normalizeStudent } from './students.js';

describe('students service mapping', () => {
  it('preserves legacy fields and normalizes missing values', () => {
    expect(normalizeStudent('s1', { name: '  Mari  ', active: false, skillMap: { reading: 75 } })).toMatchObject({ id: 's1', name: 'Mari', active: false, subject: 'Eesti keel', skillMap: { reading: 75 } });
  });

  it('treats legacy records without active as active', () => {
    expect(normalizeStudent('legacy', { name: 'Jaan' }).active).toBe(true);
  });
});
