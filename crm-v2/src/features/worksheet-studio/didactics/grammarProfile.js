// EKI's grammar competence description for adult learners, A1–C1 (etLex, Sõnaveeb „Õpetaja tööriistad”, CC BY),
// built by tools/lexicon/build_level_forms.py grammar. Loaded lazily (≈72 kB gz).
let loading = null;
export function loadGrammarProfile() {
  if (!loading) loading = import('./grammarProfile.json').then((mod) => (mod.default || mod).levels || null).catch(() => null);
  return loading;
}
// a profile key (levels.js levelKey) → the EKI level whose topics are its targets
export const GRAMMAR_LEVEL = { A1: 'A1', A2: 'A2', 'A2+': 'A2', 'B1-': 'B1', B1: 'B1', 'B1+': 'B1', 'B2-': 'B2', B2: 'B2', C1: 'C1' };
const ORDER = ['A1', 'A2', 'B1', 'B2', 'C1'];
// the topics that are new on the level (targets) and those of the levels before (already known)
export function grammarFor(profile, key) {
  const level = GRAMMAR_LEVEL[key] || 'A2';
  const before = ORDER.slice(0, ORDER.indexOf(level));
  return { level, targets: profile?.[level] || [], known: before.flatMap((l) => profile?.[l] || []) };
}
