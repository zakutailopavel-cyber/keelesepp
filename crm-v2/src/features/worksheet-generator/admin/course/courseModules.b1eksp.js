// The modules of one course, in course order. A new module of this course is one import and one place in this list.
// „B1 eksperimentaalkursus” (course key b1eksp, owner 2026-11-20): an experimental A2 → B1 course; every lesson has two
// sheets on one lesson record — adult („Täiskasvanu”, phase discover) and school pupil („Laps”, phase practice).
import * as b1ekspM01 from './b1eksp/module01.js';

export const MODULES = [b1ekspM01];
