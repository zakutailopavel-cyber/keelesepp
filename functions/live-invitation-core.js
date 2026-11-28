"use strict";

// Live Classroom invitations written by the server (liveInvitationApi) instead of the browser. The checks below are
// the ones `match /liveLessonInvitations` in firestore.rules made on create / status update; moving them here frees
// ~7 kB of the rules' 256 kB compiled limit (docs/PROJECT_STATE.md 2026-11-28). Pure decisions, no Firestore.

const INVITATION_TTL_MS = 2 * 60 * 1000;
const STATUS = { PENDING: "pending", ACCEPTED: "accepted", DECLINED: "declined", CANCELLED: "cancelled", CLOSED: "closed" };
const ID = /^[A-Za-z0-9_-]{1,128}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const clean = (value) => String(value ?? "").trim();
const fail = (status, error) => ({ ok: false, status, error });

function millis(value) {
  if (value?.toMillis) return value.toMillis();
  if (value instanceof Date) return value.getTime();
  const parsed = typeof value === "number" ? value : Date.parse(String(value || ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

// the student's login account is on the card (rules: studentAccountOwns)
function studentAccountOwns(studentId, student, userId) {
  if (!student || !userId) return false;
  return studentId === userId
    || student.linkedUserId === userId
    || student.studentUid === userId
    || (Array.isArray(student.linkedUserIds) && student.linkedUserIds.includes(userId));
}

// the administrator, or a teacher on the student's card (rules: teacherCanInviteStudent)
function canInvite({ uid, admin, teacher, student }) {
  if (admin) return true;
  if (!teacher || !student) return false;
  return student.teacherUid === uid || (Array.isArray(student.teacherUids) && student.teacherUids.includes(uid));
}

/**
 * A new invitation. `groupRoom`: the liveGroupRooms doc when body.roomKey names one (null: not found).
 * → { ok, fields, log } — `fields` without id / createdAt / expiresAt (the caller adds server time), or { ok: false }.
 */
function createDecision({ uid, admin = false, teacher = false, body = {}, student = null, groupRoom = null } = {}) {
  if (!uid || (!admin && !teacher)) return fail(403, "Tunni saab alustada ainult õpetaja.");
  const studentId = clean(body.studentId);
  const studentUid = clean(body.studentUid);
  if (!ID.test(studentId) || !studentUid) return fail(400, "Vali aktiivne õpilane.");
  if (!student) return fail(404, "Õpilase kaarti ei leitud.");
  if (!canInvite({ uid, admin, teacher, student })) return fail(403, "See õpilane ei ole sinu õpilaste hulgas.");
  if (!studentAccountOwns(studentId, student, studentUid)) return fail(409, "Õpilase kaart ei ole sisselogimiskontoga seotud. Seo konto enne tunni alustamist.");
  const teacherName = clean(body.teacherName).slice(0, 160) || "Õpetaja";
  const studentName = clean(body.studentName || student.name).slice(0, 160) || "Õpilane";
  const title = clean(body.title).slice(0, 160);
  if (!title) return fail(400, "Tunni pealkiri on kohustuslik.");
  const roomKey = clean(body.roomKey);
  if (roomKey) {
    if (!ID.test(roomKey)) return fail(400, "Vigane ruumi tunnus.");
    const members = Array.isArray(groupRoom?.memberUids) ? groupRoom.memberUids : [];
    if (!groupRoom || groupRoom.teacherUid !== uid || groupRoom.status !== "open" || !members.includes(studentUid)) {
      return fail(403, "Õpilane ei kuulu sellesse grupiruumi.");
    }
  }
  const scheduleId = clean(body.scheduleId).slice(0, 200);
  const occurrenceDate = clean(body.occurrenceDate);
  const lesson = scheduleId && DATE.test(occurrenceDate) ? { scheduleId, occurrenceDate } : {};
  return {
    ok: true,
    roomKey,
    fields: {
      teacherUid: uid, teacherName, studentId, studentUid, studentName, title,
      status: STATUS.PENDING, respondedAt: null, cancelledAt: null, closedAt: null, ...lesson,
    },
  };
}

/**
 * A status change. action: accept | decline (the student), accept-test (teacher / admin for a testStudent card),
 * cancel, close (teacher / admin). → { ok, status, stamp } — `stamp` is the field that gets the server time —
 * or { ok: false }.
 */
function transitionDecision({ invitation = null, action = "", uid = "", admin = false, student = null, nowMs = Date.now(), endMark = "" } = {}) {
  if (!invitation) return fail(404, "Tunnikutsungit ei leitud.");
  if (!uid) return fail(401, "Logi uuesti sisse.");
  const owner = admin || invitation.teacherUid === uid;
  const pending = invitation.status === STATUS.PENDING;
  const expired = millis(invitation.expiresAt) <= nowMs;
  if (action === "accept" || action === "decline") {
    if (invitation.studentUid !== uid) return fail(403, "See tunnikutsung ei kuulu sinu kontole.");
    if (!pending) return fail(409, "Tunnikutsele on juba vastatud.");
    if (expired) return fail(409, "Tunnikutsung on aegunud. Palu õpetajal saata uus kutse.");
    return { ok: true, status: action === "accept" ? STATUS.ACCEPTED : STATUS.DECLINED, stamp: "respondedAt" };
  }
  if (action === "accept-test") {
    if (!owner) return fail(403, "Ainult kutse saatnud õpetaja saab proovitunni avada.");
    if (!pending) return fail(409, "Tunnikutsele on juba vastatud.");
    if (expired) return fail(409, "Tunnikutsung on aegunud.");
    if (student?.testStudent !== true) return fail(403, "See ei ole prooviõpilase kaart.");
    return { ok: true, status: STATUS.ACCEPTED, stamp: "respondedAt" };
  }
  if (action === "cancel") {
    if (!owner) return fail(403, "Ainult kutse saatnud õpetaja saab selle tühistada.");
    if (!pending) return fail(409, "Ainult ootel kutset saab tühistada.");
    return { ok: true, status: STATUS.CANCELLED, stamp: "cancelledAt" };
  }
  if (action === "close") {
    if (!owner) return fail(403, "Ainult kutse saatnud õpetaja saab ooteruumi lõpetada.");
    if (invitation.status !== STATUS.ACCEPTED) return fail(409, "Ainult vastu võetud ooteruumi saab lõpetada.");
    return { ok: true, status: STATUS.CLOSED, stamp: "closedAt", ...(["held", "skip"].includes(endMark) ? { endMark } : {}) };
  }
  return fail(400, "Tundmatu toiming.");
}

module.exports = { INVITATION_TTL_MS, STATUS, ID, createDecision, transitionDecision, studentAccountOwns, canInvite };
