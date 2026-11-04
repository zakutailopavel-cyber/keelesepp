import { AlertTriangle, MonitorSmartphone, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { deviceCheckService } from '../../services/firebase/deviceCheck.js';
import { checkDay, groupDeviceWarnings } from './deviceCheckModel.js';
import { DeviceCheckLink } from './DeviceCheckNotice.jsx';
import './deviceCheckNotice.css';

const LEVEL_WORD = { fail: 'viga', warn: 'märkusi' };

// The teacher's device warning for a group lesson (live group room before the call, calendar group lesson panel):
// one box listing every member whose last „Seadme kontroll” is „fail” / „warn” or missing. Read only; nothing while
// loading, on errors or when every device is fine. `students` = [{ studentId, studentUid?, name }].
export default function GroupDeviceCheckNotice({ students = [], viewer = null, service = deviceCheckService, onClose, className = '' }) {
  const admin = Boolean(viewer?.roles?.includes('admin'));
  const teacherUid = viewer?.uid || '';
  const [summary, setSummary] = useState(null);
  // the members as a string, so a new array with the same students does not read again
  const key = JSON.stringify(students.filter((item) => item?.studentId || item?.studentUid)
    .map((item) => [item.studentId || '', item.studentUid || '', item.name || '']));

  useEffect(() => {
    let alive = true;
    const list = JSON.parse(key).map(([studentId, studentUid, name]) => ({ studentId, studentUid, name }));
    if (!list.length) return undefined;
    Promise.all(list.map((item) => Promise.resolve()
      .then(() => service.forStudent({ studentId: item.studentId, studentUid: item.studentUid, teacherUid, admin }))
      .catch(() => null)
      .then((result) => ({ id: item.studentId || item.studentUid, name: item.name, result }))))
      .then((entries) => { if (alive) setSummary(groupDeviceWarnings(entries)); });
    return () => { alive = false; };
  }, [admin, key, service, teacherUid]);

  if (!summary) return null;
  const Icon = summary.level === 'none' ? MonitorSmartphone : AlertTriangle;
  return <div className={`dcn dcn--${summary.level} ${className}`} role="status" aria-label="Õpilaste seadme kontroll">
    <Icon size={16} aria-hidden="true" />
    <div className="dcn__body">
      <b>{summary.title}</b>
      <ul>{summary.rows.map((row) => <li key={row.id}>
        <b>{row.name}</b>{' — '}
        {row.warning.level === 'none'
          ? <>{row.hasAccount ? 'pole seadet kontrollinud' : 'kontol pole seadme kontrolli (pole sisselogimiskontot)'}{row.hadLiveLesson ? ' (videotunnis on varem olnud)' : ''}</>
          : <>{LEVEL_WORD[row.warning.level]}{row.warning.issues.length ? `: ${row.warning.issues.join('; ')}` : ''}{row.warning.at ? <small> · {checkDay(row.warning.at)}{row.warning.browser ? `, ${row.warning.browser}` : ''}</small> : null}</>}
      </li>)}</ul>
      <DeviceCheckLink />
    </div>
    {onClose ? <button type="button" className="dcn__close" aria-label="Peida seadme hoiatus" onClick={onClose}><X size={15} /></button> : null}
  </div>;
}
