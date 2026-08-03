import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronRight,
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

const navigation = [
  { label: 'Ülevaade', icon: LayoutDashboard, active: true },
  { label: 'Õpilased', icon: Users },
  { label: 'Kalender', icon: CalendarDays },
  { label: 'Kodutööd', icon: BookOpen },
  { label: 'Finantsid', icon: CircleDollarSign },
  { label: 'Sõnumid', icon: MessageSquareText },
];

const metrics = [
  { label: 'Tänased tunnid', value: '12', meta: '3 õpetajat töös' },
  { label: 'Aktiivsed õpilased', value: '148', meta: '+6 sel kuul' },
  { label: 'Laekumata arved', value: '€2 840', meta: '11 arvet vajab tähelepanu' },
  { label: 'Kodutööd kontrollida', value: '27', meta: '8 tähtajaga täna' },
];

const lessons = [
  { time: '09:00', student: 'Anna Petrova', subject: 'Eesti keel A2', teacher: 'Maria Saar' },
  { time: '11:00', student: 'Maksim Ivanov', subject: 'Eesti keel B1', teacher: 'Karl Tamm' },
  { time: '14:30', student: 'Sofia Kuznetsova', subject: 'Vestluspraktika', teacher: 'Maria Saar' },
];

const alerts = [
  { title: '3 uut õppematerjali ootab kinnitamist', tone: 'info' },
  { title: '11 arvet on tähtaja ületanud', tone: 'warning' },
  { title: '2 õpetaja tööaeg vajab ülevaatamist', tone: 'neutral' },
];

function Sidebar({ open, onClose }) {
  return (
    <>
      <button className={`backdrop ${open ? 'is-open' : ''}`} onClick={onClose} aria-label="Sulge menüü" />
      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><GraduationCap size={22} /></div>
          <div>
            <strong>KeeleSepp</strong>
            <span>CRM v2</span>
          </div>
          <button className="icon-button mobile-only" onClick={onClose} aria-label="Sulge menüü"><X size={20} /></button>
        </div>
        <nav>
          {navigation.map(({ label, icon: Icon, active }) => (
            <button key={label} className={`nav-item ${active ? 'active' : ''}`}>
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item"><Settings size={19} /><span>Seaded</span></button>
          <div className="profile-chip">
            <div className="avatar">PZ</div>
            <div><strong>Pavel Zakutailo</strong><span>Administraator</span></div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={() => setMenuOpen(true)} aria-label="Ava menüü"><Menu size={21} /></button>
          <div className="search-box"><Search size={18} /><input aria-label="Otsi" placeholder="Otsi õpilast, arvet või tundi..." /></div>
          <div className="topbar-actions">
            <button className="icon-button" aria-label="Teavitused"><Bell size={20} /><span className="notification-dot" /></button>
            <button className="primary-button">+ Uus kirje</button>
          </div>
        </header>

        <div className="page-content">
          <section className="page-heading">
            <div><span className="eyebrow">Esmaspäev, 3. august</span><h1>Tere tulemast tagasi</h1><p>Siin on kooli tänane seis ja järgmised vajalikud tegevused.</p></div>
            <button className="secondary-button">Vaata päevaplaani <ChevronRight size={17} /></button>
          </section>

          <section className="metric-grid">
            {metrics.map((item) => <article className="metric-card" key={item.label}><span>{item.label}</span><strong>{item.value}</strong><small>{item.meta}</small></article>)}
          </section>

          <section className="content-grid">
            <article className="panel lessons-panel">
              <div className="panel-header"><div><span className="eyebrow">Täna</span><h2>Järgmised tunnid</h2></div><button className="text-button">Ava kalender</button></div>
              <div className="lesson-list">
                {lessons.map((lesson) => (
                  <button className="lesson-row" key={`${lesson.time}-${lesson.student}`}>
                    <div className="time-badge">{lesson.time}</div>
                    <div className="lesson-main"><strong>{lesson.student}</strong><span>{lesson.subject}</span></div>
                    <div className="teacher-name">{lesson.teacher}</div>
                    <ChevronRight size={18} />
                  </button>
                ))}
              </div>
            </article>

            <article className="panel attention-panel">
              <div className="panel-header"><div><span className="eyebrow">Tähelepanu</span><h2>Vajab tegutsemist</h2></div></div>
              <div className="alert-list">
                {alerts.map((alert) => <button className={`alert-row ${alert.tone}`} key={alert.title}><span className="alert-dot" /><span>{alert.title}</span><ChevronRight size={17} /></button>)}
              </div>
            </article>
          </section>
        </div>
      </main>
    </div>
  );
}
