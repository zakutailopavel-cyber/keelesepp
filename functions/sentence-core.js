"use strict";

// „Lause lahti” (owner 2026-10-19, after sonastik.app): one sentence → its words with the base form, part of speech and
// grammatical form (EKI etLex morphology, the public API the constructor already uses), the multi-word verbs in it
// (our own list: EKI does not mark „aru saama”) and translations. Pure helpers; the HTTP calls live in index.js.

const MAX_SENTENCE = 400;

function analysisRequest({ text = "" } = {}) {
  const clean = String(text || "").replace(/\s+/g, " ").trim().slice(0, MAX_SENTENCE);
  if (clean.length < 2 || !/\p{L}/u.test(clean)) { const error = new Error("Text required"); error.status = 400; throw error; }
  return { text: clean };
}

// parts of speech of the EKI morphology (Vabamorf tags)
const POS = {
  S: ["nimisõna", "существительное"],
  H: ["pärisnimi", "имя собственное"],
  V: ["tegusõna", "глагол"],
  A: ["omadussõna", "прилагательное"],
  C: ["omadussõna (keskvõrre)", "прилагательное (сравн. степень)"],
  U: ["omadussõna (ülivõrre)", "прилагательное (превосх. степень)"],
  G: ["käändumatu omadussõna", "несклоняемое прилагательное"],
  P: ["asesõna", "местоимение"],
  D: ["määrsõna", "наречие"],
  K: ["kaassõna", "послелог / предлог"],
  J: ["sidesõna", "союз"],
  N: ["põhiarvsõna", "числительное"],
  O: ["järgarvsõna", "порядковое числительное"],
  I: ["hüüdsõna", "междометие"],
  Y: ["lühend", "сокращение"],
  X: ["muu", "другое"],
};

const CASES = {
  n: ["nimetav", "именительный (kes? mis?)"],
  g: ["omastav", "родительный (kelle? mille?)"],
  p: ["osastav", "частичный (keda? mida?)"],
  ill: ["sisseütlev", "куда? внутрь (kellesse? millesse?)"],
  adt: ["lühike sisseütlev", "куда? внутрь (lühike vorm)"],
  in: ["seesütlev", "где? внутри (kelles? milles?)"],
  el: ["seestütlev", "откуда? изнутри; о чём (kellest? millest?)"],
  all: ["alaleütlev", "кому? на что (kellele? millele?)"],
  ad: ["alalütlev", "у кого? на чём (kellel? millel?)"],
  abl: ["alaltütlev", "от кого? с чего (kellelt? millelt?)"],
  tr: ["saav", "кем/чем стать (kelleks? milleks?)"],
  ter: ["rajav", "до чего (kelleni? milleni?)"],
  es: ["olev", "в качестве кого (kellena? millena?)"],
  ab: ["ilmaütlev", "без кого/чего (kelleta? milleta?)"],
  kom: ["kaasaütlev", "с кем/чем (kellega? millega?)"],
};

const VERB_FORMS = {
  ma: ["ma-tegevusnimi", "ma-инфинитив"], mas: ["ma-tegevusnimi (-mas)", "в процессе (-mas)"], mast: ["ma-tegevusnimi (-mast)", "откуда / о прекращении (-mast)"],
  maks: ["ma-tegevusnimi (-maks)", "чтобы (-maks)"], mata: ["ma-tegevusnimi (-mata)", "без (-mata)"], da: ["da-tegevusnimi", "da-инфинитив"],
  des: ["des-vorm", "деепричастие (-des)"], v: ["oleviku kesksõna (-v)", "причастие наст. вр. (-v)"], nud: ["mineviku kesksõna (-nud)", "причастие прош. вр. (-nud)"],
  tud: ["umbisikuline kesksõna (-tud)", "страдательное причастие (-tud)"], tav: ["umbisikuline kesksõna (-tav)", "страдательное причастие наст. (-tav)"],
  n: ["olevik, mina", "наст. вр., 1 л. ед. ч. (ma)"], d: ["olevik, sina", "наст. вр., 2 л. ед. ч. (sa)"], b: ["olevik, tema", "наст. вр., 3 л. ед. ч. (ta)"],
  me: ["olevik, meie", "наст. вр., 1 л. мн. ч. (me)"], te: ["olevik, teie", "наст. вр., 2 л. мн. ч. (te)"], vad: ["olevik, nemad", "наст. вр., 3 л. мн. ч. (nad)"],
  sin: ["lihtminevik, mina", "прош. вр., 1 л. ед. ч."], sid: ["lihtminevik, sina / nemad", "прош. вр., 2 л. ед. ч. / 3 л. мн. ч."], s: ["lihtminevik, tema", "прош. вр., 3 л. ед. ч."],
  sime: ["lihtminevik, meie", "прош. вр., 1 л. мн. ч."], site: ["lihtminevik, teie", "прош. вр., 2 л. мн. ч."],
  ks: ["tingiv kõneviis", "условное наклонение (-ks)"], ksin: ["tingiv kõneviis, mina", "условное наклонение, 1 л. ед. ч."], ksid: ["tingiv kõneviis", "условное наклонение"],
  o: ["eituse vorm", "форма после ei (отрицание)"], neg: ["eitussõna", "отрицание (не)"], nuks: ["tingiv minevik", "условное наклонение прошедшего"],
  ti: ["umbisikuline lihtminevik", "безличная форма, прош. вр."], takse: ["umbisikuline olevik", "безличная форма, наст. вр."], ta: ["umbisikuline eitus", "безличное отрицание"],
  gu: ["käskiv kõneviis (las)", "повелительное: пусть"], ge: ["käskiv kõneviis, teie", "повелительное, мн. ч."], "": ["", ""],
};

