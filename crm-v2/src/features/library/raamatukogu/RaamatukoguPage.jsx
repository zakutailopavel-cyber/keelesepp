import { ArrowLeft, Download, ExternalLink, Lightbulb, Search } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Badge, Button, EmptyState, PageHeader } from '../../../components/ui/index.js';
import { filterResources, typeCounts } from './raamatukoguModel.js';
import { AUDIENCES, LEVELS, RESOURCE_TYPES, RESOURCES } from './resources.js';
import '../libraryWorkspace.css';
import './raamatukogu.css';

function ResourceCard({ resource }) {
  const isFile = resource.access === 'file';
  return (
    <li className="rk-card">
      <div className="rk-card__head">
        <span className="rk-card__type">{RESOURCE_TYPES[resource.type]}</span>
        <span className="rk-card__levels">{resource.levels.map((level) => <Badge key={level}>{level}</Badge>)}</span>
      </div>
      <h2>{resource.title}</h2>
      <p className="rk-card__author">{resource.author}</p>
      <p>{resource.summary}</p>
      <p className="rk-card__ideas"><Lightbulb size={15} aria-hidden="true" /> <span>{resource.ideas}</span></p>
      <p className="rk-card__meta">
        {resource.audience.map((key) => AUDIENCES[key]).join(' · ')} · juhendkeel: {resource.instructionLanguages.join(', ')}
      </p>
      <p className="rk-card__license">{resource.license}</p>
      <div className="rk-card__actions">
        {isFile ? (
          <a className="button button--primary" href={resource.url} target="_blank" rel="noopener noreferrer"><Download size={16} /> Ava PDF ({resource.fileSize})</a>
        ) : (
          <a className="button button--secondary" href={resource.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} /> Ava allikas</a>
        )}
        {resource.sourceUrl ? <a className="rk-card__source" href={resource.sourceUrl} target="_blank" rel="noopener noreferrer">Algallikas</a> : null}
      </div>
    </li>
  );
}

export default function RaamatukoguPage({ resources = RESOURCES }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const level = params.get('tase') || '';
  const type = params.get('tyyp') || '';
  const audience = params.get('kellele') || '';
  const filesOnly = params.get('failid') === '1';

  const setParam = (patch) => {
    const next = new globalThis.URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    setParams(next, { replace: true });
  };

  const counts = useMemo(() => typeCounts(resources), [resources]);
  const visible = useMemo(
    () => filterResources(resources, { q, level, type, audience, filesOnly }),
    [resources, q, level, type, audience, filesOnly],
  );

  return (
    <div className="page-content library-page lib2 rk-page">
      <PageHeader
        compact
        eyebrow="Õppevara"
        title="Raamatukogu"
        description="Tasuta välised allikad ideede ja inspiratsiooni jaoks. Kaitstud materjal avaneb autori lehel; meie juures on ainult vabalt kasutatavad failid."
        actions={<Button variant="secondary" onClick={() => navigate('/library')}><ArrowLeft size={17} /> Õppevara</Button>}
      />

      <label className="lib2-search">
        <Search size={20} aria-hidden="true" />
        <input type="search" aria-label="Otsi raamatukogust" placeholder="Otsi: käänamine, kuulamine, lapsed…" value={q} onChange={(event) => setParam({ q: event.target.value })} />
      </label>

      <div className="lib2-filters rk-filters">
        <div className="lib2-levels" role="group" aria-label="Tase">
          <button type="button" className={!level ? 'is-active' : ''} aria-pressed={!level} onClick={() => setParam({ tase: '' })}>Kõik</button>
          {LEVELS.map((key) => (
            <button type="button" key={key} className={level === key ? 'is-active' : ''} aria-pressed={level === key} onClick={() => setParam({ tase: level === key ? '' : key })}>{key}</button>
          ))}
        </div>
        <label className="lib2-sort"><span>Tüüp</span>
          <select aria-label="Allika tüüp" value={type} onChange={(event) => setParam({ tyyp: event.target.value })}>
            <option value="">Kõik tüübid</option>
            {Object.entries(RESOURCE_TYPES).filter(([key]) => counts[key]).map(([key, label]) => <option value={key} key={key}>{label} ({counts[key]})</option>)}
          </select>
        </label>
        <label className="lib2-sort"><span>Kellele</span>
          <select aria-label="Sihtrühm" value={audience} onChange={(event) => setParam({ kellele: event.target.value })}>
            <option value="">Kõik</option>
            {Object.entries(AUDIENCES).map(([key, label]) => <option value={key} key={key}>{label}</option>)}
          </select>
        </label>
        <div className="lib2-chips" role="group" aria-label="Ligipääs">
          <button type="button" className={filesOnly ? 'is-active' : ''} aria-pressed={filesOnly} onClick={() => setParam({ failid: filesOnly ? '' : '1' })}><Download size={14} /> Allalaaditavad failid</button>
        </div>
      </div>

      <p className="rk-count" role="status">{visible.length} / {resources.length} allikat</p>

      {visible.length ? (
        <ul className="rk-grid" aria-label="Allikad">
          {visible.map((resource) => <ResourceCard resource={resource} key={resource.id} />)}
        </ul>
      ) : (
        <EmptyState title="Midagi ei leitud" description="Proovi teist otsingusõna või eemalda filtrid." />
      )}
    </div>
  );
}
