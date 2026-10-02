const KIND_ALIASES = new Map([
  ['grammar', 'grammar'], ['grammatika', 'grammar'], ['грамматика', 'grammar'],
  ['vocabulary', 'vocabulary'], ['sõnavara', 'vocabulary'], ['лексика', 'vocabulary'],
  ['communication', 'communication'], ['suhtlus', 'communication'], ['situatsioonid', 'communication'], ['ситуации', 'communication'], ['речь', 'communication'],
  ['reading', 'reading'], ['lugemine', 'reading'], ['чтение', 'reading'],
  ['listening', 'listening'], ['kuulamine', 'listening'], ['аудирование', 'listening'],
  ['writing', 'writing'], ['kirjutamine', 'writing'], ['письмо', 'writing'],
  ['assessment', 'assessment'], ['kontroll', 'assessment'], ['kontrolltöö', 'assessment'], ['проверка', 'assessment'], ['большая проверка', 'assessment'],
  ['integrated', 'integrated'], ['integreeritud', 'integrated'], ['интегрированный', 'integrated'],
]);

export function normalizeLessonKind(value) {
  const clean = String(value ?? '').trim().toLocaleLowerCase('et');
  if (KIND_ALIASES.has(clean)) return KIND_ALIASES.get(clean);
  for (const [alias, kind] of KIND_ALIASES) if (clean.includes(alias)) return kind;
  return 'integrated';
}
