// „Võimalikud topeltkaardid” (owner 2026-10-24, extended 2026-11-04): pairs of cards that are probably one person.
// Pure: nothing here reads or writes Firestore. Rules:
//  - the same name after transliteration and spelling variants („Влад Повжик” = „Vlad Povzik”, „Maria B2” = „Mariia
//    B2”, „Jekaterina” = „Ekaterina” = „Katerina”); a level / subject tag in the name („B2”, „En”) is not part of it;
//  - a similar name (same first name with a surname missing on one card, or a short and a full form) AND the same
//    learner's account, e-mail or phone, or the same parent (account, e-mail, phone or name);
//  - the same learner's account alone.
// Two people with the same first name and different surnames are never proposed on the name alone. Siblings share a
// parent but not a first name, so they are not proposed. The same teacher, the same level tag and „one card registered
// by the learner, the other made by the school” only raise the score. One card per person with a subject per
// enrollment is the model (owner 2026-10-20), so two cards with different subjects ARE a candidate („sama inimene, eri
// ained”). A pair the administrator marked „Pole sama inimene” (students.notDuplicateOf) is not shown again. Merged
// cards are left out. An archived card is paired with an active one (two archived cards are not proposed); the
// active card comes first, so the merge keeps it by default.
// Efficiency: cards are compared only inside blocks (same canonical name, same first-name stem, same account, e-mail,
// phone, parent account / e-mail / phone), not all n² pairs.

import { tracksOf } from './subjects.js';

// Cyrillic → Latin for comparing names typed in different alphabets (Влад Повжик ~ Vlad, Ульяна ~ Uljana / Ulyana)
const CYR = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'z', з: 'z', и: 'i', й: 'j', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'c', ш: 's', щ: 's', ъ: '', ы: 'i', ь: '', э: 'e', ю: 'ju', я: 'ja', і: 'i', ї: 'i', є: 'e', ґ: 'g' };
export const nameKey = (name) => String(name || '').toLowerCase().split('').map((c) => CYR[c] ?? c).join('')
  .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[jy]/g, 'i').replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();

// how alike two names are: the same first word (after transliteration) is a strong hint, a shared surname too
export function nameLikeness(a, b) {
  const [fa = '', ...ra] = nameKey(a).split(/\s+/);
  const [fb = '', ...rb] = nameKey(b).split(/\s+/);
  let score = 0;
  if (fa && fb && (fa === fb || fa.startsWith(fb) || fb.startsWith(fa))) score += 2;
  if (ra.some((w) => w.length > 2 && rb.includes(w))) score += 2;
  return score;
}

// level / subject tags admins add to a card's name to tell cards apart („Maria B2”, „Mari En”, „Karl (mat)”)
const TAG = /^(?:[abc][12][+-]?|en|eng|ing|inglise|est|ee|eesti|ru|rus|vene|mat|math|matemaatika|kl|klass)$/;

// one word of a name in its spelling-independent form: „Mariia” = „Maria” = „Марія”, „Jekaterina” = „Ekaterina”,
// „Anastassia” = „Anastasia”, „Natalja” = „Natalia”
function wordSkeleton(word) {
  let w = nameKey(word).replace(/\s+/g, '');
  if (!w) return '';
  w = w.replace(/x/g, 'ks').replace(/ph/g, 'f').replace(/w/g, 'v').replace(/kh/g, 'h').replace(/ck/g, 'k');
  w = w.replace(/^ie(?=[^aeiou])/, 'e'); // Jekaterina / Yekaterina / Екатерина, Jelena / Елена
  w = w.replace(/(.)\1+/g, '$1'); // Anastassia, Mariia, Hanna, Natallia
  w = w.replace(/ei$|ii$/, 'i'); // Andrei / Andrii / Andriy, Sergei / Serhii
  return w;
}

