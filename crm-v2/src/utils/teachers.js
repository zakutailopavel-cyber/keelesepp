const teacherAliases = Object.freeze({
  pavel: 'Pavel Zakutailo',
  jelena: 'Elena Zakutailo',
  elena: 'Elena Zakutailo',
  elizaveta: 'Yelyzaveta Lukiianchuk',
  yelyzaveta: 'Yelyzaveta Lukiianchuk',
  angelina: 'Anhelina Korotka',
  anhelina: 'Anhelina Korotka',
});

export function canonicalTeacherName(value) {
  const name = String(value || '').trim();
  if (!name) return '';
  const lower = name.toLocaleLowerCase('et');
  const alias = Object.keys(teacherAliases).find((key) => lower === key || lower.startsWith(`${key} `));
  return alias ? teacherAliases[alias] : name;
}

export function isSameTeacher(left, right) {
  return canonicalTeacherName(left).toLocaleLowerCase('et') === canonicalTeacherName(right).toLocaleLowerCase('et');
}
