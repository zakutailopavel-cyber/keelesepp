// A new card for a child who already has one makes a duplicate (Oleksiy 2026-10-24: a second subject belongs on the
// same card as a new „Õppesuund”). Cards whose name is the same, or one name is the other plus a surname
// („Milan” / „Milan Grozovski”, or the words in another order), are shown as a warning before saving; the admin decides.
const words = (value) => String(value || '').trim().toLocaleLowerCase('et').split(/\s+/).filter(Boolean);

export function similarStudents(name, students = [], { excludeId = '' } = {}) {
  const wanted = words(name);
  if (!wanted.length) return [];
  const seen = new Set();
  return students.filter((student) => {
    if (!student || student.id === excludeId || student.active === false || seen.has(student.id)) return false;
    const have = words(student.name);
    if (!have.length) return false;
    const [short, long] = wanted.length <= have.length ? [wanted, have] : [have, wanted];
    const same = short.every((word) => long.includes(word)) && (short.length === long.length || short[0] === long[0]);
    if (same) seen.add(student.id);
    return same;
  });
}
