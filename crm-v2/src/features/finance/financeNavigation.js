export const FINANCE_WORKSPACE_GROUPS = [
  {
    id: 'daily',
    label: 'Igapäevane töö',
    description: 'Arvete loomine, laekumised ja tasumata arvete jälgimine.',
    sections: [
      { id: 'tunniarvestus', label: 'Loo arved', priority: 'primary' },
      { id: 'arved', label: 'Arved ja maksed', priority: 'primary' },
      { id: 'pangauhildus', label: 'Pangalaekumised', priority: 'primary' },
    ],
  },
  {
    id: 'overview',
    label: 'Ülevaated',
    description: 'Kuu tulemused ja tulude planeerimine.',
    sections: [
      { id: 'perioodid', label: 'Kuuülevaade', priority: 'secondary' },
      { id: 'tuluprognoos', label: 'Tuluprognoos', priority: 'secondary' },
    ],
  },
  {
    id: 'advanced',
    label: 'Täpsemad toimingud',
    description: 'Harvem kasutatavad parandused ja kontrollid.',
    sections: [
      { id: 'avansid', label: 'Avansid ja tagasimaksed', priority: 'advanced' },
      { id: 'audit', label: 'Finantsaudit', priority: 'advanced' },
      { id: 'numeratsioon', label: 'Arvete numeratsioon', priority: 'advanced' },
    ],
  },
];

export const FINANCE_DEFAULT_SECTION = 'tunniarvestus';

export function financeSectionById(sectionId) {
  for (const group of FINANCE_WORKSPACE_GROUPS) {
    const section = group.sections.find((item) => item.id === sectionId);
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
