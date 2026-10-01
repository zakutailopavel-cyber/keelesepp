import Sheet from '../worksheet-studio/engine/Sheet.jsx';
import { useFitScale } from '../worksheet-studio/useFitScale.js';
import '../worksheet-studio/engine/sheet.css';
import '../worksheet-studio/worksheetStudio.css';

// Read-only view of a worksheet made in the Töölehe konstruktor (the `worksheetDoc` on the curriculum lesson),
// exactly as it prints. Loaded lazily so the library list does not carry the worksheet engine.
export default function StudioSheetPreview({ doc }) {
  const [fitRef, scale] = useFitScale();
  return (
    <div className="ws-studio ws-doc-player library-sheet-preview">
      <div className="st-canvas" ref={fitRef}>
        <div className="st-zoom" style={{ zoom: scale }}>
          <Sheet doc={doc} mode="print" />
        </div>
      </div>
    </div>
  );
}
