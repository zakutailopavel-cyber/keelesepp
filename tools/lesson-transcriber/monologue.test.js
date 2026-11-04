'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { needsTranscript, needsAnalysis, monthSince, monologueText, wpmOf, transcriptFields, createMonologueWorker, SCAN_FIELDS } = require('./monologue');

const DELETE = Symbol('delete');
const deleteField = () => DELETE;

// a small in-memory Firestore: collection().where().select().get(), doc().get()/set(), runTransaction with get/update
function fakeDb(initial = {}) {
  const data = new Map(Object.entries(initial).map(([k, v]) => [k, { ...v }]));
  const queries = [];
  const apply = (target, fields) => {
    for (const [k, v] of Object.entries(fields)) { if (v === DELETE) delete target[k]; else target[k] = v; }
  };
  const ref = (col, id) => ({
    id, path: `${col}/${id}`,
    async get() { const v = data.get(`${col}/${id}`); return { exists: Boolean(v), id, data: () => (v ? { ...v } : undefined) }; },
    async set(v) { data.set(`${col}/${id}`, { ...v }); },
    async update(f) { apply(data.get(`${col}/${id}`), f); },
  });
  const query = (col, filters = [], fields = null) => ({
    where: (field, op, value) => query(col, [...filters, { field, op, value }], fields),
    select: (...f) => query(col, filters, f),
    async get() {
      queries.push({ col, filters, fields });
      const docs = [...data.entries()].filter(([k]) => k.startsWith(`${col}/`)).map(([k, v]) => ({ id: k.slice(col.length + 1), v }))
        .filter(({ v }) => filters.every((f) => (f.op === '>=' ? String(v[f.field]) >= f.value : v[f.field] === f.value)))
        .map(({ id, v }) => ({ id, ref: ref(col, id), data: () => (fields ? Object.fromEntries(fields.filter((x) => x in v).map((x) => [x, v[x]])) : { ...v }) }));
      return { docs };
    },
  });
  return {
    data, queries,
    collection: (col) => ({ ...query(col), doc: (id) => ref(col, id) }),
    async runTransaction(fn) {
      return fn({ get: (r) => r.get(), update: (r, f) => apply(data.get(r.path), f) });
    },
  };
}

const NOW = new Date('2026-11-20T10:00:00.000Z');
const take = (extra = {}) => ({
  studentId: 's1', studentUid: 'u1', month: '2026-11', promptId: 'et-self-v1', level: 'B1',
  audioPath: 'homework/s1/monologues/2026-11.webm', contentType: 'audio/webm', seconds: 120,
  createdAt: '2026-11-19T08:00:00.000Z', updatedAt: '2026-11-19T08:00:00.000Z', ...extra,
});
const LINES = [
  { speaker: 'student', startMs: 0, endMs: 4000, text: 'Mina olen Mari ja ma elan Tallinnas.', lang: 'et' },
  { speaker: 'student', startMs: 5000, endMs: 9000, text: 'Eile ma läksin pood ja ostsin leiba.', lang: 'et' },
  { speaker: 'student', startMs: 9500, endMs: 11000, text: 'как сказать', lang: 'ru' },
];

test('job selection: audio without a text of this take', () => {
  assert.equal(needsTranscript(take()), true, 'new');
  assert.equal(needsTranscript(take({ transcribedTake: '2026-11-19T08:00:00.000Z' })), false, 'done for this take');
  assert.equal(needsTranscript(take({ transcribedTake: '2026-11-01T08:00:00.000Z' })), true, 're-recorded: the old text is stale');
  assert.equal(needsTranscript(take({ audioPath: '' })), false, 'no audio');
  assert.equal(needsTranscript(take({ audioDeletedAt: '2027-01-01' })), false, 'audio deleted');
  const broken = { transcribeError: 'ffmpeg', transcribeErrorTake: '2026-11-19T08:00:00.000Z' };
  assert.equal(needsTranscript(take({ ...broken, transcribeAttempts: 2 })), true, 'tried again');
  assert.equal(needsTranscript(take({ ...broken, transcribeAttempts: 3 })), false, 'three attempts at most');
  assert.equal(needsTranscript(take({ ...broken, transcribeAttempts: 3, updatedAt: '2026-11-20T08:00:00.000Z' })), true, 'a new take starts again');
  assert.equal(needsAnalysis(take()), false, 'no text yet');
  assert.equal(needsAnalysis(take({ transcribedTake: '2026-11-19T08:00:00.000Z' })), true);
  assert.equal(needsAnalysis(take({ transcribedTake: '2026-11-19T08:00:00.000Z', analyzedTake: '2026-11-19T08:00:00.000Z' })), false);
  assert.equal(monthSince(NOW), '2026-10');
});

test('text, Estonian words and words per minute', () => {
  const { transcript, words } = monologueText(LINES);
  assert.equal(transcript, 'Mina olen Mari ja ma elan Tallinnas. Eile ma läksin pood ja ostsin leiba. как сказать');
  assert.equal(words, 14, 'the Russian aside is not counted');
  assert.equal(wpmOf(14, 120), 7);
  assert.equal(wpmOf(14, 5), null, 'too short to say');
  const fields = transcriptFields({ lines: LINES, seconds: 120, take: 't1', host: 'kool-mac', model: 'ggml-taltech-et-verbatim-2604.bin', now: NOW, deleteField });
  assert.deepEqual(fields, {
    transcript: 'Mina olen Mari ja ma elan Tallinnas. Eile ma läksin pood ja ostsin leiba. как сказать', words: 14, wpm: 7,
    transcribedAt: NOW.toISOString(), transcriber: 'kool-mac', transcriptModel: 'ggml-taltech-et-verbatim-2604.bin',
    transcribedTake: 't1', transcribeError: DELETE, transcribeErrorTake: DELETE, transcribeAttempts: DELETE,
  });
});

