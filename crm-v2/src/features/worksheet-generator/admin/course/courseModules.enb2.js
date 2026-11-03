// The modules of one course, in course order. A new module of this course is one import and one place in this list.
// English B2 (docs/COURSE_FINAL_SHAPE_EN_B2.md, course key `enb2`, lessons en-b2-001…050, modules en-b2-module-01…10).
// A module is
//   export const MODULE = { id: 'en-b2-module-NN', course: 'enb2', title, level: 'English B1+' | 'English B2-' |
//     'English B2', language: 'en', design: 'v2', template: 'v4' };
import * as enb2m01 from './en/b2/module01.js';

export const MODULES = [enb2m01];
