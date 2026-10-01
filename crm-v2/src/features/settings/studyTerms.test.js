import { describe, expect, it } from 'vitest';
import { hasAcceptedCurrentStudyTerms, needsStudyTermsAcceptance, STUDY_TERMS_VERSION } from './studyTerms.js';

describe('parent study terms', () => {
  it('gates a parent until the current version is accepted', () => {
    const parent = { roles: ['parent'], profile: {} };
    expect(needsStudyTermsAcceptance(parent)).toBe(true);
    expect(hasAcceptedCurrentStudyTerms(parent)).toBe(false);

    const accepted = {
      ...parent,
      profile: { studyTermsAcceptedAt: '2026-10-01T18:00:00.000Z', studyTermsVersion: STUDY_TERMS_VERSION },
    };
    expect(needsStudyTermsAcceptance(accepted)).toBe(false);
    expect(hasAcceptedCurrentStudyTerms(accepted)).toBe(true);
  });

  it('does not gate staff or students', () => {
    expect(needsStudyTermsAcceptance({ roles: ['student'], profile: {} })).toBe(false);
    expect(needsStudyTermsAcceptance({ roles: ['teacher'], profile: {} })).toBe(false);
  });

  it('requires acceptance again after a version change', () => {
    const parent = {
      roles: ['parent'],
      profile: { studyTermsAcceptedAt: '2026-09-01T12:00:00.000Z', studyTermsVersion: '2026-09-01' },
    };
    expect(needsStudyTermsAcceptance(parent)).toBe(true);
  });
});
