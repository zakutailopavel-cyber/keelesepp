import { useEffect, useMemo, useState } from 'react';
import { sheetBoardTitle } from '../board/boardModel.js';
import { RoomWorksheetContent } from '../worksheet-studio/RoomWorksheetPanel.jsx';

// The student's worksheets from earlier lessons as board sheets (StudentBoard `pastWorksheets`): a page „Tööleht: …”
// stays on the board after its lesson, and the next lesson or the preparation room shows its sheet again instead of an
// empty page (2026-10-23: all sheet pages looked empty in the next lesson). A failed query leaves the list empty.
export function usePastSheets(options) {
  return usePastSheetsState(options).sheets;
}

// the same, and whether the list has arrived (`ready`: a failed query counts as arrived, with no sheets) — the student's
// own board (/board) says „only in the lesson” for a page without its sheet only once it knows
export function usePastSheetsState({ homework, studentId, role }) {
  // kept with its student: another student's sheets never show while the new list loads
  const [loaded, setLoaded] = useState({ studentId: '', items: [] });
  useEffect(() => {
    if (!studentId || !homework?.subscribeStudentLiveWorksheets) return undefined;
    try {
      return homework.subscribeStudentLiveWorksheets(studentId, (items) => setLoaded({ studentId, items }), () => setLoaded({ studentId, items: [] }));
    } catch {
      globalThis.queueMicrotask(() => setLoaded({ studentId, items: [] }));
      return undefined;
    }
  }, [homework, studentId]);
  const items = loaded.studentId === studentId ? loaded.items : null;
  const sheets = useMemo(() => (items || []).map((item) => ({
    id: item.id,
    title: sheetBoardTitle(item),
    legacyTitle: item.title || item.worksheetDoc?.meta?.title || 'Tööleht',
    // the lesson (room) and time it was opened in: the live room groups older sheets by them (sheetTabs.js)
    roomKey: item.liveRoomKey || '',
    openedAt: item.liveOpenedAt || '',
    content: <RoomWorksheetContent current={item} role={role} {...(homework ? { homework } : {})} />,
  })), [homework, items, role]);
  return { sheets, ready: Boolean(items) || !studentId || !homework?.subscribeStudentLiveWorksheets };
}
