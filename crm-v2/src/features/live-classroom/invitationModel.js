export const INVITATION_STATUS = Object.freeze({
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  CANCELLED: 'cancelled',
  CLOSED: 'closed',
});

export const ACTIVE_INVITATION_STATUSES = Object.freeze([
  INVITATION_STATUS.PENDING,
  INVITATION_STATUS.ACCEPTED,
]);

export const DEFAULT_INVITATION_STATUSES = Object.freeze([
  INVITATION_STATUS.PENDING,
]);

const clean = (value) => String(value ?? '').trim();

export function timestampMillis(value) {
  if (value?.toMillis) return value.toMillis();
  if (value?.toDate) return value.toDate().getTime();
  const parsed = Date.parse(String(value || ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizeInvitation(id, data = {}, now = Date.now()) {
  const expiresAtMs = timestampMillis(data.expiresAt);
  const status = clean(data.status) || INVITATION_STATUS.PENDING;
  const expired = status === INVITATION_STATUS.PENDING && Boolean(expiresAtMs) && expiresAtMs <= now;
  return {
    id,
    ...data,
    teacherUid: clean(data.teacherUid),
    teacherName: clean(data.teacherName) || 'Õpetaja',
    studentId: clean(data.studentId),
    studentUid: clean(data.studentUid),
    studentName: clean(data.studentName) || 'Õpilane',
    title: clean(data.title) || 'Õppetund',
    status,
    roomKey: clean(data.roomKey) || id,
    expiresAtMs,
    expired,
  };
}

export function isInvitationRouteUsable(invitation) {
  return Boolean(
    invitation
    && !invitation.expired
    && ACTIVE_INVITATION_STATUSES.includes(invitation.status),
  );
}

export function studentAccountUid(student = {}) {
  const candidates = [student.studentUid, student.linkedUserId, ...(Array.isArray(student.linkedUserIds) ? student.linkedUserIds : [])];
  return clean(candidates.find((value) => clean(value)));
}

export function eligibleInvitationStudents(students = []) {
  return students
    .filter((student) => student?.id && student.active !== false && studentAccountUid(student))
    .map((student) => ({ ...student, invitationStudentUid: studentAccountUid(student) }))
    .sort((left, right) => clean(left.name).localeCompare(clean(right.name), 'et', { sensitivity: 'base' }));
}

export function newestInvitation(invitations = [], statuses = DEFAULT_INVITATION_STATUSES) {
  return [...invitations]
    .filter((invitation) => statuses.includes(invitation.status) && !invitation.expired)
    .sort((left, right) => timestampMillis(right.createdAt) - timestampMillis(left.createdAt))[0] || null;
}
