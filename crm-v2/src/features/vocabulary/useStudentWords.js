import { useEffect, useState } from 'react';
import { studentWordsService } from '../../services/firebase/studentWords.js';

// The words of one or more student cards, live and merged (for the pet, the dashboards).
export function useStudentWords(studentIds = [], service = studentWordsService) {
  const [lists, setLists] = useState({});
  const key = studentIds.filter(Boolean).join('|');
  useEffect(() => {
    const stops = key.split('|').filter(Boolean).map((id) => {
      try { return service.subscribeForStudent(id, (items) => setLists((current) => ({ ...current, [id]: items })), () => {}); } catch { return () => {}; }
    });
    return () => stops.forEach((stop) => stop?.());
  }, [key, service]);
  return key.split('|').filter(Boolean).flatMap((id) => lists[id] || []);
}
