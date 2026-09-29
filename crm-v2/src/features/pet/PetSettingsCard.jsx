import { useEffect, useState } from 'react';
import { PawPrint } from 'lucide-react';
import { Button, Card } from '../../components/ui/index.js';
import { petsService } from '../../services/firebase/index.js';
import { announcePet } from './petEvents.js';

// "Seaded" for students: switch the pet off or on again, and replay the first-visit tour.
export default function PetSettingsCard({ user, repository = petsService }) {
  const [pet, setPet] = useState(undefined);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => repository.get(user.uid)).then((p) => { if (alive) setPet(p || null); }).catch(() => { if (alive) setPet(null); });
    return () => { alive = false; };
  }, [repository, user.uid]);

  if (pet === undefined) return null;
  const on = !pet?.optedOut;

  const change = async (flags, message) => {
    setSaving(true); setNotice('');
    try {
      const next = await repository.update({ uid: user.uid, current: pet, ...flags });
      if ('tourDoneAt' in flags) { try { window.localStorage.removeItem(`ks-pet-tour-${user.uid}`); } catch { /* private mode */ } }
      if ('optedOut' in flags) { try { window.localStorage.removeItem(`ks-pet-hidden-${user.uid}`); } catch { /* private mode */ } }
      setPet(next); announcePet(next); setNotice(message);
    } catch (err) { setNotice(err.message || 'Salvestamine ebaõnnestus.'); }
    finally { setSaving(false); }
  };

  return (
    <Card>
      <div className="settings-icon"><PawPrint /></div>
      <h2>Minu sõber</h2>
      <p className="form-hint">{on ? (pet?.kind ? `${pet.name} on sinu kabinetis sees.` : 'Sõpra ei ole veel valitud: vali ta lehel „Minu õpingud”.') : 'Sõber on välja lülitatud.'}</p>
      <div className="settings-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {on
          ? <Button variant="secondary" loading={saving} onClick={() => change({ optedOut: true }, 'Sõber on välja lülitatud.')}>Lülita välja</Button>
          : <Button loading={saving} onClick={() => change({ optedOut: false, hidden: false }, 'Sõber on tagasi!')}>Lülita sisse</Button>}
        {on && pet?.kind ? <Button variant="secondary" disabled={saving} onClick={() => change({ tourDoneAt: '' }, 'Tutvustus algab uuesti.')}>Näita tutvustust uuesti</Button> : null}
      </div>
      {notice ? <p className="form-hint" role="status">{notice}</p> : null}
    </Card>
  );
}
