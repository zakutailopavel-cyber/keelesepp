import { workTimeSummary } from '../../services/firebase/workTime.js';

export function payrollRows(teachers = [], sessions = [], programDays = []) {
  const teacherMap = new Map(teachers.map((teacher) => [teacher.id, teacher]));
  sessions.forEach((session) => {
    if (!teacherMap.has(session.staffUid)) teacherMap.set(session.staffUid, { id: session.staffUid, name: session.staffName || 'Töötaja' });
  });
  programDays.forEach((day) => {
    if (!teacherMap.has(day.staffUid)) teacherMap.set(day.staffUid, { id: day.staffUid, name: day.staffName || 'Töötaja' });
  });
  return [...teacherMap.values()].map((teacher) => {
    const staffSessions = sessions.filter((session) => session.staffUid === teacher.id);
    const staffProgramDays = programDays.filter((day) => day.staffUid === teacher.id);
    const summary = workTimeSummary(staffSessions, staffProgramDays);
    return {
      teacher,
      sessions: staffSessions,
      programDays: staffProgramDays,
      summary,
      pendingCount: staffSessions.filter((session) => session.status === 'closed' && session.approvalStatus === 'pending').length,
      approvedCount: staffSessions.filter((session) => session.approvalStatus === 'approved').length,
      rejectedCount: staffSessions.filter((session) => session.approvalStatus === 'rejected').length,
      openCount: staffSessions.filter((session) => session.status === 'open').length,
    };
  }).filter((row) => row.sessions.length || row.programDays.length || Number(row.teacher.workHourlyRateCents || 0) > 0)
    .sort((left, right) => left.teacher.name.localeCompare(right.teacher.name, 'et'));
}

export function payrollTotals(rows = []) {
  return rows.reduce((total, row) => ({
    approvedMinutes: total.approvedMinutes + row.summary.approvedMinutes,
    pendingMinutes: total.pendingMinutes + row.summary.pendingMinutes,
    programMinutes: total.programMinutes + row.summary.programMinutes,
    approvedPayCents: total.approvedPayCents + row.summary.approvedPayCents,
    pendingCount: total.pendingCount + row.pendingCount,
    openCount: total.openCount + row.openCount,
  }), { approvedMinutes: 0, pendingMinutes: 0, programMinutes: 0, approvedPayCents: 0, pendingCount: 0, openCount: 0 });
}
