// „Puuduvad andmed” (owner 2026-10-25): labels and the browser-side checks of the form. The server
// (functions/missing-data-core.js) decides what is asked and checks every value again; these checks only tell the
// learner at once what to fix. Keep the e-mail / phone / class rules the same as there.

export const ITEM_LABELS = {
  availability: 'Sobivad ajad',
  email: 'Kontakti e-post',
  phone: 'Telefon',
  parentName: 'Lapsevanema nimi',
  language: 'Sõnumite keel',
  grade: 'Klass või sünniaasta',
};
export const ITEM_HINTS = {
  availability: 'Nädala tunnid, mil õpilane saab tunnis olla',
  email: 'täiskasvanul enda, lapsel lapsevanema e-post',
  phone: 'täiskasvanul enda, lapsel lapsevanema telefon',
  parentName: 'ainult lapse kaardil',
  language: 'eesti / vene / inglise',
  grade: 'lapsel klass (1.–12.) või sünniaasta',
};
export const MODE_LABELS = { required: 'Kohustuslik', optional: 'Soovi korral', off: 'Ei küsi' };
export const ACCOUNT_LABELS = { student: 'Õpilase konto', parent: 'Lapsevanema konto', both: 'Õpilane + lapsevanem', none: 'Kontot pole' };
export const KIND_LABELS = { adult: 'Täiskasvanu', child: 'Laps', unknown: 'Vanus teadmata' };
export const LANGUAGE_OPTIONS = [{ value: 'et', label: 'Eesti keel' }, { value: 'ru', label: 'Русский' }, { value: 'en', label: 'English' }];
export const ADULT_GRADE = 'Täiskasvanu';
export const CLASS_OPTIONS = Array.from({ length: 12 }, (_, index) => `${index + 1}. klass`);

