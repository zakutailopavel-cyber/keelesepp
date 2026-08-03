export function isStudentFieldHidden(student, field) {
  return student?.hiddenFields?.[field] === true;
}

export function visibleStudentValue(student, field) {
  if (isStudentFieldHidden(student, field)) return '';
  return String(student?.[field] ?? '').trim();
}

export function studentValueLabel(student, field, fallback = '—') {
  if (isStudentFieldHidden(student, field)) return 'Peidetud';
  return visibleStudentValue(student, field) || fallback;
}
