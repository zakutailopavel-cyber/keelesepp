// The stylesheets of the pages that used to be part of the first download. The pages load on demand now (routes.jsx), but
// many of them style each other's classes (cards, sheets, chips) and the order of these rules decides ties, so the
// CSS stays one file in this order and every page looks exactly as before. Moving a sheet out means checking its classes.
import '../components/layout/globalStudentSearch.css';
import '../features/live-classroom/liveClassroom.css';
import '../features/notifications/notifications.css';
import '../features/pet/pet.css';
import '../features/guide/guide.css';
import '../features/guide/whatsNew.css';
import '../features/availability-poll/availabilityPoll.css';
import '../features/announcements/announcements.css';
import '../features/missing-data/missingData.css';
import '../components/layout/appShell.css';
import '../components/studentContextMenu.css';
import '../components/peopleOverview.css';
import '../features/worksheet-studio/engine/sheet.css';
import '../features/worksheet-studio/worksheetStudio.css';
import '../features/worksheet-studio/sheetAnnotations.css';
import '../features/vocabulary/sentenceBreakdown.css';
import '../features/homework/interactiveLesson.css';
import '../features/homework/homeworkPage.css';
import '../features/common/finalReadiness.css';
import '../features/homework/reviewLayout.css';
import '../features/board/board.css';
import '../features/lesson-recording/lessonRecording.css';
import '../features/vocabulary/vocabulary.css';
import '../features/live-classroom/liveRoom.css';
import '../features/payments/payments.css';
import '../features/learner/learner.css';
import '../features/self-study/selfStudy.css';
import '../features/messages/messagesWorkspace.css';
import '../features/students/lessonTokens.css';
import '../features/students/subjectSwitcher.css';
import '../features/google-calendar/googleCalendar.css';
import '../features/students/directions.css';
import '../features/settings/learnerEmails.css';
import '../features/settings/dataCleanup.css';
import '../features/retention/retention.css';
