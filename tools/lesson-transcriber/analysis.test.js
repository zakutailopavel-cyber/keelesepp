'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { learnerSentences, isCorrection, parseSummary, needsAnalysis, summaryPrompt, ANALYSIS_VERSION } = require('./analysis');

test('takes the learner\'s Estonian sentences only', () => {
  const transcript = [
    { speaker: 'teacher', startMs: 0, text: 'Kus sa elad?', lang: 'et' },
    { speaker: 'student', startMs: 1000, text: 'Ma elan Tallinnas koos minu ema. Majas.', lang: 'et', unsure: [3] },
    { speaker: 'student', startMs: 2000, text: 'Как сказать брат?', lang: 'ru' },
    { speaker: 'student', startMs: 3000, text: 'Mul on kaks vend.' }, // an older line without `lang`
    { speaker: 'student', startMs: 4000, text: 'Ну это Mul on' },
  ];
  // a line with unsure words is left out (it may be misheard)
  assert.deepEqual(learnerSentences(transcript), [
    { startMs: 3000, text: 'Mul on kaks vend.', unsure: false },
  ]);
});

test('a correction counts only when words changed', () => {
  assert.equal(isCorrection('Mul on kaks vend.', 'Mul on kaks venda.'), true);
  assert.equal(isCorrection('tere, minu nimi on Sofia', 'Tere! Minu nimi on Sofia.'), false);
  assert.equal(isCorrection('Mul on koer.', ''), false);
});

test('the summary is reduced to short strings; broken output gives nothing', () => {
  const s = parseSummary(JSON.stringify({ kokkuvote: ' Hea  tund. ', meeldis: ['joonistamine', 3, ''], raske: 'not a list', jargmiseks: ['a', 'b', 'c', 'd', 'e', 'f'], extra: 'x' }));
  assert.deepEqual(s, { kokkuvote: 'Hea tund.', meeldis: ['joonistamine', '3'], raske: [], jargmiseks: ['a', 'b', 'c', 'd', 'e'] });
  assert.equal(parseSummary('not json'), null);
  assert.equal(parseSummary('{}'), null);
});

test('only finished recordings with text and without this analysis version are analysed', () => {
  const done = { status: 'done', transcript: [{ speaker: 'student', text: 'Tere' }] };
  assert.equal(needsAnalysis(done), true);
  assert.equal(needsAnalysis({ ...done, analysis: { version: ANALYSIS_VERSION } }), false);
  assert.equal(needsAnalysis({ ...done, status: 'recording' }), false);
  assert.equal(needsAnalysis({ ...done, transcript: [] }), false);
  assert.match(summaryPrompt([{ speaker: 'student', startMs: 61000, text: 'Tere' }]), /\[1:01\] Õpilane: Tere/);
});

test('one lesson: the parts of one invitation on one day, joined in time order', () => {
  const { lessonParts, joinedTranscript, partsFinished } = require('./analysis');
  const all = [
    { id: 'b', invitationId: 'i', startedAt: '2026-10-09T15:38:00Z', status: 'done', transcript: [{ speaker: 'student', startMs: 500, endMs: 900, text: 'Kaks.' }] },
    { id: 'a', invitationId: 'i', startedAt: '2026-10-09T15:19:00Z', status: 'done', transcript: [{ speaker: 'teacher', startMs: 0, endMs: 400, text: 'Üks.' }] },
    { id: 'c', invitationId: 'i', startedAt: '2026-10-12T15:19:00Z', status: 'done', transcript: [] },
    { id: 'd', invitationId: 'other', startedAt: '2026-10-09T15:00:00Z', status: 'done', transcript: [] },
  ];
  const parts = lessonParts(all[0], all);
  assert.deepEqual(parts.map((p) => p.id), ['a', 'b']);
  assert.deepEqual(joinedTranscript(parts).map((l) => [l.text, l.startMs]), [['Üks.', 0], ['Kaks.', 1140500]]);
  assert.equal(partsFinished(parts), true);
  assert.equal(partsFinished([...parts, { status: 'transcribing' }]), false);
});

test('„Paku laused”: only sentences with exactly one gap, unique, at most the count', () => {
  const { parseSentences, withoutGap, sentencesPrompt } = require('./analysis');
  const raw = JSON.stringify({ laused: ['Minu [ema] on õpetaja.', 'Ilma lüngata lause.', 'Kaks [lünka] [siin].', 'minu [ema] on õpetaja.', '  Mul on kaks [venda].  '] });
  assert.deepEqual(parseSentences(raw, 5), ['Minu [ema] on õpetaja.', 'Mul on kaks [venda].']);
  assert.deepEqual(parseSentences('nonsense'), []);
  assert.equal(withoutGap('Mul on kaks [venda].'), 'Mul on kaks venda.');
  assert.match(sentencesPrompt({ topic: 'Minu pere', level: 'A2', grammar: 'osastav', count: 6 }), /Kirjuta 6 .*osastav/s);
});

