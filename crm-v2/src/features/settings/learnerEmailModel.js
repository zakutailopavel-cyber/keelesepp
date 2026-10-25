// Seaded → E-kirjad: the e-mail types to students and parents, their default texts and placeholders. The server
// (functions/learner-email-core.js) has the same defaults; learnerEmailModel.test.js keeps them equal.
export const EMAIL_TYPES = [
  { id: 'lessonReminder', label: 'Tunni meeldetuletus', when: 'Iga päev valitud kellaajal: kõigile, kellel on homme tund (korduvad tunnid arvestatud, tühistatud ja ümber tõstetud tunnid välja jäetud).', placeholders: ['õpilane', 'kuupäev', 'kell', 'õpetaja'] },
  { id: 'lessonMoved', label: 'Tund tõsteti ümber', when: 'Kui õpetaja (või administraator) tõstab tulevase tunni teisele ajale või kinnitab õpilase palve „Ei saa tulla?”. Saadetakse 10 minuti pärast: kui muudatus tagasi võetakse, kirja ei lähe.', placeholders: ['õpilane', 'kuupäev', 'kell', 'uus_kuupäev', 'uus_kell', 'õpetaja'] },
  { id: 'lessonCancelled', label: 'Tund jääb ära', when: 'Kui õpetaja (või administraator) tühistab tulevase tunni. Samuti 10 minuti viitega.', placeholders: ['õpilane', 'kuupäev', 'kell', 'õpetaja'] },
  { id: 'newSchedule', label: 'Uus tunniplaan', when: 'Kui planeerija „Kinnita ajakava” loob tunnid: üks kiri õpilasele (ja vanematele) nädala aegade, alguse ja õpetajaga.', placeholders: ['õpilane', 'algus', 'õpetaja'] },
  { id: 'homeworkDue', label: 'Kodutöö tähtaeg homme', when: 'Iga päev valitud kellaajal: kodutöö, mille tähtaeg on homme ja mis on esitamata.', placeholders: ['õpilane', 'tähtaeg', 'ülesanne', 'õpetaja'] },
  { id: 'homeworkChecked', label: 'Töö on kontrollitud', when: 'Kui õpetaja kontrollib esitatud töölehe või harjutuse (hinne või tagasiside) — üks kiri töö kohta.', placeholders: ['õpilane', 'töö', 'hinne', 'õpetaja'] },
  { id: 'announcement', label: 'Teated', when: 'Avaldatud teade (Suhtlus → Teated) läheb e-kirjaga selle saajatele, kes pole veel vastanud — üks kord. Ainult teated, mis avaldati pärast sisselülitamist.', placeholders: ['pealkiri'] },
];

export const DEFAULT_TEXTS = {
  lessonReminder: { subjectEt: 'Homme kell {kell}: tund ({õpilane})', subjectRu: 'Завтра в {kell}: урок ({õpilane})', introEt: 'Tuletame meelde homset tundi.', introRu: 'Напоминаем о завтрашнем уроке.' },
  lessonMoved: { subjectEt: 'Tunni aeg muutus ({õpilane})', subjectRu: 'Время урока изменилось ({õpilane})', introEt: 'Õpetaja kinnitas tunnile uue aja.', introRu: 'Учитель подтвердил новое время урока.' },
  lessonCancelled: { subjectEt: 'Tund jääb ära: {kuupäev} ({õpilane})', subjectRu: 'Урок отменён: {kuupäev} ({õpilane})', introEt: 'Õpetaja tühistas selle tunni. Küsimuste korral vasta sellele kirjale.', introRu: 'Учитель отменил этот урок. Если есть вопросы, ответьте на это письмо.' },
  newSchedule: { subjectEt: 'Uus tunniplaan ({õpilane})', subjectRu: 'Новое расписание ({õpilane})', introEt: 'Tunniplaan on kinnitatud. Need ajad kehtivad igal nädalal.', introRu: 'Расписание подтверждено. Это время действует каждую неделю.' },
  homeworkDue: { subjectEt: 'Kodutöö tähtaeg on homme ({õpilane})', subjectRu: 'Срок домашнего задания — завтра ({õpilane})', introEt: 'Kodutöö ei ole veel esitatud ja tähtaeg on homme.', introRu: 'Домашнее задание ещё не сдано, а срок — завтра.' },
  homeworkChecked: { subjectEt: 'Töö on kontrollitud ({õpilane})', subjectRu: 'Работа проверена ({õpilane})', introEt: 'Õpetaja kontrollis tööd. Parandused ja tagasiside on KeeleSepas.', introRu: 'Учитель проверил работу. Исправления и отзыв — в KeeleSepp.' },
  announcement: { subjectEt: 'Teade: {pealkiri}', subjectRu: 'Объявление: {pealkiri}', introEt: 'Koolil on teile teade. Logi KeeleSeppa sisse ja vasta.', introRu: 'У школы для вас объявление. Войдите в KeeleSepp и ответьте.' },
};

