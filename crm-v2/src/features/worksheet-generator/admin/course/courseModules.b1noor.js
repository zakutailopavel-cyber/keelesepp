// The modules of one course, in course order. A new module of this course is one import and one place in this list.
// „B1 noorkeele õppija” (course key b1noor, owner 2026-11-10): the A2 → B1 course for teens and the 9th-grade exam track,
// lesson design v3 stations; a separate course next to „Eesti keel B1” (courseModules.b1.js), assigned by hand only.
import * as b1noorM01 from './b1noor/module01.js';
import * as b1noorM02 from './b1noor/module02.js';

export const MODULES = [b1noorM01, b1noorM02];