test('the worker scans few fields, transcribes, writes the text and the staff-only analysis', async () => {
  const db = fakeDb({
    'studentMonologues/s1_2026-11': take(),
    'studentMonologues/s2_2026-11': take({ studentId: 's2', audioPath: 'homework/s2/monologues/2026-11.webm', transcribedTake: '2026-11-19T08:00:00.000Z', analyzedTake: '2026-11-19T08:00:00.000Z', transcript: 'x' }),
    'studentMonologues/s3_2026-08': take({ studentId: 's3', month: '2026-08', audioPath: 'homework/s3/monologues/2026-08.webm' }),
  });
  const heard = [];
  const worker = createMonologueWorker({
    db, deleteField, host: 'kool-mac', model: 'et.bin', gecModel: 'llammas-gec', now: () => NOW,
    transcribe: async (audioPath) => { heard.push(audioPath); return LINES; },
  });
  const gec = async (s) => (s.startsWith('Eile') ? 'Eile ma läksin poodi ja ostsin leiba.' : s);
  assert.equal(await worker.work({ gec }), 1, 'recent months only: one job');
  assert.deepEqual(db.queries[0].filters, [{ field: 'month', op: '>=', value: '2026-10' }]);
  assert.deepEqual(db.queries[0].fields, SCAN_FIELDS, 'never the whole doc');
  assert.deepEqual(heard, ['homework/s1/monologues/2026-11.webm']);
  const doc = db.data.get('studentMonologues/s1_2026-11');
  assert.equal(doc.words, 14);
  assert.equal(doc.wpm, 7);
  assert.equal(doc.transcribedTake, '2026-11-19T08:00:00.000Z');
  assert.equal(doc.analyzedTake, '2026-11-19T08:00:00.000Z');
  assert.equal(doc.transcriber, 'kool-mac');
  assert.equal(doc.seconds, 120, 'the take is untouched');
  assert.equal('analysis' in doc, false, 'errors are not on the doc the student reads');
  const analysis = db.data.get('studentMonologueAnalysis/s1_2026-11');
  assert.equal(analysis.studentId, 's1');
  assert.equal(analysis.take, '2026-11-19T08:00:00.000Z');
  assert.equal(analysis.checked, 2);
  assert.deepEqual(analysis.errors.map((e) => [e.said, e.corrected]), [['Eile ma läksin pood ja ostsin leiba.', 'Eile ma läksin poodi ja ostsin leiba.']]);
  assert.equal(analysis.focus.length, 1);
  assert.equal(analysis.focus[0].count, 1);
  assert.deepEqual(analysis.models, { gec: 'llammas-gec' });

  // the full scan finds the old month too; without the GEC model only the text is made
  heard.length = 0;
  assert.equal(await worker.work({ all: true, gec: null }), 1);
  assert.deepEqual(db.queries[1].filters, []);
  assert.deepEqual(heard, ['homework/s3/monologues/2026-08.webm']);
  assert.equal(db.data.get('studentMonologues/s3_2026-08').words, 14);
  assert.equal(db.data.get('studentMonologues/s3_2026-08').analyzedTake, undefined);
  assert.equal(db.data.has('studentMonologueAnalysis/s3_2026-08'), false);
  // later, with the model: only the analysis, from the stored text (no new transcription)
  heard.length = 0;
  assert.equal(await worker.work({ all: true, gec }), 1);
  assert.deepEqual(heard, []);
  assert.equal(db.data.get('studentMonologueAnalysis/s3_2026-08').checked, 2);
  assert.equal(await worker.work({ all: true, gec }), 0, 'nothing left');
});

test('a re-record during transcription is not overwritten with the old text; a failure is counted', async () => {
  const db = fakeDb({ 'studentMonologues/s1_2026-11': take() });
  const worker = createMonologueWorker({
    db, deleteField, now: () => NOW,
    transcribe: async () => {
      // the student records again while the Mac works
      Object.assign(db.data.get('studentMonologues/s1_2026-11'), { updatedAt: '2026-11-20T09:59:00.000Z', seconds: 90 });
      return LINES;
    },
  });
  await worker.work({});
  const doc = db.data.get('studentMonologues/s1_2026-11');
  assert.equal(doc.transcript, undefined);
  assert.equal(doc.transcribedTake, undefined);

  const failing = createMonologueWorker({ db, deleteField, now: () => NOW, transcribe: async () => { throw new Error('ffmpeg: invalid data'); } });
  for (let i = 0; i < 4; i += 1) await failing.work({});
  assert.equal(doc.transcribeError, 'ffmpeg: invalid data');
  assert.equal(doc.transcribeAttempts, 3, 'stops after three attempts');
  assert.equal(doc.transcribeErrorTake, '2026-11-20T09:59:00.000Z');
});
