import { CheckCircle2, Database, KeyRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Card, PageHeader } from '../../components/ui/index.js';

export default function SettingsPage() {
  const { user, configured } = useAuth();
  return <div className="page-content"><PageHeader eyebrow="Süsteem" title="Seaded" description="Konto, ligipääsud ja CRM v2 ühenduste olek." /><section className="settings-grid"><Card><div className="settings-icon"><ShieldCheck /></div><h2>Ligipääs</h2><div className="detail-list"><div><dt>Kasutaja</dt><dd>{user.displayName}</dd></div><div><dt>E-post</dt><dd>{user.email}</dd></div><div><dt>Rollid</dt><dd>{user.roles.join(', ')}</dd></div><div><dt>Konto UID</dt><dd className="mono">{user.uid}</dd></div></div></Card><Card><div className="settings-icon"><Database /></div><h2>Firebase</h2><div className="integration-row"><div><strong>Andmebaasi ühendus</strong><span>Autentimine ja Firestore</span></div><Badge tone={configured ? 'success' : 'danger'}>{configured ? 'Ühendatud' : 'Seadistamata'}</Badge></div><div className="integration-row"><div><strong>Ligipääsureeglid</strong><span>Rollipõhine kaitse</span></div><CheckCircle2 size={20} color="#067647" /></div></Card><Card><div className="settings-icon"><KeyRound /></div><h2>Turvalisus</h2><p className="settings-copy">CRM v2 kasutab sama Firebase’i kasutajakontot ja rollimudelit nagu olemasolev CRM. Administraatori õigused kontrollitakse igal kaitstud marsruudil.</p><Badge tone="info">Ühine autentimine</Badge></Card></section></div>;
}
