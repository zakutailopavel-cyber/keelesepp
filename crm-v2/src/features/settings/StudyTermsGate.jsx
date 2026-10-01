import { FileCheck2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../app/AuthContext.jsx';
import { Button, Card } from '../../components/ui/index.js';
import StudyTermsContent from './StudyTermsContent.jsx';
import './studyTerms.css';

export default function StudyTermsGate() {
  const { acceptStudyTerms, signOut } = useAuth();
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const accept = async () => {
    if (!confirmed) return;
    setSaving(true);
    setError('');
    try {
      await acceptStudyTerms();
    } catch (acceptError) {
      setError(acceptError?.message || 'Õppetingimuste kinnitamine ebaõnnestus.');
      setSaving(false);
    }
  };

  return (
    <main className="study-terms-gate">
      <Card className="study-terms-gate__card" aria-labelledby="study-terms-title">
        <div className="study-terms-gate__heading">
          <span className="study-terms-gate__icon"><FileCheck2 aria-hidden="true" /></span>
          <div>
            <span className="eyebrow">Enne lapsevanema kabinetti sisenemist</span>
            <h1 id="study-terms-title">Õppetingimused</h1>
            <p>Palun tutvu KeeleSepa õppetasu, puudumiste ja õppetöö korralduse põhimõtetega. Kinnituse järel avaneb sinu iseteenindus.</p>
          </div>
        </div>

        <StudyTermsContent />

        <label className="study-terms-confirm">
          <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
          <span>Olen õppetingimused läbi lugenud ja nõustun nendega.</span>
        </label>

        {error ? <p className="study-terms-error" role="alert">{error}</p> : null}

        <div className="study-terms-actions">
          <Button disabled={!confirmed} loading={saving} onClick={accept}>Kinnitan ja jätkan</Button>
          <Button variant="secondary" disabled={saving} onClick={signOut}>Ei nõustu</Button>
        </div>
        <p className="study-terms-note">Kui sa tingimustega ei nõustu, ei saa lapsevanema iseteenindust kasutada. Küsimuste korral kirjuta info@epkoolitus.ee.</p>
      </Card>
    </main>
  );
}
