import { groupCalendarEvents } from '../../calendar/calendarView.js';
import { addDays, daysFrom, todayLessonCount, homeworkQueue, lessonsRunningOut, needsCall, newLeads, tallinnClock, tallinnDay, todayLessons } from './todayModel.js';

const DAY = 86400000;

describe('Tallinn days', () => {
  it('uses the school day, not UTC: 23:30 UTC on 4 Nov is already 5 Nov in Tallinn', () => {
    expect(tallinnDay(new Date('2026-11-04T23:30:00Z'))).toBe('2026-11-05');
    expect(tallinnClock(new Date('2026-11-04T23:30:00Z'))).toBe('01:30');
    expect(tallinnDay(new Date('2026-07-01T21:30:00Z'))).toBe('2026-07-02'); // summer time +3
  });
  it('adds days across months', () => {
    expect(addDays('2026-10-30', 3)).toBe('2026-11-02');
    expect(addDays('2026-11-02', -3)).toBe('2026-10-30');
    expect(daysFrom('2026-11-04', 3)).toEqual(['2026-11-04', '2026-11-05', '2026-11-06']);
  });
});

describe('todayLessons', () => {
  const events = [
    { id: 'w1', recurring: true, day: 'Wed', startDate: '2026-09-02', time: '09:00', duration: 60, studentId: 's1', studentName: 'Mari', teacher: 'Kati', status: 'Planeeritud', online: true },
    { id: 'o1', date: '2026-11-04', time: '12:30', duration: 45, studentId: 's2', studentName: 'Jaan', teacher: 'Kati', roomName: 'Klass 1', status: 'Planeeritud' },
    { id: 'o2', date: '2026-11-04', time: '15:00', duration: 60, studentId: 's3', studentName: 'Ott', teacher: 'Mart', status: 'Planeeritud' },
    { id: 'o3', date: '2026-11-04', time: '16:00', studentId: 's4', studentName: 'Ann', teacher: 'Mart', status: 'Tühistatud' },
    { id: 'o4', date: '2026-11-05', time: '10:00', studentId: 's5', studentName: 'Homme' },
  ];
  it('lists today (not tomorrow, not cancelled) with weekly series, place, phase and the calendar link', () => {
    const list = todayLessons({ events, today: '2026-11-04', now: '12:40' });
    expect(list.map((item) => item.studentName)).toEqual(['Mari', 'Jaan', 'Ott']); // the calendar leaves a cancelled one-off out
    expect(list[0]).toMatchObject({ time: '09:00', end: '10:00', place: 'Veebitund', online: true, phase: 'past' });
    expect(list[1]).toMatchObject({ place: 'Klass 1', phase: 'now', end: '13:15' });
    expect(list[2]).toMatchObject({ place: '', phase: 'later' });
    expect(list[0].path).toBe(`/calendar?lesson=${encodeURIComponent('w1:2026-11-04|2026-11-04')}`);
  });
});

