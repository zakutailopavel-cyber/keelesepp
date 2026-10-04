const decided = (student) => typeof student?.recordingConsent === 'boolean';
const hasParentAccount = (student) => Boolean(student?.linkedParentId || student?.parentUid || student?.guardianUid
  || (Array.isArray(student?.linkedParentIds) && student.linkedParentIds.length));

// Who is asked: a card with a linked parent account is answered by the parent (minors); otherwise by the student.
export function consentQuestionFor(students = [], role = 'student') {
  return students.filter((student) => student?.id && !decided(student) && (role === 'parent' || !hasParentAccount(student)));
}
