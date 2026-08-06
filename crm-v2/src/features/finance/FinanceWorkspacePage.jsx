import { useState } from 'react';
import FinancePage from './FinancePage.jsx';
import FinanceWorkspaceNav from './FinanceWorkspaceNav.jsx';
import { FINANCE_DEFAULT_SECTION, normalizeFinanceSection } from './financeNavigation.js';

export default function FinanceWorkspacePage(props) {
  const [activeSection, setActiveSection] = useState(() => normalizeFinanceSection(window.location.hash.slice(1) || FINANCE_DEFAULT_SECTION));

  const selectSection = (sectionId) => {
    const nextSection = normalizeFinanceSection(sectionId);
    setActiveSection(nextSection);
    window.history.replaceState(null, '', `#${nextSection}`);
    window.requestAnimationFrame(() => {
      document.getElementById(nextSection)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <>
      <FinanceWorkspaceNav activeSection={activeSection} onSelect={selectSection} />
      <FinancePage {...props} />
    </>
  );
}
