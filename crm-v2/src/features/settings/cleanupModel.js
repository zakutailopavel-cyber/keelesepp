import { buildConversations } from '../messages/messagesModel.js';
import { isHomeworkOpen } from '../homework/homeworkStatus.js';
import { canonicalTeacherName } from '../../utils/teachers.js';

// Admin: find data that needs tidying, show exactly what would change, change only the ticked rows.
export const OLD_DAYS = 30;
const TEST_PATTERN = /\b(test|smoke|outbound)\b/i;
const PLACEHOLDER_TOPIC = 'uus tööleht';

const daysAgo = (days) => new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
const hasTeacher = (student) => Boolean(canonicalTeacherName(student.teacher)) || (student.enrollments || []).some((item) => canonicalTeacherName(item.teacher));

export function findCleanup({ students = [], schedule = [], lessons = [], homework = [], messages = [], userUid = '' }) {
  const names = new Map(students.map((student) => [student.id, student.name]));
  const teacherOf = (studentId) => {
    const counts = new Map();
    schedule.filter((item) => item.studentId === studentId && item.status !== 'Tühistatud' && canonicalTeacherName(item.teacher))
      .forEach((item) => { const name = canonicalTeacherName(item.teacher); counts.set(name, (counts.get(name) || 0) + 1); });
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '';
  };
  const noTeacher = students.filter((student) => student.active && !hasTeacher(student))
    .map((student) => ({ id: student.id, label: student.name || 'Nimetu õpilane', detail: [student.subject, student.level].filter(Boolean).join(' · '), suggestion: teacherOf(student.id), student }));
  const topics = lessons.filter((lesson) => String(lesson.topic || '').trim().toLocaleLowerCase('et') === PLACEHOLDER_TOPIC)
    .map((lesson) => ({ id: lesson.id, label: `${lesson.date || '—'} · ${lesson.studentName || names.get(lesson.studentId) || 'Õpilane'}`, detail: lesson.teacher || '', lesson }));
  const limit = daysAgo(OLD_DAYS);
  const oldHomework = homework.filter((item) => isHomeworkOpen(item) && item.due && item.due < limit)
    .sort((a, b) => String(a.due).localeCompare(String(b.due)))
    .map((item) => ({ id: item.id, label: `${names.get(item.studentId) || item.studentName || 'Õpilane'} · tähtaeg ${item.due}`, detail: String(item.task || '').slice(0, 120), item }));
  const conversations = buildConversations(messages, userUid)
    .filter((conversation) => TEST_PATTERN.test(conversation.name) || conversation.messages.some((message) => TEST_PATTERN.test(message.text)))
    .map((conversation) => ({ id: conversation.id, label: `${conversation.name} · ${conversation.channel}`, detail: `${conversation.messages.length} sõnumit · „${String(conversation.messages.at(-1)?.text || '').slice(0, 60)}”`, messageIds: conversation.messages.map((message) => message.id).filter(Boolean) }));
  return { noTeacher, topics, oldHomework, conversations };
}

