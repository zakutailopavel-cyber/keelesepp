import { eligibleInvitationStudents, INVITATION_STATUS, newestInvitation, normalizeInvitation, studentAccountUid } from './invitationModel.js';

describe('live lesson invitation model', () => {
  it('uses only an explicit student account link', () => {
    expect(studentAccountUid({ studentUid: 'student-1', linkedParentId: 'parent-1' })).toBe('student-1');
    expect(studentAccountUid({ linkedUserIds: ['student-2'], linkedParentId: 'parent-2' })).toBe('student-2');
    expect(studentAccountUid({ linkedParentId: 'parent-only' })).toBe('');
  });

  it('offers only active students that can receive the invitation', () => {
    expect(eligibleInvitationStudents([
      { id: 'b', name: 'Mari', active: true, linkedUserId: 'student-b' },
      { id: 'a', name: 'Anna', active: true, studentUid: 'student-a' },
      { id: 'c', name: 'Peeter', active: false, studentUid: 'student-c' },
      { id: 'd', name: 'Kati', active: true, linkedParentId: 'parent-d' },
    ]).map((student) => student.id)).toEqual(['a', 'b']);
  });

  it('marks an unanswered invitation expired without rewriting its stored status', () => {
    const invitation = normalizeInvitation('invite-1', { status: INVITATION_STATUS.PENDING, expiresAt: '2026-09-28T10:00:00.000Z' }, Date.parse('2026-09-28T10:01:00.000Z'));
    expect(invitation).toMatchObject({ id: 'invite-1', status: 'pending', expired: true });
  });

  it('selects the newest usable pending invitation', () => {
    const invitations = [
      normalizeInvitation('old', { status: 'pending', createdAt: '2026-09-28T10:00:00Z', expiresAt: '2026-09-28T11:00:00Z' }, Date.parse('2026-09-28T10:30:00Z')),
      normalizeInvitation('new', { status: 'pending', createdAt: '2026-09-28T10:20:00Z', expiresAt: '2026-09-28T11:00:00Z' }, Date.parse('2026-09-28T10:30:00Z')),
      normalizeInvitation('declined', { status: 'declined', createdAt: '2026-09-28T10:25:00Z', expiresAt: '2026-09-28T11:00:00Z' }, Date.parse('2026-09-28T10:30:00Z')),
    ];
    expect(newestInvitation(invitations)?.id).toBe('new');
  });
});

