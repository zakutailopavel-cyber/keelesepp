/* global URLSearchParams */
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../app/AuthContext.jsx';
import ParentDashboardPage from '../../features/parents/ParentDashboardPage.jsx';
import { toIsoDate } from '../../features/calendar/calendarView.js';
import { demoFamily, demoRepositories } from './demoFamily.js';
import '../../styles/index.css';

// A page outside the app (vite dev only, not in the production build): „Minu pere” with a FAKE demo family and fake
// repositories, no sign-in and no Firebase reads. For screenshots and a quick look:
//   /parent-lab.html?family=two | one | empty
const params = new URLSearchParams(globalThis.location.search);
const family = params.get('family') || 'two';
const data = demoFamily(toIsoDate(), family);
const user = { uid: 'demo-parent', displayName: 'Katrin Tamm', roles: ['parent'] };

createRoot(document.getElementById('root')).render(
  <MemoryRouter>
    <AuthContext.Provider value={{ user }}>
      <main className="parent-lab"><ParentDashboardPage {...demoRepositories(data)} /></main>
    </AuthContext.Provider>
  </MemoryRouter>,
);
