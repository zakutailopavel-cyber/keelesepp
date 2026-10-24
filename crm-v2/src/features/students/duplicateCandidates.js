// „Võimalikud duplikaadid” (owner 2026-10-24): pairs of cards that are probably one child. Rules:
//  - the same name (written the same after transliteration: „Влад Повжик” = „Vlad Povzik”);
//  - a similar name (same first name, or a short and a full form) AND the same parent (account, e-mail, phone or
//    name), or the same learner's account, e-mail or phone.
// Siblings share a parent but not a first name, so they are not proposed. A pair the administrator marked „Ei ole
// duplikaat” (students.notDuplicateOf) is not shown again. Archived and merged cards are left out.

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

const clean = (value) => String(value ?? '').trim();
const email = (value) => { const v = clean(value).toLowerCase(); return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? v : ''; };
const phone = (value) => { const d = clean(value).replace(/\D/g, ''); return d.length >= 7 ? d.slice(-8) : ''; };
const uniq = (list) => [...new Set(list.filter(Boolean))];
const shared = (a, b) => a.some((x) => b.includes(x));

function signals(s = {}) {
  const contacts = Array.isArray(s.parentContacts) ? s.parentContacts : [];
  return {
    name: nameKey(s.name),
    accounts: uniq([s.linkedUserId, s.studentUid, ...(s.linkedUserIds || [])].map(clean)),
    emails: uniq([s.email, s.contactEmail, s.studentEmail].map(email)),
    phones: uniq([s.phone, s.studentPhone].map(phone)),
    parentIds: uniq([s.linkedParentId, s.parentUid, s.guardianUid, ...(s.linkedParentIds || [])].map(clean)),
    parentEmails: uniq([s.parentEmail, s.guardianEmail, ...contacts.map((c) => c?.email)].map(email)),
    parentPhones: uniq([s.parentPhone, s.guardianPhone, ...contacts.map((c) => c?.phone)].map(phone)),
    parentNames: uniq([s.parentName, s.guardianName, ...contacts.map((c) => c?.name)].map(nameKey)),
  };
}

export function isOpenCard(s = {}) {
  return Boolean(s.id) && s.active !== false && !s.mergedInto && !s.mergedIntoStudentId && !s.convertedToParent;
}

export function dismissedPair(a = {}, b = {}) {
  return (a.notDuplicateOf || []).includes(b.id) || (b.notDuplicateOf || []).includes(a.id);
}

// one pair: { a, b, score, confidence: 'high' | 'medium', reasons: [{ code, label }] } or null
export function duplicatePair(a = {}, b = {}) {
  if (!a.id || !b.id || a.id === b.id || dismissedPair(a, b)) return null;
  const x = signals(a);
  const y = signals(b);
  const reasons = [];
  const add = (code, label) => reasons.push({ code, label });
  const sameName = Boolean(x.name) && x.name === y.name;
  // a similar name: the same first name (or a short form of it); a shared surname alone is a sibling, not a twin card
  const [fa = ''] = x.name.split(' ');
  const [fb = ''] = y.name.split(' ');
  const similar = sameName || Boolean(fa && fb && (fa === fb || (Math.min(fa.length, fb.length) >= 3 && (fa.startsWith(fb) || fb.startsWith(fa)))));
  if (sameName) add('name', 'Sama nimi');
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
  const score = (sameName ? 50 : similar ? 25 : 0) + (codes.has('account') ? 100 : 0) + (codes.has('email') || codes.has('phone') ? 40 : 0)
    + (codes.has('parent_account') || codes.has('parent_email') ? 40 : 0) + (codes.has('parent_phone') ? 30 : 0) + (codes.has('parent_name') ? 15 : 0);
  return { a, b, score, confidence: score >= 80 ? 'high' : 'medium', reasons };
}

// all pairs among the open cards, the likeliest first
export function duplicateCandidates(students = []) {
  const open = (students || []).filter(isOpenCard);
  const pairs = [];
  for (let i = 0; i < open.length; i += 1) {
    for (let j = i + 1; j < open.length; j += 1) {
      const pair = duplicatePair(open[i], open[j]);
      if (pair) pairs.push(pair);
    }
  }
  return pairs.sort((p, q) => q.score - p.score || clean(p.a.name).localeCompare(clean(q.a.name), 'et'));
}
