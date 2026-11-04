// Tests only: the Live Classroom's views, side panels and the worksheet in the room are lazy (they download on first
// use, LiveClassroomPage.jsx / LiveRoom.jsx / RoomWorksheetPanel.jsx). Loading them once before a test file runs keeps
// the tests about behaviour, not about how long a module takes to load on a busy runner.
export function preloadLiveClassroomParts() {
  return Promise.all([
    import('./LiveRoom.jsx'),
    import('./GroupRoom.jsx'),
    import('./StudentWorkspace.jsx'),
    import('./TeacherWorkspace.jsx'),
    import('./LessonHints.jsx'),
    import('./WarmupPanel.jsx'),
    import('./LessonHomeworkPanel.jsx'),
    import('./LessonEndPanel.jsx'),
    import('./MaterialsPanel.jsx'),
    import('../vocabulary/LessonWordsPanel.jsx'),
    import('../lesson-recording/RoomRecorder.jsx'),
    import('../worksheet-studio/DocWorksheetPlayer.jsx'),
    import('../worksheet-studio/LiveWorksheetView.jsx'),
    import('../worksheet-studio/RoomStepControl.jsx'),
  ]);
}