export const TEXT_FIELDS = [
  { key: 'subjectEt', label: 'Teema (eesti)', max: 200 },
  { key: 'introEt', label: 'Sissejuhatus (eesti)', max: 1000 },
  { key: 'subjectRu', label: 'Teema (vene)', max: 200 },
  { key: 'introRu', label: 'Sissejuhatus (vene)', max: 1000 },
];

export const DAILY_HOURS = Array.from({ length: 16 }, (_, index) => index + 6);
const clean = (value, max) => String(value ?? '').trim().slice(0, max);

export function normalizeEmailSettings(raw = {}) {
  const hour = Number(raw.dailyHour);
  return {
    dailyHour: Number.isInteger(hour) && hour >= 6 && hour <= 21 ? hour : 17,
    siteAddress: clean(raw.siteAddress, 200),
    types: Object.fromEntries(EMAIL_TYPES.map(({ id }) => {
      const stored = raw.types?.[id] || {};
      return [id, {
        enabled: stored.enabled === true,
        enabledAt: clean(stored.enabledAt, 40),
        ...Object.fromEntries(TEXT_FIELDS.map(({ key, max }) => [key, clean(stored[key], max)])),
      }];
    })),
  };
}

// switching a type on records the moment (announcements published before it are not e-mailed)
export function toggleType(settings, id, enabled, now = new Date()) {
  const current = settings.types[id];
  return { ...settings, types: { ...settings.types, [id]: { ...current, enabled, enabledAt: enabled ? (current.enabled && current.enabledAt ? current.enabledAt : now.toISOString()) : current.enabledAt } } };
}

// placeholders in a text that the type does not know (shown as a warning; the server drops them)
export function unknownPlaceholders(text, id) {
  const known = EMAIL_TYPES.find((type) => type.id === id)?.placeholders || [];
  return [...String(text || '').matchAll(/\{([\p{L}_]+)\}/gu)].map((match) => match[1]).filter((name) => !known.includes(name));
}

const KIND_LABEL = Object.fromEntries(EMAIL_TYPES.map((type) => [type.id, type.label]));
const STATUS_LABEL = { sent: 'saadetud', skipped: 'vahele jäetud', failed: 'ebaõnnestus', test: 'proovikiri', 'opt-out': 'loobus', 'opt-in': 'tellis uuesti' };
const REASON_LABEL = { 'no-email': 'e-posti pole', 'opted-out': 'kõik loobunud', disabled: 'tüüp välja lülitatud', unchanged: 'muudatus võeti tagasi', restored: 'tund taastati', deleted: 'tund kustutati', 'not-on-date': 'tundi enam pole', 'done-or-changed': 'kodutöö tehtud', 'not-active': 'teade ei kehti', 'batch-silent': 'planeerija: vaikselt', 'no-lessons': 'tunde pole' };

export function logRow(entry = {}) {
  return {
    id: entry.id,
    at: entry.at ? new Date(entry.at).toLocaleString('et-EE', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
    kind: entry.kind === 'preferences' ? 'E-kirjade seaded' : KIND_LABEL[entry.kind] || entry.kind || '',
    status: STATUS_LABEL[entry.status] || entry.status || '',
    detail: [entry.recipientCount ? `${entry.recipientCount} saajat` : '', entry.optedOut ? `${entry.optedOut} loobunud` : '', REASON_LABEL[entry.reason] || (entry.status === 'failed' ? entry.reason : '')].filter(Boolean).join(' · '),
  };
}
