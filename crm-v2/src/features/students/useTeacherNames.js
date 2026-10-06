import { useEffect, useState } from 'react';
import { teachersService } from '../../services/firebase/teachers.js';
import { canonicalTeacherName } from '../../utils/teachers.js';
import { LEGACY_TEACHERS } from './studentOptions.js';

// Teacher choices for a student: the staff accounts (admin, teacher) plus the legacy names, so a newly approved
// teacher shows up without a code change. Disabled accounts are left out.
export function useTeacherNames(enabled = true, repository) {
  const source = repository || teachersService;
  const [staff, setStaff] = useState([]);
  useEffect(() => {
    if (!enabled) return undefined;
    let live = true;
    source.list()
      .then((list) => { if (live) setStaff(list.filter((teacher) => !teacher.disabled).map((teacher) => canonicalTeacherName(teacher.name)).filter(Boolean)); })
      .catch(() => {});
    return () => { live = false; };
  }, [enabled, source]);
  return staff;
}

export function teacherChoices(staff, ...extra) {
  return [...new Set([...LEGACY_TEACHERS, ...staff, ...extra.flat().map(canonicalTeacherName)].filter(Boolean))].sort((left, right) => left.localeCompare(right, 'et'));
}
