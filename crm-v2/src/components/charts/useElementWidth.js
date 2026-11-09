import { useEffect, useRef, useState } from 'react';

// the rendered width of an element (charts draw at real pixels, so their text never stretches); `fallback` until it is
// measured and where ResizeObserver is missing (tests)
export function useElementWidth(fallback = 640) {
  const ref = useRef(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof globalThis.ResizeObserver !== 'function') return undefined;
    const measure = () => { const next = Math.round(node.getBoundingClientRect().width); if (next > 0) setWidth(next); };
    measure();
    const observer = new globalThis.ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
}
