import { Card } from '../../components/ui/index.js';
import { FINANCE_WORKSPACE_GROUPS, normalizeFinanceSection } from './financeNavigation.js';
import './financeWorkspaceNav.css';

export default function FinanceWorkspaceNav({ activeSection, onSelect }) {
  const active = normalizeFinanceSection(activeSection);

  return (
    <Card className="finance-workspace-nav-card">
      <nav className="finance-workspace-nav" aria-label="Finantsmooduli jaotised">
        {FINANCE_WORKSPACE_GROUPS.map((group) => (
          <section className={`finance-workspace-nav__group finance-workspace-nav__group--${group.id}`} key={group.id}>
            <header>
              <strong>{group.label}</strong>
              <span>{group.description}</span>
            </header>
            <div>
              {group.sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  className={section.id === active ? 'is-active' : undefined}
                  aria-pressed={section.id === active}
                  onClick={() => onSelect(section.id)}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </section>
        ))}
      </nav>
    </Card>
  );
}
