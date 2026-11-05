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
  // in the room's top bar a short word when the bar is tight (`.lr-top.is-compact`); the full sentence stays its name
  return <div className="rec-indicator" role="status" aria-label="Tundi salvestatakse · Урок записывается" title="Tundi salvestatakse · Урок записывается">
    <span className="rec-dot" aria-hidden="true" /> <span className="rec-indicator__long">Tundi salvestatakse · Урок записывается</span><span className="rec-indicator__short" aria-hidden="true">Salvestatakse</span>
  </div>;
}
