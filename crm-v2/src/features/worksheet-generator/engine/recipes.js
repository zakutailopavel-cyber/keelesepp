export const PHASES = ['discover', 'practice', 'transfer'];

export const RECIPES = {
  discover: { id: 'discover-context-v1', displayLabel: 'Avasta', types: ['match', 'truefalse', 'categorize', 'dialogue', 'selfcheck'] },
  practice: { id: 'practice-accuracy-v1', displayLabel: 'Harjuta', types: ['gaps', 'errorfix', 'translation', 'wordorder', 'categorize'] },
  transfer: { id: 'transfer-production-v1', displayLabel: 'Kasuta', types: ['rolecards', 'speaking', 'planning', 'writing', 'selfcheck'] },
  full: { id: 'focus-full-v1', displayLabel: 'Täistööleht', types: ['match', 'gaps', 'errorfix', 'speaking', 'writing'] },
};

export function recipeFor({ phase, lessonKind = 'integrated' } = {}) {
  const recipe = RECIPES[phase];
  if (!recipe) return null;
  return { ...recipe, lessonKind };
}
