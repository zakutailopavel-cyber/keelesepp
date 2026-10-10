import { GraduationCap, LogOut, Menu, X } from 'lucide-react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { navigation, settingsNavigation } from '../../app/navigation.js';
import { useAuth } from '../../app/AuthContext.jsx';
import { hasAnyRole } from '../../utils/roles.js';
import GlobalStudentSearch from './GlobalStudentSearch.jsx';
import IconButton from '../ui/IconButton.jsx';
import LessonInvitationOverlay from './LessonInvitationOverlay.jsx';
import NotificationCenter from './NotificationCenter.jsx';
import PetCompanion from '../../features/pet/PetCompanion.jsx';
import { accountApprovalsService } from '../../services/firebase/accountApprovals.js';
import { messagesService } from '../../services/firebase/messages.js';
import { clearTestSession, testSessionName } from '../../services/firebase/auth.js';
import GuideBanner from '../../features/guide/GuideBanner.jsx';
import './appShell.css';

function initials(name) {
  return String(name || '?').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

export default function AppShell({ approvals = accountApprovalsService, messages = messagesService }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut, preview, stopPreview } = useAuth();
  const visibleNavigation = useMemo(() => navigation.filter((item) => hasAnyRole(user.roles, item.roles)), [user.roles]);
  const showSettings = hasAnyRole(user.roles, settingsNavigation.roles);
  const canSearchStudents = hasAnyRole(user.roles, ['admin', 'teacher']);
  const showNotifications = hasAnyRole(user.roles, ['admin', 'teacher', 'finance']);
  // admins see at once that someone registered and waits for approval
  const isAdmin = hasAnyRole(user.roles, ['admin']) && !preview;
  const [pendingAccounts, setPendingAccounts] = useState(0);
  useEffect(() => {
    if (!isAdmin || !approvals?.subscribePendingCount) return undefined;
    try { return approvals.subscribePendingCount(setPendingAccounts, () => setPendingAccounts(0)); } catch { return undefined; }
  }, [approvals, isAdmin]);
  // staff see unread messages on „Suhtlus”
  const isStaff = hasAnyRole(user.roles, ['admin', 'teacher']) && !preview;
  const [unreadMessages, setUnreadMessages] = useState(0);
  useEffect(() => {
    if (!isStaff || !messages?.subscribeUnreadCount || !user.uid) return undefined;
    try { return messages.subscribeUnreadCount({ uid: user.uid, teacherName: user.displayName, all: isAdmin }, setUnreadMessages, () => setUnreadMessages(0)); } catch { return undefined; }
  }, [messages, isStaff, isAdmin, user.uid, user.displayName]);
  const badges = { '/accounts': isAdmin ? pendingAccounts : 0, '/messages': isStaff ? unreadMessages : 0 };
  const exitPreview = () => { stopPreview(); navigate('/settings'); };
  const blockPreviewButtons = (event) => {
    if (!preview?.readOnly) return;
    if (event.target.closest('button, [role="button"]')) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return (
    <div className="app-shell">
      <button className={`backdrop ${menuOpen ? 'is-open' : ''}`} onClick={() => setMenuOpen(false)} aria-label="Sulge menüü" />
      <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><GraduationCap size={22} /></div>
          <div><strong>KeeleSepp</strong><span>EP Koolitus</span></div>
          <IconButton className="mobile-only sidebar-close" label="Sulge menüü" onClick={() => setMenuOpen(false)}><X size={20} /></IconButton>
        </div>
        <nav aria-label="Põhinavigatsioon">
          {visibleNavigation.map(({ to, label, icon: Icon, end, group }, index) => (
            <Fragment key={to}>
              {group && group !== visibleNavigation[index - 1]?.group ? <span className="nav-group">{group}</span> : null}
              <NavLink to={to} end={end} data-tour={`nav-${to}`} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                <Icon size={19} /><span>{label}</span>{badges[to] ? <b className="nav-count" aria-label={to === "/messages" ? `${badges[to]} lugemata` : `${badges[to]} ootel`}>{badges[to]}</b> : null}
              </NavLink>
            </Fragment>
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
        <LessonInvitationOverlay />
        <GuideBanner user={user} preview={preview} />
        {testSessionName() && !preview ? <div className="preview-banner" role="status"><span><strong>Testõpilase seanss: {testSessionName()}</strong><small>Sa oled sisse logitud testõpilasena · administraatoriks naasmiseks logi uuesti sisse</small></span><button onClick={() => { clearTestSession(); signOut(); }}>Lõpeta testseanss</button></div> : null}
        {preview ? <div className="preview-banner" role="status"><span><strong>Vaatad süsteemi kasutajana: {user.displayName || user.email}</strong><small>Read-only tugivaade · administraatori seanss jääb aktiivseks</small></span><button onClick={exitPreview}>Lõpeta vaade</button></div> : null}
        <header className="topbar">
          <IconButton className="mobile-only" data-tour="menu" label="Ava menüü" onClick={() => setMenuOpen(true)}><Menu size={21} /></IconButton>
          {canSearchStudents ? <GlobalStudentSearch user={user} /> : null}
          {showNotifications ? <div className="topbar-actions"><NotificationCenter user={user} /></div> : null}
        </header>
        <div className={preview?.readOnly ? 'preview-surface preview-surface--readonly' : 'preview-surface'} onClickCapture={blockPreviewButtons} onSubmitCapture={(event) => { if (preview?.readOnly) { event.preventDefault(); event.stopPropagation(); } }}><Outlet /></div>
        <PetCompanion />
      </main>
    </div>
  );
}
