// Finance v2 §2: three everyday tabs; rarely used tools live under "Täpsem".
export const FINANCE_WORKSPACE_GROUPS = [
  {
    id: 'main',
    label: 'Finantsid',
    sections: [
      { id: 'kuuarved', label: 'Kuuarved', description: 'Kuu tundide arved kalendri ja hinna järgi' },
      { id: 'arved', label: 'Arved ja maksed', description: 'Tasumata arved, meeldetuletused, laekumised ja pank' },
      { id: 'ulevaade', label: 'Ülevaade', description: 'Kuu tulemused ja prognoos' },
    ],
  },
  {
    id: 'advanced',
    label: 'Täpsem',
    sections: [
      { id: 'tunniarvestus', label: 'Arved toimunud tundidest' },
      { id: 'avansid', label: 'Avansid ja tagasimaksed' },
      { id: 'audit', label: 'Finantsaudit' },
      { id: 'numeratsioon', label: 'Arvete numeratsioon' },
      { id: 'ekirjad', label: 'E-kirjad' },
    ],
  },
];

// old links (#pangauhildus, #perioodid, #tuluprognoos) open the tab that now holds them
const ALIASES = { pangauhildus: 'arved', perioodid: 'ulevaade', tuluprognoos: 'ulevaade' };

export const FINANCE_DEFAULT_SECTION = 'kuuarved';

export function financeSectionById(sectionId) {
  const id = ALIASES[sectionId] || sectionId;
  for (const group of FINANCE_WORKSPACE_GROUPS) {
    const section = group.sections.find((item) => item.id === id);
    if (section) return { ...section, groupId: group.id, groupLabel: group.label };
  }
  return null;
}

export function financeSectionIds() {
  return FINANCE_WORKSPACE_GROUPS.flatMap((group) => group.sections.map((section) => section.id));
}

export function normalizeFinanceSection(sectionId) {
  return financeSectionById(sectionId)?.id || FINANCE_DEFAULT_SECTION;
}
