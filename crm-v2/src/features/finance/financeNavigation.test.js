import { describe, expect, it } from 'vitest';
import {
  FINANCE_DEFAULT_SECTION,
  FINANCE_WORKSPACE_GROUPS,
  financeSectionById,
  financeSectionIds,
  normalizeFinanceSection,
} from './financeNavigation.js';

describe('finance workspace navigation', () => {
  it('keeps daily finance work first', () => {
    expect(FINANCE_WORKSPACE_GROUPS[0].id).toBe('daily');
    expect(FINANCE_WORKSPACE_GROUPS[0].sections.map((section) => section.id)).toEqual([
      'tunniarvestus',
      'arved',
      'pangauhildus',
    ]);
  });

  it('keeps rare correction tools in the advanced group', () => {
    const advanced = FINANCE_WORKSPACE_GROUPS.find((group) => group.id === 'advanced');
    expect(advanced.sections.map((section) => section.id)).toEqual([
      'avansid',
      'audit',
      'numeratsioon',
    ]);
  });

  it('returns section metadata together with its group', () => {
    expect(financeSectionById('perioodid')).toMatchObject({
      id: 'perioodid',
      label: 'Kuuülevaade',
      groupId: 'overview',
    });
  });

  it('normalizes unknown sections to the daily default', () => {
    expect(normalizeFinanceSection('puuduv')).toBe(FINANCE_DEFAULT_SECTION);
    expect(normalizeFinanceSection('arved')).toBe('arved');
  });

  it('contains every finance section only once', () => {
    const ids = financeSectionIds();
    expect(new Set(ids).size).toBe(ids.length);
  });
});
