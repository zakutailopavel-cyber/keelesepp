import { CheckCircle2, Database, FilePenLine, TriangleAlert, X } from 'lucide-react';
import { Badge, Button, Card } from '../../../components/ui/index.js';

const CATEGORIES = [
  ['Fookused', 'focuses'],
  ['Sõnavara', 'vocabulary'],
  ['Kontekstid', 'contexts'],
  ['Laused', 'sentences'],
  ['Dialoogid', 'dialogues'],
  ['Rääkimine', 'speakingPrompts'],
  ['Kirjutamine', 'writingPrompts'],
];

export default function ContentPackFactoryPanel({ draft, onEdit, onCancel }) {
  const counts = draft?.readiness?.counts || {};
  const ready = draft?.status === 'ready';
  return (
    <Card className="content-pack-factory-panel">
      <div className="content-pack-factory-panel__head">
        <div><span className="eyebrow">Content Pack Factory v1</span><h2>Sisupaketi mustand</h2><p>Kontrollitud sisupankadest koostatud mustand. Midagi ei salvestata enne, kui avad redaktori ja vajutad „Salvesta sisupakett”.</p></div>
        <Badge tone={ready ? 'green' : 'yellow'}>{ready ? 'Ready' : draft?.status === 'missing-sources' ? 'Missing sources' : 'Draft'}</Badge>
      </div>
      <div className="content-pack-factory-sources"><Database size={17} /><span>{(draft?.selectedPackIds || []).join(' · ') || 'Sobivaid allikaid ei leitud'}</span></div>
      {draft?.missingSources?.length ? <div className="generator-profile-diagnostics" role="status">{draft.missingSources.map((item) => <div key={item}><TriangleAlert size={14} /> {item}</div>)}</div> : null}
      {draft?.profile ? <div className="content-pack-factory-grid">{CATEGORIES.map(([label, key]) => <div key={key}><span>{label}</span><strong>{counts[key] || 0}</strong></div>)}</div> : null}
      {draft?.readiness ? <div className="content-pack-factory-readiness">{ready ? <CheckCircle2 size={18} /> : <TriangleAlert size={18} />}<span>{ready ? 'Kõik kolm etappi on 5 ülesandetüübiga valmis.' : `${draft.readiness.diagnostics.filter((item) => item.severity === 'error').length} readiness probleemi vajab parandamist.`}</span></div> : null}
      <div className="generator-profile-actions">
        <Button onClick={onEdit} disabled={!draft?.profile}><FilePenLine size={16} /> Muuda ja salvesta</Button>
        <Button variant="secondary" onClick={onCancel}><X size={16} /> Loobu mustandist</Button>
      </div>
    </Card>
  );
}
