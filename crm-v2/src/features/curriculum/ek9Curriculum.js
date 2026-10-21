// Eesti keel emakeelena, 9. klass emakeel (docs/NATIVE_ESTONIAN_9_12_PLAN.md): 30 lessons in 6 modules that prepare the
// põhikooli eesti keele lõpueksam (Harno eristuskiri 2026/2027). Module topics follow the exam (reading, language tasks,
// short essay) and the grade 7–9 spelling topics of PRÕK 2011 lisa 1 that the exam description names as its source.
// Lesson 5 of each module is a check in exam form. Records go to curriculumLessons/{id} (Õppevara: Eesti keel →
// 9. klass emakeel → module).

export const EK9_CURRICULUM_ID = 'est-ek9-emakeel-v1';
export const EK9_CURRICULUM_TITLE = 'KeeleSepp 9. klass emakeel (lõpueksam)';
export const EK9_LEVEL = '9. klass emakeel';
export const EK9_VERSION = '2026-10-21.1';

export const EK9_MODULES = Object.freeze([
  {
    number: 1, title: 'Tekstimõistmine', goal: 'Ilukirjandusliku, teabe- ja meediateksti mõistmine ja tõlgendamine nagu eksami lugemisosas.',
    lessons: [
      ['Ilukirjanduslik tekst: tegelane ja tema valikud', 'Tegelase iseloom, tegude põhjused ja muutus; fakt ja tõlgendus; tsitaat ja kaudkõne.'],
      ['Ilukirjanduslik tekst: kujundlik keel ja peamõte', 'Võrdlus, metafoor, isikustamine, sümbol; sisu ja peamõte; teoste ja nimede algustäht.'],
      ['Teabetekst: tekst, joonis ja olulise info leidmine', 'Teksti ja joonise sidumine, fakt ja arvamus; arvude, kuupäevade ja lühendite kirjutamine.'],
      ['Meediatekst: fakt, arvamus ja mõjutamine', 'Uudis ja arvamuslugu, mõjutamisvõtted, kommentaarium ja reklaam; arvamusavaldus.'],
      ['Mooduli 1 kontroll: lugemisosa eksami vormis', 'Kaks lugemisteksti, keeleülesanded ja lühikirjand eksami skaala järgi.'],
    ],
  },
  {
    number: 2, title: 'Häälikuõigekiri', goal: 'Veaohtlike sõnade õigekiri, kaashäälikuühend, võõrsõnad, poolitamine ja välte seos õigekirjaga.',
    lessons: [
      ['Kaashäälikuühend ja veaohtlikud sõnad', 'Kaashäälikuühendi põhireegel, liitega sõnad ja erandid; veaohtliku häälikuõigekirjaga sõnad.'],
      ['Sulghäälikud ning h ja i/j', 'g, b, d ja k, p, t sõna alguses, keskel ja lõpus; h sõna alguses; i ja j õigekiri.'],
      ['Välted, silbid ja õigekiri', 'Silbitamine, pikk ja lühike silp, välte ja õigekirja seosed; õigekeelsussõnaraamatu kasutamine.'],
      ['Võõrsõnad ja poolitamine', 'Veaohtlike võõrsõnade õigekiri, omasõnad ja võõrsõnad; poolitamine, ka võõrsõnad ja nimed.'],
      ['Mooduli 2 kontroll: häälikuõigekiri', 'Keeleülesanded ja lugemistekst eksami vormis; õigekiri lühikirjandis.'],
    ],
  },
  {
    number: 3, title: 'Algustäht, lühendid ja arvud', goal: 'Suure ja väikese algustähe, lühendite, arvude ja võõrnimede kirjutamine.',
    lessons: [
      ['Nimed ja nimetused: isikud, kohad, asutused', 'Isikud ja olendid, kohad ja ehitised, asutused, ettevõtted, riigid; nimi ja nimetus.'],
      ['Pealkirjad, teosed, sündmused ja kaubad', 'Teosed, dokumendid, perioodikaväljaanded, ajaloosündmused, üritused ja kaubad; jutumärgid.'],
      ['Lühendid ja nende käänamine', 'Lühendamise põhimõtted, punkt ja kaldkriips, lühendite käänamine, tsitaatsõnad.'],
      ['Arvud, kuupäevad ja võõrnimed', 'Põhi- ja järgarvud, kuupäevad, aastad, kellaajad; võõrnimede õigekiri ja käänamine.'],
      ['Mooduli 3 kontroll: algustäht, lühendid ja arvud', 'Keeleülesanded ja teabeteksti lugemine eksami vormis.'],
    ],
  },
  {
    number: 4, title: 'Sõnavormid ning kokku- ja lahkukirjutus', goal: 'Veaohtlikud käände- ja pöördevormid, astmevaheldus ning kokku- ja lahkukirjutamine.',
    lessons: [
      ['Käändsõnad: veaohtlikud vormid ja astmevaheldus', 'Käänetevahelised seosed, veaohtlikud käändevormid, astmevaheldus, võrdlusastmed, tüüpsõna.'],
      ['Tegusõna: pööre, aeg, kõneviis ja tegumood', 'Pöördelised ja käändelised vormid, veaohtlikud tegusõnad, ühend- ja väljendtegusõna.'],
      ['Käändsõnade kokku- ja lahkukirjutamine', 'Liitsõnad ja sõnaühendid, täiendsõna ja põhisõna, arvsõnad, omadussõnad.'],
      ['Tegusõnade ja muutumatute sõnade kokku- ja lahkukirjutamine', 'Ühendtegusõnad, määr- ja kaassõnad, muutumatute sõnade kokku- ja lahkukirjutamise reeglid.'],
      ['Mooduli 4 kontroll: sõnavormid ja kokku-lahkukirjutus', 'Keeleülesanded ja ilukirjandusliku teksti lugemine eksami vormis.'],
    ],
  },
  {
    number: 5, title: 'Lause ja kirjavahemärgid', goal: 'Lauseliikmed, liht- ja liitlause, lauselühend, otse- ja kaudkõne ning nende kirjavahemärgid.',
    lessons: [
      ['Lauseliikmed ja koondlause', 'Öeldis, alus, sihitis, määrus, öeldistäide, täiend; korduvad lauseliikmed ja koondlause koma.'],
      ['Lisand, üte ja kiil', 'Lisandi, ütte ja kiilu kasutamine ja kirjavahemärgistamine.'],
      ['Rindlause, põimlause ja segaliitlause', 'Osalausete ühendamine, sidesõnad, pea- ja kõrvallause, koma liitlauses, sõnajärg.'],
      ['Lauselühend, otsekõne, kaudkõne ja tsitaat', 'Lauselühendi õigekiri ja asendamine kõrvallausega; otsekõne muutmine kaudkõneks; tsitaat.'],
      ['Mooduli 5 kontroll: lause ja kirjavahemärgid', 'Keeleülesanded ja meediateksti lugemine eksami vormis.'],
    ],
  },
  {
    number: 6, title: 'Tekstiloome ja proovieksam', goal: 'Jutustava-arutleva lühikirjandi kirjutamine ja toimetamine ning kogu eksam ajaga.',
    lessons: [
      ['Sõnavara ja stiil', 'Sünonüümid ja tähendusvarjundid, paronüümid, fraseologismid, stiilivärving, kirjakeel ja kõnekeel.'],
      ['Lühikirjandi teema, peamõte ja kava', 'Teema avamine pealkirja, alusteksti või pildi põhjal; peamõte, kava ja mustand.'],
      ['Arutlev tekstilõik ja sidusus', 'Väide, põhjendus, näide, järeldus; lõikude järjestus, sidesõnad, jutustava ja arutleva osa sidumine.'],
      ['Lühikirjandi toimetamine ja hindamine', 'Sõnastus- ja lausestusvead, õigekirja kontroll, hindamine eksami skaala järgi.'],
      ['Proovieksam', 'Kogu põhikooli lõpueksam ajaga: lugemisosa, keeleülesanded ja lühikirjand.'],
    ],
  },
]);

