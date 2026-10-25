// The data behind the Harno exam blocks (harno.jsx), kept in plain JS so the course builders
// (admin/course/blocks.js) and node tools can import it without JSX.

export const WRITING_GENRES = {
  kusimustik: 'Küsimustik', teade: 'Teade / sõnum', kutse: 'Kutse või kaart', kiri: 'Isiklik kiri', jutt: 'Jutt etteantud pealkirjaga', vastus: 'Vastus kirjale',
};
// Harno does not publish its internal per-criterion split for B1; these criteria are our inference (documented in
// COURSE_FINAL_SHAPE_B1.md §2.4) and keep a module exam on the same raw scale as the real exam.
export const PASS_SHARE = 0.8; // owner 2026-10-26: the course certificate needs ≥ 80 % in every exam part
export const RUBRIC_SCALES = {
  W1: { label: 'Kirjutamine, 1. ülesanne', criteria: [
    { name: 'Sisupunkt 1 on kirjas', max: 1 }, { name: 'Sisupunkt 2 on kirjas', max: 1 }, { name: 'Sisupunkt 3 on kirjas', max: 1 }, { name: 'Sisupunkt 4 on kirjas', max: 1 },
    { name: 'Keel ja vorm', max: 4, hint: 'pöördumine ja lõpetus sobivad adressaadile; vead ei sega mõistmist; pikkus ±20 %' },
  ] },
  W2: { label: 'Kirjutamine, 2. ülesanne', criteria: [
    { name: 'Ülesande täitmine ja sisu', max: 3, hint: 'kõik punktid, teemas, sõnum on arusaadav' },
    { name: 'Ülesehitus ja sidusus', max: 3, hint: 'algus ja lõpp, lõigud, sidesõnad (sest, kuna, et, siis, pärast seda)' },
    { name: 'Sõnavara', max: 3, hint: 'piisav ja täpne, vähe kordusi' },
    { name: 'Grammatika ja õigekiri', max: 3, hint: 'vead ei sega mõistmist' },
  ] },
  S: { label: 'Rääkimine', criteria: [
    { name: 'Ülesande täitmine ja suhtlus', max: 5, hint: 'vastused on arendatud, kokkulepe on tehtud, kaardi info on küsitud ja antud' },
    { name: 'Sujuvus ja sidusus', max: 5, hint: 'räägib pausideta, mõtted on seotud' },
    { name: 'Sõnavara', max: 5, hint: 'sõnad sobivad teemaga ja olukorraga' },
    { name: 'Grammatika ja hääldus', max: 5, hint: 'vead ei sega mõistmist, hääldus on arusaadav' },
  ] },
};
export const EXAM_PART_DEFAULTS = {
  W: { part: 'Kirjutamine', minutes: 35, points: 20, tasks: 2 },
  L: { part: 'Kuulamine', minutes: 35, points: 30, tasks: 4 },
  R: { part: 'Lugemine', minutes: 50, points: 33, tasks: 4 },
  S: { part: 'Rääkimine', minutes: 15, points: 20, tasks: 3 },
};
