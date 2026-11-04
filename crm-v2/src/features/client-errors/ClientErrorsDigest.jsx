import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clientErrorsService } from '../../services/firebase/clientErrors.js';
import { groupErrors, newInLastDay } from './clientErrorsModel.js';
import './clientErrors.css';

// Admin dashboard: „N uut viga saidil (24 h)” with the three latest, linking to „Vead”. Nothing when there are none
// or the read fails (the dashboard must not break because of the error log).
export default function ClientErrorsDigest({ service = clientErrorsService, now = () => Date.now() }) {
  const [fresh, setFresh] = useState([]);
  useEffect(() => {
    let alive = true;
    service.listRecent({ days: 2 })
      .then((records) => { if (alive) setFresh(newInLastDay(groupErrors(records), now())); })
      .catch(() => { if (alive) setFresh([]); });
    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service]);
  if (!fresh.length) return null;
  return (
    <section className="client-errors-digest" aria-label="Uued vead saidil">
      <AlertTriangle size={18} aria-hidden="true" />
      <strong>{fresh.length === 1 ? '1 uus viga' : `${fresh.length} uut viga`} saidil (24 h)</strong>
      <Link to="/vead">Ava vead</Link>
      <ul>
        {fresh.slice(0, 3).map((group) => <li key={group.fingerprint}>{group.message} · {group.count}× · {group.users} {group.users === 1 ? 'inimene' : 'inimest'}</li>)}
      </ul>
    </section>
  );
}
