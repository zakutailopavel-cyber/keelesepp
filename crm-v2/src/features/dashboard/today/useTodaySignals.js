import { useMemo, useState } from 'react';
import { useAsyncData } from '../../../hooks/useAsyncData.js';
import { homeworkService } from '../../../services/firebase/homework.js';
import { lessonsService } from '../../../services/firebase/lessons.js';
import { revenuePlansService } from '../../../services/firebase/revenuePlans.js';
import { websiteLeadsService } from '../../../services/firebase/websiteLeads.js';
import { lessonTokensService } from '../../../services/firebase/lessonTokens.js';
import { presenceService } from '../../../services/firebase/presence.js';
import { clientErrorsService } from '../../../services/firebase/clientErrors.js';
import { studentFollowupsService } from '../../../services/firebase/studentFollowups.js';
import { unmarkedLessons } from '../../calendar/unmarkedLessons.js';
import { groupErrors, newInLastDay } from '../../client-errors/clientErrorsModel.js';
import { CALL_WINDOW_DAYS, CALLED_DAYS, addDays, homeworkQueue, lessonsRunningOut, needsCall, newLeads, tallinnClock, todayLessons } from './todayModel.js';

export const HOMEWORK_WINDOW_DAYS = 30;
export const todayApi = {
  // the journal: all teachers for the admin, own lessons for a teacher (shared with the calendar's other readers)
  lessons: (teacherUid) => lessonsService.listForCalendar(teacherUid ? { teacherUid } : {}),
  seen: (students) => presenceService.forStudents(students),
  plans: () => revenuePlansService.list(),
  packages: () => lessonTokensService.listCountedPackages(),
  owed: () => lessonTokensService.listOwed(),
  leads: () => websiteLeadsService.listNew(),
  worksheetsDue: (from, to) => homeworkService.listWorksheetAssignmentsDueBetween(from, to),
  followups: (from) => studentFollowupsService.listSince(from),
  addFollowup: (input, user) => studentFollowupsService.add(input, user),
};

// one source that fails leaves its own count out, never the whole page
const optional = (read, fallback = null) => Promise.resolve().then(read).catch(() => fallback);

// The home page's counts and the data its panels show. Reads only what the attention list counts (the journal, the
// narrow „Täna” reads, the error log); the panels reuse it, so opening one reads nothing more (except „Riskis
// õpilased”, which adds the words). Role scoping as before (2026-11-04): the admin gets everything, a teacher the
// journal of own lessons, the accountant only the lesson packages.
export function useTodaySignals({ isAdmin = false, canViewLearning = false, canViewBalance = false, teacherUid = '', students = [], schedule = [], events = [], homework = [], submissions = [], invoices = [], today, repository = todayApi, errorsService = clientErrorsService, now = () => new Date() }) {
  const state = useAsyncData(async () => {
    const callFrom = addDays(today, -Math.max(CALL_WINDOW_DAYS, HOMEWORK_WINDOW_DAYS));
    const [lessons, seen, plans, packages, owed, leads, worksheets, followups, errors] = await Promise.all([
      canViewLearning ? optional(() => repository.lessons(isAdmin ? '' : teacherUid)) : null,
      isAdmin ? optional(() => repository.seen(students), new Map()) : new Map(),
      isAdmin ? optional(() => repository.plans()) : [],
      canViewBalance ? optional(() => repository.packages()) : [],
      canViewBalance ? optional(() => repository.owed(), []) : [],
      isAdmin ? optional(() => repository.leads()) : [],
      isAdmin ? optional(() => repository.worksheetsDue(callFrom, addDays(today, -1))) : [],
      isAdmin ? optional(() => repository.followups(addDays(today, -CALLED_DAYS)), []) : [],
      isAdmin && errorsService?.listRecent ? optional(() => errorsService.listRecent({ days: 2 })) : null,
    ]);
    return { lessons, seen, plans, packages, owed, leads, worksheets, followups, errors };
  }, [repository, errorsService, today, isAdmin, canViewLearning, canViewBalance, teacherUid, students]);
  const [added, setAdded] = useState([]);
  const data = state.data;
  const clock = tallinnClock(now());

  const lessonsToday = useMemo(() => (canViewLearning ? todayLessons({ events, today, now: clock }) : []), [canViewLearning, events, today, clock]);
  const unmarked = useMemo(() => (canViewLearning && data?.lessons ? unmarkedLessons({ schedule, lessons: data.lessons, today, teacherUid: isAdmin ? '' : teacherUid }) : null), [canViewLearning, data, schedule, today, teacherUid, isAdmin]);
  const queue = useMemo(() => (isAdmin && data ? homeworkQueue({ submissions, homework, worksheets: data.worksheets || [], students, today, windowDays: HOMEWORK_WINDOW_DAYS }) : null), [isAdmin, data, submissions, homework, students, today]);
  const runningOut = useMemo(() => (canViewBalance && data ? lessonsRunningOut({
    students: isAdmin ? students : [],
    plans: isAdmin && data.lessons ? data.plans || [] : [],
    invoices,
    lessons: data.lessons || [],
    events,
    packages: data.packages || [],
    owed: data.owed || [],
    today,
  }) : null), [canViewBalance, isAdmin, data, students, invoices, events, today]);
  const leads = useMemo(() => (isAdmin && data?.leads ? newLeads(data.leads, today) : null), [isAdmin, data, today]);
  const calls = useMemo(() => (isAdmin && data ? needsCall({ students, lessons: data.lessons || [], homework, worksheets: data.worksheets || [], events, seen: data.seen || new Map(), followups: [...(data.followups || []), ...added], today, now: now().getTime() }) : null), [isAdmin, data, students, homework, events, added, today]); // eslint-disable-line react-hooks/exhaustive-deps
  const errors = useMemo(() => (data?.errors ? newInLastDay(groupErrors(data.errors), now().getTime()) : null), [data]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    loading: state.loading,
    data,
    clock,
    lessonsToday,
    unmarked,
    queue,
    runningOut,
    leads,
    calls,
    errors,
    addCall: (record) => setAdded((current) => [...current, record]),
  };
}
