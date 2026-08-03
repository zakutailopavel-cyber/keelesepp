import {
  Bell,
  BookOpen,
  CalendarDays,
  CircleDollarSign,
  GraduationCap,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  Search,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const navigation = [
  { to: '/', label: 'Ülevaade', icon: LayoutDashboard, end: true },
  { to: '/students', label: 'Õpilased', icon: Users },
  { to: '/calendar', label: 'Kalender', icon: CalendarDays },
  { to: '/homework', label: 'Kodutööd', icon: BookOpen },
  { to: '/finance', label: 'Finantsid', icon: CircleDollarSign },
  { to: '/messages', label: 'Sõnumid', icon: MessageSquareText },
];

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <button className={`backdrop ${menuOpen ? 'is-open' : ''}`} onClick={() => setMenuOpen(false)} aria-label="Sulge menüü" />
      <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><GraduationCap size={22} /></div>
          <div><strong>KeeleSepp</strong><span>CRM v2</span></div>
          <button className="icon-button mobile-only" onClick={() => setMenuOpen(false)} aria-label="Sulge menüü"><X size={20} /></button>
        </div>
        <nav>
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
              <Icon size={19} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Settings size={19} /><span>Seaded</span></NavLink>
          <div className="profile-chip"><div className="avatar">PZ</div><div><strong>Pavel Zakutailo</strong><span>Administraator</span></div></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={() => setMenuOpen(true)} aria-label="Ava menüü"><Menu size={21} /></button>
          <div className="search-box"><Search size={18} /><input aria-label="Otsi" placeholder="Otsi õpilast, arvet või tundi..." /></div>
          <div className="topbar-actions">
            <button className="icon-button" aria-label="Teavitused"><Bell size={20} /><span className="notification-dot" /></button>
            <button className="primary-button">+ Uus kirje</button>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
