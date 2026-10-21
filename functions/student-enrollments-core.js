"use strict";

// One learner, several subjects (owner 2026-10-20): a child's card holds one enrollment per subject and teacher
// (Eesti keel with Pavel, Matemaatika with Yelyzaveta…). Old cards keep the subject in the top-level fields
// (subject, teacher, teacherUid, level, targetLevel); this reads both shapes the same way as the CRM
// (crm-v2/src/services/firebase/students.js normalizedEnrollment).

const clean = (value) => String(value ?? "").trim();
const lower = (value) => clean(value).toLocaleLowerCase("et");
const DEFAULT_SUBJECT = "Eesti keel";

// "Inglise Keel" and "Inglise keel" are one subject: first letter upper, the rest as typed but lower-cased
function subjectName(value) {
  const text = clean(value).replace(/\s+/g, " ");
  if (!text) return "";
  const low = text.toLocaleLowerCase("et");
  return low.charAt(0).toLocaleUpperCase("et") + low.slice(1);
}

function enrollmentOf(value = {}, fallback = {}) {
  const subject = subjectName(value.subject || fallback.subject) || DEFAULT_SUBJECT;
  const teacher = clean(value.teacher || fallback.teacher);
  const teacherUid = clean(value.teacherUid || fallback.teacherUid);
  const level = clean(value.level || fallback.level);
  const targetLevel = clean(value.targetLevel || fallback.targetLevel);
  return {
    id: clean(value.id) || [subject, teacherUid || teacher, level, targetLevel].map(lower).join("|"),
    subject,
    teacher,
    teacherUid,
    level,
    targetLevel,
    active: value.active !== false,
  };
}

function enrollmentsOf(student = {}) {
  const list = Array.isArray(student.enrollments) && student.enrollments.length ? student.enrollments : [{}];
  return list.filter(Boolean).map((item) => enrollmentOf(item, student));
}

// the same subject with the same teacher is one enrollment. Teachers are compared by uid when both cards have it,
// else by the first name („Pavel” = „Pavel Zakutailo”); a track with no teacher joins the same subject's track.
const firstName = (value) => lower(value).split(/\s+/)[0] || "";
function sameTrack(a, b) {
  if (lower(a.subject) !== lower(b.subject)) return false;
  if (a.teacherUid && b.teacherUid) return a.teacherUid === b.teacherUid;
  if (!a.teacher || !b.teacher) return true;
  return firstName(a.teacher) === firstName(b.teacher);
}

// the kept card's enrollments plus the other card's subjects it does not have yet
function mergeEnrollments(keep = {}, source = {}) {
  const merged = enrollmentsOf(keep);
  const added = [];
  for (const track of enrollmentsOf(source)) {
    const twin = merged.find((item) => sameTrack(item, track));
    if (twin) {
      // fill what the kept track is missing (uid, level) from the other card
      for (const field of ["teacher", "teacherUid", "level", "targetLevel"]) if (!twin[field] && track[field]) twin[field] = track[field];
      twin.active = twin.active || track.active;
      continue;
    }
    merged.push(track);
    added.push(track);
  }
  const teacherUids = [...new Set([...(keep.teacherUids || []), ...(source.teacherUids || []), ...merged.filter((item) => item.active).map((item) => item.teacherUid)].map(clean).filter(Boolean))];
  return { enrollments: merged, added, teacherUids };
}

// the subject a record of this card belongs to, when the record itself does not say: the card's only active subject
function cardSubject(student = {}) {
  const active = enrollmentsOf(student).filter((item) => item.active);
  const subjects = [...new Set(active.map((item) => item.subject))];
  return subjects.length === 1 ? subjects[0] : "";
}

module.exports = { subjectName, enrollmentOf, enrollmentsOf, mergeEnrollments, cardSubject, sameTrack };
