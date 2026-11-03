import { COURSE_MODULES } from './registry.js';
import { COURSE_LOADERS, LOADABLE_COURSES, PENDING_COURSES, loadCourseModules } from './courseLoaders.js';
import { COURSES } from './courseSheet.js';

describe('loading one course at a time', () => {
  it('gives the same modules in the same order as the whole list', async () => {
    expect(LOADABLE_COURSES).toEqual([...new Set(COURSE_MODULES.map((mod) => mod.MODULE.course))]);
    const loaded = await Promise.all(LOADABLE_COURSES.map(loadCourseModules));
    LOADABLE_COURSES.forEach((course, index) => {
      expect(loaded[index].map((mod) => mod.MODULE.id)).toEqual(COURSE_MODULES.filter((mod) => mod.MODULE.course === course).map((mod) => mod.MODULE.id));
    });
    expect(loaded.flat().map((mod) => mod.MODULE.id)).toEqual(COURSE_MODULES.map((mod) => mod.MODULE.id));
  });

  // a registered course without modules (English B2 before its module 1) is not offered as an empty course; it leaves
  // PENDING_COURSES in the PR that adds its first module
  it('keeps a pending course loadable but hidden while it is empty', async () => {
    for (const course of PENDING_COURSES) {
      expect(COURSE_LOADERS[course]).toBeTypeOf('function');
      expect(COURSES[course]).toBeTruthy();
      expect(LOADABLE_COURSES).not.toContain(course);
      expect(await loadCourseModules(course), `${course} has modules: remove it from PENDING_COURSES`).toEqual([]);
    }
  });
});
