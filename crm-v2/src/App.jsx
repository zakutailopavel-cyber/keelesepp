import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';

const modules = [
  { path: 'students', eyebrow: 'CRM', title: 'Õpilased', description: 'Õpilaste profiilid, kontaktid, õpitee ja tegevused.' },
  { path: 'calendar', eyebrow: 'Planeerimine', title: 'Kalender', description: 'Tunnid, õpetajate koormus ja ajakonfliktid.' },
  { path: 'homework', eyebrow: 'Õppetöö', title: 'Kodutööd', description: 'Ülesanded, tähtajad, esitused ja tagasiside.' },
  { path: 'finance', eyebrow: 'Finantsid', title: 'Arved ja maksed', description: 'Arveldus, laekumised, võlad ja aruandlus.' },
  { path: 'messages', eyebrow: 'Suhtlus', title: 'Sõnumid', description: 'Vestlused õpilaste, vanemate ja õpetajatega.' },
  { path: 'settings', eyebrow: 'Süsteem', title: 'Seaded', description: 'Kasutajad, õigused, integratsioonid ja kooli profiil.' },
];

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        {modules.map((module) => (
          <Route key={module.path} path={module.path} element={<PlaceholderPage {...module} />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
