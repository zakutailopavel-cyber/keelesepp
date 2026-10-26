// temporary local preview of B1 module 4 (not committed)
import { createRoot } from 'react-dom/client';
import * as mod from './features/worksheet-generator/admin/course/b1/module04.js';
import { buildCourseSheet } from './features/worksheet-generator/admin/course/registry.js';
import Sheet from './features/worksheet-studio/engine/Sheet.jsx';
import './features/worksheet-studio/engine/sheet.css';

const lesson = new URLSearchParams(location.search).get('l') || 'a2b1-016';
const phase = new URLSearchParams(location.search).get('p');
const phases = [['discover', 'Avasta'], ['practice', 'Harjuta'], ['transfer', 'Kasuta']].filter(([p]) => !phase || p === phase);
function App() {
  return <div>{phases.map(([p, label]) => (
    <section key={p} id={p}><h2 style={{ fontFamily: 'sans-serif', padding: 8 }}>{lesson} · {label}</h2>
      <Sheet doc={buildCourseSheet(mod, lesson, p)} mode="print" />
    </section>))}</div>;
}
createRoot(document.getElementById('root')).render(<App />);
