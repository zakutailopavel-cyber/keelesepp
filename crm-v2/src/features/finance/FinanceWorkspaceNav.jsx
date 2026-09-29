import { ChevronDown } from 'lucide-react';
import { FINANCE_WORKSPACE_GROUPS, financeSectionById, normalizeFinanceSection } from './financeNavigation.js';
import './financeWorkspaceNav.css';

export default function FinanceWorkspaceNav({ activeSection, onSelect }) {
  const active = normalizeFinanceSection(activeSection);
  const [main, advanced] = FINANCE_WORKSPACE_GROUPS;
  const inAdvanced = financeSectionById(active)?.groupId === 'advanced';
  return (
    <nav className="finance-tabs" aria-label="Finantsmooduli jaotised">
      {main.sections.map((section) => (
        <button key={section.id} type="button" title={section.description} aria-pressed={section.id === active} className={section.id === active ? 'is-active' : undefined} onClick={() => onSelect(section.id)}>
          {section.label}
        </button>
      ))}
      <details className="finance-tabs__more" open={inAdvanced || undefined}>
        <summary className={inAdvanced ? 'is-active' : undefined}>{advanced.label} <ChevronDown size={15} /></summary>
        <div>
          {advanced.sections.map((section) => (
            <button key={section.id} type="button" aria-pressed={section.id === active} className={section.id === active ? 'is-active' : undefined} onClick={() => onSelect(section.id)}>{section.label}</button>
          ))}
        </div>
      </details>
    </nav>
  );
}
