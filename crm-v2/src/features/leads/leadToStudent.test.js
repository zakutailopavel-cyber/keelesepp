import { describe, expect, it } from 'vitest';
import { leadToStudent } from './leadToStudent.js';

describe('leadToStudent', () => {
  it("a parent's lead: the e-mail goes to the parent", () => {
    expect(leadToStudent({ name: 'Mia', parentName: 'Olga', email: 'olga@example.com', phone: '5551234', language: 'Eesti keel', level: 'A2 (tasemetest)' }))
      .toEqual({ name: 'Mia', phone: '5551234', parentName: 'Olga', parentEmail: 'olga@example.com', level: 'A2', subject: 'Eesti keel' });
  });
  it('an adult: own e-mail, unknown level and subject left out', () => {
    expect(leadToStudent({ name: 'Ivan', email: 'ivan@example.com', level: 'ei tea', language: 'estonian' })).toEqual({ name: 'Ivan', phone: '', email: 'ivan@example.com' });
  });
});