// spelling and language variants of one first name (Russian / Ukrainian / Estonian / English forms); the first one is
// the group's key. Only names that really are one name — a short pet form is a different name unless listed here.
const VARIANTS = [
  ['ekaterina', 'jekaterina', 'yekaterina', 'katerina', 'kateryna'],
  ['maria', 'mariia', 'marija', 'mariya', 'marya'],
  ['aleksandr', 'alexander', 'aleksander', 'oleksandr', 'alexandr'],
  ['aleksandra', 'alexandra', 'oleksandra'],
  ['aleksei', 'alexei', 'alexey', 'aleksey', 'oleksii', 'oleksiy', 'oleksij', 'aleksej'],
  ['elena', 'jelena', 'yelena', 'olena'],
  ['julia', 'yulia', 'iuliia', 'julija', 'yuliya', 'juliia', 'julja'],
  ['natalia', 'natalja', 'nataliya', 'nataliia', 'natalya'],
  ['tatiana', 'tatjana', 'tatyana', 'tetiana', 'tetyana'],
  ['sofia', 'sofiya', 'sophia', 'sofiia'],
  ['anastasia', 'anastassia', 'anastasiya', 'anastasiia'],
  ['jevgeni', 'evgeni', 'evgeny', 'evgenii', 'yevgeny', 'yevhen', 'jevgenij', 'ievgen', 'evgen'],
  ['jevgenia', 'evgenia', 'evgeniya', 'yevheniia', 'jevgenija'],
  ['dmitri', 'dmitry', 'dmitrii', 'dmytro', 'dimitri'],
  ['andrei', 'andrey', 'andrii', 'andriy', 'andrej'],
  ['sergei', 'sergey', 'serhii', 'serhiy', 'sergii', 'sergej'],
  ['mihhail', 'mikhail', 'mihail', 'michail', 'mykhailo'],
  ['viktoria', 'victoria', 'viktoriia', 'viktorija', 'viktoriya'],
  ['ksenia', 'kseniia', 'xenia', 'ksenija', 'kseniya'],
  ['daria', 'dariia', 'darja', 'darya'],
  ['irina', 'iryna'],
  ['olga', 'olha'],
  ['anna', 'ganna'],
  ['vladislav', 'vladyslav'],
  ['jaroslav', 'yaroslav', 'iaroslav'],
  ['jelizaveta', 'elizaveta', 'yelyzaveta', 'jelisaveta', 'elisaveta'],
  ['nikolai', 'nikolay', 'mykola', 'nikolaj'],
  ['anatoli', 'anatoly', 'anatolii', 'anatolij'],
  ['juri', 'yuri', 'yurii', 'iurii', 'jurii', 'jurij'],
  ['pavel', 'pavlo'],
  ['valeria', 'valerija', 'valeriia', 'valeriya'],
  ['arina', 'aryna'],
  ['uljana', 'ulyana', 'uliana', 'ulijana'],
];
const VARIANT_OF = new Map();
for (const group of VARIANTS) {
  const key = wordSkeleton(group[0]);
  for (const name of group) { const s = wordSkeleton(name); if (s && !VARIANT_OF.has(s)) VARIANT_OF.set(s, key); }
}
const firstNameKey = (word) => { const s = wordSkeleton(word); return VARIANT_OF.get(s) || s; };

// a name split into its parts: { first, rest, full, tags } — tags are the level / subject words taken out
export function personName(name) {
  const raw = String(name || '').toLowerCase().replace(/\([^)]*\)/g, (m) => ` ${m.slice(1, -1)} `).split(/[\s,./_-]+/).filter(Boolean);
  const tags = [];
  const words = [];
  for (const word of raw) {
    const plain = word.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9а-яёіїєґ+-]/g, '');
    if (TAG.test(plain)) tags.push(plain.replace(/[+-]$/, ''));
    else if (/^\d+(?:kl|klass)?$/.test(plain)) continue; // a grade or a number
    else words.push(word);
  }
  const plainName = nameKey(words.join(' '));
  const [first = '', ...rest] = words.map((w, i) => (i === 0 ? firstNameKey(w) : wordSkeleton(w))).filter(Boolean);
  const restKeys = rest.filter((w) => w.length > 1); // initials like „S.” stay out of the comparison
  return { first, rest: restKeys, full: [first, ...restKeys].join(' '), plain: plainName, tags: [...new Set(tags)] };
}

const clean = (value) => String(value ?? '').trim();
const email = (value) => { const v = clean(value).toLowerCase(); return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? v : ''; };
const phone = (value) => { const d = clean(value).replace(/\D/g, ''); return d.length >= 7 ? d.slice(-8) : ''; };
const uniq = (list) => [...new Set(list.filter(Boolean))];
const shared = (a, b) => a.some((x) => b.includes(x));

