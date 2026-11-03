// The course modules produced in code (docs/B1_B2_COURSE_PRODUCTION.md). Each module file (listed in courseModules.<course>.js) exports MODULE and LESSONS
// ({ [lessonId]: { title, canDo, practice?, transfer?, discover? } }); the admin page „Kursuse tootmine” previews
// and publishes them lesson by lesson. Avasta sheets that are already published are not part of these files unless a
// module says so.
import { MODULES as A2_MODULES } from './courseModules.a2.js';
import { MODULES as B1_MODULES } from './courseModules.b1.js';
import { MODULES as B2_MODULES } from './courseModules.b2.js';
import { MODULES as C1_MODULES } from './courseModules.c1.js';
import { MODULES as EK9_MODULES } from './courseModules.ek9.js';
import { MODULES as EN_MODULES } from './courseModules.en.js';
import { MODULES as EN_B2_MODULES } from './courseModules.enb2.js';

export * from './courseSheet.js';

// every course together: 11 MB of code. A page that shows one course uses courseLoaders.js instead.
export const COURSE_MODULES = [...A2_MODULES, ...B1_MODULES, ...B2_MODULES, ...C1_MODULES, ...EK9_MODULES, ...EN_MODULES, ...EN_B2_MODULES];
