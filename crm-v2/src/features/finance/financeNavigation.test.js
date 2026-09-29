import { describe, expect, it } from 'vitest';
import { FINANCE_DEFAULT_SECTION, FINANCE_WORKSPACE_GROUPS, financeSectionById, financeSectionIds, normalizeFinanceSection } from './financeNavigation.js';

describe('finance workspace navigation', () => {
  it('has three everyday tabs, monthly invoices first', () => {
    expect(FINANCE_WORKSPACE_GROUPS[0].sections.map((section) => section.id)).toEqual(['kuuarved', 'arved', 'ulevaade']);
    expect(FINANCE_DEFAULT_SECTION).toBe('kuuarved');
  });

  it('keeps rare tools under Täpsem', () => {
    expect(FINANCE_WORKSPACE_GROUPS[1].sections.map((section) => section.id)).toEqual(['tunniarvestus', 'avansid', 'audit', 'numeratsioon']);
  });

  it('opens old links in the tab that now holds them', () => {
    expect(normalizeFinanceSection('pangauhildus')).toBe('arved');
    expect(normalizeFinanceSection('perioodid')).toBe('ulevaade');
    expect(financeSectionById('audit')).toMatchObject({ groupId: 'advanced' });
    expect(normalizeFinanceSection('puuduv')).toBe('kuuarved');
  });

  it('contains every section once', () => {
    const ids = financeSectionIds();
    expect(new Set(ids).size).toBe(ids.length);
  });
});
