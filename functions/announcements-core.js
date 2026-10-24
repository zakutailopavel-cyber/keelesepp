"use strict";

// „Teated” (owner 2026-10-24): the administrator writes an announcement for students and / or parents; right after
// login a learner or parent must read it, answer a question or confirm their suitable lesson times before using the
// CRM. Announcements and answers are never read by learners directly (firestore.rules: admin only) — the server
// matches the audience and returns only the caller's own announcements, so nothing about other learners leaks.
//
// Pure logic only (no Firestore here): normalising, audience matching, answer validation, the learner view and the
// administrator's report. functions/index.js (staffOperationsApi /announcements/*) loads the data and writes.

const { enrollmentsOf, subjectName } = require("./student-enrollments-core");

const AUDIENCES = ["students", "parents", "both"];
const RESPONSE_TYPES = ["read", "question", "availability"];
const QUESTION_MODES = ["text", "single", "multiple"];
const STATUSES = ["draft", "published", "archived"];
const MAX_OPTIONS = 12;
const MAX_TEXT = 2000;

const clean = (value, max = 200) => String(value ?? "").trim().slice(0, max);
const cleanList = (value, max, itemMax = 200) => (Array.isArray(value) ? value : [])
  .map((item) => clean(item, itemMax)).filter(Boolean).slice(0, max);
const isoDate = (value) => (/^\d{4}-\d{2}-\d{2}$/.test(clean(value, 10)) ? clean(value, 10) : "");
const lower = (value) => clean(value).toLocaleLowerCase("et");
const millis = (value) => {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.toDate === "function") return value.toDate().getTime();
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};
const iso = (value) => (millis(value) ? new Date(millis(value)).toISOString() : "");

function statusError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizeQuestion(value = {}) {
  const mode = QUESTION_MODES.includes(value?.mode) ? value.mode : "text";
  return {
    mode,
    options: mode === "text" ? [] : [...new Set(cleanList(value?.options, MAX_OPTIONS, 200))],
    allowOther: mode !== "text" && value?.allowOther === true,
  };
}

function normalizeAnnouncement(id, data = {}) {
  return {
    id: clean(id, 128),
    title: clean(data.title, 200),
    body: clean(data.body, 5000),
    audience: AUDIENCES.includes(data.audience) ? data.audience : "both",
    subjects: cleanList(data.subjects, 20).map(subjectName),
    levels: cleanList(data.levels, 20, 20),
    studentIds: cleanList(data.studentIds, 500, 128),
    activeFrom: isoDate(data.activeFrom),
    activeTo: isoDate(data.activeTo),
    responseType: RESPONSE_TYPES.includes(data.responseType) ? data.responseType : "read",
    question: normalizeQuestion(data.question),
    allowChange: data.allowChange === true,
    status: STATUSES.includes(data.status) ? data.status : "draft",
    publishedAt: iso(data.publishedAt),
    createdAt: iso(data.createdAt),
  };
}

// published and its first day has come (ended ones stay readable in the learner's „Teated” list)
const isVisible = (announcement, today) => announcement.status === "published" && Boolean(announcement.activeFrom) && announcement.activeFrom <= today;
// … and its last day has not passed: only these block the app
const isActive = (announcement, today) => isVisible(announcement, today) && (!announcement.activeTo || today <= announcement.activeTo);

// the same account fields as firestore.rules ownsStudentProfile / studentAccountOwns
const studentUidsOf = (student = {}) => [...new Set([student.linkedUserId, student.studentUid, ...(Array.isArray(student.linkedUserIds) ? student.linkedUserIds : [])].map((item) => clean(item, 128)).filter(Boolean))];
const parentUidsOf = (student = {}) => [...new Set([student.linkedParentId, student.parentUid, student.guardianUid, ...(Array.isArray(student.linkedParentIds) ? student.linkedParentIds : [])].map((item) => clean(item, 128)).filter(Boolean))];
const isLiveCard = (student = {}) => student.active !== false && student.convertedToParent !== true && student.archived !== true;

// a card is addressed when it is active, in the chosen list (if any) and one of its active subjects matches the
// subject and level filter (both on the same enrollment)
function cardMatches(announcement, student = {}) {
  if (!isLiveCard(student)) return false;
  if (announcement.studentIds.length && !announcement.studentIds.includes(clean(student.id, 128))) return false;
  if (!announcement.subjects.length && !announcement.levels.length) return true;
  const subjects = announcement.subjects.map(lower);
  const levels = announcement.levels.map(lower);
  return enrollmentsOf(student).filter((item) => item.active !== false).some((item) => (
    (!subjects.length || subjects.includes(lower(item.subject)))
    && (!levels.length || levels.includes(lower(item.level)) || levels.includes(lower(item.targetLevel)))
  ));
}

