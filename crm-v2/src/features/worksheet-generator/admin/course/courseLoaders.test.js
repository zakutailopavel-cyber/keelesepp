import { COURSE_MODULES } from './registry.js';
import { LOADABLE_COURSES, loadCourseModules } from './courseLoaders.js';

describe('loading one course at a time', () => {
  it('gives the same modules in the same order as the whole list', async () => {
    expect(LOADABLE_COURSES).toEqual([...new Set(COURSE_MODULES.map((mod) => mod.MODULE.course))]);
    const loaded = await Promise.all(LOADABLE_COURSES.map(loadCourseModules));
    LOADABLE_COURSES.forEach((course, index) => {
      expect(loaded[index].map((mod) => mod.MODULE.id)).toEqual(COURSE_MODULES.filter((mod) => mod.MODULE.course === course).map((mod) => mod.MODULE.id));
    });
    expect(loaded.flat().map((mod) => mod.MODULE.id)).toEqual(COURSE_MODULES.map((mod) => mod.MODULE.id));
  });
});
