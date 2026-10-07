import { describe, expect, it } from 'vitest';
import { legacyFinanceDestination, normalizeFinanceSettingsSection } from './financeSettingsNavigation.js';

describe('finance settings navigation', () => {
  it('keeps old settings and panel aliases working', () => {
    expect(legacyFinanceDestination('#numeratsioon')).toBe('/finance/seaded#numeratsioon');
    expect(legacyFinanceDestination('#settings')).toBe('/finance/seaded#tuluprognoos');
    expect(legacyFinanceDestination('#pangauhildus')).toBe('/finance?status=all');
    expect(normalizeFinanceSettingsSection('email')).toBe('ekirjad');
  });
});
