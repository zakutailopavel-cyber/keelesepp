// One course at a time, on demand: a page that shows a single course does not download the other courses.
export const COURSE_LOADERS = {
  a2: () => import('./courseModules.a2.js'),
  b1: () => import('./courseModules.b1.js'),
  b2: () => import('./courseModules.b2.js'),
  c1: () => import('./courseModules.c1.js'),
  ek9: () => import('./courseModules.ek9.js'),
  en: () => import('./courseModules.en.js'),
  enb2: () => import('./courseModules.enb2.js'),
};

// courses registered before their first module (docs/COURSE_FINAL_SHAPE_EN_B2.md §9): they have a loader, but no admin
// page offers them while they are empty. Remove a course from here in the PR that adds its module 1 (courseLoaders.test.js
// fails while a pending course has modules). English B2 left the list with its module 1 (en/b2/module01.js).
export const PENDING_COURSES = [];

export const LOADABLE_COURSES = Object.keys(COURSE_LOADERS).filter((course) => !PENDING_COURSES.includes(course));

export const loadCourseModules = (course) => COURSE_LOADERS[course]().then((file) => file.MODULES);