const pad = (n) => String(n).padStart(3, '0');

// the teacher's lesson description in the CRM (Russian, like the other courses' lesson plans)
function lessonPlan(module, title, focus, check) {
  return [
    `Курс: эстонский как родной, 9 класс (подготовка к выпускному экзамену Harno).`,
    `Модуль ${module.number}: ${module.title}.`,
    `Тема урока: ${title}.`,
    `Что учить: ${focus}`,
    check
      ? 'Как проходит урок: контроль в формате экзамена — лист 1 (чтение), лист 2 (задания по языку), лист 3 (lühikirjand ≥ 200 слов, оценка по шкале Harno).'
      : 'Как проходит урок: Avasta (текст и правило) → Harjuta (задания, орфография, «Raskem») → Kasuta (экзаменационное задание и lühikirjand ≥ 200 слов).',
  ].join('\n');
}

export function ek9CurriculumRecords() {
  return EK9_MODULES.flatMap((module) => module.lessons.map(([title, focus], index) => {
    const number = (module.number - 1) * 5 + index + 1;
    const check = index === 4;
    return {
      id: `ek9-${pad(number)}`,
      type: 'lesson',
      title,
      description: lessonPlan(module, title, focus, check),
      descriptionSource: 'lesson-plan-v1',
      subject: 'Eesti keel',
      level: EK9_LEVEL,
      levelStage: EK9_LEVEL,
      topic: `${String(module.number).padStart(2, '0')}. ${module.title}`,
      order: number,
      curriculumId: EK9_CURRICULUM_ID,
      curriculumTitle: EK9_CURRICULUM_TITLE,
      roadmapLessonId: `ek9-${pad(number)}`,
      roadmapLessonNumber: number,
      roadmapModuleId: `ek9-module-${String(module.number).padStart(2, '0')}`,
      roadmapModuleNumber: module.number,
      roadmapModuleTitle: module.title,
      roadmapModuleGoal: module.goal,
      roadmapKind: check ? 'check' : 'theme',
      roadmapTag: check ? 'Kontroll' : 'Teema',
      lessonTypeLabel: check ? 'Kontroll' : 'Teema',
      goal: focus,
      languageFocus: focus,
      contactMinutes: 60,
      roadmapVersion: EK9_VERSION,
      roadmapManaged: true,
    };
  }));
}
