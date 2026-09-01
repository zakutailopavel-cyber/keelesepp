function normalizedIdentity(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9@]+/g, " ")
    .trim();
}

function classifyLessonDataQuality({ lessons = [], students = [], groups = [] } = {}) {
  const studentIds = new Set(students.map(student => String(student.id || "")).filter(Boolean));
  const groupsById = new Map(groups.map(group => [String(group.id || ""), group]).filter(([id]) => id));
  const groupsByName = new Map();
  groups.filter(group => group.active !== false).forEach(group => {
    const key = normalizedIdentity(group.name);
    if (!key) return;
    const matches = groupsByName.get(key) || [];
    matches.push(group);
    groupsByName.set(key, matches);
  });

  const orphanLessons = [];
  const groupLessonsNeedingLink = [];
  let linkedGroupLessonCount = 0;

  lessons.forEach(lesson => {
    const studentId = String(lesson.studentId || "").trim();
    if (studentId && studentIds.has(studentId)) return;

    const groupId = String(lesson.groupId || "").trim();
    if (groupId && groupsById.has(groupId)) {
      linkedGroupLessonCount += 1;
      return;
    }

    const candidateNames = [lesson.groupName];
    const hasExplicitGroupMarker = Boolean(
      groupId
      || lesson.isGroup === true
      || lesson.lessonAudienceType === "group"
      || String(lesson.groupName || "").trim(),
    );
    if (hasExplicitGroupMarker || studentId === "ext") {
      candidateNames.push(lesson.studentName, lesson.name);
    }
    const exactGroups = new Map();
    candidateNames.forEach(name => {
      const key = normalizedIdentity(name);
      (groupsByName.get(key) || []).forEach(group => exactGroups.set(group.id, group));
    });

    if (hasExplicitGroupMarker || exactGroups.size > 0) {
      const exactMatches = [...exactGroups.values()];
      const suggestedGroup = exactMatches.length === 1 ? exactMatches[0] : null;
      groupLessonsNeedingLink.push({
        ...lesson,
        suggestedGroupId: suggestedGroup?.id || "",
        suggestedGroupName: suggestedGroup?.name || "",
        exactGroupMatch: Boolean(suggestedGroup),
        groupMatchCount: exactMatches.length,
      });
      return;
    }

    orphanLessons.push(lesson);
  });

  return {
    orphanLessons,
    groupLessonsNeedingLink,
    linkedGroupLessonCount,
  };
}

function classifyStudentOwnedRecords({ records = [], students = [] } = {}) {
  const studentIds = new Set(students.map(student => String(student.id || "").trim()).filter(Boolean));
  return records.filter(record => {
    const studentId = String(record.studentId || "").trim();
    return !studentId || !studentIds.has(studentId);
  });
}

function cleanIds(values) {
  return [...new Set(values.flatMap(value => Array.isArray(value) ? value : [value])
    .map(value => String(value || "").trim())
    .filter(Boolean))];
}

function studentLoginIds(student = {}) {
  return cleanIds([student.linkedUserIds, student.linkedUserId, student.studentUid]);
}

function studentParentIds(student = {}) {
  return cleanIds([student.linkedParentIds, student.linkedParentId, student.parentUid, student.guardianUid]);
}

function classifyAccountIntegrity({ students = [], userProfiles = [], authUsers = [] } = {}) {
  const activeStudents = students.filter(student => student.active !== false);
  const studentsById = new Map(activeStudents.map(student => [String(student.id || ""), student]));
  const authIds = new Set(authUsers.map(user => String(user.uid || user.id || "").trim()).filter(Boolean));
  const userProfilesById = new Map(userProfiles.map(profile => [String(profile.id || profile.uid || "").trim(), profile]));
  const studentLinksByUid = new Map();
  const missingAuthLinks = [];

  activeStudents.forEach(student => {
    studentLoginIds(student).forEach(uid => {
      const links = studentLinksByUid.get(uid) || [];
      links.push({ studentId: student.id, studentName: student.name || "", relationship: "student" });
      studentLinksByUid.set(uid, links);
      if (!authIds.has(uid)) missingAuthLinks.push({
        uid,
        studentId: student.id,
        studentName: student.name || "",
        relationship: "student",
      });
    });
    studentParentIds(student).forEach(uid => {
      if (!authIds.has(uid)) missingAuthLinks.push({
        uid,
        studentId: student.id,
        studentName: student.name || "",
        relationship: "parent",
      });
    });
  });

  const studentAccountConflicts = [...studentLinksByUid.entries()]
    .filter(([, links]) => links.length > 1)
    .map(([uid, links]) => ({
      uid,
      email: userProfilesById.get(uid)?.email || authUsers.find(user => String(user.uid || user.id) === uid)?.email || "",
      students: links.map(link => ({
        id: link.studentId,
        name: link.studentName,
        email: studentsById.get(link.studentId)?.email || studentsById.get(link.studentId)?.contactEmail || "",
      })),
    }));

  const orphanUserProfiles = userProfiles
    .filter(profile => {
      const uid = String(profile.id || profile.uid || "").trim();
      return uid && !authIds.has(uid) && profile.disabled !== true && profile.active !== false;
    })
    .map(profile => ({
      uid: String(profile.id || profile.uid || "").trim(),
      email: profile.email || "",
      displayName: profile.displayName || profile.name || "",
      role: profile.role || "",
    }));

  const brokenProfileStudentLinks = [];
  userProfiles.forEach(profile => {
    const uid = String(profile.id || profile.uid || "").trim();
    cleanIds([profile.linkedStudentIds, profile.studentIds, profile.studentId]).forEach(studentId => {
      if (!studentsById.has(studentId)) brokenProfileStudentLinks.push({
        uid,
        email: profile.email || "",
        displayName: profile.displayName || profile.name || "",
        studentId,
      });
    });
  });

  return {
    missingAuthLinks,
    studentAccountConflicts,
    orphanUserProfiles,
    brokenProfileStudentLinks,
  };
}

module.exports = {
  classifyAccountIntegrity,
  classifyLessonDataQuality,
  classifyStudentOwnedRecords,
  normalizedIdentity,
};
