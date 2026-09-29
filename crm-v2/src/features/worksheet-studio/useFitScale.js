/* global ResizeObserver */
import { useEffect, useState } from 'react';

const MM = 3.7795;

// Fits the 270 mm design canvas into the available width (never enlarges).
export function useFitScale(ref) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const fit = () => setScale(Math.max(0.3, Math.min(1, (el.clientWidth - 24) / (270 * MM))));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return scale;
}

