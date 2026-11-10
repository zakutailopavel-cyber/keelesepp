import { useCallback, useEffect, useState } from 'react';

// The signed-in teacher's „Makstud sularahas” marks (lessonId → mark) for the marking screens. Server-side
// (/cash/lesson/mine): a teacher gets only their own, an admin every one. A failed read leaves the map empty — the
// buttons still work, the server refuses a second mark of the same lesson.
export function useLessonCashMarks(api, enabled = true) {
  const [marks, setMarks] = useState({});
  useEffect(() => {
    if (!enabled || !api?.lessonCashMine) return undefined;
    let alive = true;
    Promise.resolve()
      .then(() => api.lessonCashMine())
      .then((result) => { if (alive) setMarks(result?.marks || {}); })
      .catch(() => {});
    return () => { alive = false; };
  }, [api, enabled]);
  const setMark = useCallback((lessonId, mark) => setMarks((current) => {
    const next = { ...current };
    if (mark) next[lessonId] = mark; else delete next[lessonId];
    return next;
  }), []);
  return [marks, setMark];
}
