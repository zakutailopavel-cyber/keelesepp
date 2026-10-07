export const FINANCE_SETTINGS_DEFAULT = 'tuluprognoos';
export const FINANCE_SETTINGS_SECTIONS = new Set(['tuluprognoos', 'perioodid', 'numeratsioon', 'ekirjad', 'audit']);

const SETTINGS_ALIASES = { settings: 'tuluprognoos', seaded: 'tuluprognoos', forecast: 'tuluprognoos', numbering: 'numeratsioon', email: 'ekirjad', emails: 'ekirjad', periods: 'perioodid' };

export function normalizeFinanceSettingsSection(value = '') {
  const section = SETTINGS_ALIASES[value] || value;
  return FINANCE_SETTINGS_SECTIONS.has(section) ? section : FINANCE_SETTINGS_DEFAULT;
}

export function legacyFinanceDestination(hash = '') {
  const section = String(hash).replace(/^#/, '');
  if (FINANCE_SETTINGS_SECTIONS.has(SETTINGS_ALIASES[section] || section) || SETTINGS_ALIASES[section]) {
    return `/finance/seaded#${normalizeFinanceSettingsSection(section)}`;
  }
  if (section === 'arved' || section === 'pangauhildus') return '/finance?status=all';
  if (section === 'kuuarved') return '/finance';
  return '';
}
