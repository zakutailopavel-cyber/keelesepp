import { GraduationCap, LogOut, Menu, X } from 'lucide-react';
import { Fragment, Suspense, useEffect, useMemo, useState } from 'react';
import { lazyComponent } from '../../app/lazyComponent.js';
import { NavLink, Outlet } from 'react-router-dom';
import { navigationFor, settingsNavigation } from '../../app/navigation.js';
import { useAuth, usePreviewNavigation } from '../../app/AuthContext.jsx';
import { hasAnyRole, roleLabels } from '../../utils/roles.js';
import IconButton from '../ui/IconButton.jsx';
import LessonInvitationOverlay from './LessonInvitationOverlay.jsx';
import { messagesService } from '../../services/firebase/messages.js';
import { clearTestSession, testSessionName } from '../../services/firebase/auth.js';
import GuideBanner from '../../features/guide/GuideBanner.jsx';
import { WhatsNewDialog } from '../../features/guide/WhatsNew.jsx';
import AnnouncementGate from '../../features/announcements/AnnouncementGate.jsx';
import { isLearnerAccount } from '../../features/announcements/announcementModel.js';
import MissingDataGate from '../../features/missing-data/MissingDataGate.jsx';
import './appShell.css';

// students only (it renders nothing for anyone else), so nobody else downloads it
// staff only
const NotificationCenter = lazyComponent(() => import('./NotificationCenter.jsx'));
const PetCompanion = lazyComponent(() => import('../../features/pet/PetCompanion.jsx'));
// staff only: the student search, the right-click menu and the administrator's menu counts download for them only, so a
// student's or parent's first load (and the login page) does not carry the calendar, lesson and finance code they use
const GlobalStudentSearch = lazyComponent(() => import('./GlobalStudentSearch.jsx'));
const EntityContextMenu = lazyComponent(() => import('../EntityContextMenu.jsx'));
// a student's card, a lesson or an invoice in a side drawer over any page (entityDrawer.js); tiny until one is opened
const EntityDrawer = lazyComponent(() => import('../entityDrawer/EntityDrawer.jsx'));
// a subscription whose service file downloads on first use; unsubscribing before it arrives starts nothing
const lazySubscription = (load, method) => (...args) => {
  let stop = null;
  let off = false;
  load().then((service) => { if (!off) stop = service[method](...args); }).catch(() => {});
  return () => { off = true; if (typeof stop === 'function') stop(); };
};
const accountApprovalsService = { subscribePendingCount: lazySubscription(() => import('../../services/firebase/accountApprovals.js').then((m) => m.accountApprovalsService), 'subscribePendingCount') };
const unmarkedLessonsService = { subscribeCount: lazySubscription(() => import('../../services/firebase/unmarkedLessons.js').then((m) => m.unmarkedLessonsService), 'subscribeCount') };

