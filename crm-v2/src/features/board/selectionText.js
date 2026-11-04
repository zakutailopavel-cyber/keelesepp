// The text of the board elements chosen with „Vali” (texts, notes, callouts), in reading order — e.g. for the
// teacher's „Kiirküsimus” (features/live-classroom/QuickPoll.jsx „Võta tahvlilt valitud tekst”).
export function selectionText(elements = []) {
  return elements
    .filter((element) => element && typeof element.text === 'string' && element.text.trim())
    .sort((a, b) => (a.y || 0) - (b.y || 0) || (a.x || 0) - (b.x || 0))
    .map((element) => element.text.replace(/\s+/g, ' ').trim())
    .join(' ');
}

// the text marked with the mouse in the page (e.g. in a worksheet), or ''
export function pageSelectionText(win = globalThis) {
  try { return String(win.getSelection?.()?.toString?.() || '').replace(/\s+/g, ' ').trim(); } catch { return ''; }
}
