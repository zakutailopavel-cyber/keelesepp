import { CalendarSync, RefreshCw, Unplug } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge, Button, Card } from '../../components/ui/index.js';
import { googleCalendarService } from '../../services/firebase/googleCalendar.js';
import { describeConnection, formatSyncTime, syncResultMessage } from './googleCalendarModel.js';
import './googleCalendar.css';

const RETURN_NOTICES = {
  connected: { tone: 'success', text: 'Google Calendar on ühendatud ja esimene sünkroonimine on tehtud.' },
  error: { tone: 'error', text: 'Google Calendari ühendamine ei õnnestunud. Proovi uuesti või kirjuta administraatorile.' },
};

// ?gcal=connected|error is appended by the OAuth callback. It is read on first render and removed from the
// address afterwards, so a page refresh does not repeat the notice.
function readReturnStatus() {
  try { return new URL(window.location.href).searchParams.get('gcal') || ''; } catch { return ''; }
}

function clearReturnStatus() {
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('gcal')) return;
    url.searchParams.delete('gcal');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch { /* address stays as it is */ }
}

/** "Seaded" card for teachers and admins: connect, see sync state, sync now, group lessons, disconnect. */
export default function GoogleCalendarCard({ user, repository = googleCalendarService, returnPath = '/settings' }) {
  const [status, setStatus] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState(() => RETURN_NOTICES[readReturnStatus()] || null);
  const [disconnectArmed, setDisconnectArmed] = useState(false);

  useEffect(() => { clearReturnStatus(); }, []);

  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => repository.status(user.uid))
      .then((value) => {
        if (!alive) return;
        setStatus(value);
        // "Ühenda Google" in the calendar links here with #google-calendar.
        if (window.location.hash === '#google-calendar') globalThis.requestAnimationFrame?.(() => document.getElementById('google-calendar')?.scrollIntoView?.({ block: 'center' }));
      })
      .catch((error) => { if (alive) setLoadError(error.message || 'Google Calendari olekut ei saanud laadida.'); });
    return () => { alive = false; };
  }, [repository, user.uid]);

  const run = async (key, action) => {
    setBusy(key); setNotice(null);
    try { await action(); } catch (error) { setNotice({ tone: 'error', text: error.message || 'Toiming ebaõnnestus.' }); } finally { setBusy(''); }
  };
  const refresh = async () => setStatus(await repository.status(user.uid));

  const connect = () => run('connect', async () => {
    const url = await repository.authUrl(user.uid, `${window.location.origin}${returnPath}`);
    window.location.assign(url);
  });
  const syncNow = () => run('sync', async () => {
    const result = await repository.sync(user.uid);
    await refresh();
    setNotice({ tone: result.pushFailed ? 'error' : 'success', text: syncResultMessage(result) });
  });
  const toggleGroups = (syncGroups) => run('groups', async () => {
    const result = await repository.setSyncGroups(user.uid, syncGroups);
    await refresh();
    setNotice({ tone: 'success', text: syncGroups ? `Grupitunnid on nüüd Google Calendaris (${result.groupsPushed || 0} saadetud).` : `Grupitunnid eemaldati Google Calendarist (${result.groupsRemoved || 0}).` });
  });
  const disconnect = () => {
    if (!disconnectArmed) { setDisconnectArmed(true); return; }
    setDisconnectArmed(false);
    run('disconnect', async () => {
      await repository.disconnect(user.uid);
      await refresh();
      setNotice({ tone: 'success', text: 'Ühendus katkestati. Tunnid jäid KeeleSeppa alles; Google Calendarisse saadetud sündmused jäävad sinu Google’i kalendrisse.' });
    });
  };

  const summary = describeConnection(status);
  return (
    <Card className="gcal-card">
      <div className="settings-icon"><CalendarSync /></div>
      <h2 id="google-calendar">Google Calendar</h2>
      {notice ? <p className={notice.tone === 'error' ? 'form-error' : 'gcal-notice'} role={notice.tone === 'error' ? 'alert' : 'status'}>{notice.text}</p> : null}
      {loadError && !status ? <p className="form-error" role="alert">{loadError}</p> : null}
      {!status && !loadError ? <p className="settings-copy">Laen ühenduse olekut…</p> : null}

      {status && !status.connected ? (
        <>
          <p className="settings-copy">Ühenda oma Google Calendar: KeeleSepa tunnid (ka grupitunnid) ilmuvad sinu Google'i kalendrisse ning Google'is lisatud või tõstetud tunnid jõuavad KeeleSeppa. Sünkroonimine käib iga tund ja kalendri avamisel.</p>
          <Button loading={busy === 'connect'} onClick={connect}><CalendarSync size={17} /> Ühenda Google Calendar</Button>
        </>
      ) : null}

      {status?.connected ? (
        <>
          <div className="integration-row"><div><strong>Olek</strong><span>{summary.tone === 'success' ? 'Tunnid liiguvad ainult KeeleSepast Google’isse' : summary.label}</span></div><Badge tone={summary.tone}>{summary.label}</Badge></div>
          {status.writeEnabled ? <div className="integration-row"><div><strong>KeeleSepp → Google</strong><span>{formatSyncTime(status.lastPushAt)}</span></div></div> : null}
          {summary.error ? <p className="form-error" role="alert">{summary.error}</p> : null}
          {status.requiresWriteConsent ? (
            <div className="gcal-consent">
              <p className="settings-copy">Luba KeeleSepal oma tunde Google Calendarisse kirjutada — muidu tunnid sinna ei jõua.</p>
              <Button loading={busy === 'connect'} onClick={connect}>Luba kirjutamine</Button>
            </div>
          ) : null}
          {status.writeEnabled ? (
            <label className="checkbox-field gcal-groups">
              <input type="checkbox" checked={status.syncGroups !== false} disabled={Boolean(busy)} onChange={(event) => toggleGroups(event.target.checked)} />
              <span>Näita minu grupitunde Google Calendaris</span>
            </label>
          ) : null}
          <p className="settings-copy">Tunnid liiguvad ainult KeeleSepast Google Calendarisse. Lisa ja muuda tunde KeeleSepas; Google’is tehtud muudatused ja uued sündmused KeeleSeppa ei tule.</p>
          <div className="gcal-actions">
            <Button variant="secondary" loading={busy === 'sync'} disabled={Boolean(busy) && busy !== 'sync'} onClick={syncNow}><RefreshCw size={16} /> Sünkrooni kohe</Button>
            <Button variant="danger" loading={busy === 'disconnect'} disabled={Boolean(busy) && busy !== 'disconnect'} onClick={disconnect}><Unplug size={16} /> {disconnectArmed ? 'Kinnita: katkesta ühendus' : 'Katkesta ühendus'}</Button>
          </div>
          {disconnectArmed ? <p className="form-hint">Tunnid jäävad KeeleSeppa alles. Sinu Google’i kalendrisse jäävad sündmused alles, kuid neid enam ei uuendata. <button type="button" className="link-button" onClick={() => setDisconnectArmed(false)}>Loobu</button></p> : null}
        </>
      ) : null}
    </Card>
  );
}
