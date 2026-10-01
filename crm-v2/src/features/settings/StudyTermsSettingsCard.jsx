import { FileCheck2 } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card } from '../../components/ui/index.js';
import StudyTermsContent from './StudyTermsContent.jsx';
import { hasAcceptedCurrentStudyTerms, STUDY_TERMS_VERSION } from './studyTerms.js';
import './studyTerms.css';

function acceptedDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('et-EE');
}

export default function StudyTermsSettingsCard({ user, readOnly = false }) {
  const [open, setOpen] = useState(false);
  const accepted = hasAcceptedCurrentStudyTerms(user);
  const date = acceptedDate(user.profile?.studyTermsAcceptedAt);

  return (
    <Card className="study-terms-settings-card">
      <div className="settings-icon"><FileCheck2 /></div>
      <div className="study-terms-settings-card__title">
        <h2>Õppetingimused</h2>
        <Badge tone={accepted ? 'success' : 'neutral'}>{accepted ? 'Kinnitatud' : 'Kinnitamata'}</Badge>
      </div>
      <p className="settings-copy">Õppetasu, puudumiste, tunni tühistamise ja õppetöö korralduse põhimõtted.</p>
      <div className="study-terms-meta">
        <span>Versioon <strong>{STUDY_TERMS_VERSION}</strong></span>
        {date ? <span>Kinnitatud <strong>{date}</strong></span> : null}
        {readOnly && !accepted ? <span>Administraatori tugivaates ei küsita kinnitust.</span> : null}
      </div>
      <Button variant="secondary" onClick={() => setOpen((value) => !value)}>
        {open ? 'Peida tingimused' : 'Vaata õppetingimusi'}
      </Button>
      {open ? <StudyTermsContent compact /> : null}
    </Card>
  );
}
