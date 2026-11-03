// The modules of one course, in course order. A new module of this course is one import and one place in this list.
// English B2 (docs/COURSE_FINAL_SHAPE_EN_B2.md, course key `enb2`, lessons en-b2-001…050, modules en-b2-module-01…10):
// registered before its first module. While the list is empty the course is in PENDING_COURSES (courseLoaders.js), so
// no admin page offers it as an empty course; take it out of PENDING_COURSES when module 1 is added here. A module is
//   export const MODULE = { id: 'en-b2-module-NN', course: 'enb2', title, level: 'English B1+' | 'English B2-' |
//     'English B2', language: 'en', design: 'v2', template: 'v4' };
export const MODULES = [];
