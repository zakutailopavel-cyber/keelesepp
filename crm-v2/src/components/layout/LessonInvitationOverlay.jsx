import { Clock3, Video, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { liveLessonInvitationsService } from '../../services/firebase/liveLessonInvitations.js';
import { INVITATION_STATUS, newestInvitation, normalizeInvitation, serverNow } from '../../features/live-classroom/invitationModel.js';
import { Button, IconButton } from '../ui/index.js';
import '../../features/live-classroom/liveClassroom.css';

export default function LessonInvitationOverlay({ service = liveLessonInvitationsService }) {
  const { user, preview } = useAuth();
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState([]);
  const [hiddenId, setHiddenId] = useState('');
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [now, setNow] = useState(() => serverNow());
  const isStudent = user.roles?.includes('student');
  const readOnlyPreview = Boolean(preview?.readOnly);

  useEffect(() => {
    if (!isStudent || readOnlyPreview) return undefined;
    return service.subscribeIncoming(
      user.uid,
      setInvitations,
      (nextError) => setError(nextError?.message || 'Tunnikutsungit ei saanud laadida.'),
    );
  }, [isStudent, readOnlyPreview, service, user.uid]);

  useEffect(() => {
    if (!isStudent || readOnlyPreview) return undefined;
    const timer = window.setInterval(() => setNow(serverNow()), 1000);
    return () => window.clearInterval(timer);
  }, [isStudent, readOnlyPreview]);

  const normalizedInvitations = useMemo(
    () => invitations.map((item) => normalizeInvitation(item.id, item, now)),
    [invitations, now],
  );
  const invitation = useMemo(
    () => newestInvitation(normalizedInvitations, [INVITATION_STATUS.PENDING]),
    [normalizedInvitations],
  );

  useEffect(() => {
    if (invitation?.id !== hiddenId) setHiddenId('');
  }, [hiddenId, invitation?.id]);

  if (!isStudent || readOnlyPreview || !invitation || hiddenId === invitation.id) return null;

  const respond = async (decision) => {
    setSaving(decision);
    setError('');
    try {
      await service.respond(invitation.id, decision, user);
      if (decision === INVITATION_STATUS.ACCEPTED) navigate(`/live-classroom?invitation=${encodeURIComponent(invitation.id)}`);
    } catch (nextError) {
      setError(nextError?.message || 'Tunnikutsungile ei saanud vastata.');
    } finally {
      setSaving('');
    }
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
