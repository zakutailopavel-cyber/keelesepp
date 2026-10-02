import { ArrowLeft, Database, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, ErrorState, LoadingState, PageHeader } from '../../../components/ui/index.js';
import { useAsyncData } from '../../../hooks/useAsyncData.js';
import { lessonWorksheetsService } from '../../../services/firebase/index.js';
import {
  buildGeneratorCoverage,
  GENERATOR_COVERAGE_LABELS,
  GENERATOR_COVERAGE_STATUSES,
} from '../coverage.js';
import '../generator.css';

const STATUS_OPTIONS = [
  ['all', 'Kõik olekud'],
  [GENERATOR_COVERAGE_STATUSES.READY_EMBEDDED, 'Valmis · sisupakett'],
  [GENERATOR_COVERAGE_STATUSES.READY_STATIC, 'Valmis · fallback'],
  [GENERATOR_COVERAGE_STATUSES.DRAFT, 'Mustand'],
  [GENERATOR_COVERAGE_STATUSES.MISSING, 'Puudub'],
  [GENERATOR_COVERAGE_STATUSES.ERROR, 'Viga'],
];

const SUMMARY_ORDER = [
  GENERATOR_COVERAGE_STATUSES.READY_EMBEDDED,
  GENERATOR_COVERAGE_STATUSES.READY_STATIC,
  GENERATOR_COVERAGE_STATUSES.DRAFT,
  GENERATOR_COVERAGE_STATUSES.MISSING,
  GENERATOR_COVERAGE_STATUSES.ERROR,
];

const PHASES = [
  ['discover', 'Avasta'],
  ['practice', 'Harjuta'],
  ['transfer', 'Kasuta'],
];

const normalized = (value) => String(value || '').toLocaleLowerCase('et');

export default function GeneratorCoveragePage({ repository = lessonWorksheetsService }) {
  const [queryText, setQueryText] = useState('');
  const [status, setStatus] = useState('all');
  const [level, setLevel] = useState('all');
  const state = useAsyncData(() => repository.listGeneratorLessons(), [repository]);

  const coverage = useMemo(() => buildGeneratorCoverage(state.data || []), [state.data]);
  const rows = useMemo(() => {
    const query = normalized(queryText);
    return coverage.rows.filter((row) => {
      if (status !== 'all' && row.status !== status) return false;
      if (level !== 'all' && row.level !== level) return false;
      if (!query) return true;
      return [row.title, row.lessonId, row.level, row.module, row.lessonKind]
        .some((value) => normalized(value).includes(query));
    });
  }, [coverage.rows, level, queryText, status]);

  if (state.loading) return <LoadingState label="Laen generaatori katvust…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;

  return (
    <div className="page-content generator-coverage-page">
      <PageHeader
        eyebrow="Lesson Engine"
        title="Generaatori katvus"
        description="Ülevaade sellest, millised õppekava tunnid on 3-leheliseks genereerimiseks valmis ja millised vajavad veel sisupaketti."
        actions={<Link className="button button--secondary" to="/library"><ArrowLeft size={16} /> Õppevara</Link>}
      />

      <div className="generator-coverage-summary" aria-label="Generaatori katvuse kokkuvõte">
        <Card className="generator-coverage-stat is-total"><span>Kokku</span><strong>{coverage.summary.total}</strong></Card>
        {SUMMARY_ORDER.map((key) => (
          <Card key={key} className={`generator-coverage-stat is-${key}`}>
            <span>{GENERATOR_COVERAGE_LABELS[key]}</span>
            <strong>{coverage.summary[key] || 0}</strong>
          </Card>
        ))}
      </div>

      <Card className="generator-coverage-filters">
        <label className="generator-coverage-search">
          <span>Otsing</span>
          <div><Search size={16} aria-hidden="true" /><input aria-label="Otsi generaatori katvusest" value={queryText} onChange={(event) => setQueryText(event.target.value)} placeholder="Tund, moodul, ID…" /></div>
        </label>
        <label><span>Tase</span><select aria-label="Filtreeri taseme järgi" value={level} onChange={(event) => setLevel(event.target.value)}><option value="all">Kõik tasemed</option>{coverage.levels.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label><span>Olek</span><select aria-label="Filtreeri oleku järgi" value={status} onChange={(event) => setStatus(event.target.value)}>{STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <div className="generator-coverage-result-count"><strong>{rows.length}</strong><span>nähtavat tundi</span></div>
      </Card>

      <Card className="generator-coverage-table-card">
        {rows.length ? (
          <div className="generator-coverage-table-wrap">
            <table className="generator-coverage-table">
              <thead><tr><th>Tund</th><th>Olek</th><th>Etapid</th><th>Sisu</th><th /></tr></thead>
              <tbody>
                {rows.map((row) => {
                  const firstDiagnostic = row.diagnostics.find((item) => item.severity === 'error') || row.diagnostics[0];
                  return (
                    <tr key={row.lessonId}>
                      <td>
                        <div className="generator-coverage-lesson">
                          <strong>{row.title}</strong>
                          <span>{row.level}{row.module ? ` · ${row.module}` : ''}</span>
                          <small>{row.lessonId}</small>
                        </div>
                      </td>
                      <td>
                        <span className={`generator-coverage-status is-${row.status}`}>{GENERATOR_COVERAGE_LABELS[row.status]}</span>
                        {row.hasEmbeddedDraft && row.status === GENERATOR_COVERAGE_STATUSES.READY_STATIC ? <small className="generator-coverage-note">Sisupaketi mustand olemas</small> : null}
                      </td>
                      <td>
                        <div className="generator-coverage-phases">
                          {PHASES.map(([key, label]) => {
                            const count = row.phaseAvailability[key] || 0;
                            return <span key={key} className={count >= 5 ? 'is-ready' : 'is-low'}>{label} {count}/5</span>;
                          })}
                        </div>
                      </td>
                      <td>
                        {row.ready ? (
                          <div className="generator-coverage-content"><Database size={15} aria-hidden="true" /><span>{row.source === 'embedded' ? 'Tunni sisupakett' : 'Kontrollitud fallback'}</span></div>
                        ) : (
                          <div className="generator-coverage-diagnostic"><span>{firstDiagnostic?.message || 'Generaatori sisupakett puudub.'}</span>{row.errorCount > 1 ? <small>+{row.errorCount - 1} probleemi</small> : null}</div>
                        )}
                      </td>
                      <td><Link className="button button--secondary" to={`/library/lessons/${encodeURIComponent(row.lessonId)}/worksheets`}>Ava sisupakett</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : <div className="generator-coverage-empty">Valitud filtritega tunde ei leitud.</div>}
      </Card>
    </div>
  );
}
