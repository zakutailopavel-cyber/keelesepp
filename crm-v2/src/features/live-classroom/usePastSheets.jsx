import { useEffect, useMemo, useState } from 'react';
import { sheetBoardTitle } from '../board/boardModel.js';
import { RoomWorksheetContent } from '../worksheet-studio/RoomWorksheetPanel.jsx';

// The student's worksheets from earlier lessons as board sheets (StudentBoard `pastWorksheets`): a page „Tööleht: …”
// stays on the board after its lesson, and the next lesson or the preparation room shows its sheet again instead of an
// empty page (2026-10-23: all sheet pages looked empty in the next lesson). A failed query leaves the list empty.
export function usePastSheets({ homework, studentId, role }) {
  // kept with its student: another student's sheets never show while the new list loads
  const [loaded, setLoaded] = useState({ studentId: '', items: [] });
  useEffect(() => {
    if (!studentId || !homework?.subscribeStudentLiveWorksheets) return undefined;
    try {
      return homework.subscribeStudentLiveWorksheets(studentId, (items) => setLoaded({ studentId, items }), () => setLoaded({ studentId, items: [] }));
    } catch {
      return undefined;
    }
  }, [homework, studentId]);
  const items = loaded.studentId === studentId ? loaded.items : null;
  return useMemo(() => (items || []).map((item) => ({
    id: item.id,
    title: sheetBoardTitle(item),
    legacyTitle: item.title || item.worksheetDoc?.meta?.title || 'Tööleht',
    content: <RoomWorksheetContent current={item} role={role} {...(homework ? { homework } : {})} />,
  })), [homework, items, role]);
}
