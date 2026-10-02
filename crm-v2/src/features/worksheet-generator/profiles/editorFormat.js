import { scaffoldGeneratorProfile, sanitizeGeneratorProfile } from './authoring.js';

const SEP = '::';
const clean = (value) => String(value ?? '').trim();
const csv = (value) => clean(value).split(',').map((item) => item.trim()).filter(Boolean);
const lines = (value) => String(value ?? '').split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith('#'));
const joinCsv = (items) => (items || []).join(', ');
const joinLine = (items) => items.map((item) => String(item ?? '').trim()).join(` ${SEP} `);

function maps(profile) {
  const byId = (items) => new Map((items || []).map((item) => [item.id, item]));
  return {
    focus: byId(profile?.focuses),
    vocab: byId(profile?.activeVocabulary),
    context: byId(profile?.contexts),
    sentence: byId(profile?.banks?.sentences),
    error: byId(profile?.banks?.errorPairs),
    translation: byId(profile?.banks?.translations),
    speaking: byId(profile?.banks?.speakingPrompts),
    writing: byId(profile?.banks?.writingPrompts),
  };
}

function parseRows(text, section, expected, mapper, diagnostics) {
  return lines(text).map((line, index) => {
    const parts = line.split(SEP).map((item) => item.trim());
    if (parts.length < expected) {
      diagnostics.push({
        severity: 'error',
        code: 'PROFILE_EDITOR_ROW_INVALID',
        message: `${section}, rida ${index + 1}: oodati vähemalt ${expected} välja eraldajaga "::".`,
        section,
        row: index + 1,
      });
      return null;
    }
    try {
      return mapper(parts, index);
    } catch (error) {
      diagnostics.push({
        severity: 'error',
        code: 'PROFILE_EDITOR_ROW_INVALID',
        message: `${section}, rida ${index + 1}: ${error.message}`,
        section,
        row: index + 1,
      });
      return null;
    }
  }).filter(Boolean);
}

export function profileToEditorFields(profile, lesson = {}) {
  const source = profile || scaffoldGeneratorProfile(lesson);
  return {
    lessonKind: source.lessonKind || 'integrated',
    level: source.level || lesson.levelStage || lesson.level || 'A1',
    title: source.title || lesson.title || '',
    focuses: (source.focuses || []).map((item) => joinLine([item.id, item.type || 'communication', item.label])).join('\n'),
    vocabulary: (source.activeVocabulary || []).map((item) => joinLine([
      item.id,
      item.word,
      item.translation,
      item.lexicalType || 'other',
      joinCsv(item.focusIds),
    ])).join('\n'),
    contexts: (source.contexts || []).map((item) => joinLine([item.id, item.label, joinCsv(item.times)])).join('\n'),
    sentences: (source.banks?.sentences || []).map((item) => joinLine([
      item.id,
      joinCsv(item.focusIds),
      joinCsv(item.contextIds),
      item.difficulty || 1,
      JSON.stringify(item.slots || {}),
      item.text,
    ])).join('\n'),
    errorPairs: (source.banks?.errorPairs || []).map((item) => joinLine([
      item.id,
      joinCsv(item.focusIds),
      item.wrong,
      item.correct,
    ])).join('\n'),
    translations: (source.banks?.translations || []).map((item) => joinLine([
      item.id,
      joinCsv(item.focusIds),
      item.sourceLang || 'ru',
      item.source,
      item.target,
    ])).join('\n'),
    speakingPrompts: (source.banks?.speakingPrompts || []).map((item) => joinLine([
      item.id,
      joinCsv(item.focusIds),
      joinCsv(item.contextIds),
      item.text,
    ])).join('\n'),
    writingPrompts: (source.banks?.writingPrompts || []).map((item) => joinLine([
      item.id,
      joinCsv(item.focusIds),
      joinCsv(item.contextIds),
      item.text,
    ])).join('\n'),
    dialoguesJson: JSON.stringify(source.banks?.dialogues || [], null, 2),
    successCriteria: (source.successCriteria || []).join('\n'),
  };
}

