import { describe, expect, it } from 'vitest';
import { PAPER_TEMPLATES, paperMeasured, paperStartGrades, paperWorkPayload } from './paperWork.js';

const exam = PAPER_TEMPLATES[0];
const student = { id: 's1', name: 'Polina' };

describe('a work done on paper', () => {
  it('stores the points per criterion with the sum and percent', () => {
    const parts = exam.parts.map((part, index) => ({ ...part, points: ['2', '2', '3', '2'][index] }));
    const payload = paperWorkPayload({ student, title: exam.title, date: '2026-10-28', parts, skills: exam.skills, user: { uid: 't1' } });
    expect(payload).toMatchObject({ studentId: 's1', exerciseType: 'paper', exerciseTitle: exam.title, score: { correct: 9, total: 20 }, pct: 45, paperSkills: ['Kirjutamine'], reviewStatus: 'pending', completedAt: '2026-10-28T12:00:00.000Z' });
    expect(payload.paperParts).toHaveLength(4);
  });

  it('refuses points above the maximum, an empty name or a missing date', () => {
    const base = { student, title: 'Töö', date: '2026-10-28', parts: [{ label: 'Kõik', points: '7', max: 5 }] };
    expect(() => paperWorkPayload(base)).toThrow('punktid 0–5');
    expect(() => paperWorkPayload({ ...base, title: ' ' })).toThrow('nimi');
    expect(() => paperWorkPayload({ ...base, date: '' })).toThrow('kuupäev');
    expect(paperWorkPayload({ ...base, parts: [{ label: 'Kõik', points: '4,5', max: 5 }] }).score).toEqual({ correct: 4.5, total: 5 });
  });

  it('the measured skills get the percent and a starting grade in the review window', () => {
    const submission = { percentage: 45, source: { exerciseType: 'paper', paperSkills: ['Kirjutamine'] } };
    expect(paperMeasured(submission)).toEqual({ Kirjutamine: 45 });
    expect(paperStartGrades(submission)).toEqual({ Kirjutamine: 2 });
    expect(paperMeasured({ percentage: 45, source: { exerciseType: 'quiz' } })).toEqual({});
  });
});