function signals(s = {}) {
  const contacts = Array.isArray(s.parentContacts) ? s.parentContacts : [];
  // an archived card without enrollments is its own (inactive) track: its subject / teacher still count here
  const tracks = tracksOf({ ...s, active: true });
  return {
    name: personName(s.name),
    accounts: uniq([s.linkedUserId, s.studentUid, ...(s.linkedUserIds || [])].map(clean)),
    emails: uniq([s.email, s.contactEmail, s.studentEmail].map(email)),
    phones: uniq([s.phone, s.studentPhone].map(phone)),
    parentIds: uniq([s.linkedParentId, s.parentUid, s.guardianUid, ...(s.linkedParentIds || [])].map(clean)),
    parentEmails: uniq([s.parentEmail, s.guardianEmail, ...contacts.map((c) => c?.email)].map(email)),
    parentPhones: uniq([s.parentPhone, s.guardianPhone, ...contacts.map((c) => c?.phone)].map(phone)),
    parentNames: uniq([s.parentName, s.guardianName, ...contacts.map((c) => c?.name)].map((n) => personName(n).full)),
    teachers: uniq([...tracks.flatMap((t) => [t.teacherUid, t.teacher && `n:${nameKey(t.teacher)}`]), s.teacherUid, ...(s.teacherUids || [])].map(clean)),
    // explicit subjects only (a card without any says nothing about its subject)
    subjects: Array.isArray(s.enrollments) && s.enrollments.some((e) => clean(e?.subject)) || clean(s.subject) ? uniq(tracks.map((t) => t.subject)) : [],
    levels: uniq(tracks.map((t) => clean(t.level).toLowerCase())),
    selfRegistered: String(s.id || '').startsWith('self_') || s.source === 'self' || s.selfRegistered === true,
  };
}

export function isOpenCard(s = {}) {
  return isMergeableCard(s) && s.active !== false;
}

// a card that can still take part in a merge: not merged away, not turned into a parent account; archived is fine
export function isMergeableCard(s = {}) {
  return Boolean(s.id) && !s.mergedInto && !s.mergedIntoStudentId && !s.convertedToParent;
}

export function dismissedPair(a = {}, b = {}) {
  return (a.notDuplicateOf || []).includes(b.id) || (b.notDuplicateOf || []).includes(a.id);
}

// the first names are one name, or one is a short form of the other (≥ 3 letters: „Alex” / „Aleksander”)
function sameFirst(fa, fb) {
  return Boolean(fa && fb && (fa === fb || (Math.min(fa.length, fb.length) >= 3 && (fa.startsWith(fb) || fb.startsWith(fa)))));
}

