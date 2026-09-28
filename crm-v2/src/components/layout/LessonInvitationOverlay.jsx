import { Clock3, Video, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { liveLessonInvitationsService } from '../../services/firebase/liveLessonInvitations.js';
import { INVITATION_STATUS, newestInvitation } from '../../features/live-classroom/invitationModel.js';
import { Button, IconButton } from '../ui/index.js';

export default function LessonInvitationOverlay({ service = liveLessonInvitationsService }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState([]);
  const [hiddenId, setHiddenId] = useState('');
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const isStudent = user.roles?.includes('student');

  useEffect(() => {
    if (!isStudent) return undefined;
    return service.subscribeIncoming(user.uid, setInvitations, (nextError) => setError(nextError.message));
  }, [isStudent, service, user.uid]);

  const invitation = useMemo(() => newestInvitation(invitations, [INVITATION_STATUS.PENDING]), [invitations]);
  useEffect(() => { if (invitation?.id !== hiddenId) setHiddenId(''); }, [hiddenId, invitation?.id]);
  if (!isStudent || !invitation || hiddenId === invitation.id) return null;

  const respond = async (decision) => {
    setSaving(decision); setError('');
    try {
      await service.respond(invitation.id, decision, user);
      if (decision === INVITATION_STATUS.ACCEPTED) navigate(`/live-classroom?invitation=${encodeURIComponent(invitation.id)}`);
    } catch (nextError) { setError(nextError.message); }
    finally { setSaving(''); }
  };

  return <aside className="lesson-invitation" role="dialog" aria-modal="false" aria-labelledby="lesson-invitation-title">
    <div className="lesson-invitation__icon"><Video size={24} /></div>
    <div className="lesson-invitation__content">
      <span className="eyebrow">Tunnikutsung</span>
      <h2 id="lesson-invitation-title">{invitation.teacherName} kutsub sind tundi</h2>
      <p>{invitation.title}</p>
      <span className="lesson-invitation__expiry"><Clock3 size={14} /> Kutse kehtib lühikest aega</span>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className="lesson-invitation__actions">
        <Button loading={saving === INVITATION_STATUS.ACCEPTED} disabled={Boolean(saving)} onClick={() => respond(INVITATION_STATUS.ACCEPTED)}>Liitu tunniga</Button>
        <Button variant="secondary" loading={saving === INVITATION_STATUS.DECLINED} disabled={Boolean(saving)} onClick={() => respond(INVITATION_STATUS.DECLINED)}>Praegu ei saa</Button>
      </div>
    </div>
    <IconButton className="lesson-invitation__close" label="Peida tunnikutsung" onClick={() => setHiddenId(invitation.id)}><X size={18} /></IconButton>
  </aside>;
}

