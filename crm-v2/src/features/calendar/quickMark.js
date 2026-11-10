import { useEffect, useState } from 'react';

// the inline marks' labels (QuickMarkButtons, the undo toast)
export const MARK_LABELS = { Toimunud: 'Toimus', Puudus_p: 'Puudus, teatas ette', Puudus_eta: 'Puudus, ei teatanud' };

// The 5-second undo after a tap (owner 2026-11-09): one toast at a time; a new mark replaces the old toast.
// `undo` = { label, run }; run() takes the mark back (lessons.removeMark — „Paranda märge → Eemalda”).
export function useMarkUndo(ms = 5000) {
  const [undo, setUndo] = useState(null);
  useEffect(() => {
    if (!undo) return undefined;
    // a toast with a second step („Maksis sularahas”, owner 2026-11-11) stays a little longer (undo.ms)
    const timer = globalThis.setTimeout(() => setUndo(null), undo.ms || ms);
    return () => globalThis.clearTimeout(timer);
  }, [undo, ms]);
  return [undo, setUndo];
}
