// Sub-goals per English B2 lesson (docs/COURSE_FINAL_SHAPE_EN_B2.md §6; the same contract as the Estonian courses,
// docs/LESSON_QUALITY_CONTRACT.md A2–A4): four sub-goals per lesson (three for grammar lessons and module checks), shared
// by the three sheets, and the lesson's success criterion for the teacher. Written in English, as the sheets are. Filled
// module by module with the lessons (en-b2-001…050). An entry:
//   'en-b2-001': { goals: { g_vocab: 'The learner …', g_read: '…', g_notice: '…', g_use: '…' }, tags: { blockId: 'g_vocab' },
//     success: 'The learner writes a 120-word letter that …' },
export const EN_B2_LESSON_GOALS = {
  // module 1 „Who we are” (en/b2/module01.js)
  'en-b2-001': {
    goals: {
      g_vocab: 'The learner uses words for generations and age (stereotype, generation gap, life expectancy, to take for granted) and forms related words (expect → expectancy).',
      g_read: 'The learner understands an article and street interviews about generations and explains in their own words why a generation label can mislead (age, period, size).',
      g_notice: 'The learner chooses between the present perfect simple (result, number, state) and continuous (activity, how long) and keeps state verbs simple.',
      g_use: 'The learner discusses generation labels, agrees on family rules in a role play and presents a 3–4-minute podcast segment comparing two generations.',
    },
    success: 'The learner speaks for three to four minutes comparing their generation with their parents\', gives reasons and uses the present perfect simple and continuous correctly at least four times.',
  },
  'en-b2-002': {
    goals: {
      g_read: 'The learner understands a memoir of 20 June 1992, a radio interview and a model story, and follows the order of events.',
      g_notice: 'The learner tells apart the past simple (events), past continuous (background) and past perfect simple and continuous (earlier events and long actions) and uses time words (by the time, while, as soon as).',
      g_use: 'The learner tells a story about a day that changed things, discusses which story to print and writes a 140–160-word story with all four past tenses.',
    },
    success: 'The learner writes a 140–160-word story with a clear turning moment in which the past perfect shows what had happened earlier.',
  },
  'en-b2-003': {
    goals: {
      g_read: 'The learner understands a podcast about turning points, a popular-science text on the reminiscence bump, a life story with gaps and a museum coordinator\'s talk.',
      g_notice: 'The learner chooses between the past perfect simple and continuous (how long before a past moment, a visible result) and uses phrases for turning points.',
      g_use: 'The learner talks about turning points, conducts an oral-history interview and writes a 120-word semi-formal letter (state exam writing task 1) to a museum project.',
    },
    success: 'The learner writes a semi-formal letter of about 120 words that covers all four points, has the right opening and closing and uses the past perfect continuous at least once.',
  },
  'en-b2-004': {
    goals: {
      g_read: 'The learner understands a radio interview with a youth researcher, a 490-word article with Eurostat data on leaving home (state exam reading task 2) and an exchange plan.',
      g_notice: 'The learner forms question tags after all the module\'s tenses (didn\'t you, hasn\'t she, aren\'t I, shall we, do they) and uses falling and rising tone.',
      g_use: 'The learner discusses leaving home, talks on a topic card for at least 1 minute 45 seconds, compares two photos (state exam speaking tasks 2 and 1) and writes an opinion piece.',
    },
    success: 'The learner compares two photos for at least 1 minute 45 seconds, answers the examiner\'s questions with reasons and checks facts with correct question tags.',
  },
  'en-b2-005': {
    goals: {
      g_read: 'The learner does three listening tasks and five reading and language tasks in the state exam\'s form, in the given time.',
      g_notice: 'The learner shows control of the module\'s tenses and question tags in correction, dictation and transformation tasks.',
      g_use: 'The learner writes a 120-word letter to an organiser and does both speaking tasks of the state exam with at least 1 minute 45 seconds of own talk each.',
    },
    success: 'The teacher can place the learner on the B1/B2 line in every part of the exam and names the two weakest skills for the next modules.',
  },
};