export function editorFieldsToProfile(fields = {}, { lesson = {}, baseProfile = null } = {}) {
  const diagnostics = [];
  const preserved = maps(baseProfile || {});
  const lessonId = lesson.id || baseProfile?.lessonId || '';

  const focuses = parseRows(fields.focuses, 'Fookused', 3, ([id, type, ...label]) => ({
    ...(preserved.focus.get(id) || {}),
    id,
    type,
    label: label.join(` ${SEP} `),
  }), diagnostics);

  const activeVocabulary = parseRows(fields.vocabulary, 'Sõnavara', 5, ([id, word, translation, lexicalType, ...focusIds]) => ({
    ...(preserved.vocab.get(id) || {}),
    id,
    word,
    translation,
    lexicalType,
    focusIds: csv(focusIds.join(` ${SEP} `)),
  }), diagnostics);

  const contexts = parseRows(fields.contexts, 'Kontekstid', 3, ([id, label, ...times]) => ({
    ...(preserved.context.get(id) || {}),
    id,
    label,
    times: csv(times.join(` ${SEP} `)),
  }), diagnostics);

  const sentences = parseRows(fields.sentences, 'Laused', 6, ([id, focusIds, contextIds, difficulty, slotJson, ...text]) => {
    let parsedSlots = {};
    if (slotJson && slotJson !== '{}') {
      try {
        parsedSlots = JSON.parse(slotJson);
      } catch {
        throw new Error('slots JSON on vigane.');
      }
    }
    return {
      ...(preserved.sentence.get(id) || {}),
      id,
      focusIds: csv(focusIds),
      contextIds: csv(contextIds),
      difficulty: Number(difficulty) || 1,
      slots: parsedSlots,
      text: text.join(` ${SEP} `),
    };
  }, diagnostics);

  const errorPairs = parseRows(fields.errorPairs, 'Veaparandused', 4, ([id, focusIds, wrong, ...correct]) => ({
    ...(preserved.error.get(id) || {}),
    id,
    focusIds: csv(focusIds),
    wrong,
    correct: correct.join(` ${SEP} `),
  }), diagnostics);

  const translations = parseRows(fields.translations, 'Tõlked', 5, ([id, focusIds, sourceLang, source, ...target]) => ({
    ...(preserved.translation.get(id) || {}),
    id,
    focusIds: csv(focusIds),
    sourceLang,
    source,
    target: target.join(` ${SEP} `),
  }), diagnostics);

  const promptRows = (field, section, preservedMap) => parseRows(field, section, 4, ([id, focusIds, contextIds, ...text]) => ({
    ...(preservedMap.get(id) || {}),
    id,
    focusIds: csv(focusIds),
    contextIds: csv(contextIds),
    text: text.join(` ${SEP} `),
  }), diagnostics);

  let dialogues = baseProfile?.banks?.dialogues || [];
  if (clean(fields.dialoguesJson)) {
    try {
      const parsed = JSON.parse(fields.dialoguesJson);
      if (!Array.isArray(parsed)) throw new Error('Dialoogid peavad olema JSON massiiv.');
      dialogues = parsed;
    } catch (error) {
      diagnostics.push({ severity: 'error', code: 'PROFILE_DIALOGUES_JSON_INVALID', message: `Dialoogid: ${error.message}` });
    }
  }

  const raw = {
    ...(baseProfile || {}),
    schema: baseProfile?.schema,
    version: baseProfile?.version,
    lessonId,
    lessonKind: fields.lessonKind,
    level: fields.level,
    title: fields.title || lesson.title,
    focuses,
    activeVocabulary,
    contexts,
    banks: {
      ...(baseProfile?.banks || {}),
      sentences,
      errorPairs,
      translations,
      dialogues,
      speakingPrompts: promptRows(fields.speakingPrompts, 'Rääkimisülesanded', preserved.speaking),
      writingPrompts: promptRows(fields.writingPrompts, 'Kirjutamisülesanded', preserved.writing),
    },
    successCriteria: lines(fields.successCriteria),
  };

  if (diagnostics.some((item) => item.severity === 'error')) return { profile: null, diagnostics };
  try {
    const profile = sanitizeGeneratorProfile(raw, { lessonId, lesson });
    return { profile, diagnostics };
  } catch (error) {
    return {
      profile: null,
      diagnostics: [...diagnostics, { severity: 'error', code: 'PROFILE_EDITOR_INVALID', message: error.message }],
    };
  }
}

export const PROFILE_EDITOR_SEPARATOR = SEP;
