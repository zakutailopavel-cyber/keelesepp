import { ClipboardList, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '../../components/ui/index.js';
import { DEFAULT_MISSING_SETTINGS, MISSING_ITEMS, missingDataService } from '../../services/firebase/missingData.js';
import { firebaseErrorMessage } from '../../utils/firebaseErrors.js';
import { ITEM_HINTS, ITEM_LABELS, MODE_LABELS } from '../missing-data/missingDataModel.js';
import '../missing-data/missingData.css';

// Seaded → „Puuduvad andmed” (owner 2026-10-25): per item whether a student / parent is asked after login and whether
// it blocks the CRM until filled („Kohustuslik”), is asked but can stay empty („Soovi korral”) or is not asked.
// The form opens only when something required is missing.
export default function MissingDataSettingsCard({ user, service = missingDataService }) {
  const [items, setItems] = useState(null);
  const [saved, setSaved] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => service.getSettings())
      .then((value) => { if (alive) { setItems(value); setSaved(value); } })
      .catch((err) => { if (alive) { setItems({ ...DEFAULT_MISSING_SETTINGS }); setSaved({ ...DEFAULT_MISSING_SETTINGS }); setError(firebaseErrorMessage(err)); } });
    return () => { alive = false; };
  }, [service]);

  const changed = items && saved && MISSING_ITEMS.some((item) => items[item] !== saved[item]);
  const save = async () => {
    setBusy(true); setError(''); setNotice('');
    try {
      const value = await service.saveSettings(items, user);
      setSaved(value); setItems(value);
      setNotice('Salvestatud. Kehtib järgmisest sisselogimisest.');
    } catch (err) { setError(firebaseErrorMessage(err)); } finally { setBusy(false); }
  };

  return (
    <Card className="missing-settings" id="puuduvad-andmed">
      <div className="settings-icon"><ClipboardList /></div>
      <h2>Puuduvad andmed</h2>
      <p className="settings-copy">Mida küsida õpilaselt või lapsevanemalt kohe pärast sisselogimist (pärast „Teateid”), kui see kaardil puudub. „Kohustuslik” ei lase KeeleSeppa enne täitmist avada; „Soovi korral” küsitakse samas vormis, aga võib jätta tühjaks. Kontota õpilasi ja vanemaid näed <Link to="/students?puuduvad=1">Õpilased → Puuduvad andmed</Link>.</p>
      {!items ? <p className="form-hint">Laen…</p> : (
        <div className="missing-settings__rows">
          {MISSING_ITEMS.map((item) => (
            <label key={item} className="missing-settings__row" htmlFor={`missing-setting-${item}`}>
              <span><strong>{ITEM_LABELS[item]}</strong><small>{ITEM_HINTS[item]}</small></span>
              <select id={`missing-setting-${item}`} value={items[item]} onChange={(event) => setItems((current) => ({ ...current, [item]: event.target.value }))}>
                {Object.entries(MODE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          ))}
        </div>
      )}
      {error ? <p className="form-hint" role="alert">{error}</p> : null}
      {notice ? <p className="form-hint" role="status">{notice}</p> : null}
      <Button onClick={save} loading={busy} disabled={!changed}><Save size={16} /> Salvesta</Button>
    </Card>
  );
}
