import { createContext } from 'react';

// The board's anchored „Järjehoidja” for what lies under it (a worksheet): StudentBoard provides
//   { open({ blockId, start, end }) — a bookmark on that text of the page (the teacher's „Märkus / Analüüs” popup),
//     onPopup() — a popup of the sheet opened: the bookmark sheet closes,
//     register(close) → unregister — the sheet's popup closes when a bookmark sheet opens }
// Outside a board it is null and the sheet shows no „Järjehoidja”.
export const BoardBookmarkContext = createContext(null);
