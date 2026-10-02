export const PHASES = ['discover', 'practice', 'transfer'];

export const RECIPES = {
  discover: {
    id: 'discover-didactic-v2',
    displayLabel: 'Avasta',
    purpose: 'notice-and-understand',
  },
  practice: {
    id: 'practice-didactic-v2',
    displayLabel: 'Harjuta',
    purpose: 'controlled-accuracy',
  },
  transfer: {
    id: 'transfer-didactic-v2',
    displayLabel: 'Kasuta',
    purpose: 'independent-transfer',
  },
  full: {
    id: 'focus-full-didactic-v2',
    displayLabel: 'Täistööleht',
    purpose: 'discover-practice-transfer',
  },
};

export function recipeFor({ phase, lessonKind = 'integrated' } = {}) {
  const recipe = RECIPES[phase];
  if (!recipe) return null;
  return { ...recipe, lessonKind };
}
