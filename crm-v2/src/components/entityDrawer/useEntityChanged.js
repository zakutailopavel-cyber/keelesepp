import { useEffect, useRef } from 'react';
import { onEntityChanged } from './entityDrawer.js';

// A page under the side drawer updates its data in place when the drawer changed an entity of `kinds`
// (entityDrawer.js `announceEntityChanged`). The handler may be a new function on every render; the subscription stays.
export function useEntityChanged(kinds, handler) {
  const latest = useRef(handler);
  useEffect(() => { latest.current = handler; });
  const key = [].concat(kinds).join(',');
  useEffect(() => onEntityChanged(key.split(','), (change) => latest.current?.(change)), [key]);
}
