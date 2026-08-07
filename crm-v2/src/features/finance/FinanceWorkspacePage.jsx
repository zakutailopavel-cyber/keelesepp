import { useState } from 'react';
import FinancePage from './FinancePage.jsx';
import FinanceWorkspaceNav from './FinanceWorkspaceNav.jsx';
import ManualInvoiceDialog from './ManualInvoiceDialog.jsx';
import { FINANCE_DEFAULT_SECTION, normalizeFinanceSection } from './financeNavigation.js';
import './manualInvoice.css';

export default function FinanceWorkspacePage(props) {
  const [activeSection, setActiveSection] = useState(() => normalizeFinanceSection(window.location.hash.slice(1) || FINANCE_DEFAULT_SECTION));
  const [financePageKey, setFinancePageKey] = useState(0);
  const [notice, setNotice] = useState('');

  const selectSection = (sectionId) => {
    const nextSection = normalizeFinanceSection(sectionId);
    setActiveSection(nextSection);
    window.history.replaceState(null, '', `#${nextSection}`);
    window.requestAnimationFrame(() => {
      document.getElementById(nextSection)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleManualInvoiceCreated = async (invoice) => {
    setNotice(`Arve ${invoice?.num || ''} loodi edukalt.`.trim());
    setFinancePageKey((current) => current + 1);
    setActiveSection('arved');
    window.history.replaceState(null, '', '#arved');
    window.requestAnimationFrame(() => {
      document.getElementById('arved')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <>
      <FinanceWorkspaceNav activeSection={activeSection} onSelect={selectSection} />
      <div className="finance-workspace-actions">
        <ManualInvoiceDialog onCreated={handleManualInvoiceCreated} />
      </div>
      {notice ? (
        <div className="finance-workspace-notice" role="status">
          <span>{notice}</span>
          <button type="button" aria-label="Sulge teade" onClick={() => setNotice('')}>×</button>
        </div>
      ) : null}
      <FinancePage key={financePageKey} {...props} />
    </>
  );
}
