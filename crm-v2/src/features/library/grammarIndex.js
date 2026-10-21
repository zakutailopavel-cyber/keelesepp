// „Grammatika” at the top of each level in Õppevara (owner 2026-10-21): every grammar topic of the level in course order,
// with the course lessons that teach it. A lesson's „Õpik” sheet (the textbook's rule and exercises) opens from here, so
// a teacher finds a topic and assigns it to any learner. Topics follow the course roadmaps (data/*roadmap*.json) and the
// textbook map in docs/TEXTBOOKS.md.

export const GRAMMAR_INDEX = Object.freeze({
  A2: [
    { topic: 'Olema, olevik ja eitus', lessons: ['a2-003'] },
    { topic: 'Küsisõnad: kes? mis? kus? kust?', lessons: ['a2-002', 'a2-009'] },
    { topic: 'Nimetav mitmus, see ja need', lessons: ['a2-006'] },
    { topic: 'Omastav: kelle? kelle oma?', lessons: ['a2-007'] },
    { topic: 'Kellaaeg ja ajaväljendid', lessons: ['a2-012'] },
    { topic: 'Kus? Kuhu? Kust? — sees (-s, -sse, -st)', lessons: ['a2-017'] },
    { topic: 'Kus? Kuhu? Kust? — peal (-l, -le, -lt)', lessons: ['a2-018'] },
    { topic: 'Käskiv kõneviis', lessons: ['a2-023'] },
    { topic: 'Partitiiv ja kogused', lessons: ['a2-027', 'a2-032'] },
    { topic: 'Pean, saan, võin, tohin + ma- / da-infinitiiv', lessons: ['a2-037'] },
    { topic: 'Mulle meeldib…', lessons: ['a2-047'] },
    { topic: 'Võrdlusaste', lessons: ['a2-052'] },
    { topic: 'Lihtminevik', lessons: ['a2-059', 'a2-076'] },
    { topic: 'Tahan õppida / hakkan õppima', lessons: ['a2-068'] },
    { topic: 'Viisakas palve (tahaksin, saaksite)', lessons: ['a2-072'] },
    { topic: 'Tulevik olevikuga', lessons: ['a2-081'] },
    { topic: 'Kui…, siis…', lessons: ['a2-083'] },
  ],
  B1: [
    { topic: 'Genitiiv: kelle? kelle oma?', lessons: ['a2b1-008'] },
    { topic: 'Kus? Kuhu? Kust?', lessons: ['a2b1-012'] },
    { topic: 'Peab, võib ja saab', lessons: ['a2b1-017'] },
    { topic: 'Lihtminevik: põhivormid (-si-)', lessons: ['a2b1-021'] },
    { topic: 'Lihtminevik: -i- ja erandid', lessons: ['a2b1-023'] },
    { topic: 'Partitiiv toidu ja koguse juures', lessons: ['a2b1-028'] },
    { topic: 'Käskiv kõneviis ja nõuanded', lessons: ['a2b1-033'] },
    { topic: 'ma- või da-infinitiiv', lessons: ['a2b1-037', 'a2b1-043'] },
    { topic: 'Sest ja kuna', lessons: ['a2b1-038'] },
    { topic: 'Võrdlusaste', lessons: ['a2b1-052'] },
    { topic: 'Põhjus ja tagajärg', lessons: ['a2b1-058'] },
    { topic: 'Tingiv kõneviis', lessons: ['a2b1-062'] },
    { topic: 'Täisminevik', lessons: ['a2b1-067'] },
    { topic: 'Tuleviku väljendamine', lessons: ['a2b1-071'] },
    { topic: 'Kui…, siis…', lessons: ['a2b1-073'] },
  ],
  B2: [
    { topic: 'Võrdlemine', lessons: ['b1b2-004'] },
    { topic: 'Kus? Kuhu? Kust?', lessons: ['b1b2-006'] },
    { topic: 'Lihtminevik', lessons: ['b1b2-011'] },
    { topic: 'Täisminevik', lessons: ['b1b2-012'] },
    { topic: 'Enneminevik', lessons: ['b1b2-013'] },
    { topic: 'Täissihitis ja osasihitis', lessons: ['b1b2-016'] },
    { topic: 'ma- ja da-infinitiiv', lessons: ['b1b2-017'] },
    { topic: 'Tegusõna rektsioon', lessons: ['b1b2-018'] },
    { topic: 'Tingiv kõneviis ja nõuanded', lessons: ['b1b2-042'] },
    { topic: 'Kaudne kõne', lessons: ['b1b2-048'] },
    { topic: 'Umbisikuline tegumood', lessons: ['b1b2-058'] },
    { topic: 'Sõnajärg', lessons: ['b1b2-077'] },
    { topic: 'Kesksõnad ja des-vorm', lessons: ['b1b2-078'] },
    { topic: 'Tingiv, umbisikuline ja kaudne kõne', lessons: ['b1b2-079'] },
  ],
  C1: [
    { topic: 'Sihitis', lessons: ['est-c1-008'] },
    { topic: 'Rektsioon ja käändevalik', lessons: ['est-c1-009'] },
    { topic: 'Sõnajärg ja infostruktuur', lessons: ['est-c1-018'] },
    { topic: 'Käänete keerukam kasutus', lessons: ['est-c1-019'] },
    { topic: 'Ajavormid sidusas tekstis', lessons: ['est-c1-028'] },
    { topic: 'Kõneviisid ja modaalsus', lessons: ['est-c1-029'] },
    { topic: 'ma- ja da-infinitiiv, käändelised vormid', lessons: ['est-c1-038'] },
    { topic: 'Kesksõnad ja lühendatud tarindid', lessons: ['est-c1-039'] },
    { topic: 'Isikuline ja umbisikuline väljendus', lessons: ['est-c1-048'] },
    { topic: 'Nominalisatsioon', lessons: ['est-c1-049'] },
    { topic: 'Relatiivlaused ja viitamine', lessons: ['est-c1-058'] },
    { topic: 'Kõrvallausete süsteem', lessons: ['est-c1-059'] },
    { topic: 'Sidendid ja tekstisisesed seosed', lessons: ['est-c1-068'] },
    { topic: 'Määruslikud suhted, kaassõnad ja käänded', lessons: ['est-c1-069'] },
    { topic: 'Kaudne kõne ja refereerimine', lessons: ['est-c1-078'] },
    { topic: 'Stiilivariandid ja paralleelvormid', lessons: ['est-c1-079'] },
    { topic: 'Kirjavahemärgid keerukas lauses', lessons: ['est-c1-088'] },
    { topic: 'Viiteselgus ja asesõnad', lessons: ['est-c1-089'] },
  ],
});

// the topics of one level with the library items of their lessons (only lessons that exist in Õppevara)
export function grammarTopics(level, items = []) {
  const topics = GRAMMAR_INDEX[level];
  if (!topics) return [];
  const byId = new Map(items.map((item) => [item.sourceId, item]));
  return topics
    .map(({ topic, lessons }) => ({ topic, lessons: lessons.map((id) => byId.get(id)).filter(Boolean) }))
    .filter((entry) => entry.lessons.length);
}
