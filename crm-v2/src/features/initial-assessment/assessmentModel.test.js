import { describe, expect, it } from 'vitest';
import { assessmentPayload, buildInitialAssessment, focusTopics, newTopicId, normalizeAssessment, normalizeScore, statusForScore } from './assessmentModel.js';

const RULE_KEYS = ['studentId', 'assessmentDate', 'currentLevel', 'targetLevel', 'overallStatus', 'grammarData', 'vocabularyData', 'skillsData', 'strengths', 'developmentAreas', 'learningFocus', 'createdAt', 'updatedAt', 'createdByUid', 'createdByName', 'updatedByUid', 'updatedByName', 'version'];
const student = { id: 's1', level: 'B1', targetLevel: 'B2' };
const teacher = { uid: 't1', displayName: 'Pavel' };

describe('initial assessment model', () => {
  it('builds the v1 baseline with the standard topics', () => {
    const base = buildInitialAssessment(student, teacher, '2026-10-04T10:00:00.000Z');
    expect(base.grammarData).toHaveLength(20);
    expect(base.vocabularyData).toHaveLength(15);
    expect(base.skillsData).toHaveLength(6);
    expect(base).toMatchObject({ currentLevel: 'B1', targetLevel: 'B2', assessmentDate: '2026-10-04', version: 1 });
  });

  it('writes exactly the keys Firestore requires and keeps creation fields on update', () => {
    const existing = { createdAt: '2026-08-11T09:00:00.000Z', createdByUid: 'admin', createdByName: 'Admin' };
    const payload = assessmentPayload({ ...buildInitialAssessment(student, teacher), overallStatus: 'not_tested', strengths: 'Sõnavara\n\n Hääldus ' }, student, teacher, existing, '2026-10-04T10:00:00.000Z');
    expect(Object.keys(payload).sort()).toEqual([...RULE_KEYS].sort());
    expect(payload).toMatchObject({ createdAt: existing.createdAt, createdByUid: 'admin', updatedByUid: 't1', overallStatus: 'needs_work', strengths: ['Sõnavara', 'Hääldus'] });
  });

  it('keeps 0 % as a real result and empty as not tested', () => {
    expect(normalizeScore('')).toBeNull();
    expect(normalizeScore('0')).toBe(0);
    expect(normalizeScore('120')).toBe(100);
    expect(statusForScore(null)).toBe('not_tested');
    expect(statusForScore(0)).toBe('needs_work');
    expect(statusForScore(85)).toBe('target_reached');
  });

  it('reads an older v1 document and lists the weakest topics first', () => {
    const read = normalizeAssessment({ studentId: 's1', assessmentDate: '2026-08-11', overallStatus: 'developing', createdAt: 'x', createdByUid: 'a',
      grammarData: [{ id: 'a', name: 'A', score: 40, priority: 'high' }, { id: 'b', name: 'B', score: 90 }, { id: 'c', name: 'C', score: 40, priority: 'very_high' }] }, student);
    expect(read.vocabularyData).toHaveLength(15);
    expect(read.createdByUid).toBe('a');
    expect(focusTopics(read).map((row) => row.id)).toEqual(['c', 'a']);
  });

  it('gives custom topics unique ids', () => {
    expect(newTopicId('Õ-tähe hääldus', [])).toBe('custom_o_tahe_haaldus');
    expect(newTopicId('X', [{ id: 'custom_x' }])).toBe('custom_x_2');
  });
});
