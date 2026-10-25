// The example lesson of docs/FINAL_SHAPE_AUTHORING.md: one teaching lesson written with the final-shape tags and the
// Harno builders, so that it passes every lesson rule of docs/COURSE_FINAL_SHAPE_B1.md §8 (V9–V13, V15; V12 because it is
// in module 7). It is NOT a course module (not in registry.js COURSE_MODULES) — finalShapeExample.test.js keeps it right.
// Module 7 „Tervis”, lesson 1 in the §6.2 plan: KUUL L→W (listening-led, writing outcome).
import { B, tag, teach, withShapes } from './blocks.js';

export const MODULE = { id: 'naidis-module-07', course: 'b1', title: 'Tervis (näidis)', level: 'B1-', design: 'v2', template: 'v4' };

export const LESSONS = withShapes({
  'naidis-031': {
    title: 'Arsti juures',
    // the can-do says what the learner DOES (kirjutan → writing); the main Kasuta task is that writing (V9)
    canDo: 'Ma kirjutan sõbrale 80–100-sõnalise kirja oma arstivisiidist ja annan talle ühe nõuande.',
    discover: [
      // „Mäletad?”: one item from the previous lesson and one from a module 2–4 back (V13)
      B.review('031_d_review', [['Mis juhtus Liisi koogiga?', 'naidis-030'], ['Mida Markus eile tegi?', 'naidis-021'], 'Kuidas sa täna end tunned?']),
      B.text('031_d_goal', 'Moodul 7: tervis', 'Selles tunnis kuulad perearstikeskuse telefonisõnumit ja kirjutad lõpuks sõbrale kirja oma arstivisiidist.'),
      B.listening('031_d_call', 'Perearstikeskuse sõnum.', 'Kuula sõnumit kaks korda. Kirjuta lünka üks sõna või number.', [
        'Tere! Te helistasite Tamme perearstikeskusesse.',
        'Keskus on avatud esmaspäevast reedeni kella kaheksast neljani. Laupäeval ja pühapäeval on keskus suletud.',
        'Kui teil on palavik või tugev köha, jääge koju ja helistage meile. Õde helistab teile samal päeval tagasi.',
        'Kui soovite arsti juurde aega broneerida, vajutage üks. Kui soovite rääkida õega, vajutage kaks.',
        'Retsepti saate pikendada ka meie kodulehel. Selleks on vaja ID-kaarti või mobiil-ID-d.',
        'Vereanalüüse teeme tööpäeviti kella kaheksast kümneni. Tulge tühja kõhuga.',
        'Kui teil on vaja kiiresti abi, helistage numbril 112.',
      ], ['Keskus on avatud kella [kaheksast|8] neljani.', 'Nädalavahetusel on keskus [suletud].', 'Kui on palavik, tuleb jääda [koju].', 'Õe juurde saab, kui vajutad [kaks|2].', 'Retsepti saab pikendada [kodulehel].', 'Vereanalüüsi tehakse kella [kaheksast|8] kümneni.']),
      tag(B.categorize('031_d_sort', 'Kes mida teeb?', 'Pane sõnad õigesse rühma.', [
        ['Arst', ['kirjutab retsepti', 'kuulab kopse']], ['Patsient', ['broneerib aja', 'võtab rohtu']],
      ], 'full', 'g_vocab'), { level: 2 }),
      B.notice('031_d_notice', 'Märka: mis sul viga on?', ['Mul **on** palavik. Mul **valutab** pea.', 'Ma **jäin** haigeks. Ma **sain** terveks.']),
      B.table('031_d_rule', 'Kuidas muutus?', 'Täida tabel märkamiskasti järgi.', 'Enne, Pärast', ['olin terve | jäin [haigeks]', 'olin haige | sain [terveks]'], 'g_notice'),
      // fluency with known language (Nation's 4th strand): the same story three times, shorter each time (V11)
      teach(tag(B.speaking('031_d_432', 'Räägi kolm korda.', 'Räägi paarilisele oma viimasest arstivisiidist: 2 minutit, siis 1,5 ja lõpuks 1 minut.', ['Millal sa käisid arsti juures?', 'Mis sul viga oli?', 'Mida arst soovitas?'], [60, 120]), { task: 'S08', fluency: true }), 'Üks-ühele: õpilane räägib õpetajale kolm korda, õpetaja hoiab aega.'),
    ],
    practice: [
      B.choice('031_p_form', 'Vali õige vorm.', 'Vali lausesse sobiv sõna.', [
        ['Eile jäi Anna …', 'haigeks', 'haige', 'haiget'], ['Nädala pärast sai ta …', 'terveks', 'terve', 'tervet'],
      ], 'full', 'g_notice'),
      B.match('031_p_words', 'Sõnad ja tähendused.', 'Ühenda sõna ja selgitus.', [['retsept', 'paber, millega saab apteegist rohtu'], ['palavik', 'kõrge temperatuur']]),
      B.reading('031_p_blog', 'Jaani blogi.', 'Loe Jaani postitust ja vasta lühidalt.', 'Miks ma ei käi arsti juures',
        'Ma ei käi peaaegu kunagi arsti juures. Viimati käisin seal kolm aastat tagasi, kui murdsin jalgpalli mängides käe. Tavaliselt ma arvan, et haigus läheb ise üle.\n\nKui mul on külm, joon ma kuuma teed meega ja magan rohkem. Kui pea valutab, lähen õue jalutama. Ema ütleb, et see on rumal, sest mõni haigus ei lähe ise üle.\n\nNüüd olen kaks nädalat köhinud. Öösel ei saa ma hästi magada ja tööl olen väsinud. Kolleeg ütles, et ma peaksin perearstile helistama. Võib-olla tal on õigus, aga mul pole aega. Mida teie teeksite?',
        [['Millal Jaan viimati arsti juures käis?', 'kolm aastat tagasi'], ['Mida Jaan teeb, kui tal on külm?', 'joob teed meega|magab rohkem|joob kuuma teed'], ['Mis Jaani praegu vaevab?', 'köha|ta köhib'], ['Mida kolleeg soovitas?', 'helistada perearstile|perearstile helistada'], ['Miks Jaan tööl väsinud on?', 'ta ei saa öösel magada|ei saa magada'], ['Mida ema arvab?', 'see on rumal|mõni haigus ei lähe ise üle']]),
      B.dialogue('031_p_chat', 'Sõnumid sõbraga.', 'Loe sõnumeid ja kirjuta lünka sobiv sõna.', 'Anna', 'Liis', [
        ['A', 'Kas sa oled [haige]?'], ['B', 'Jah, mul on [palavik]. Homme lähen arsti juurde.'],
        ['A', 'Kas sa said aja [broneerida]?'], ['B', 'Jah, kell kümme. Õde ütles, et pean [tühja] kõhuga tulema.'],
      ], 'g_read'),
      // the lesson's one exam corner (V12): one Harno format, scored like the exam — W1b, a note of about 50 words
      tag(B.examWriting('031_p_note', 'Kirjuta teade.', 'Kirjuta kolleegile umbes 50 sõna. Kirjuta kõigist neljast punktist.', 'teade', {
        situation: 'Sa oled haige ja ei tule homme tööle.', points: ['mis sul viga on', 'kui kaua sa kodus oled', 'kes teeb su töö', 'kuidas sinuga ühendust saab'], words: [40, 60], opening: 'Tere, Kati!',
      }), { harno: 'W1b' }),
    ],
    transfer: [
      B.text('031_t_sit', 'Sõber küsib nõu', 'Sinu sõber Jaan on kaks nädalat köhinud, aga ta ei taha arsti juurde minna.'),
      teach(B.ideaCard('031_t_talk', 'Leppige kokku.', 'Arutage paarilisega, mida Jaan peaks tegema, ja leppige kokku üks nõuanne.', 'Jaan köhib juba kaks nädalat.', ['perearst', 'apteek', 'puhkus', 'tee ja mesi'], 'Mida te Jaanile soovitate ja miks?'), 'Üks-ühele: õpetaja on Jaani sõber ja vaidleb vastu; lõpuks lepite kokku.'),
      tag(B.examWriting('031_t_letter', 'Kiri Jaanile.', 'Kirjuta Jaanile 80–100 sõna.', 'kiri', {
        situation: 'Jaan küsis, kuidas sinu arstivisiit läks.', points: ['millal ja miks sa arsti juures käisid', 'mida arst ütles', 'kuidas sa end nüüd tunned', 'üks nõuanne Jaanile'], words: [80, 100], opening: 'Tere, Jaan!', closing: 'Saa terveks!',
      }), { main: true }),
      B.rubricW2('031_t_rubric'),
    ],
  },
}, { 'naidis-031': 'KUUL L→W' });
