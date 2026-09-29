import { useEffect, useState } from 'react';
import { lessonRecordingsService, RECORDING_STATUS } from '../../services/firebase/lessonRecordings.js';
import './lessonRecording.css';

// The student always sees when their lesson is being recorded.
export default function RecordingIndicator({ invitation, user, service = lessonRecordingsService }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    try {
      return service.subscribeForStudent({ uid: user.uid, invitationId: invitation.id }, (items) => setOn(items.some((r) => r.status === RECORDING_STATUS.recording)), () => setOn(false));
    } catch { return undefined; }
  }, [invitation.id, service, user.uid]);
  if (!on) return null;
  return <div className="rec-indicator" role="status"><span className="rec-dot" aria-hidden="true" /> Tundi salvestatakse · Урок записывается</div>;
}
