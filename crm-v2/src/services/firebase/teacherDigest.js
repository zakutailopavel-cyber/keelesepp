import { doc, getDoc } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { call } from './learnerEmails.js';
import { teachersService } from './teachers.js';
import { todayIso } from '../../features/tasks/taskModel.js';

// Weekly „Märkimata tunnid” e-mail to teachers (functions/teacher-unmarked-digest-*.js, docs/EMAIL_NOTIFICATIONS.md
// „Õpetajate nädalakiri”). The switch emailSettings/teacherDigest (no document = on) is read here by the administrator
// and written only by staffOperationsApi /teacher-digest/settings; the test copy goes through /teacher-digest/test.
// The teacher reads his own marker teacherUnmarkedDigests/{uid}_{YYYY-Www} for the bell notice.

// ISO 8601 week of a „YYYY-MM-DD” date: „2026-W46” (same as the server's isoWeekId)
export function isoWeekId(date) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() - ((value.getUTCDay() + 6) % 7) + 3);
  const year = value.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(year, 0, 4, 12));
  firstThursday.setUTCDate(firstThursday.getUTCDate() - ((firstThursday.getUTCDay() + 6) % 7) + 3);
  return `${year}-W${String(1 + Math.round((value - firstThursday) / (7 * 86400000))).padStart(2, '0')}`;
}

export const teacherDigestService = {
  async getSettings() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDoc(doc(db, 'emailSettings', 'teacherDigest'));
    return { weeklyUnmarked: !(snapshot.exists() && snapshot.data().weeklyUnmarked === false) };
  },
  saveSettings({ weeklyUnmarked }) {
    return call('/teacher-digest/settings', { weeklyUnmarked: weeklyUnmarked === true });
  },
  sendTest({ teacherUid = '' } = {}) {
    return call('/teacher-digest/test', { teacherUid });
  },
  async listTeachers() {
    return (await teachersService.list()).filter((item) => item.role === 'teacher' && item.disabled !== true);
  },
  // this week's marker of the signed-in teacher, or null (nothing sent this week, or the read is refused)
  async thisWeek({ user, today = todayIso() } = {}) {
    if (!user?.uid) return null;
    const { db } = requireFirebaseClient();
    const week = isoWeekId(today);
    try {
      const snapshot = await getDoc(doc(db, 'teacherUnmarkedDigests', `${user.uid}_${week}`));
      return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
    } catch {
      return null;
    }
  },
};
