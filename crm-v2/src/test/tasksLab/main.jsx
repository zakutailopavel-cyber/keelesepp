/* global URLSearchParams */
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../app/AuthContext.jsx';
import HomeworkPage from '../../features/homework/HomeworkPage.jsx';
import StudentPracticePage from '../../features/students/StudentPracticePage.jsx';
import { localDate } from '../../utils/localDate.js';
import { COURSE_LOADERS } from '../../features/worksheet-generator/admin/course/courseLoaders.js';
import { demoTasks } from './demoTasks.js';
import '../../styles/index.css';

// A page outside the app (vite dev only, not in the production build): the student's „Ülesanded” and „Harjuta” with FAKE
// demo tasks (demoTasks.js), no sign-in and no Firebase. For screenshots and a quick look:
//   /tasks-lab.html                         „Ülesanded” as the student sees it
//   /tasks-lab.html?view=harjuta            „Harjuta” (its „Täna” steps)
//   /tasks-lab.html?view=harjuta&kaardid=hw-words-new   a word task opened from „Ülesanded” („Ava kaardid”)
//   /tasks-lab.html?fold=vanad | tehtud     „Ülesanded” with that fold open
//   /tasks-lab.html?scenario=repeats        one sheet given three times (audit 05: „+2 varasemat”)
//   /tasks-lab.html?view=harjuta&kursus=1   „Harjuta” whose „Laused ja grammatika” step loads the real course of the
//                                           demo card (a course lesson with scene pictures + picture items of his words);
//                                           without it the step has only the picture items of his words
//   &theme=dark                             the dark theme
const params = new URLSearchParams(globalThis.location.search);
if (params.get('theme')) document.documentElement.dataset.theme = params.get('theme');
const data = demoTasks(localDate(), { repeats: params.get('scenario') === 'repeats' });
const student = { uid: 'demo-student', displayName: 'Test Õpilane', roles: ['student'] };
const demoOnly = async () => { throw new Error('Demo: ei salvesta.'); };
const homeworkRepository = {
  listByStudentIds: async () => data.homework,
  listSubmissionsByStudentIds: async () => data.submissions,
  listWorksheetAssignmentsByStudentIds: async () => data.sheets,
  setStatus: demoOnly, submitAnswer: demoOnly,
};
const studentRepository = { listOwned: async () => [data.student], listSelf: async () => [data.student], getById: async () => data.student };
const wordsService = { subscribeForStudent: (id, onData) => { onData(data.words); return () => {}; }, rate: async () => null };
const practiceService = { saveToday: async () => null };

const view = params.get('view') || 'tasks';
const entry = view === 'harjuta' ? `/student/harjuta${params.get('kaardid') ? `?kaardid=${params.get('kaardid')}` : ''}` : `/homework${params.get('ava') ? `?ava=${params.get('ava')}` : ''}${params.get('fold') ? `#${params.get('fold')}` : ''}`;
const page = view === 'harjuta'
  ? <StudentPracticePage studentRepository={studentRepository} homeworkRepository={homeworkRepository} scheduleRepository={{ listByStudent: async () => [] }}
    lessonRepository={{ listByStudent: async () => [] }} petRepository={{ get: async () => null, lessonStats: async () => [] }} monologueRepository={null}
    wordsService={wordsService} practiceService={practiceService} courseLoaders={params.get('kursus') ? COURSE_LOADERS : {}} />
  : <HomeworkPage repository={homeworkRepository} studentRepository={studentRepository} interactiveRepository={{ list: async () => [] }} monologueRepository={null} />;

createRoot(document.getElementById('root')).render(
  <MemoryRouter initialEntries={[entry]}>
    <AuthContext.Provider value={{ user: student }}>
      <main className="tasks-lab" style={{ padding: '16px', minHeight: '100vh', background: 'var(--app-bg)' }}>{page}</main>
    </AuthContext.Provider>
  </MemoryRouter>,
);
