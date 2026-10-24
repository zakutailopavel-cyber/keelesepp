import { answerText, cardMatches, emptyForm, formErrors, reportCsv, subjectsAndLevels, textLines } from './announcementModel.js';

describe('„Teated” model', () => {
  it('keeps line breaks and turns only http(s) addresses into links', () => {
    expect(textLines('Tere!\n\nVaata https://epkoolitus.ee/info. <b>x</b> javascript:alert(1)')).toEqual([
      [{ text: 'Tere!' }],
      [],
      [{ text: 'Vaata ' }, { link: 'https://epkoolitus.ee/info' }, { text: '. <b>x</b> javascript:alert(1)' }],
    ]);
  });

  it('names what is missing in the form', () => {
    const form = emptyForm('2026-10-24');
    expect(Object.keys(formErrors(form))).toEqual(['title', 'body']);
    expect(formErrors({ ...form, title: 'T', body: 'B', activeTo: '2026-10-01' })).toEqual({ activeTo: expect.any(String) });
    const question = { ...form, title: 'T', body: 'B', responseType: 'question', question: { mode: 'single', options: ['Jah', ' '], allowOther: false } };
    expect(formErrors(question).options).toMatch(/kaks/);
    expect(formErrors({ ...question, question: { ...question.question, options: ['Jah', 'Jah'] } }).options).toMatch(/korduvad/);
    expect(formErrors({ ...question, question: { mode: 'text', options: [], allowOther: false } })).toEqual({});
  });

  it('counts the cards like the server: subject and level on one enrollment', () => {
    const juri = { id: 's2', name: 'Jüri', active: true, enrollments: [{ subject: 'Matemaatika', level: '7' }, { subject: 'Eesti keel', level: 'A2' }] };
    const form = { ...emptyForm('2026-10-24'), subjects: ['Matemaatika'], levels: ['A2'] };
    expect(cardMatches(form, juri)).toBe(false);
    expect(cardMatches({ ...form, subjects: ['Eesti keel'] }, juri)).toBe(true);
    expect(cardMatches({ ...emptyForm(''), studentIds: ['s1'] }, juri)).toBe(false);
    expect(cardMatches(emptyForm(''), { ...juri, active: false })).toBe(false);
    expect(subjectsAndLevels([juri, { subject: 'Eesti keel', level: 'B1' }])).toEqual({ subjects: ['Eesti keel', 'Matemaatika'], levels: ['7', 'A2', 'B1'] });
  });

  it('exports answers for Excel', () => {
    const csv = reportCsv({ responseType: 'availability' }, [
      { studentName: 'Mari', names: ['Ema'], kind: 'parent', answered: true, answeredAt: '2026-10-24T10:00:00.000Z', answeredByName: 'Ema', slots: ['Mon-17:00', 'Mon-17:30', 'Mon-18:00', 'Mon-18:30'], preferred: ['Mon-17:00', 'Mon-17:30'] },
      { studentName: 'Jüri "J"', names: [], kind: 'student', answered: false },
    ]);
    expect(csv.startsWith('﻿"Õpilane / laps";')).toBe(true);
    expect(csv).toContain('"Mari";"Ema";"Lapsevanem";"Vastatud"');
    expect(csv).toContain('"E 17–19 (★ 17–18)"');
    expect(csv).toContain('"Jüri ""J""";"";"Õpilane";"Ootab"');
    expect(answerText('question', { answered: true, answer: { choices: ['Jah'], other: 'pigem' } })).toBe('Jah; Muu: pigem');
  });
});
