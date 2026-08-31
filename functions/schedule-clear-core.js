"use strict";

const { canonicalTeacherKey } = require("./teacher-scope-core");

const CLOSED_STATUSES = new Set(["Tühistatud", "Toimunud", "Puudus_p", "Puudus_eta"]);

function validIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function previousIsoDate(value) {
  if (!validIsoDate(value)) return "";
  const date = new Date(`${value}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function teacherOwnsRecord(record = {}, teacherUid = "", teacherName = "") {
  const assignedUid = String(record.teacherUid || "").trim();
  const actorUid = String(teacherUid || "").trim();
  if (assignedUid) return Boolean(actorUid) && assignedUid === actorUid;
  const actorKey = canonicalTeacherKey(teacherName);
  return Boolean(actorKey) && canonicalTeacherKey(record.teacherFull || record.teacher) === actorKey;
}

function futureRecordInScope(record = {}, fromDate = "") {
  if (!validIsoDate(fromDate) || CLOSED_STATUSES.has(String(record.status || "Planeeritud"))) return false;
  const date = String(record.date || "");
  if (date) return validIsoDate(date) && date >= fromDate;
  const recurring = record.recurring !== false && Boolean(record.day);
  if (!recurring) return false;
  const endDate = String(record.endDate || "");
  return !validIsoDate(endDate) || endDate >= fromDate;
}

function futureScheduleClearPatch(record = {}, fromDate = "", options = {}) {
  if (!futureRecordInScope(record, fromDate)) return null;
  const nowIso = String(options.nowIso || new Date().toISOString());
  const metadata = {
    futureScheduleClearedAt: nowIso,
    futureScheduleClearedFrom: fromDate,
    futureScheduleClearedByUid: String(options.teacherUid || ""),
    futureScheduleClearOperationId: String(options.operationId || ""),
    updatedAtIso: nowIso,
  };
  if (String(record.source || "") === "gcal") {
    if (!options.includeExternalGoogle) return null;
    return {
      kind: "cancel_external_google",
      patch: {
        ...metadata,
        status: "Tühistatud",
        canceledAt: nowIso.slice(0, 10),
        gcalImportSuppressed: true,
        gcalImportSuppressedAt: nowIso,
      },
    };
  }
  const date = String(record.date || "");
  if (date) {
    return {
      kind: "cancel_single",
      patch: {
        ...metadata,
        status: "Tühistatud",
        canceledAt: nowIso.slice(0, 10),
      },
    };
  }
  const startDate = String(record.startDate || "");
  if (validIsoDate(startDate) && startDate >= fromDate) {
    return {
      kind: "cancel_series",
      patch: {
        ...metadata,
        status: "Tühistatud",
        canceledAt: nowIso.slice(0, 10),
      },
    };
  }
  return {
    kind: "truncate_series",
    patch: {
      ...metadata,
      endDate: previousIsoDate(fromDate),
    },
  };
}

function planTeacherFutureScheduleClear({
  schedule = [],
  groups = [],
  teacherUid = "",
  teacherName = "",
  fromDate = "",
  nowIso = new Date().toISOString(),
  operationId = "preview",
  includeExternalGoogle = false,
} = {}) {
  if (!validIsoDate(fromDate)) throw new Error("Valid fromDate required");
  const options = { teacherUid, nowIso, operationId, includeExternalGoogle };
  const schedulePatches = [];
  let externalGoogleCount = 0;
  (schedule || []).forEach(record => {
    if (!record?.id || !teacherOwnsRecord(record, teacherUid, teacherName)) return;
    if (String(record.source || "") === "gcal") {
      if (futureRecordInScope(record, fromDate)) externalGoogleCount += 1;
    }
    const change = futureScheduleClearPatch(record, fromDate, options);
    if (change) schedulePatches.push({ id: String(record.id), ...change });
  });

  const groupPatches = [];
  let groupLessonCount = 0;
  (groups || []).forEach(group => {
    if (!group?.id) return;
    let changed = 0;
    const lessons = (Array.isArray(group.lessons) ? group.lessons : []).map(lesson => {
      const owner = {
        ...lesson,
        teacherUid: lesson.teacherUid || group.teacherUid || "",
        teacher: lesson.teacher || group.teacher || "",
        source: lesson.source || "keelesepp",
      };
      if (!teacherOwnsRecord(owner, teacherUid, teacherName)) return lesson;
      const change = futureScheduleClearPatch(owner, fromDate, options);
      if (!change) return lesson;
      changed += 1;
      return { ...lesson, ...change.patch };
    });
    if (!changed) return;
    groupLessonCount += changed;
    groupPatches.push({ id: String(group.id), lessons, changedLessonCount: changed });
  });

  const kindCounts = schedulePatches.reduce((result, item) => {
    result[item.kind] = (result[item.kind] || 0) + 1;
    return result;
  }, {});
  return {
    fromDate,
    teacherUid: String(teacherUid || ""),
    teacherName: String(teacherName || ""),
    schedulePatches,
    groupPatches,
    summary: {
      scheduleCount: schedulePatches.length,
      groupLessonCount,
      groupDocumentCount: groupPatches.length,
      totalCount: schedulePatches.length + groupLessonCount,
      externalGoogleCount,
      cancelledSingleCount: kindCounts.cancel_single || 0,
      cancelledSeriesCount: kindCounts.cancel_series || 0,
      truncatedSeriesCount: kindCounts.truncate_series || 0,
      cancelledExternalGoogleCount: kindCounts.cancel_external_google || 0,
    },
  };
}

module.exports = {
  futureRecordInScope,
  futureScheduleClearPatch,
  planTeacherFutureScheduleClear,
  previousIsoDate,
  teacherOwnsRecord,
};
