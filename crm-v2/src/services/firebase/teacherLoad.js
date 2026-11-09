import { collection, getDocs, query, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { groupsService } from './groups.js';
import { normalizeLesson } from './lessons.js';
import { normalizeSubmission } from './homework.js';
import { scheduleService } from './schedule.js';
import { studentsService } from './students.js';
import { teacherAvailabilityService } from './teacherAvailability.js';
import { teachersService } from './teachers.js';
import { shiftDate } from '../../features/calendar/calendarView.js';
import { REVIEW_DAYS } from '../../features/calendar/unmarkedLessons.js';
import { SUBMISSION_LOOKBACK_DAYS } from '../../features/teachers/teacherLoad.js';

// „Õpetajate koormus” (admin only): every read the page needs, read only. The admin's rules already allow all of it
// (users role in admin/teacher, students, schedule, groups, lessons, teacherAvailability, worksheetAssignments,
// exerciseResults). Journal and submissions are read by single-field date ranges (no new index):
// - lessons: `date` from min(period start, today − 60 days) to max(period end, today);
// - worksheetAssignments / exerciseResults: `completedAt >=` today − 180 days (ISO strings, as the app writes them).
// The calendar (schedule, groups) is read whole, as every calendar view does: weekly series have no date to range on.
async function lessonsBetween(from, to) {
  const { db } = requireFirebaseClient();
  const snapshot = await getDocs(query(collection(db, 'lessons'), where('date', '>=', from), where('date', '<=', to)));
  return snapshot.docs.map((item) => normalizeLesson(item.id, item.data()));
}

async function submissionsSince(fromIso) {
  const { db } = requireFirebaseClient();
  const [sheets, exercises] = await Promise.all([
    getDocs(query(collection(db, 'worksheetAssignments'), where('completedAt', '>=', fromIso))),
    getDocs(query(collection(db, 'exerciseResults'), where('completedAt', '>=', fromIso))),
  ]);
  return [
    // only what the student handed in (Kodutööd's rule): a done sheet, or one already reviewed
    ...sheets.docs.map((item) => normalizeSubmission(item.id, item.data(), 'worksheet')).filter((item) => item.source.status === 'done' || item.reviewStatus === 'reviewed'),
    ...exercises.docs.map((item) => normalizeSubmission(item.id, item.data(), 'exercise')),
  ];
}

export const teacherLoadService = {
  // lessonsOnly (payroll, owner 2026-11-09): the lesson counts and the pay estimate only — free time and waiting works
  // are not read
  async load({ period, today, lessonsOnly = false }) {
    const journalFrom = [period.from, shiftDate(today, -REVIEW_DAYS)].sort()[0];
    const journalTo = [period.to, today].sort()[1];
    const reviewFrom = new Date(`${shiftDate(today, -SUBMISSION_LOOKBACK_DAYS)}T00:00:00Z`).toISOString();
    const settle = (promise, fallback) => promise.catch(() => fallback);
    const [teachers, students, schedule, groups, lessons, availability, submissions] = await Promise.all([
      teachersService.list(),
      studentsService.list({ status: 'active', pageSize: 500, exhaustive: true }),
      scheduleService.list(),
      settle(groupsService.list({}), []),
      lessonsBetween(journalFrom, journalTo),
      lessonsOnly ? [] : settle(teacherAvailabilityService.list(), []),
      lessonsOnly ? [] : settle(submissionsSince(reviewFrom), null),
    ]);
    return { teachers, students: students.items || [], schedule, groups, lessons, availability, submissions: submissions || [], reviewsFailed: submissions === null };
  },
};