describe('todayLessons — cancelled and missed lessons, the calendar\'s way (owner 2026-11-28)', () => {
  // Saturday 2026-11-28: Olivia's weekly 10:00 series, marked „Puudus_p” ahead in the journal by the teacher
  const series = (id, time, extra = {}) => ({ id, recurring: true, day: 'Sat', startDate: '2026-10-10', time, duration: 60, studentId: `st-${id}`, studentName: id, teacher: 'Yelyzaveta', status: 'Planeeritud', online: true, ...extra });
  const record = (scheduleId, status) => ({ id: `schedule_${scheduleId}_2026-11-28`, scheduleId, studentId: `st-${scheduleId}`, date: '2026-11-28', status });
  const at = (list, name) => list.find((item) => item.studentName === name);

  it('a weekly-series occurrence cancelled on its day (occurrenceStatuses) is „cancelled”, not running', () => {
    const list = todayLessons({ events: [series('Olivia', '10:00', { occurrenceStatuses: { '2026-11-28': { status: 'Tühistatud' } } })], today: '2026-11-28', now: '10:20' });
    expect(list[0]).toMatchObject({ phase: 'cancelled', status: 'Tühistatud', marked: false });
  });

  it('a journal record decides first: „Tühistatud” is cancelled, „Puudus_p” / „Puudus_eta” are absent, never „now”', () => {
    const events = [series('Olivia', '10:00'), series('Aleksandra', '11:00'), series('Mari', '10:00'), series('Jaan', '10:00')];
    const records = [record('Olivia', 'Puudus_p'), record('Aleksandra', 'Puudus_p'), record('Mari', 'Tühistatud'), record('Jaan', 'Puudus_eta')];
    const list = todayLessons({ events, today: '2026-11-28', now: '10:20', records });
    expect(at(list, 'Olivia')).toMatchObject({ phase: 'absent', status: 'Puudus_p', statusLabel: 'Puudus, teatas ette', marked: true });
    expect(at(list, 'Aleksandra')).toMatchObject({ phase: 'absent' }); // ahead (11:00) but missed: not „later” either
    expect(at(list, 'Mari')).toMatchObject({ phase: 'cancelled', status: 'Tühistatud' });
    expect(at(list, 'Jaan')).toMatchObject({ phase: 'absent', statusLabel: 'Puudus, ei teatanud (tasuline)' });
    // without the journal (not loaded yet) the same lessons are the plain plan
    expect(at(todayLessons({ events, today: '2026-11-28', now: '10:20' }), 'Olivia').phase).toBe('now');
  });

  it('„Tunnid täna” counts only lessons that are taught: not cancelled, the student not absent', () => {
    const events = [series('Olivia', '10:00'), series('Aleksandra', '11:00'), series('Mari', '12:00'), series('Jaan', '13:00', { occurrenceStatuses: { '2026-11-28': { status: 'Tühistatud' } } })];
    const records = [record('Olivia', 'Puudus_p'), record('Aleksandra', 'Tühistatud')];
    expect(todayLessonCount(todayLessons({ events, today: '2026-11-28', now: '10:20', records }))).toBe(1);
    expect(todayLessonCount(todayLessons({ events, today: '2026-11-28', now: '10:20' }))).toBe(3); // journal not loaded yet
  });
  it('a record of another student or another day does not touch the lesson', () => {
    const list = todayLessons({ events: [series('Olivia', '10:00')], today: '2026-11-28', now: '10:20', records: [{ ...record('Olivia', 'Tühistatud'), date: '2026-11-21' }, { ...record('Olivia', 'Tühistatud'), studentId: 'other' }] });
    expect(list[0].phase).toBe('now');
  });

  it('a group lesson cancelled on its day (the group lesson\'s occurrenceStatuses) is „cancelled”', () => {
    const groups = [{ id: 'g1', name: 'Laupäeva grupp', teacher: 'Kati', students: ['a', 'b'], lessons: [{ id: 'l1', day: 'Sat', time: '10:00', duration: 60, recurring: true, startDate: '2026-10-03', occurrenceStatuses: { '2026-11-28': { status: 'Tühistatud' } } }] }];
    const list = todayLessons({ events: groupCalendarEvents(groups), today: '2026-11-28', now: '10:20' });
    expect(list[0]).toMatchObject({ isGroup: true, phase: 'cancelled' });
  });
});

describe('homeworkQueue', () => {
  const students = [{ id: 's1', name: 'Mari', teacher: 'Kati', active: true }, { id: 's2', name: 'Jaan', teacher: 'Mart', active: true }, { id: 'old', active: false, teacher: 'Kati' }];
  it('counts waiting reviews and overdue tasks per teacher, a linked sheet once, active cards only', () => {
    const result = homeworkQueue({
      students,
      today: '2026-11-04',
      submissions: [{ studentId: 's1', reviewStatus: 'pending' }, { studentId: 's1', reviewStatus: 'reviewed' }, { studentId: 's2', reviewStatus: 'pending' }, { studentId: 'old', reviewStatus: 'pending' }],
      worksheets: [
        { id: 'w1', studentId: 's1', dueDate: '2026-11-01', status: 'new' },
        { id: 'w2', studentId: 's1', dueDate: '2026-11-01', status: 'done' },
        { id: 'w3', studentId: 's1', dueDate: '2026-11-04', status: 'new' }, // due today: not late yet
      ],
      homework: [
        { id: 'h1', studentId: 's1', due: '2026-11-01', status: 'Ootel', worksheetAssignmentId: 'w1' }, // the sheet's deadline
        { id: 'h2', studentId: 's2', due: '2026-11-02', status: 'Ootel' },
        { id: 'h3', studentId: 's2', due: '2026-11-02', status: 'Tehtud' },
        { id: 'h4', studentId: 's2', due: '2026-08-01', status: 'Ootel' }, // older than the window
        { id: 'h5', studentId: 'old', due: '2026-11-02', status: 'Ootel' },
      ],
    });
    expect(result).toEqual({ waiting: 2, overdue: 2, byTeacher: [{ teacher: 'Kati', waiting: 1, overdue: 1 }, { teacher: 'Mart', waiting: 1, overdue: 1 }] });
  });
});

