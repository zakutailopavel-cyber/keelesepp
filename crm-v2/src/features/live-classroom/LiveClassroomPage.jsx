import { Video } from 'lucide-react';
import { Card, PageHeader } from '../../components/ui/index.js';

export default function LiveClassroomPage() {
  return <div className="page-content">
    <PageHeader eyebrow="Live Classroom" title="Live Classroom" description="Otseülekandega tunniruum õpetajale ja õpilasele." />
    <Card className="settings-profile-card"><div className="settings-icon"><Video /></div><h2>Varsti tuleb uuendus</h2><p className="settings-copy">Live Classroom on praegu ehitamisel. See avaldatakse siis, kui ekraanijagamine ja reaalajas tunnid on valmis ning testitud.</p></Card>
  </div>;
}
