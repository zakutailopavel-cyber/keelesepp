const existingFunctions = require('./index');
const { manualInvoiceApi } = require('./manual-invoice-api');
const { learningSessionApi } = require('./learning-session-api');
const { learningProfileEvidenceApi } = require('./learning-profile-evidence-api');
const { autoMarkLiveLesson } = require('./live-auto-mark');

module.exports = {
  ...existingFunctions,
  interactiveLessonApi: require("./interactive-lesson-api").interactiveLessonApi,
  lessonDraftsApi: require('./lesson-drafts-api').lessonDraftsApi,
  manualInvoiceApi,
  learningSessionApi,
  learningProfileEvidenceApi,
  // Live Classroom → the calendar lesson marked held on the server when the room closes (live-auto-mark-core.js)
  autoMarkLiveLesson,
};