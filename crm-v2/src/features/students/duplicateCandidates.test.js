import { duplicateCandidates, duplicatePair, maskEmail, maskPhone, nameKey, personName } from './duplicateCandidates.js';

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

  it('a self-registered card marked by the sign-up linking pairs with the existing card (incident 2026-11-09)', () => {
    const teacherCard = { id: 'card-stefania', name: 'Stefania ', parentName: 'Jelena Shabanova', linkedParentIds: ['p1'] };
    const selfCard = { id: 'self_u1', name: 'Stefania Šabanova', linkedUserIds: ['u1'], possibleExistingCardIds: ['card-stefania'] };
    // without the server's mark the pair was not proposed (no shared contact)
    expect(duplicatePair(teacherCard, { ...selfCard, possibleExistingCardIds: [] })).toBeNull();
    const pairs = duplicateCandidates([teacherCard, selfCard, { id: 'sister', name: 'Viktoria Shabanova', parentName: 'Jelena Shabanova' }]);
    expect(pairs).toHaveLength(1);
    expect(pairs[0].reasons.map((r) => r.code)).toContain('signup_match');
    expect(pairs[0].confidence).toBe('high');
    expect(duplicateCandidates([{ ...teacherCard, notDuplicateOf: ['self_u1'] }, selfCard])).toEqual([]);
  });

  it('leaves out merged and dismissed cards and sorts the likeliest first; an archived card pairs with an active one', () => {
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
    // the archived card comes second, so „Liida” keeps the active card by default
    expect(pairs.map((p) => `${p.a.id}${p.b.id}`)).toEqual(['fg', 'hi', 'dc']);
  });

  it('two archived cards are proposed too (2026-11-06), after a pair with an active card; cards in the trash are not', () => {
    const archived = duplicateCandidates([{ id: 'a', name: 'Karl', active: false }, { id: 'b', name: 'Karl', active: false }]);
    expect(archived.map((p) => `${p.a.id}${p.b.id}`)).toEqual(['ab']);
    expect(duplicateCandidates([
      { id: 'a', name: 'Karl', active: false }, { id: 'b', name: 'Karl', active: false },
      { id: 'c', name: 'Jaan' }, { id: 'd', name: 'Jaan', active: false },
    ]).map((p) => `${p.a.id}${p.b.id}`)).toEqual(['cd', 'ab']);
    expect(duplicateCandidates([{ id: 'a', name: 'Karl' }, { id: 'b', name: 'Karl', deletedAt: '2026-11-05T10:00:00.000Z' }])).toEqual([]);
  });

  it('an archived card is a candidate next to an active one (the active card first)', () => {
    const [pair] = duplicateCandidates([{ id: 'old', name: 'Mia Tamm', active: false, parentEmail: 'ema@example.com' }, { id: 'new', name: 'Mia Tamm', parentEmail: 'ema@example.com' }]);
    expect([pair.a.id, pair.b.id]).toEqual(['new', 'old']);
    expect(pair.confidence).toBe('high');
    expect(duplicateCandidates([{ id: 'a', name: 'Karl' }, { id: 'b', name: 'Karl', active: false, convertedToParent: true }])).toEqual([]);
  });

  it('„Maria B2” (archived, old schedule) and „Mariia B2” (self-registered) are one person', () => {
    expect(personName('Maria B2')).toMatchObject({ full: 'maria', tags: ['b2'] });
    expect(personName('Mariia B2').full).toBe(personName('Maria B2').full);
    const cards = [
      { id: 'IPwSFP14CAmiFZUUXIer', name: 'Maria B2', active: false, createdAt: '2026-09-29', subject: 'Eesti keel', teacher: 'Oksana', level: 'B2' },
      { id: 'self_imA0JUXOnkPGazIQtQvADe5fr1W2', name: 'Mariia B2', active: true, linkedUserId: 'imA0JUXOnkPGazIQtQvADe5fr1W2', subject: 'Eesti keel', teacher: 'Oksana', level: 'B2' },
      { id: 'other', name: 'Mari Tamm', active: true },
    ];
    const pairs = duplicateCandidates(cards);
    expect(pairs).toHaveLength(1);
    const [pair] = pairs;
    // the active (self-registered) card first: the merge keeps it by default
    expect([pair.a.id, pair.b.id]).toEqual(['self_imA0JUXOnkPGazIQtQvADe5fr1W2', 'IPwSFP14CAmiFZUUXIer']);
    expect(pair.reasons.map((r) => r.code)).toEqual(['name', 'teacher', 'level_tag', 'self_registered']);
    expect(pair.reasons[0].label).toBe('Sama nimi (eri kirjapilt)');
    expect(pair.reasons[2].label).toBe('Sama märge nimes (B2)');
    expect(pair.confidence).toBe('high');
  });

  it('Jekaterina, Ekaterina, Екатерина and Katerina are one first name; й and case do not matter', () => {
    const key = personName('Jekaterina Ivanova').full;
    expect(personName('Ekaterina Ivanova').full).toBe(key);
    expect(personName('Екатерина Иванова').full).toBe(key);
    expect(personName('KATERINA ivanova').full).toBe(key);
    expect(personName('Yekaterina Ivanova').full).toBe(key);
    expect(personName('Андрій').full).toBe(personName('Andrei').full);
    expect(personName('Сергей').full).toBe(personName('Serhii').full);
    expect(personName('Anastassia Põld En').full).toBe(personName('Anastasia Pold').full);
    expect(duplicatePair({ id: 'a', name: 'Jekaterina Ivanova' }, { id: 'b', name: 'Ekaterina Ivanova' }).reasons[0]).toEqual({ code: 'name', label: 'Sama nimi (eri kirjapilt)' });
  });

  it('different people with the same first name are not matched without another signal', () => {
    expect(duplicatePair({ id: 'a', name: 'Maria Ivanova' }, { id: 'b', name: 'Maria Petrova' })).toBeNull();
    // the same teacher or level alone does not make them one person
    expect(duplicatePair({ id: 'a', name: 'Maria Ivanova', teacher: 'Oksana', level: 'B2' }, { id: 'b', name: 'Mariia Petrova', teacher: 'Oksana', level: 'B2' })).toBeNull();
    expect(duplicatePair({ id: 'a', name: 'Maria', teacher: 'Oksana' }, { id: 'b', name: 'Maria Petrova', teacher: 'Oksana' })).toBeNull();
    // a pet form is another name
    expect(duplicatePair({ id: 'a', name: 'Katja' }, { id: 'b', name: 'Ekaterina' })).toBeNull();
    // the same phone makes the short card a candidate
    expect(duplicatePair({ id: 'a', name: 'Maria', phone: '+372 5123 4567' }, { id: 'b', name: 'Mariia Petrova', phone: '51234567' }).reasons.map((r) => r.code)).toEqual(['similar_name', 'phone']);
  });

  it('two cards of one person for two subjects are a candidate „sama inimene, eri ained”', () => {
    const pair = duplicatePair(
      { id: 'a', name: 'Mari Tamm', subject: 'Eesti keel', parentEmail: 'ema@example.com' },
      { id: 'b', name: 'Mari Tamm En', subject: 'Inglise keel', parentEmail: 'ema@example.com' },
    );
    expect(pair.reasons.map((r) => r.code)).toEqual(['name', 'parent_email', 'subjects']);
    expect(pair.reasons.at(-1).label).toBe('Sama inimene, eri ained (Eesti keel / Inglise keel)');
  });

  it('compares only cards that share a block, but still finds account-only pairs', () => {
    const firsts = ['Mari', 'Karl', 'Sofia', 'Oliver', 'Liisa', 'Robin', 'Emma', 'Hugo', 'Lenna', 'Timur', 'Diana', 'Bogdan', 'Vera', 'Nikita', 'Polina'];
    const lasts = ['Tamm', 'Saar', 'Kask', 'Mets', 'Ivanov', 'Petrov', 'Rebane', 'Ilves', 'Pärn', 'Kuusk', 'Lepp', 'Volkov', 'Koval', 'Sepp', 'Orlov', 'Kivi', 'Lill', 'Mägi', 'Raud', 'Vaher'];
    const many = firsts.flatMap((f, i) => lasts.map((l, j) => ({ id: `s${i}_${j}`, name: `${f} ${l}`, teacher: 'Oksana', level: 'B1' })));
    expect(many).toHaveLength(300);
    const pairs = duplicateCandidates([...many, { id: 'x', name: 'Sofia', linkedUserId: 'u1' }, { id: 'y', name: 'S. T.', linkedUserIds: ['u1'] }]);
    expect(pairs.map((p) => `${p.a.id}${p.b.id}`)).toEqual(['xy']);
  });

  it('masks contacts', () => {
    expect(maskEmail('Maria.B@Gmail.com')).toBe('m•••@gmail.com');
    expect(maskEmail('not a mail')).toBe('');
    expect(maskPhone('+372 5123 4567')).toBe('•••• 67');
    expect(maskPhone('')).toBe('');
  });
});