const VERB_INFO = [
  ["kindel kõneviis", "изъявительное наклонение"], ["tingiv kõneviis", "условное наклонение"], ["käskiv kõneviis", "повелительное наклонение"],
  ["kaudne kõneviis", "косвенное наклонение"], ["jaatav", "утверждение"], ["eitav", "отрицание"], ["umbisikuline", "безличная форма"],
  ["isikuline", "личная форма"], ["olevik", "настоящее время"], ["lihtminevik", "простое прошедшее время"], ["täisminevik", "перфект"],
  ["enneminevik", "плюсквамперфект"],
];

function formOf(pos, code = "", info = "") {
  const value = String(code || "").trim();
  if (pos === "V") {
    const head = VERB_FORMS[value] || ["", ""];
    // an infinitive or participle has no tense or mood of its own (the chain „öelda ei oska” belongs to „ei oska”)
    if (["ma", "mas", "mast", "maks", "mata", "da", "des", "v", "nud", "tud", "tav"].includes(value)) return { et: head[0], ru: head[1] };
    const chain = String(info || "");
    const has = (et) => chain.includes(et);
    const ru = [head[1]];
    if (has("tingiv")) ru.push("условное наклонение"); else if (has("käskiv")) ru.push("повелительное наклонение"); else if (has("kaudne")) ru.push("косвенное наклонение");
    if (has("eitav") && value !== "neg" && value !== "o") ru.push("отрицание");
    if (has("umbisikuline")) ru.push("безличная форма");
    if (!/вр\./.test(head[1])) { const tense = VERB_INFO.slice(8).find(([et]) => has(et)); if (tense) ru.push(tense[1]); }
    return { et: [head[0], chain].filter(Boolean).join(" · "), ru: ru.filter(Boolean).join(", ") };
  }
  const match = value.match(/^(sg|pl) (\w+)$/);
  if (match && CASES[match[2]]) {
    const [number, kase] = [match[1], CASES[match[2]]];
    return { et: `${number === "sg" ? "ainsuse" : "mitmuse"} ${kase[0]}`, ru: `${number === "sg" ? "ед. ч." : "мн. ч."}, ${kase[1]}` };
  }
  return { et: String(info || ""), ru: "" };
}

