// The lesson room's side panels and the teacher's recorder, each a file of its own (LiveRoom.jsx loads them lazily).
export const loadHints = () => import('./LessonHints.jsx');
export const loadRecorder = () => import('../lesson-recording/RoomRecorder.jsx');
export const loadWarmup = () => import('./WarmupPanel.jsx');
export const loadWords = () => import('../vocabulary/LessonWordsPanel.jsx');
export const loadHomework = () => import('./LessonHomeworkPanel.jsx');
export const loadEnd = () => import('./LessonEndPanel.jsx');
export const loadMaterials = () => import('./MaterialsPanel.jsx');
// once the room is open its panels download in the background: a panel opened hours later (after a release) is then
// already in the browser and never asks for a file the new build has removed
export const ROOM_PANEL_LOADERS = { teacher: [loadHints, loadRecorder, loadWarmup, loadWords, loadHomework, loadEnd, loadMaterials], student: [loadWords] };
export function prefetchRoomPanels(teacher, loaders = ROOM_PANEL_LOADERS) {
  (teacher ? loaders.teacher : loaders.student).forEach((load) => { Promise.resolve().then(load).catch(() => {}); });
}
