/* global URLSearchParams */
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../app/AuthContext.jsx';
import ParentDashboardPage from '../../features/parents/ParentDashboardPage.jsx';
import ProgressPointsCard from '../../features/progress-points/ProgressPointsCard.jsx';
import { toIsoDate } from '../../features/calendar/calendarView.js';
import { demoFamily, demoRepositories } from './demoFamily.js';
import '../../styles/index.css';

// A page outside the app (vite dev only, not in the production build): „Minu pere” with a FAKE demo family and fake
// repositories, no sign-in and no Firebase reads. For screenshots and a quick look:
//   /parent-lab.html?family=two | one | empty      the parent's page
//   /parent-lab.html?view=staff                    the student card's „Keeleoskus tasemele” as the admin sees it
const params = new URLSearchParams(globalThis.location.search);
const family = params.get('family') || 'two';
const data = demoFamily(toIsoDate(), family);
const repositories = demoRepositories(data);
const parent = { uid: 'demo-parent', displayName: 'Jelena Smirnova', roles: ['parent'] };
const adminUser = { uid: 'demo-admin', displayName: 'Admin', roles: ['admin'] };
const noWrites = { ...repositories.pointsService, add: async () => { throw new Error('Demo: ei salvesta.'); }, update: async () => { throw new Error('Demo: ei salvesta.'); }, remove: async () => {} };

createRoot(document.getElementById('root')).render(
  params.get('view') === 'staff'
    ? <main className="page-content" style={{ maxWidth: 900 }}><ProgressPointsCard student={data.students[0]} user={adminUser} isAdmin service={noWrites} loadSheets={async (id) => data.assignments.filter((item) => item.studentId === id)} className="" /></main>
    : <MemoryRouter>
      <AuthContext.Provider value={{ user: parent }}>
        <main className="parent-lab"><ParentDashboardPage {...repositories} /></main>
      </AuthContext.Provider>
    </MemoryRouter>,
);
