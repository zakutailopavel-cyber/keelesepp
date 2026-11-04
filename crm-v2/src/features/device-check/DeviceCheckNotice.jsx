import { AlertTriangle, Copy, MonitorSmartphone, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { deviceCheckService } from '../../services/firebase/deviceCheck.js';
import { checkDay as day, teacherWarning } from './deviceCheckModel.js';
import './deviceCheckNotice.css';

// „Saada õpilasele: <link> Kopeeri” (also used by the group notice)
export function DeviceCheckLink() {
  const [copied, setCopied] = useState(false);
  const link = `${globalThis.location?.origin || 'https://crm.epkoolitus.ee'}/kontroll`;
  const copy = async () => {
    try { await globalThis.navigator?.clipboard?.writeText(link); setCopied(true); } catch { setCopied(false); }
  };
  return <span className="dcn__link">Saada õpilasele: <a href="/kontroll" target="_blank" rel="noopener">{link}</a>
    <button type="button" onClick={copy} aria-label="Kopeeri kontrolli link"><Copy size={13} aria-hidden="true" /> {copied ? 'Kopeeritud' : 'Kopeeri'}</button></span>;
}

// Teacher's warning about the student's device (calendar lesson panel, 1:1 live room before the call connects):
// the last „Seadme kontroll” was „fail” / „warn”, or the student never checked and never had a live lesson.
// Read only; nothing is shown while loading, on an error or when all is fine.
// `viewer`: the signed-in teacher / admin (a teacher may list only his own invitations for „never had a live lesson”).
export default function DeviceCheckNotice({ studentId = '', studentUid = '', viewer = null, service = deviceCheckService, onClose, className = '' }) {
  const admin = Boolean(viewer?.roles?.includes('admin'));
  const teacherUid = viewer?.uid || '';
  const [warning, setWarning] = useState(null);

  useEffect(() => {
    let alive = true;
    if (!studentId && !studentUid) return undefined;
    Promise.resolve()
      .then(() => service.forStudent({ studentId, studentUid, teacherUid, admin }))
      .then((result) => { if (alive) setWarning(result ? teacherWarning(result) : null); })
      .catch(() => { if (alive) setWarning(null); });
    return () => { alive = false; };
  }, [admin, service, studentId, studentUid, teacherUid]);

  if (!warning) return null;
  const Icon = warning.level === 'none' ? MonitorSmartphone : AlertTriangle;
  return <div className={`dcn dcn--${warning.level} ${className}`} role="status" aria-label="Õpilase seadme kontroll">
    <Icon size={16} aria-hidden="true" />
    <div className="dcn__body">
      <b>{warning.title}</b>
      {warning.issues.length ? <ul>{warning.issues.map((text) => <li key={text}>{text}</li>)}</ul> : null}
      {warning.at ? <small>Viimane kontroll {day(warning.at)}{warning.browser ? ` · ${warning.browser}` : ''}</small> : <small>Ta pole veel ühtegi videotundi teinud.</small>}
      <DeviceCheckLink />
    </div>
    {onClose ? <button type="button" className="dcn__close" aria-label="Peida seadme hoiatus" onClick={onClose}><X size={15} /></button> : null}
  </div>;
}