describe('lessonsRunningOut', () => {
  const student = { id: 's1', name: 'Mari', active: true };
  const plan = { studentId: 's1', billingMode: 'advance', lessonMinutes: 60, active: true };
  const weekly = { id: 'w1', recurring: true, day: 'Wed', startDate: '2026-09-02', time: '10:00', duration: 60, studentId: 's1', status: 'Planeeritud' };
  it('monthly: flags fewer paid lessons left than the calendar still has this month', () => {
    // November invoice paid 2 lessons; 1 held on 4.11 → 1 left, but 11.11, 18.11, 25.11 are still planned
    const invoices = [{ id: 'i1', studentId: 's1', planMonth: '2026-11', plannedUnits: 2, status: 'Ootel' }];
    const lessons = [{ id: 'l1', studentId: 's1', date: '2026-11-04', status: 'Toimunud', duration: 60 }];
    const list = lessonsRunningOut({ students: [student], plans: [plan], invoices, lessons, events: [weekly], today: '2026-11-04' });
    expect(list).toEqual([expect.objectContaining({ kind: 'month', studentId: 's1', left: 1, planned: 3 })]);
  });
  it('monthly: a lesson ahead cancelled or missed in the journal (marked ahead) is not still to come (owner 2026-11-28)', () => {
    const invoices = [{ id: 'i1', studentId: 's1', planMonth: '2026-11', plannedUnits: 2, status: 'Ootel' }];
    const lessons = [{ id: 'l1', studentId: 's1', date: '2026-11-04', status: 'Toimunud', duration: 60 }];
    const record = (date, status, extra = {}) => ({ id: `r-${date}`, scheduleId: 'w1', studentId: 's1', date, status, ...extra });
    // without the journal 11.11, 18.11 and 25.11 are all ahead; an absence marked ahead (Puudus_p) is not a lesson to
    // give, and a series day cancelled on the series is not either
    const series = { ...weekly, occurrenceStatuses: { '2026-11-25': { status: 'Tühistatud' } } };
    // the series cancellation alone: 11.11 and 18.11 still ahead, 1 paid left → flagged
    expect(lessonsRunningOut({ students: [student], plans: [plan], invoices, lessons, events: [series], today: '2026-11-04' }))
      .toEqual([expect.objectContaining({ kind: 'month', left: 1, planned: 2 })]);
    // + the absence on 18.11 marked ahead in the journal: only 11.11 ahead, the 1 paid lesson covers it → not flagged
    expect(lessonsRunningOut({ students: [student], plans: [plan], invoices, lessons: [...lessons, record('2026-11-18', 'Puudus_p', { billingStatus: 'free' })], events: [series], today: '2026-11-04' })).toEqual([]);
  });
  it('monthly per subject: a subject on lesson packages has no monthly balance (owner 2026-11-06)', () => {
    const kid = { id: 'k', name: 'Kristjan', active: true, subject: 'Eesti keel', enrollments: [{ subject: 'Eesti keel' }, { subject: 'Inglise keel' }] };
    const plan = { studentId: 'k', billingMode: 'advance', lessonMinutes: 60, lessonPriceCents: 2000, active: true, subjectBilling: { 'Inglise keel': { billingMode: 'package' } } };
    const invoices = [{ id: 'i', planMonth: '2026-11', status: 'Ootel', combined: true, studentIds: ['k'], cardParts: [{ studentId: 'k', subject: 'Eesti keel', plannedUnits: 1 }] }];
    const events = [{ ...weekly, studentId: 'k', subject: 'Eesti keel' }, { ...weekly, id: 'w2', day: 'Thu', studentId: 'k', subject: 'Inglise keel' }];
    const list = lessonsRunningOut({ students: [kid], plans: [plan], invoices, lessons: [], events, today: '2026-11-04' });
    expect(list).toEqual([expect.objectContaining({ kind: 'month', studentId: 'k', subject: 'Eesti keel', left: 1, planned: 4 })]);
  });
  it('monthly: enough paid lessons is not listed', () => {
    const invoices = [{ id: 'i1', studentId: 's1', planMonth: '2026-11', plannedUnits: 4, status: 'Ootel' }];
    expect(lessonsRunningOut({ students: [student], plans: [plan], invoices, lessons: [], events: [weekly], today: '2026-11-04' })).toEqual([]);
  });
  it('packages: low, empty and owed; archived cards and full packages are left out; owed first', () => {
    const packages = [
      { id: 'p1', studentId: 's1', status: 'active', grantedCredits: 10, consumedCredits: 8, balanceCredits: 2 },
      { id: 'p2', studentId: 's2', status: 'active', grantedCredits: 10, consumedCredits: 2, balanceCredits: 8 },
      { id: 'p3', studentId: 's3', status: 'depleted', grantedCredits: 5, consumedCredits: 5, balanceCredits: 0 },
      { id: 'p4', studentId: 'old', status: 'depleted', grantedCredits: 5, consumedCredits: 5, balanceCredits: 0 },
    ];
    const students = [student, { id: 's2', name: 'Jaan', active: true }, { id: 's3', name: 'Ott', active: true }, { id: 's4', name: 'Ann', active: true }];
    const owed = [{ studentId: 's4', status: 'needs_attention', lessonDate: '2026-11-03' }];
    const list = lessonsRunningOut({ students, packages, owed, today: '2026-11-04' });
    expect(list.map((item) => [item.studentName, item.left, item.owed])).toEqual([['Ann', 0, 1], ['Ott', 0, 0], ['Mari', 2, 0]]);
  });
  it('an accountant without the cards: packages by their own student name', () => {
    const list = lessonsRunningOut({ packages: [{ studentId: 'x', studentName: 'Pakett Mari', status: 'active', grantedCredits: 4, consumedCredits: 3, balanceCredits: 1 }], today: '2026-11-04' });
    expect(list[0]).toMatchObject({ studentName: 'Pakett Mari', kind: 'package', left: 1 });
  });
});

