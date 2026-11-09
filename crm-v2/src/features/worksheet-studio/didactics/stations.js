// Lesson design v3 „stations” (docs/COURSE_DESIGN_STATIONS.md, owner 2026-11-09): a lesson is 4–6 independent stations
// of 8–15 min, each with its own small input. A course module opts in with MODULE.design: 'v3-stations'; its exam lessons
// keep the old (v2 / v4) rules. This is only the flag the lower-level checks read (depth.js, gates.js, finalShape.js) to
// skip the rules that the station design replaces; the station rules themselves are admin/course/stations.js.
export const STATIONS_DESIGN = 'v3-stations';
export const isStationSheet = (doc) => doc?.meta?.design === STATIONS_DESIGN && !doc?.meta?.assessment;
// closed tasks of a station lesson have 5–8 items (a reason to exist, not a quota)
export const STATION_ITEMS = Object.freeze([5, 8]);