function initials(name) {
  return String(name || '?').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

export default function AppShell({ approvals = accountApprovalsService, messages = messagesService, unmarked = unmarkedLessonsService, announcements, missingData }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut, preview } = useAuth();
  const previewNavigation = usePreviewNavigation();
  const visibleNavigation = useMemo(() => navigationFor(user.roles).filter((item) => hasAnyRole(user.roles, item.roles)), [user.roles]);
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
    try { return messages.subscribeUnreadCount({ uid: user.uid, all: isAdmin }, setUnreadMessages, () => setUnreadMessages(0)); } catch { return undefined; }
  }, [messages, isStaff, isAdmin, user.uid]);
  // admins see past lessons nobody marked (not billed) on „Kalender”
  const [unmarkedLessons, setUnmarkedLessons] = useState(0);
  useEffect(() => {
    if (!isAdmin || !unmarked?.subscribeCount) return undefined;
    try { return unmarked.subscribeCount({ user, isAdmin: true }, setUnmarkedLessons); } catch { return undefined; }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- the user object changes identity; uid is the key
  }, [unmarked, isAdmin, user.uid]);
  const badges = { '/accounts': isAdmin ? pendingAccounts : 0, '/messages': isStaff ? unreadMessages : 0, '/calendar': isAdmin ? unmarkedLessons : 0 };
  const badgeLabel = { '/messages': 'lugemata', '/calendar': 'märkimata tundi' };
  const blockPreviewButtons = (event) => {
    if (!preview?.readOnly) return;
    // only closing a dialog is let through: it changes nothing, and a dialog that cannot be closed covers the page
    if (event.target.closest('[data-preview-allowed]')) return;
    if (event.target.closest('button, [role="button"]')) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  // „Teated”: a student / parent answers the school's open announcements before the CRM opens (not in the admin's preview);
  // then „Puuduvad andmed”: what is missing on their card(s) (MissingDataGate mounts only after the last announcement)
  const gated = isLearnerAccount(user.roles) && !preview;

  return (
    <AnnouncementGate enabled={gated} user={user} onSignOut={signOut} {...(announcements ? { service: announcements } : {})}>
      {/* the right-click menu: staff and the accountant, each with their own actions (not in the admin's preview) */}
      {hasAnyRole(user.roles, ['admin', 'teacher', 'finance']) && !preview ? <Suspense fallback={null}><EntityContextMenu roles={user.roles} /><EntityDrawer roles={user.roles} /></Suspense> : null}
    <MissingDataGate enabled={gated} user={user} onSignOut={signOut} {...(missingData ? { service: missingData } : {})}>
    <div className="app-shell">
      <button className={`backdrop ${menuOpen ? 'is-open' : ''}`} onClick={() => setMenuOpen(false)} aria-label="Sulge menüü" />
      <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><GraduationCap size={22} /></div>
          <div><strong>KeeleSepp</strong><span>EP Koolitus</span></div>
          <IconButton className="mobile-only sidebar-close" label="Sulge menüü" onClick={() => setMenuOpen(false)}><X size={20} /></IconButton>
        </div>
        <nav aria-label="Põhinavigatsioon">
          {visibleNavigation.map(({ to, label, icon: Icon, end, group, hint }, index) => (
            <Fragment key={to}>
              {group && group !== visibleNavigation[index - 1]?.group ? <span className="nav-group">{group}</span> : null}
              <NavLink to={to} end={end} data-tour={`nav-${to}`} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                <Icon size={19} /><span>{label}{hint ? <small className="nav-hint">{hint}</small> : null}</span>{badges[to] ? <b className="nav-count" aria-label={`${badges[to]} ${badgeLabel[to] || 'ootel'}`}>{badges[to]}</b> : null}
              </NavLink>
            </Fragment>
          ))}
        </nav>
        <div className="sidebar-footer">
          {showSettings ? <NavLink to={settingsNavigation.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><settingsNavigation.icon size={19} /><span>{settingsNavigation.label}</span></NavLink> : null}
          <div className="profile-chip">
            <div className="avatar">{initials(user.displayName)}</div>
            <div className="profile-chip__text"><strong>{user.displayName}</strong><span>{roleLabels(user.roles) || 'kasutaja'}</span></div>
            <IconButton label="Logi välja" className="profile-chip__logout" onClick={signOut}><LogOut size={17} /></IconButton>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <LessonInvitationOverlay />
        <GuideBanner user={user} preview={preview} />
        <WhatsNewDialog user={user} preview={preview} />
        {testSessionName() && !preview ? <div className="preview-banner" role="status"><span><strong>Testõpilase seanss: {testSessionName()}</strong><small>Sa oled sisse logitud testõpilasena · administraatoriks naasmiseks logi uuesti sisse</small></span><button onClick={() => { clearTestSession(); signOut(); }}>Lõpeta testseanss</button></div> : null}
        {preview ? <div className="preview-banner" role="status"><span><strong>Vaatad süsteemi kasutajana: {user.displayName || user.email}</strong><small>Read-only tugivaade · administraatori seanss jääb aktiivseks</small></span><button onClick={previewNavigation.close}>Lõpeta vaade</button></div> : null}
        <header className="topbar">
          <IconButton className="mobile-only" data-tour="menu" label="Ava menüü" onClick={() => setMenuOpen(true)}><Menu size={21} /></IconButton>
          {canSearchStudents ? <Suspense fallback={null}><GlobalStudentSearch user={user} /></Suspense> : null}
          {showNotifications ? <div className="topbar-actions"><Suspense fallback={null}><NotificationCenter user={user} /></Suspense></div> : null}
        </header>
        <div className={preview?.readOnly ? 'preview-surface preview-surface--readonly' : 'preview-surface'} onClickCapture={blockPreviewButtons} onSubmitCapture={(event) => { if (preview?.readOnly) { event.preventDefault(); event.stopPropagation(); } }}><Outlet /></div>
        {user.roles?.includes('student') && !preview ? <Suspense fallback={null}><PetCompanion /></Suspense> : null}
      </main>
    </div>
    </MissingDataGate>
    </AnnouncementGate>
  );
}