describe('newLeads', () => {
  it('keeps only new enquiries, newest first, with the days waited (Tallinn day)', () => {
    const list = newLeads([
      { id: 'a', status: 'new', createdAt: '2026-11-01T09:00:00.000Z', name: 'A' },
      { id: 'b', status: 'contacted', createdAt: '2026-11-03T09:00:00.000Z' },
      { id: 'c', status: 'new', createdAt: '2026-11-03T22:30:00.000Z', name: 'C' }, // 4.11 00:30 in Tallinn
    ], '2026-11-04');
    expect(list.map((lead) => [lead.id, lead.days])).toEqual([['c', 0], ['a', 3]]);
  });
});

describe('needsCall', () => {
  const now = Date.parse('2026-11-04T10:00:00Z');
  const today = '2026-11-04';
  const booked = (studentId) => ({ id: `w-${studentId}`, recurring: true, day: 'Mon', startDate: '2026-09-07', time: '10:00', studentId, status: 'Planeeritud' });
  const base = {
    today,
    now,
    students: [
      { id: 'ok', name: 'Korras', active: true },
      { id: 'away', name: 'Kadunud', active: true },
      { id: 'lazy', name: 'Laisk', active: true },
      { id: 'absent', name: 'Puuduja', active: true },
      { id: 'free', name: 'Tunnita', active: true },
      { id: 'paused', name: 'Paus', active: true, planningPausedUntil: '2026-12-01' },
      { id: 'self', name: 'Ise', active: true, isSelfStudent: true },
      { id: 'gone', name: 'Arhiiv', active: false },
    ],
    events: ['ok', 'away', 'lazy', 'absent'].map(booked),
    seen: new Map([['ok', { lastSeenAt: now - 2 * DAY }], ['away', { lastSeenAt: now - 30 * DAY }]]),
    lessons: [
      { studentId: 'absent', date: '2026-10-20', status: 'Puudus_eta' },
      { studentId: 'absent', date: '2026-10-27', status: 'Puudus_p' },
      { studentId: 'ok', date: '2026-10-27', status: 'Puudus_p' },
      { studentId: 'ok', date: '2026-09-01', status: 'Puudus_p' }, // outside 21 days
    ],
    homework: [
      { id: 'h1', studentId: 'lazy', due: '2026-10-30', status: 'Ootel' },
      { id: 'h2', studentId: 'lazy', due: '2026-11-03', status: 'Ootel', worksheetAssignmentId: 'w1' },
      { id: 'h3', studentId: 'ok', due: '2026-11-01', status: 'Ootel' },
    ],
    worksheets: [{ id: 'w1', studentId: 'lazy', dueDate: '2026-11-03', status: 'new' }],
  };
  it('lists each signal with its reason; paused, self-study, archived and quiet students are left out', () => {
    const { list, called } = needsCall(base);
    const reasons = Object.fromEntries(list.map((entry) => [entry.student.id, entry.reasons.map((reason) => reason.code)]));
    expect(reasons).toEqual({ away: ['notSeen'], lazy: ['homework'], absent: ['absences'], free: ['noLesson'] });
    expect(list.find((entry) => entry.student.id === 'away').reasons[0].text).toBe('pole 30 päeva sisse loginud');
    expect(list.find((entry) => entry.student.id === 'lazy').reasons[0].text).toBe('2 kodutööd tegemata');
    expect(list.find((entry) => entry.student.id === 'absent').reasons[0].text).toBe('2 puudumist 3 nädalaga');
    expect(called).toEqual([]);
  });
  it('a group lesson ahead counts as booked; a cancelled one does not', () => {
    const events = [{ id: 'g', isGroup: true, studentIds: ['free'], date: '2026-11-10', time: '10:00' }, { id: 'x', studentId: 'self', date: '2026-11-06', status: 'Tühistatud' }];
    const { list } = needsCall({ ...base, events: [...base.events, ...events] });
    expect(list.some((entry) => entry.student.id === 'free')).toBe(false);
  });
  it('a lesson ahead cancelled or missed in the journal does not count as booked (owner 2026-11-28)', () => {
    // „free” has one lesson ahead (9.11), but the journal says it is cancelled / the student is away; „ok” stays booked
    const ahead = { id: 'one', date: '2026-11-09', time: '10:00', studentId: 'free', status: 'Planeeritud' };
    const journal = (status) => [...base.lessons, { id: 'r', scheduleId: 'one', studentId: 'free', date: '2026-11-09', status }];
    ['Tühistatud', 'Puudus_p', 'Puudus_eta'].forEach((status) => {
      const { list } = needsCall({ ...base, events: [...base.events, ahead], lessons: journal(status) });
      expect(list.find((entry) => entry.student.id === 'free')?.reasons.map((reason) => reason.code)).toContain('noLesson');
    });
    expect(needsCall({ ...base, events: [...base.events, ahead] }).list.some((entry) => entry.student.id === 'free')).toBe(false);
    // a weekly series cancelled on its only day in the window (occurrenceStatuses) is not booked either
    const series = { ...base.events[0], id: 'w-free', studentId: 'free', occurrenceStatuses: { '2026-11-09': { status: 'Tühistatud' }, '2026-11-16': { status: 'Tühistatud' } } };
    expect(needsCall({ ...base, events: [...base.events, series] }).list.some((entry) => entry.student.id === 'free')).toBe(true);
  });
  it('„Helistasin” in the last 14 days moves the student to called; an older call stays as a hint', () => {
    const followups = [
      { studentId: 'away', at: new Date(now - 2 * DAY).toISOString(), note: 'ema helistab tagasi' },
      { studentId: 'free', at: new Date(now - 20 * DAY).toISOString(), note: 'vana' },
    ];
    const { list, called } = needsCall({ ...base, followups });
    expect(called.map((entry) => [entry.student.id, entry.call.note])).toEqual([['away', 'ema helistab tagasi']]);
    expect(list.find((entry) => entry.student.id === 'free').call.note).toBe('vana');
  });
});