const forStudents = (announcement) => announcement.audience === "students" || announcement.audience === "both";
const forParents = (announcement) => announcement.audience === "parents" || announcement.audience === "both";
const byName = (a, b) => clean(a.name).localeCompare(clean(b.name), "et") || clean(a.id).localeCompare(clean(b.id));

// A student answers once for themself (u_<uid>). A parent acknowledges „Loetud” once (p_<uid>), and answers a
// question or the suitable times per child (c_<studentId>; either parent may answer for the child).
function targetsForCaller(announcement, { uid, role, cards = [], name = "" }) {
  const matched = cards.filter((card) => cardMatches(announcement, card)).sort(byName);
  if (!matched.length) return [];
  if (role === "student" && forStudents(announcement)) {
    return [{ key: `u_${uid}`, kind: "student", uid, name, studentId: clean(matched[0].id, 128), studentName: clean(matched[0].name) }];
  }
  if (role === "parent" && forParents(announcement)) {
    if (announcement.responseType === "read") {
      return [{ key: `p_${uid}`, kind: "parent", uid, name, studentId: "", studentName: matched.map((card) => clean(card.name)).filter(Boolean).join(", ") }];
    }
    return matched.map((card) => ({ key: `c_${clean(card.id, 128)}`, kind: "parent", uid, name, studentId: clean(card.id, 128), studentName: clean(card.name) }));
  }
  return [];
}

// every account that must answer (the administrator's report). `users` maps uid → profile; accounts that are not
// a student / parent, are disabled or wait for approval are left out (they cannot log in to answer).
function allTargets(announcement, students = [], users = new Map()) {
  const targets = new Map();
  const userOk = (uid, role) => {
    const profile = users.get(uid);
    return Boolean(profile) && profile.role === role && profile.disabled !== true && !["pending", "rejected"].includes(profile.approvalStatus);
  };
  const userName = (uid) => clean(users.get(uid)?.displayName || users.get(uid)?.name || users.get(uid)?.email);
  students.filter((card) => cardMatches(announcement, card)).sort(byName).forEach((card) => {
    const studentId = clean(card.id, 128);
    if (forStudents(announcement)) {
      studentUidsOf(card).filter((uid) => userOk(uid, "student")).forEach((uid) => {
        const key = `u_${uid}`;
        if (!targets.has(key)) targets.set(key, { key, kind: "student", uids: [uid], names: [userName(uid) || clean(card.name)], studentId, studentName: clean(card.name) });
      });
    }
    if (forParents(announcement)) {
      const parents = parentUidsOf(card).filter((uid) => userOk(uid, "parent"));
      if (announcement.responseType === "read") {
        parents.forEach((uid) => {
          const key = `p_${uid}`;
          const current = targets.get(key);
          if (current) current.studentName = [current.studentName, clean(card.name)].filter(Boolean).join(", ");
          else targets.set(key, { key, kind: "parent", uids: [uid], names: [userName(uid)], studentId: "", studentName: clean(card.name) });
        });
      } else if (parents.length) {
        const key = `c_${studentId}`;
        targets.set(key, { key, kind: "parent", uids: parents, names: parents.map(userName), studentId, studentName: clean(card.name) });
      }
    }
  });
  return [...targets.values()];
}

const responseId = (announcementId, key) => `${announcementId}__${key}`;

// the learner's answer, checked against the announcement; returns what is stored
function validateAnswer(announcement, answer = {}) {
  if (announcement.responseType === "read") return { acknowledged: true };
  if (announcement.responseType === "availability") return { confirmed: true };
  const { mode, options, allowOther } = announcement.question;
  if (mode === "text") {
    const text = clean(answer?.text, MAX_TEXT);
    if (!text) throw statusError(400, "Vastus puudub.");
    return { text };
  }
  const choices = [...new Set(cleanList(answer?.choices, MAX_OPTIONS))];
  if (choices.some((choice) => !options.includes(choice))) throw statusError(400, "Tundmatu valik.");
  const other = allowOther ? clean(answer?.other, 500) : "";
  if (clean(answer?.other) && !allowOther) throw statusError(400, "Muu vastus ei ole lubatud.");
  if (!choices.length && !other) throw statusError(400, "Vali vastus.");
  if (mode === "single" && choices.length + (other ? 1 : 0) > 1) throw statusError(400, "Vali üks vastus.");
  return { choices, other };
}

