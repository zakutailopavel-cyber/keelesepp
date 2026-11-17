// Lesson design v3 „stations” (docs/COURSE_DESIGN_STATIONS.md, owner 2026-11-09): a lesson is 4–6 independent stations
// of 8–15 min, each with its own small input. A course module opts in with MODULE.design: 'v3-stations'; its exam lessons
// keep the old (v2 / v4) rules. This is only the flag the lower-level checks read (depth.js, gates.js, finalShape.js) to
// skip the rules that the station design replaces; the station rules themselves are admin/course/stations.js.
export const STATIONS_DESIGN = 'v3-stations';
export const isStationSheet = (doc) => doc?.meta?.design === STATIONS_DESIGN && !doc?.meta?.assessment;
// closed tasks of a station lesson have 5–8 items (a reason to exist, not a quota)
export const STATION_ITEMS = Object.freeze([5, 8]);
// design v4 „task-based” (owner 2026-11-17) runs on the station sheets and adds `meta.format`; its exit check (data.exit,
// 2–3 items) is exempt from the item minimum
export const isTaskDesign = (doc) => isStationSheet(doc) && Boolean(doc?.meta?.format);
export const isExitCheck = (b) => Boolean(b?.data?.exit);

// design v4 gate adjustments (owner OK 2026-11-17, docs/COURSE_DESIGN_STATIONS.md §7.3); v2 / v3 sheets keep the old rules.
// 1. the long writing of the „Kodus” card (a writing task marked data.home: the class only plans it and writes the first
//    sentences, the text itself is homework) is not lesson time: it stays in the lesson's formats, goals and exam corner,
//    not in its minutes. The 1-minute voice message keeps its old place (it is short and part of the lesson's balance).
const WRITING_TYPES = ['writing', 'guidedletter', 'examwriting'];
export const isHomeWriting = (b) => Boolean(b?.data?.home) && WRITING_TYPES.includes(b?.type);
// 2. a chat (dialogue) block without gaps is an input to read, not a closed task: its gaps are counted in the line texts
//    (the old count read the brackets of the JSON array and saw one item in every chat)
export const dialogueGaps = (d) => (String((d?.lines || []).map((l) => l?.text || '').join('\n')).match(/\[[^\]]*\]/g) || []).length;
// 3. every lesson has one substantial input besides the hook (station 1): a text of ≥ 120 words (the station text cap)
//    or a recording of ≥ 60 s (≈ 110 words at the 110 words a minute of didactics/timeEstimate.js)
export const V4_INPUT = Object.freeze({ textWords: 120, audioWords: 110 });
// 4. a short listening row (choice or true / false of goal g_listen: the teacher's word, a minimal pair) is not a sentence
//    of the level and stays out of the sentence-length check
export const isListeningRow = (b) => b?.goal === 'g_listen' && ['choice', 'truefalse'].includes(b?.type);