// Multi-word verbs (ühendverbid) and fixed verb phrases with what they govern. [particle, verb, ru, government]
const GOV = {
  el: "elatiiv (kellest/millest)", p: "sihitis (keda/mida või kelle/mille)", all: "allatiiv (kellele/millele)", kom: "komitatiiv (kellega/millega)",
  ad: "adessiiv (kellel/millel)", abl: "ablatiiv (kellelt/millelt)", ill: "illatiiv (kellesse/millesse)", in: "inessiiv (kelles/milles)",
  tr: "translatiiv (kelleks/milleks)", g: "genitiiv (kelle/mille)", "all+p": "kellele + sihitis (mida/mille)", "all+el": "kellele + millest",
  "kom+in": "kellega + milles", "g+pärast": "kelle/mille pärast", "g+üle": "kelle/mille üle", "g+eest": "kelle/mille eest",
};
const PHRASES = [
  ["aru", "saama", "понимать", "el"], ["aru", "andma", "отчитываться", "all+el"], ["ära", "minema", "уходить, уезжать"], ["ära", "tegema", "сделать (до конца)"],
  ["ära", "ootama", "дождаться"], ["ära", "unustama", "забыть"], ["ära", "kasutama", "воспользоваться", "p"], ["ära", "võtma", "отнять, забрать"],
  ["ära", "kaotama", "потерять"], ["ära", "jääma", "отмениться, не состояться"], ["ära", "tundma", "узнать (кого-то)", "p"], ["ette", "valmistama", "подготовить", "p"],
  ["ette", "kujutama", "представлять себе", "p"], ["ette", "nägema", "предусматривать", "p"], ["ette", "panema", "предлагать", "p"], ["ette", "tulema", "случаться"],
  ["ette", "heitma", "упрекать", "all+p"], ["ette", "lugema", "зачитать", "all+p"], ["kaasa", "võtma", "взять с собой", "p"], ["kaasa", "tundma", "сочувствовать", "all"],
  ["kaasa", "lööma", "участвовать", "in"], ["kaasa", "aitama", "способствовать", "all"], ["kinni", "panema", "закрыть", "p"], ["kinni", "maksma", "оплатить", "all+p"],
  ["kinni", "pidama", "соблюдать", "el"], ["kinni", "hoidma", "держаться", "el"], ["kokku", "leppima", "договориться", "kom+in"], ["kokku", "saama", "встретиться", "kom"],
  ["kokku", "võtma", "подвести итог", "p"], ["kokku", "puutuma", "столкнуться", "kom"], ["läbi", "viima", "провести", "p"], ["läbi", "lugema", "прочитать (целиком)", "p"],
  ["läbi", "saama", "ладить; закончиться", "kom"], ["läbi", "kukkuma", "провалиться"], ["läbi", "rääkima", "вести переговоры; обсудить", "kom"], ["läbi", "käima", "общаться", "kom"],
  ["läbi", "põlema", "выгореть"], ["maha", "jätma", "бросить (привычку)", "p"], ["maha", "minema", "выйти (из транспорта)"], ["maha", "maksma", "окупиться"],
  ["meelde", "jätma", "запомнить", "p"], ["meelde", "tuletama", "напомнить", "all+p"], ["meelde", "tulema", "вспомниться", "all"], ["osa", "võtma", "участвовать", "el"],
  ["puudust", "tundma", "нуждаться; скучать", "el"], ["muret", "tundma", "беспокоиться", "g+pärast"], ["ringi", "vaatama", "осмотреться"], ["sisse", "astuma", "зайти; поступить", "ill"],
  ["sisse", "lülitama", "включить", "p"], ["sisse", "elama", "вжиться", "ill"], ["välja", "lülitama", "выключить", "p"], ["tagasi", "tulema", "вернуться"],
  ["tagasi", "andma", "вернуть", "all+p"], ["tagasi", "lükkama", "отклонить", "p"], ["tähele", "panema", "заметить", "p"], ["valmis", "tegema", "приготовить, доделать", "p"],
  ["vastu", "võtma", "принять", "p"], ["vastu", "pidama", "выдержать"], ["vastu", "vaidlema", "возражать", "all"], ["välja", "nägema", "выглядеть"],
  ["välja", "mõtlema", "придумать", "p"], ["välja", "tulema", "получиться; выйти"], ["välja", "minema", "выйти"], ["välja", "kannatama", "вытерпеть", "p"],
  ["välja", "selgitama", "выяснить", "p"], ["üle", "vaatama", "просмотреть, проверить", "p"], ["üle", "elama", "пережить", "p"], ["üle", "võtma", "перенять, принять на себя", "p"],
  ["üle", "kuulama", "переспросить"], ["üles", "tõusma", "встать"], ["üles", "kirjutama", "записать", "p"], ["üles", "ärkama", "проснуться"],
  ["üles", "andma", "указать, сообщить", "p"], ["järele", "mõtlema", "обдумать", "g+üle"], ["järele", "proovima", "попробовать", "p"], ["järele", "andma", "уступить", "all"],
  ["otsa", "saama", "закончиться"], ["pooleli", "jätma", "бросить незаконченным", "p"], ["teada", "saama", "узнать", "el"], ["teada", "andma", "сообщить", "all+el"],
  ["vahele", "jätma", "пропустить", "p"], ["vahele", "segama", "перебивать"], ["hakkama", "saama", "справляться", "kom"], ["esile", "tõstma", "подчеркнуть", "p"],
  ["kätte", "saama", "получить", "p"], ["kätte", "jõudma", "наступить"], ["selgeks", "tegema", "выяснить; объяснить", "all+p"], ["selgeks", "saama", "уяснить", "p"],
  ["alla", "andma", "сдаться"], ["alla", "kirjutama", "подписать", "all"], ["edasi", "lükkama", "отложить", "p"], ["edasi", "andma", "передать", "all+p"],
  ["tähelepanu", "pöörama", "обращать внимание", "all"], ["silma", "paistma", "выделяться"], ["juttu", "ajama", "болтать", "kom"], ["nõu", "andma", "советовать", "all"],
  ["nõu", "pidama", "советоваться", "kom"], ["ümber", "mõtlema", "передумать"], ["ümber", "kirjutama", "переписать", "p"], ["korda", "minema", "удаться", "all"],
  ["korda", "tegema", "привести в порядок", "p"], ["omaks", "võtma", "принять (как своё)", "p"], ["ühendust", "võtma", "связаться", "kom"], ["tähtsaks", "pidama", "считать важным", "p"],
  ["õigeks", "pidama", "считать правильным", "p"], ["hoolt", "kandma", "заботиться", "g+eest"], ["vastutust", "võtma", "брать ответственность", "g+eest"], ["sõna", "võtma", "взять слово"],
  ["otsust", "tegema", "принимать решение"], ["lubadust", "andma", "давать обещание", "all"], ["aega", "veetma", "проводить время", "kom"], ["abi", "küsima", "просить помощи", "abl"],
  ["pilku", "heitma", "бросить взгляд", "all"], ["kõrvale", "jätma", "оставить в стороне", "p"], ["kõrvale", "panema", "отложить", "p"], ["juurde", "tulema", "подойти; прибавиться", "all"],
  ["üle", "minema", "перейти; пройти (о боли)", "ill"], ["läbi", "vaatama", "просмотреть", "p"], ["sisse", "kirjutama", "прописать (по месту жительства)", "p"], ["välja", "kirjutama", "выписать", "p"],
];

