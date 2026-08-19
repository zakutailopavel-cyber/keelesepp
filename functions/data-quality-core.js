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

module.exports = {
  classifyLessonDataQuality,
  normalizedIdentity,
};
