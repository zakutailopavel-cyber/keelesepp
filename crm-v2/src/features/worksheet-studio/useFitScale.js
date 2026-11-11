/* global ResizeObserver */
import { useCallback, useEffect, useState } from 'react';

const MM = 3.7795;
// on the Live Classroom board the sheet lies on a 1000 px page with 28 px sides: the same scale for teacher and student,
// so the board drawings and notes sit on the same words on both screens
export const BOARD_SHEET_SCALE = (1000 - 56) / (270 * MM);

// Fits the 270 mm design canvas into the available width (never enlarges).
// Returns a callback ref, so it also works when the canvas appears after a loading state.
export function useFitScale() {
  const [el, setEl] = useState(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    // the canvas's side padding stays free (a wide padding made the page run past it and scroll sideways)
    const fit = () => {
      const css = globalThis.getComputedStyle?.(el);
      const sides = css ? (parseFloat(css.paddingLeft) || 0) + (parseFloat(css.paddingRight) || 0) : 0;
      setScale(Math.max(0.3, Math.min(1, (el.clientWidth - Math.max(40, sides + 4)) / (270 * MM))));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [el]);
  const ref = useCallback((node) => setEl(node), []);
  return [ref, scale];
}
