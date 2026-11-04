import { useMemo, useState } from 'react';
import LessonHints from './LessonHints.jsx';
import { useMembersRecentLessons } from './useRecentLessons.js';
import { lessonHints } from './warmup.js';

/**
 * „Täna harjutada” in a group room (teacher only): the same box as in the 1:1 room, with one chip per member who has
 * an analysed earlier lesson (group lessons are recorded per student, so each member has his own analysis). The
 * teacher reads one member at a time; nothing goes onto the shared board. „Soojendus” is not offered here: it puts
 * one student's own error sentences on the board, which in a group the others would see.
 * `members` = [{ studentId, name, invitationId }] (invitationId = the member's invitation into this room).
 */
export default function GroupLessonHints({ members = [], user, hidden = false, service }) {
  const studentIds = members.map((member) => member.studentId);
  const recent = useMembersRecentLessons({ studentIds, user, ...(service ? { service } : {}) });
  const withHints = useMemo(() => members.filter((member) => lessonHints(recent.byStudent[member.studentId] || [], { currentInvitationId: member.invitationId || '' })), [members, recent.byStudent]);
  const [picked, setPicked] = useState('');
  if (hidden || recent.loading || !withHints.length) return null;
  const current = withHints.find((member) => member.studentId === picked) || withHints[0];
  const switcher = <div className="lesson-hints__who" role="group" aria-label="Kelle vihjed">
    {withHints.map((member) => <button key={member.studentId} type="button" aria-pressed={member.studentId === current.studentId} onClick={() => setPicked(member.studentId)}>{member.name || 'Õpilane'}</button>)}
  </div>;
  return <LessonHints invitation={{ id: current.invitationId || '', studentId: current.studentId }} lessons={recent.byStudent[current.studentId] || []} switcher={switcher} />;
}
