import { ArrowLeft, BarChart3, CalendarClock, FileDigit, Mail, ScrollText } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import FinancePage from './FinancePage.jsx';
import { normalizeFinanceSettingsSection } from './financeSettingsNavigation.js';
import './financeSettings.css';

const sections = [
  { id: 'tuluprognoos', label: 'Arveldusreeglid', description: 'Õpilaste hinnad ja tuluprognoos', icon: BarChart3 },
  { id: 'perioodid', label: 'Perioodid', description: 'Kuu kontroll ja sulgemine', icon: CalendarClock },
  { id: 'numeratsioon', label: 'Numeratsioon', description: 'Arvenumbrite kontroll', icon: FileDigit },
  { id: 'ekirjad', label: 'E-kirjad', description: 'Saatmine ja tarneolek', icon: Mail },
  { id: 'audit', label: 'Audit', description: 'Muutmatu finantsajalugu', icon: ScrollText },
];

export default function FinanceSettingsPage(props) {
  const [active, setActive] = useState(() => normalizeFinanceSettingsSection(window.location.hash.slice(1)));
  const select = (id) => {
    const next = normalizeFinanceSettingsSection(id);
    setActive(next);
    window.history.replaceState(null, '', `#${next}`);
  };
  return (
    <div className="page-content finance-settings-page">
      <header className="finance-settings-header">
        <div><span className="eyebrow">Finantsid</span><h1>Seaded</h1><p>Arvelduse reeglid, perioodid, e-kirjad ja kontrolljälg.</p></div>
        <Link className="button button--secondary" to="/finance"><ArrowLeft size={17} /> Tagasi kuu arveldusse</Link>
      </header>
      <nav className="finance-settings-nav" aria-label="Finantsseaded">
        {sections.map(({ id, label, description, icon: Icon }) => <button key={id} type="button" className={active === id ? 'is-active' : ''} aria-pressed={active === id} onClick={() => select(id)}><Icon size={19} /><span><strong>{label}</strong><small>{description}</small></span></button>)}
      </nav>
      <section className="finance-settings-content"><FinancePage key={active} {...props} section={active} /></section>
    </div>
  );
}