// „Sobivad ajad”: the times must be saved after the announcement was published (the gate saves them right before)
function availabilitySnapshot(announcement, availability) {
  const slots = Array.isArray(availability?.slots) ? availability.slots.map((slot) => clean(slot, 12)).filter(Boolean).slice(0, 336) : [];
  if (!slots.length) throw statusError(400, "Sobivad ajad on märkimata.");
  const changed = millis(availability.changedAt) || millis(availability.updatedAt);
  if (millis(announcement.publishedAt) && changed < millis(announcement.publishedAt)) throw statusError(409, "Kinnita sobivad ajad uuesti.");
  const preferred = Array.isArray(availability.preferred) ? availability.preferred.map((slot) => clean(slot, 12)).filter((slot) => slots.includes(slot)).slice(0, 336) : [];
  return { slots, preferred };
}

// what a learner may see of an announcement: no audience lists, no other learners
function publicAnnouncement(announcement) {
  const { id, title, body, responseType, question, allowChange, activeFrom, activeTo, publishedAt } = announcement;
  return { id, title, body, responseType, question, allowChange, activeFrom, activeTo, publishedAt };
}

function publicResponse(response) {
  if (!response) return null;
  return {
    answer: response.answer || {},
    slots: Array.isArray(response.slots) ? response.slots : [],
    preferred: Array.isArray(response.preferred) ? response.preferred : [],
    answeredAt: iso(response.answeredAt),
    updatedAt: iso(response.updatedAt),
    answeredByName: clean(response.answeredByName),
  };
}

const oldestFirst = (a, b) => a.announcement.activeFrom.localeCompare(b.announcement.activeFrom)
  || a.announcement.publishedAt.localeCompare(b.announcement.publishedAt)
  || a.announcement.id.localeCompare(b.announcement.id) || a.target.key.localeCompare(b.target.key);

// `entries`: [{ announcement, target, response }] → { pending (blocking, oldest first), past (newest first, max 30) }
function learnerView(entries = [], today) {
  const items = entries.filter(({ announcement }) => isVisible(announcement, today)).map(({ announcement, target, response }) => ({
    announcement: publicAnnouncement(announcement),
    target: { key: target.key, studentId: target.studentId, studentName: target.studentName, kind: target.kind },
    response: publicResponse(response),
    active: isActive(announcement, today),
  }));
  const pending = items.filter((item) => item.active && !item.response).sort(oldestFirst);
  const past = items.filter((item) => !pending.includes(item)).sort((a, b) => oldestFirst(b, a)).slice(0, 30);
  return { pending, past };
}

function answerText(announcement, response) {
  if (!response) return "";
  if (announcement.responseType === "read") return "Loetud";
  if (announcement.responseType === "availability") return `${(response.slots || []).length / 2} h märgitud`;
  const answer = response.answer || {};
  return [answer.text, ...(answer.choices || []), answer.other ? `Muu: ${answer.other}` : ""].filter(Boolean).join("; ");
}

// the administrator's table: every target with its answer (or none yet), not answered first
function reportRows(announcement, targets = [], responses = new Map()) {
  return targets.map((target) => {
    const response = responses.get(target.key) || null;
    return {
      key: target.key,
      kind: target.kind,
      names: target.names,
      studentId: target.studentId,
      studentName: target.studentName,
      answered: Boolean(response),
      answeredAt: iso(response?.answeredAt),
      updatedAt: iso(response?.updatedAt),
      answeredByName: clean(response?.answeredByName),
      answer: response?.answer || null,
      slots: Array.isArray(response?.slots) ? response.slots : [],
      preferred: Array.isArray(response?.preferred) ? response.preferred : [],
      answerText: answerText(announcement, response),
    };
  }).sort((a, b) => Number(a.answered) - Number(b.answered) || clean(a.studentName || a.names[0]).localeCompare(clean(b.studentName || b.names[0]), "et"));
}

module.exports = {
  AUDIENCES,
  RESPONSE_TYPES,
  QUESTION_MODES,
  STATUSES,
  normalizeAnnouncement,
  isVisible,
  isActive,
  cardMatches,
  studentUidsOf,
  parentUidsOf,
  targetsForCaller,
  allTargets,
  responseId,
  validateAnswer,
  availabilitySnapshot,
  publicAnnouncement,
  learnerView,
  reportRows,
  statusError,
};
