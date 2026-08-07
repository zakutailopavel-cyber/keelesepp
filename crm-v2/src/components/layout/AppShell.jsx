import { GraduationCap, LogOut, Menu, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { navigation, settingsNavigation } from '../../app/navigation.js';
import { useAuth } from '../../app/AuthContext.jsx';
import { hasAnyRole } from '../../utils/roles.js';
import GlobalStudentSearch from './GlobalStudentSearch.jsx';
import IconButton from '../ui/IconButton.jsx';

function initials(name) {
  return String(name || '?').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const visibleNavigation = useMemo(() => navigation.filter((item) => hasAnyRole(user.roles, item.roles)), [user.roles]);
  const showSettings = hasAnyRole(user.roles, settingsNavigation.roles);
  const canSearchStudents = hasAnyRole(user.roles, ['admin', 'teacher']);

  return (
    <div className="app-shell">
      <button className={`backdrop ${menuOpen ? 'is-open' : ''}`} onClick={() => setMenuOpen(false)} aria-label="Sulge menüü" />
      <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><GraduationCap size={22} /></div>
          <div><strong>KeeleSepp</strong><span>CRM v2</span></div>
          <IconButton className="mobile-only sidebar-close" label="Sulge menüü" onClick={() => setMenuOpen(false)}><X size={20} /></IconButton>
        </div>
        <nav aria-label="Põhinavigatsioon">
          {visibleNavigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
              <Icon size={19} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          {showSettings ? <NavLink to={settingsNavigation.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><settingsNavigation.icon size={19} /><span>{settingsNavigation.label}</span></NavLink> : null}
          <div className="profile-chip">
            <div className="avatar">{initials(user.displayName)}</div>
            <div className="profile-chip__text"><strong>{user.displayName}</strong><span>{user.roles.join(', ') || 'kasutaja'}</span></div>
            <IconButton label="Logi välja" className="profile-chip__logout" onClick={signOut}><LogOut size={17} /></IconButton>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <IconButton className="mobile-only" label="Ava menüü" onClick={() => setMenuOpen(true)}><Menu size={21} /></IconButton>
          {canSearchStudents ? <GlobalStudentSearch user={user} /> : null}
        </header>
        <Outlet />
      </main>
    </div>
  );
}