// the field texts, Estonian · Russian, per kind of card
export function fieldLabel(item, kind) {
  const child = kind === 'child';
  return {
    email: child ? 'Lapsevanema e-post · E-mail родителя' : 'Sinu e-post · Ваш e-mail',
    phone: child ? 'Lapsevanema telefon · Телефон родителя' : 'Sinu telefon · Ваш телефон',
    parentName: 'Lapsevanema ees- ja perekonnanimi · Имя и фамилия родителя',
    language: 'Mis keeles sulle kirjutada? · На каком языке вам писать?',
    grade: 'Klass või sünniaasta · Класс или год рождения',
    availability: 'Sobivad tunniajad · Удобное время для уроков',
  }[item];
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const validEmail = (value) => EMAIL.test(String(value ?? '').trim());

export function normalizePhone(value) {
  let text = String(value ?? '').trim().replace(/[\s().-]/g, '');
  if (text.startsWith('00')) text = `+${text.slice(2)}`;
  if (/^[3-8]\d{6,7}$/.test(text)) return `+372${text}`;
  if (/^\+372[3-8]\d{6,7}$/.test(text)) return text;
  if (/^\+(?!372)[1-9]\d{6,14}$/.test(text)) return text;
  return '';
}

// '5. klass' / 'Täiskasvanu' / a birth year → which questions follow (adult or child)
export function kindOfGrade(grade, year = new Date().getFullYear()) {
  const text = String(grade ?? '').trim();
  if (!text) return '';
  if (text === ADULT_GRADE) return 'adult';
  if (/^\d{4}$/.test(text)) return year - Number(text) >= 18 ? 'adult' : 'child';
  return 'child';
}

export function validBirthYear(value, year = new Date().getFullYear()) {
  const born = Number(value);
  return /^\d{4}$/.test(String(value ?? '').trim()) && born >= year - 100 && born <= year - 3;
}

// the questions of one card for the current answer: { kind, items }
export function cardQuestions(card, answer = {}, year = new Date().getFullYear()) {
  if (!card.variants) return { kind: card.kind, items: card.ask };
  const kind = kindOfGrade(answer.grade, year);
  if (!kind) {
    // until the class is chosen: the class and what both readings ask
    const both = card.variants.adult.filter((item) => card.variants.child.includes(item) && !['email', 'phone'].includes(item));
    return { kind: '', items: ['grade', ...both.filter((item) => item !== 'grade')] };
  }
  return { kind, items: ['grade', ...card.variants[kind].filter((item) => item !== 'grade')] };
}

export const ERROR_TEXT = {
  required: 'Palun täida · Пожалуйста, заполните',
  email: 'E-posti aadress ei ole korrektne · Неверный e-mail',
  phone: 'Telefoninumber ei ole korrektne (nt 5123 4567 või +358 …) · Неверный номер',
  name: 'Kirjuta ees- ja perekonnanimi · Укажите имя и фамилию',
  grade: 'Vali klass või kirjuta sünniaasta · Выберите класс или год рождения',
  language: 'Vali keel · Выберите язык',
};

// errors of one card's answer: { item: code }
export function cardErrors(card, answer = {}, year = new Date().getFullYear()) {
  const { items } = cardQuestions(card, answer, year);
  const required = new Set(card.required || []);
  const errors = {};
  const need = (item, has) => { if (!has && required.has(item)) errors[item] = 'required'; };
  items.forEach((item) => {
    const value = String(answer[item] ?? '').trim();
    if (item === 'availability') need(item, Boolean(answer.availability?.slots?.length));
    else if (item === 'email') { if (value && !validEmail(value)) errors.email = 'email'; else need(item, Boolean(value)); }
    else if (item === 'phone') { if (value && !normalizePhone(value)) errors.phone = 'phone'; else need(item, Boolean(value)); }
    else if (item === 'parentName') { if (value && value.split(/\s+/).length < 2) errors.parentName = 'name'; else need(item, Boolean(value)); }
    else if (item === 'grade') {
      const ok = value === ADULT_GRADE || CLASS_OPTIONS.includes(value) || validBirthYear(value, year);
      if (value && !ok) errors.grade = 'grade'; else need(item, ok);
    } else if (item === 'language') need(item, ['et', 'ru', 'en'].includes(value));
  });
  if (card.variants && !kindOfGrade(answer.grade, year) && !errors.grade && required.has('grade')) errors.grade = 'required';
  return errors;
}

export function profileErrors(profile = { ask: [], required: [] }, answer = {}) {
  const errors = {};
  const required = new Set(profile.required || []);
  if (profile.ask.includes('language') && !['et', 'ru', 'en'].includes(answer.language) && required.has('language')) errors.language = 'required';
  if (profile.ask.includes('phone')) {
    const value = String(answer.phone ?? '').trim();
    if (value && !normalizePhone(value)) errors.phone = 'phone';
    else if (!value && required.has('phone')) errors.phone = 'required';
  }
  return errors;
}

// only the asked items go to the server
export function payloadOf(questions, answers, profileAnswer, year = new Date().getFullYear()) {
  const cards = Object.fromEntries(questions.cards.map((card) => {
    const answer = answers[card.studentId] || {};
    const { items } = cardQuestions(card, answer, year);
    return [card.studentId, Object.fromEntries(items.map((item) => [item, answer[item]]).filter(([, value]) => value !== undefined && value !== ''))];
  }));
  const profile = Object.fromEntries(questions.profile.ask.map((item) => [item, profileAnswer[item]]).filter(([, value]) => value !== undefined && value !== ''));
  return { cards, profile };
}

// the administrator's list: filter + counts
export function filterRows(rows = [], { item = '', account = '', search = '', onlyMissing = true } = {}) {
  const text = search.trim().toLocaleLowerCase('et');
  return rows.filter((row) => (!onlyMissing || row.missing.length)
    && (!item || row.missing.includes(item))
    && (!account || (account === 'none' ? row.account === 'none' : account === 'any' ? row.account !== 'none' : row.account === account))
    && (!text || row.name.toLocaleLowerCase('et').includes(text) || String(row.teacher || '').toLocaleLowerCase('et').includes(text)));
}

export function itemCounts(rows = []) {
  return Object.fromEntries(Object.keys(ITEM_LABELS).map((item) => [item, rows.filter((row) => row.missing.includes(item)).length]));
}

export const FIELD_NAMES = {
  email: 'e-post', phone: 'telefon', parentName: 'lapsevanema nimi', parentEmail: 'lapsevanema e-post', parentPhone: 'lapsevanema telefon',
  grade: 'klass', birthYear: 'sünniaasta', preferredLanguage: 'keel', slots: 'sobivad ajad',
};
