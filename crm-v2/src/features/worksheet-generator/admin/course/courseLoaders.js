// One course at a time, on demand: a page that shows a single course does not download the other courses.
export const COURSE_LOADERS = {
  a2: () => import('./courseModules.a2.js'),
  b1: () => import('./courseModules.b1.js'),
  b2: () => import('./courseModules.b2.js'),
  c1: () => import('./courseModules.c1.js'),
  ek9: () => import('./courseModules.ek9.js'),
  en: () => import('./courseModules.en.js'),
};

export const LOADABLE_COURSES = Object.keys(COURSE_LOADERS);

export const loadCourseModules = (course) => COURSE_LOADERS[course]().then((file) => file.MODULES);