// one pair: { a, b, score, confidence: 'high' | 'medium', reasons: [{ code, label }] } or null
export function duplicatePair(a = {}, b = {}) {
  if (!a.id || !b.id || a.id === b.id || dismissedPair(a, b)) return null;
  const x = signals(a);
  const y = signals(b);
  const reasons = [];
  const add = (code, label) => reasons.push({ code, label });
  const sameName = Boolean(x.name.full) && x.name.full === y.name.full;
  // different surnames on both cards: two people unless an account says otherwise
  const surnamesDiffer = x.name.rest.length && y.name.rest.length && !shared(x.name.rest, y.name.rest);
  const similar = sameName || (!surnamesDiffer && sameFirst(x.name.first, y.name.first));
  if (sameName) add('name', x.name.plain === y.name.plain ? 'Sama nimi' : 'Sama nimi (eri kirjapilt)');
  else if (similar) add('similar_name', 'Sarnane nimi');
  if (shared(x.accounts, y.accounts)) add('account', 'Sama õpilase konto');
  if (similar && shared(x.emails, y.emails)) add('email', 'Sama e-post');
  if (similar && shared(x.phones, y.phones)) add('phone', 'Sama telefon');
  if (similar && shared(x.parentIds, y.parentIds)) add('parent_account', 'Sama lapsevanema konto');
  if (similar && shared(x.parentEmails, y.parentEmails)) add('parent_email', 'Sama lapsevanema e-post');
  if (similar && shared(x.parentPhones, y.parentPhones)) add('parent_phone', 'Sama lapsevanema telefon');
  if (similar && shared(x.parentNames, y.parentNames)) add('parent_name', 'Sama lapsevanema nimi');
  const codes = new Set(reasons.map((r) => r.code));
  const linked = ['account', 'email', 'phone', 'parent_account', 'parent_email', 'parent_phone', 'parent_name'].some((code) => codes.has(code));
  if (!sameName && !(similar && linked) && !codes.has('account')) return null;
  // supporting signals: only raise the score of a pair that is already a candidate
  const sameTeacher = shared(x.teachers, y.teachers);
  if (sameTeacher) add('teacher', 'Sama õpetaja');
  const tag = x.name.tags.find((t) => y.name.tags.includes(t));
  if (tag) add('level_tag', `Sama märge nimes (${tag.toUpperCase()})`);
  else if (shared(x.levels, y.levels)) add('level', 'Sama tase');
  const accountPattern = (x.accounts.length > 0) !== (y.accounts.length > 0) && (x.selfRegistered || y.selfRegistered);
  if (accountPattern) add('self_registered', 'Üks kaart on õpilase enda registreeritud, teisel kontot pole');
  if (x.subjects.length && y.subjects.length && !shared(x.subjects, y.subjects)) add('subjects', `Sama inimene, eri ained (${x.subjects.join(', ')} / ${y.subjects.join(', ')})`);
  const score = (sameName ? 50 : similar ? 25 : 0) + (codes.has('account') ? 100 : 0) + (codes.has('email') || codes.has('phone') ? 40 : 0)
    + (codes.has('parent_account') || codes.has('parent_email') ? 40 : 0) + (codes.has('parent_phone') ? 30 : 0) + (codes.has('parent_name') ? 15 : 0)
    + (sameTeacher ? 15 : 0) + (tag ? 10 : shared(x.levels, y.levels) ? 5 : 0) + (accountPattern ? 10 : 0);
  return { a, b, score, confidence: score >= 80 ? 'high' : 'medium', reasons };
}

// the blocks a card belongs to: only cards sharing a block are compared
function blockKeys(s) {
  const x = signals(s);
  const keys = [];
  if (x.name.full) keys.push(`n:${x.name.full}`);
  if (x.name.first.length >= 3) keys.push(`f:${x.name.first.slice(0, 3)}`);
  else if (x.name.first) keys.push(`f:${x.name.first}`);
  x.accounts.forEach((v) => keys.push(`a:${v}`));
  x.emails.forEach((v) => keys.push(`e:${v}`));
  x.phones.forEach((v) => keys.push(`p:${v}`));
  x.parentIds.forEach((v) => keys.push(`pa:${v}`));
  x.parentEmails.forEach((v) => keys.push(`pe:${v}`));
  x.parentPhones.forEach((v) => keys.push(`pp:${v}`));
  return keys;
}

// all pairs with at least one active card, the likeliest first; an archived card is always the second one
export function duplicateCandidates(students = []) {
  const cards = (students || []).filter(isMergeableCard);
  const blocks = new Map();
  cards.forEach((card, index) => {
    for (const key of blockKeys(card)) { if (!blocks.has(key)) blocks.set(key, []); blocks.get(key).push(index); }
  });
  const seen = new Set();
  const pairs = [];
  for (const members of blocks.values()) {
    for (let m = 0; m < members.length; m += 1) {
      for (let n = m + 1; n < members.length; n += 1) {
        const key = `${members[m]}|${members[n]}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const [first, second] = [cards[members[m]], cards[members[n]]];
        const [a, b] = first.active === false ? [second, first] : [first, second];
        if (a.active === false) continue;
        const pair = duplicatePair(a, b);
        if (pair) pairs.push(pair);
      }
    }
  }
  return pairs.sort((p, q) => q.score - p.score || clean(p.a.name).localeCompare(clean(q.a.name), 'et'));
}

// a contact shown without giving it away: „m•••@gmail.com”, „••• •• 45”
export function maskEmail(value) {
  const v = email(value);
  if (!v) return '';
  const [user, domain] = v.split('@');
  return `${user.slice(0, 1)}•••@${domain}`;
}

export function maskPhone(value) {
  const d = clean(value).replace(/\D/g, '');
  if (d.length < 4) return '';
  return `•••• ${d.slice(-2)}`;
}
