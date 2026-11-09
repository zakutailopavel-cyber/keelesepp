// „Võta ühendamine tagasi” (2026-11-09): which merges can be reversed and what the question to the administrator says.
// The reversal itself is on the server (functions/student-merge.js unmergeStudentCards).

export const UNMERGE_LEGACY_HINT = 'Vana ühendamine — tagasi võtmiseks pöördu administraatori poole';

const COLLECTION_LABELS = {
  lessons: 'tunnid', schedule: 'tunniplaan', groups: 'grupid', homework: 'kodutööd', worksheetAssignments: 'töölehed',
  invoices: 'arved', payments: 'maksed', studentRevenuePlans: 'hind', studentAvailability: 'sobivad ajad', lessonChangeRequests: 'muutmise palved',
};

export const formatMergeDate = (value) => {
  const date = new Date(value);
  return value && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('et-EE') : '';
};

// the merged-away card can be reversed when the merge left its record (mergeUndoVersion) and still points at keepId
export function canUnmerge(source, keepId) {
  return Boolean(source && Number(source.mergeUndoVersion) >= 1 && (source.mergedInto || source.mergedIntoStudentId) === keepId);
}

export function unmergeMessage(preview) {
  const moved = Object.entries(preview.revert || {}).map(([collection, count]) => `${COLLECTION_LABELS[collection] || collection} ${count}`);
  const parts = [`„${preview.source?.name || 'Teine kaart'}” ja „${preview.keep?.name || 'see kaart'}” saavad jälle kaheks eraldi kaardiks.`];
  parts.push(moved.length ? `Tagasi liigub: ${moved.join(', ')}.` : 'Kirjeid tagasi tõsta ei ole.');
  if (preview.accounts) parts.push(`Kontod, mille seosed taastatakse: ${preview.accounts}.`);
  if (preview.conflicts?.length) parts.push(`${preview.conflicts.length} kirjet on pärast ühendamist muudetud — muudetud väljad jäävad nii, nagu need on.`);
  if (preview.keepFields?.changedSince?.length) parts.push(`Alles jääva kaardi väljad, mida on hiljem muudetud, jäävad samaks: ${preview.keepFields.changedSince.join(', ')}.`);
  if (preview.copies?.length) parts.push(`Kopeeritud dokumendid jäävad alles jäävale kaardile (kontrolli käsitsi): ${preview.copies.map((c) => c.label || c.collection).join(', ')}.`);
  parts.push('Pärast ühendamist sellele kaardile lisatud uued tunnid jäävad siia. Midagi ei kustutata.');
  return parts.join('\n\n');
}
