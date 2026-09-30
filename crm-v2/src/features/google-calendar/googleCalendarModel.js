// Pure helpers for the Google Calendar screens: labels, timing and lesson sync state.

export const AUTO_SYNC_MINUTES = 15;

export function formatSyncTime(iso, now = new Date()) {
  if (!iso) return 'veel mitte';
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) return 'veel mitte';
  const minutes = Math.round((now.getTime() - value.getTime()) / 60000);
  if (minutes < 1) return 'just praegu';
  if (minutes < 60) return `${minutes} min tagasi`;
  const sameDay = value.toDateString() === now.toDateString();
  const time = value.toLocaleTimeString('et-EE', { hour: '2-digit', minute: '2-digit' });
  return sameDay ? `täna ${time}` : `${value.toLocaleDateString('et-EE', { day: 'numeric', month: 'short' })} ${time}`;
}

/** One-line summary of the connection for the settings card and the calendar chip. */
export function describeConnection(status) {
  if (!status?.connected) return { tone: 'neutral', label: 'Ühendamata', short: 'Google: ühendamata' };
  const error = status.lastSyncError || status.lastPushError || status.lastGroupPushError;
  if (error) return { tone: 'danger', label: 'Viga sünkroonimisel', short: 'Google: viga', error };
  if (status.requiresWriteConsent) {
    return { tone: 'info', label: 'Ainult Google → KeeleSepp', short: 'Google: ainult import' };
  }
  return { tone: 'success', label: 'Kahesuunaline', short: 'Google ✓' };
}

/** Sync when the calendar opens, at most every AUTO_SYNC_MINUTES, and never while an error is unresolved. */
export function shouldAutoSync(status, now = new Date(), minutes = AUTO_SYNC_MINUTES) {
  if (!status?.connected || status.lastSyncError) return false;
  if (!status.lastSyncAt) return true;
  const last = new Date(status.lastSyncAt).getTime();
  return Number.isNaN(last) || now.getTime() - last >= minutes * 60000;
}

export function syncResultMessage(result = {}) {
  const parts = [];
  if (result.synced) parts.push(`Google'ist uuendati ${result.synced} tundi`);
  if (result.pushed || result.groupsPushed) parts.push(`Google'isse saadeti ${Number(result.pushed || 0) + Number(result.groupsPushed || 0)} tundi`);
  if (result.cancelled || result.removed || result.groupsRemoved) {
    parts.push(`eemaldati ${Number(result.cancelled || 0) + Number(result.removed || 0) + Number(result.groupsRemoved || 0)}`);
  }
  if (result.skipped) parts.push(`${result.skipped} sündmust ei seotud õpilasega`);
  const text = parts.length ? `${parts.join(', ')}.` : 'Kõik on juba ajakohane.';
  return result.pushFailed ? `${text} ${result.pushFailed} tundi ei õnnestunud Google'isse saata.` : text;
}

/** Where a calendar lesson stands with Google. Returns null when there is nothing to say. */
export function lessonSyncState(item) {
  if (!item || item.isGroup) return null;
  if (item.source === 'gcal') {
    return { tone: 'neutral', label: 'Google Calendarist', hint: 'See tund tuli Google Calendarist. Aega muuda Google Calendaris, muidu kirjutab järgmine sünkroonimine selle üle.' };
  }
  switch (item.gcalSyncStatus) {
    case 'synced': return { tone: 'success', label: 'Google Calendaris', hint: '' };
    case 'queued': return { tone: 'info', label: "Ootab Google'isse saatmist", hint: 'Saadetakse järgmisel sünkroonimisel.' };
    case 'error': return { tone: 'danger', label: "Google'isse ei jõudnud", hint: item.gcalSyncError || 'Proovitakse uuesti järgmisel sünkroonimisel.' };
    case 'skipped': return { tone: 'info', label: "Google'isse ei saadetud", hint: item.gcalSyncError || '' };
    default: return null;
  }
}

/** Google owns imported lessons: moving them in KeeleSepp would be undone by the next import. */
export function isGoogleOwned(item) {
  return Boolean(item) && !item.isGroup && item.source === 'gcal';
}
