// Shapes of the „Skeem” block: boxes from text lines ([gap] = learner fills in) and their positions.
export const node = (raw) => {
  const text = String(raw || '').trim();
  const gap = /^\[([^\]]*)\]$/.exec(text);
  return gap ? { gap: gap[1].split('|').map((x) => x.trim()).filter(Boolean) } : { text };
};
export const MAX_NODES = 12;
export function diagramNodes(data = {}) {
  return String(data.nodes || '').split('\n').map((line) => line.trim()).filter(Boolean).slice(0, MAX_NODES).map(node);
}

// positions in a 100-wide box; `h` is the box height in the same units
export function diagramLayout(kind, count) {
  if (kind === 'flow') {
    // a snake: odd rows run right to left, so every step is a short horizontal or vertical arrow
    const perRow = Math.min(4, Math.max(1, count));
    const rows = Math.max(1, Math.ceil(count / perRow));
    const h = rows * 16 + 2;
    const width = 100 / perRow;
    return {
      h,
      center: null,
      points: Array.from({ length: count }, (_, i) => {
        const row = Math.floor(i / perRow);
        const col = row % 2 ? perRow - 1 - (i % perRow) : i % perRow;
        return { x: width / 2 + col * width, y: 9 + row * 16 };
      }),
      links: Array.from({ length: Math.max(0, count - 1) }, (_, i) => [i, i + 1]),
    };
  }
  if (kind === 'tree') {
    const h = 44;
    return {
      h,
      center: { x: 50, y: 9 },
      points: Array.from({ length: count }, (_, i) => ({ x: ((i + 0.5) * 100) / Math.max(1, count), y: 34 })),
      links: Array.from({ length: count }, (_, i) => ['c', i]),
    };
  }
  const h = 40;
  return {
    h,
    center: { x: 50, y: h / 2 },
    points: Array.from({ length: count }, (_, i) => {
      const angle = (-90 + (i * 360) / Math.max(1, count)) * (Math.PI / 180);
      return { x: 50 + 34 * Math.cos(angle), y: h / 2 + 14 * Math.sin(angle) };
    }),
    links: Array.from({ length: count }, (_, i) => ['c', i]),
  };
}
