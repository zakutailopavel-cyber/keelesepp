import { duplicateCandidates, duplicatePair, nameKey } from './duplicateCandidates.js';

describe('possible duplicate cards', () => {
  it('the same name across alphabets is a pair', () => {
    expect(nameKey('Влад Повжик')).toBe(nameKey('Vlad Povzik'));
    const pair = duplicatePair({ id: 'a', name: 'Влад Повжик' }, { id: 'b', name: 'Vlad Povzik' });
    expect(pair.reasons.map((r) => r.code)).toEqual(['name']);
    expect(pair.confidence).toBe('medium');
  });

  it('a similar name needs the same parent, phone or e-mail', () => {
    expect(duplicatePair({ id: 'a', name: 'Milan' }, { id: 'b', name: 'Milan Grozovski' })).toBeNull();
    const parent = duplicatePair({ id: 'a', name: 'Milan', linkedParentId: 'p1' }, { id: 'b', name: 'Milan Grozovski', linkedParentIds: ['p1'] });
    expect(parent.reasons.map((r) => r.code)).toEqual(['similar_name', 'parent_account']);
    expect(parent.confidence).toBe('medium');
    const phone = duplicatePair({ id: 'a', name: 'Milan', phone: '+372 5551 2345' }, { id: 'b', name: 'Milan G', phone: '55512345' });
    expect(phone.reasons.map((r) => r.code)).toContain('phone');
    const mail = duplicatePair({ id: 'a', name: 'Milan', parentContacts: [{ email: 'ISA@example.com' }] }, { id: 'b', name: 'Milan G', parentEmail: 'isa@example.com' });
    expect(mail.reasons.map((r) => r.code)).toContain('parent_email');
  });

  it('the same name and the same parent is very likely one child', () => {
    const pair = duplicatePair({ id: 'a', name: 'Mari Tamm', parentEmail: 'ema@example.com' }, { id: 'b', name: 'mari  tamm', parentEmail: 'Ema@Example.com' });
    expect(pair.confidence).toBe('high');
  });

  it('siblings (same parent, another first name) are not proposed; the same account always is', () => {
    expect(duplicatePair({ id: 'a', name: 'Sofia Tamm', linkedParentId: 'p1' }, { id: 'b', name: 'Mari Tamm', linkedParentId: 'p1' })).toBeNull();
    expect(duplicatePair({ id: 'a', name: 'Sofia', linkedUserId: 'u1' }, { id: 'b', name: 'S. T.', linkedUserIds: ['u1'] }).reasons.map((r) => r.code)).toEqual(['account']);
  });

  it('leaves out archived, merged and dismissed cards and sorts the likeliest first', () => {
    const pairs = duplicateCandidates([
      { id: 'a', name: 'Maria', notDuplicateOf: ['b'] },
      { id: 'b', name: 'Maria' },
      { id: 'c', name: 'Karl', active: false },
      { id: 'd', name: 'Karl' },
      { id: 'e', name: 'Karl', mergedInto: 'd' },
      { id: 'f', name: 'Mari Tamm', parentEmail: 'x@example.com' },
      { id: 'g', name: 'Mari Tamm', parentEmail: 'x@example.com' },
      { id: 'h', name: 'Jaan' },
      { id: 'i', name: 'Jaan' },
    ]);
    expect(pairs.map((p) => `${p.a.id}${p.b.id}`)).toEqual(['fg', 'hi']);
  });
});
