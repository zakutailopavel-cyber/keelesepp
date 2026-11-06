// The group create / edit form and the group lesson form: one validation for create and edit, the lesson length
// choices and the „?” help texts (owner 2026-11-06: every field says what to enter, with an example).

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// the length of a group lesson: the usual ones as a choice, any other under „Muu pikkus”
export const DURATION_PRESETS = [45, 60, 90, 120];
export const CUSTOM_DURATION = 'custom';
export const durationChoice = (minutes) => (DURATION_PRESETS.includes(Number(minutes)) ? String(Number(minutes)) : CUSTOM_DURATION);

/** Minutes from the lesson form, or an error text: 5–480 in steps of 5 (the same limits as a 1:1 lesson). */
export function lessonDuration(value) {
  const minutes = Number(value);
  if (!Number.isFinite(minutes) || String(value ?? '').trim() === '') return { error: 'Sisesta tunni kestus minutites.' };
  const rounded = Math.round(minutes);
  if (rounded < 5 || rounded > 480) return { error: 'Tunni kestus peab olema 5–480 minutit.' };
  return { minutes: rounded };
}

const blank = (value) => String(value ?? '').trim() === '';
const whole = (value) => Number.isInteger(Number(value));

/**
 * Checks the group form before it is saved (create and edit alike). Returns the first problem as plain Estonian,
 * or '' when the form is fine. The service (`groupsService.create / update`) checks the name and the ages again.
 */
export function groupFormError(form = {}, { teachers = [], teacherChanged = false } = {}) {
  if (blank(form.name)) return 'Sisesta grupi nimi.';
  if (String(form.name).trim().length > 120) return 'Grupi nimi on liiga pikk (kuni 120 märki).';
  if (!form.teacherUid || !teachers.some((teacher) => teacher.id === form.teacherUid)) return 'Vali õpetaja.';
  if (blank(form.subject)) return 'Vali õppeaine.';
  if (!blank(form.capacity) && (!whole(form.capacity) || Number(form.capacity) < 1 || Number(form.capacity) > 30)) return 'Kohti saab olla 1–30.';
  const ageAllowed = form.audience && form.audience !== 'adult';
  if (ageAllowed) {
    for (const [key, label] of [['ageFrom', 'alates'], ['ageTo', 'kuni']]) {
      if (!blank(form[key]) && (!whole(form[key]) || Number(form[key]) < 3 || Number(form[key]) > 18)) return `Vanus „${label}” peab olema 3–18 aastat.`;
    }
    if (!blank(form.ageFrom) && !blank(form.ageTo) && Number(form.ageFrom) > Number(form.ageTo)) return 'Vanus „alates” on suurem kui „kuni”.';
  }
  if (teacherChanged && !/^\d{4}-\d{2}-\d{2}$/.test(form.teacherFrom || '')) return 'Vali kuupäev, millest alates uus õpetaja tunde annab.';
  return '';
}

// „?” texts: what to enter and an example. Plain Estonian, short.
export const GROUP_HELP = {
  name: { text: 'Lühike nimi, mida näevad õpilased ja õpetaja (kalender, õpilase kaart, grupiruum).', example: 'Eesti keel B1 · teisipäev 18:00' },
  teacher: { text: 'Kes annab selle grupi tunde. Grupi tunnid on tema kalendris ja aruannetes.', example: 'vali nimekirjast grupi põhiõpetaja' },
  teacherFrom: { text: 'Esimene päev, mil uus õpetaja tunde annab. Varasemad tunnid (kalender, aruanded, palk) jäävad endisele õpetajale.', example: 'järgmise nädala esmaspäev' },
  subject: { text: 'Mida grupis õpitakse. Loend tuleb Seaded → Õppesuunad.', example: 'Eesti keel' },
  level: { text: 'Grupi praegune keeletase. Selle järgi pakub „Täida grupp” sobivaid õpilasi.', example: 'B1 — õpilased saavad igapäevateemadel iseseisvalt hakkama' },
  audience: { text: 'Kellele grupp on mõeldud. Laste ja kooliõpilaste grupil saab märkida ka vanuse.', example: 'Kooliõpilased' },
  capacity: { text: 'Mitu õpilast mahub gruppi (1–30). Tühjaks jäetuna 8 kohta (eelkooliealistel 6).', example: '6' },
  ageFrom: { text: 'Noorim sobiv vanus aastates (3–18). Võib jääda tühjaks.', example: '7' },
  ageTo: { text: 'Vanim sobiv vanus aastates (3–18). Võib jääda tühjaks.', example: '10' },
  day: { text: 'Mis nädalapäeval see tund iga nädal toimub. Teise päeva jaoks lisa uus tunniaeg.', example: 'Teisipäev' },
  time: { text: 'Tunni algusaeg (24 h). Hiljem saab tunni kalendris lohistades teisele ajale viia.', example: '18:00' },
  duration: { text: 'Kui kaua üks tund kestab. Kestus läheb kalendrisse, kohalolu märkesse ja arvele samamoodi nagu eratunnil.', example: '60 min; muu pikkus „Muu pikkus” alt, nt 75 min' },
  customDuration: { text: 'Tunni pikkus minutites, 5–480.', example: '75' },
  startDate: { text: 'Esimene päev, millest alates tund igal nädalal kalendris on. Varasemaid tunde ei looda.', example: 'järgmine teisipäev' },
};