test("the pet gets only simple numbers and the learner's own corrected sentences", () => {
  const { petLessonStats } = require('./analysis');
  const parts = [{ id: 'a', studentId: 's1', studentUid: 'u1', startedAt: '2026-10-09T15:00:00Z', endedAt: '2026-10-09T15:40:00Z' }];
  const transcript = [
    { speaker: 'student', text: 'Ma elan Tallinnas koos oma emaga.', lang: 'et' },
    { speaker: 'student', text: 'Как это сказать?', lang: 'ru' },
    { speaker: 'teacher', text: 'Väga hea!', lang: 'et' },
  ];
  const stats = petLessonStats({ parts, transcript, errors: [{ said: 'a b', corrected: 'a c' }, { said: 'x y', corrected: 'x z', unsure: true }] });
  assert.deepEqual(stats, { studentId: 's1', studentUid: 'u1', date: '2026-10-09T15:00:00Z', minutes: 40, studentWords: 9, estonianWords: 6, share: 67, longest: 6, practice: [{ said: 'a b', corrected: 'a c' }], lang: 'et' });
  assert.equal(petLessonStats({ parts: [{ id: 'b' }], transcript }), null);
});

test('level filter: words above the level and the reading answer shape', async () => {
  const { loadDidactics, hardWords, parseReading, readingPrompt } = require('./analysis');
  const did = await loadDidactics();
  assert.ok(did && did.forms, 'the CRM didactics are found from the repository');
  assert.deepEqual(hardWords('Ma elan koos emaga Tallinnas. Keskkonnasõbralik tarbimine on oluline.', 'A2', did.forms), ['keskkonnasõbralik', 'tarbimine']);
  assert.deepEqual(hardWords('Keskkonnasõbralik tarbimine on oluline teema.', 'B2', did.forms), [], 'B2 knows these words');
  assert.ok(did.forms.B2 && did.forms.C1, 'B2 and C1 lists are loaded');
  const reading = parseReading(JSON.stringify({ pealkiri: 'Mari päev', tekst: 'Mari ärkab kell seitse. '.repeat(6), kysimused: [{ kysimus: 'Millal Mari ärkab?', vastus: 'kell [seitse]' }, { kysimus: '', vastus: 'x' }] }));
  assert.equal(reading.title, 'Mari päev');
  assert.deepEqual(reading.questions, [{ q: 'Millal Mari ärkab?', a: 'kell seitse' }]);
  assert.equal(parseReading('{"tekst": "liiga lühike"}'), null);
  assert.match(readingPrompt({ topic: 'Pere', norm: did.LEVELS.B1 }), /Miks/);
});

test('a -mine noun counts as its verb', async () => {
  const { loadDidactics, wordLevel } = require('./analysis');
  const did = await loadDidactics();
  assert.equal(wordLevel('raiskamisest', did.forms), wordLevel('raiskama', did.forms));
  assert.ok(wordLevel('õppimine', did.forms));
});

test('the EKI grammar profile gives the targets of a level and what is known before', async () => {
  const { loadDidactics, ekiGrammar } = require('./analysis');
  const did = await loadDidactics();
  assert.ok(did.grammarProfile, 'grammarProfile.json is found');
  const g = ekiGrammar(did.grammarProfile, 'B1-');
  assert.equal(g.level, 'B1');
  assert.ok(g.targets.length > 50 && g.known.length > 100);
});

test('EKI evaluation summary: levels, what is above the level, the highest forms used', () => {
  const { summarizeEvaluation, sentencesOf } = require('./analysis');
  const s = summarizeEvaluation({
    evaluatedText: [{ text: 'Ma', lemma: 'mina', pos: 'P', level: 'A1' }, { text: 'ostaksin', lemma: 'ostma', pos: 'V', level: 'A1' }, { text: '.', pos: 'Z', level: '' }],
    evaluatedGrammarText: [{ text: 'ostaksin', level: 'B1', formXinfo: 'tingiv kõneviis' }, { text: 'Ma', level: 'A1', formXinfo: 'ainsuse nimetav' }],
  }, 'A2');
  assert.equal(s.words, 2);
  assert.deepEqual(s.aboveForms, [{ text: 'ostaksin', lemma: undefined, level: 'B1', form: 'tingiv kõneviis' }]);
  assert.deepEqual(s.topForms[0], { text: 'ostaksin', level: 'B1', form: 'tingiv kõneviis' });
  assert.deepEqual(sentencesOf('Ma elan Tallinnas. Jah. Mul on koer!'), ['Ma elan Tallinnas.', 'Mul on koer!']);
});

test('foreign recognition noise and lists of one word\'s forms are not checked (owner 2026-10-10)', () => {
  const { looksEstonian, isFormList, learnerSpeech } = require('./analysis');
  const line = (text) => ({ speaker: 'student', startMs: 0, text, lang: 'et' });
  const transcript = ['The bovli out of the book.', 'Minera é sra do pojo.', "I'm still guys. Yeah.", 'Jõgi jõe jõge.', ', käsi, käe, kätt.', 'Ravi, ravimu, ravimud.', 'Olulik näitaja.', 'Minu sõber võttis kaasa väikese.'].map(line);
  assert.deepEqual(learnerSentences(transcript).map((s) => s.text), ['Olulik näitaja.', 'Minu sõber võttis kaasa väikese.']);
  assert.equal(looksEstonian('Ma elan Tallinnas.'), true);
  assert.equal(looksEstonian('See on minu maja ja me elame siin.'), true);
  assert.equal(looksEstonian('from the way you before.'), false);
  assert.equal(isFormList('Suur, suur, suurt.'), true);
  assert.equal(isFormList('Ma lähen koju.'), false);
  const speech = learnerSpeech([line('The bovli out of the book.'), line('Ma elan Tallinnas.'), { speaker: 'student', text: 'Я не знаю', lang: 'ru' }]);
  assert.deepEqual(speech, { words: 12, langWords: 3 });
});
