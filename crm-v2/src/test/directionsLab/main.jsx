/* global URLSearchParams */
import { createRoot } from 'react-dom/client';
import StudentDirectionsCard from '../../features/students/StudentDirectionsCard.jsx';
import EnrollmentManager from '../../features/students/EnrollmentManager.jsx';
import BillingSettingsCard from '../../features/students/BillingSettingsCard.jsx';
import LessonTokensCard from '../../features/students/LessonTokensCard.jsx';
import { DEFAULT_DIRECTIONS } from '../../features/students/studyDirections.js';
import '../../styles/index.css';
import '../../features/students/studentFinancePanel.css';

// A page outside the app (vite dev only, not in the production build): „Õppesuunad: individuaalne / grupp” (2026-11-18)
// on a FAKE card, fake services, no sign-in and no Firebase reads or writes. For screenshots:
//   /directions-lab.html                 card „Õppesuunad”, Arveldus (group price) and Tunnipakett
//   /directions-lab.html?view=window     the „Õppesuunad” window with the format choice
//   /directions-lab.html?price=none      the group direction without a group price (warnings)
const params = new URLSearchParams(globalThis.location.search);
const groups = [{ id: 'g1', name: 'Eesti A2 õhtugrupp', subject: 'Eesti keel', students: ['demo'], active: true }];
const student = {
  id: 'demo', name: 'Mari Tamm', subject: 'Eesti keel', active: true,
  enrollments: [
    { id: 'et-i', subject: 'Eesti keel', teacher: 'Pavel Zakutailo', level: 'A2', targetLevel: 'B1', active: true, format: 'individual' },
    { id: 'et-g', subject: 'Eesti keel', teacher: 'Pavel Zakutailo', level: 'A2', targetLevel: 'B1', active: true, format: 'group', groupId: 'g1' },
    { id: 'ma', subject: 'Matemaatika', teacher: 'Yelyzaveta', level: '9. klass', active: true },
  ],
};
const plan = {
  lessonPriceCents: 2500, lessonMinutes: 60, weeklyLessons: 3, billingMode: 'advance', chargeNoShow: true, priceTerms: 'general', hourlyRateCents: 2500,
  subjectPrices: { Matemaatika: { lessonPriceCents: 2500, lessonMinutes: 60 } },
  ...(params.get('price') === 'none' ? {} : { groupPrices: { 'Eesti keel': { lessonPriceCents: 1800, lessonMinutes: 90, weeklyLessons: 1 } } }),
};
const day = (offset) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
const schedule = [{ id: 'w1', subject: 'Eesti keel', recurring: true, day: 'Wed', startDate: day(-60), time: '15:00' }];
const lessons = [{ id: 'l1', date: day(-2), subject: 'Eesti keel', status: 'Toimunud' }, { id: 'l2', date: day(-1), subject: 'Eesti keel', groupId: 'g1', status: 'Toimunud' }];
const packages = [
  { id: 'p1', status: 'active', tokenSubject: 'Eesti keel', grantedCredits: 8, consumedCredits: 3, balanceCredits: 5, issuedAt: day(-20), sourceInvoiceNum: 'KS-2026-101' },
  ...(params.get('price') === 'none' ? [] : [{ id: 'p2', status: 'active', tokenSubject: 'Eesti keel', tokenFormat: 'group', grantedCredits: 10, consumedCredits: 2, balanceCredits: 8, issuedAt: day(-10), sourceInvoiceNum: 'KS-2026-114' }]),
];
const ledger = [{ id: 'e1', entryType: 'lesson_consumption', creditsDelta: -1, balanceAfter: 8, lessonDate: day(-1), ...(params.get('price') === 'none' ? { formatFallback: true } : {}) }];
const tokens = { listByStudent: async () => packages, ledgerByStudent: async () => ledger, owedByStudent: async () => [] };
const service = { updateEnrollment: async () => { throw new Error('Demo: ei salvesta.'); }, addEnrollment: async () => { throw new Error('Demo: ei salvesta.'); } };
const noop = () => {};

createRoot(document.getElementById('root')).render(params.get('view') === 'window'
  ? <EnrollmentManager student={{ ...student, enrollments: [{ id: 'et', subject: 'Eesti keel', teacher: 'Pavel Zakutailo', level: 'A2', targetLevel: 'B1', active: true }] }} teachers={['Pavel Zakutailo', 'Yelyzaveta']} service={service} directions={DEFAULT_DIRECTIONS} groups={groups} onClose={noop} onChanged={noop} />
  : <main className="page-content" style={{ maxWidth: 1000, display: 'grid', gap: 16 }}>
    <StudentDirectionsCard student={student} schedule={schedule} lessons={lessons} plan={plan} directions={DEFAULT_DIRECTIONS} groups={groups} canEdit canViewFinance service={service} onEdit={noop} />
    <BillingSettingsCard student={student} plan={plan} canEdit onSave={async () => { throw new Error('Demo: ei salvesta.'); }} />
    <LessonTokensCard student={student} service={tokens} />
  </main>);