function findExpressions(tokens = []) {
  const words = tokens.map((t) => String(t.text || "").toLocaleLowerCase("et"));
  const found = [];
  const used = new Set();
  for (const [particle, verb, ru, gov] of PHRASES) {
    const verbAt = tokens.findIndex((t, i) => t.pos === "V" && t.lemma === verb && !used.has(i));
    if (verbAt < 0) continue;
    let partAt = -1;
    words.forEach((w, i) => { if (w === particle && i !== verbAt && !used.has(i) && (partAt < 0 || Math.abs(i - verbAt) < Math.abs(partAt - verbAt))) partAt = i; });
    if (partAt < 0) continue;
    used.add(verbAt); used.add(partAt);
    found.push({ phrase: `${particle} ${verb}`, ru, government: gov ? GOV[gov] || gov : "", tokens: [Math.min(verbAt, partAt), Math.max(verbAt, partAt)] });
  }
  return found;
}

const NO_SPACE_BEFORE = /^[.,!?;:%)\]»”…]$/;
const NO_SPACE_AFTER = /^[(\[«„]$/;

// etLex answer → { tokens: [{ text, lemma, pos, posEt, posRu, form, formEt, formRu, level, space }] }
function tokensFromEvaluation(data) {
  const list = Array.isArray(data?.evaluatedGrammarText) && data.evaluatedGrammarText.length ? data.evaluatedGrammarText : (data?.evaluatedText || []);
  const tokens = list.map((t) => {
    const text = String(t.token ?? t.text ?? "");
    const pos = String(t.pos || "X");
    const punct = pos === "Z";
    const form = punct ? { et: "", ru: "" } : formOf(pos, t.form, t.formXinfo);
    const level = ["A1", "A2", "B1", "B2", "C1"].includes(t.level) ? t.level : "";
    return {
      text, lemma: punct ? text : String(t.lemma || text), pos, punct,
      posEt: punct ? "" : (POS[pos] || POS.X)[0], posRu: punct ? "" : (POS[pos] || POS.X)[1],
      form: String(t.form || ""), formEt: form.et, formRu: form.ru, level,
    };
  });
  tokens.forEach((t, i) => { const next = tokens[i + 1]; t.space = Boolean(next) && !NO_SPACE_BEFORE.test(next.text) && !NO_SPACE_AFTER.test(t.text); });
  return tokens;
}

// the words worth a short gloss: content words, each lemma once, at most 20
function glossLemmas(tokens = []) {
  const seen = new Set();
  return tokens.filter((t) => !t.punct && !["J", "Z"].includes(t.pos) && t.lemma && !seen.has(t.lemma) && seen.add(t.lemma)).map((t) => t.lemma).slice(0, 20);
}

module.exports = { MAX_SENTENCE, analysisRequest, tokensFromEvaluation, findExpressions, glossLemmas, formOf, PHRASES, POS, CASES };
