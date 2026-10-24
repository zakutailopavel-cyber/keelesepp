import { useEffect, useState } from 'react';
import { studyDirectionsService } from '../../services/firebase/studyDirections.js';
import { directionList } from './studyDirections.js';

// the school's „Õppesuunad”, read once per page load (a failed read — e.g. before the rules are deployed — falls back
// to the built-in list)
let cache = null;
export function resetStudyDirectionsCache() { cache = null; }

export function useStudyDirections(service = studyDirectionsService) {
  const [list, setList] = useState(() => directionList(cache || []));
  useEffect(() => {
    let alive = true;
    if (!cache || service !== studyDirectionsService) {
      Promise.resolve(service.list()).then((items) => { if (service === studyDirectionsService) cache = items; if (alive) setList(directionList(items)); }).catch(() => {});
    }
    return () => { alive = false; };
  }, [service]);
  return list;
}
