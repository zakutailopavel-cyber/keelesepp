# Word forms checked with Vabamorf — 2026-11-09

For the owner / teacher to decide. Nothing in this file was written into `word-forms.json` or the generator lexicon:
only words that had **no forms at all** and got **one unambiguous form** from Vabamorf were added.

Tool: Vabamorf (github.com/Filosoft/vabamorf, commit `2d17173effa3`, lexicon `dct/binary/et.dct`), built locally
with `apps/cmdline/project/unix/Makefile` (`etsyn` synthesis, `etana` analysis), run offline without guessing.
Vabamorf is LGPL; only its output is used, no Vabamorf code or lexicon is in this repository.

Columns: **ours** = what the app shows now (— = nothing yet), **Vabamorf** = what Vabamorf synthesises
(several forms separated by /). Fields: omastav = sg g, osastav = sg p, da-tegevusnimi, olevik 3. p (verb `b`).

## Summary

| Check | Count |
|---|---|
| `word-forms.json` entries checked | 8661 |
| … both forms match Vabamorf exactly | 8633 |
| … ours is one of several Vabamorf forms | 19 |
| … ours differs from Vabamorf | 2 |
| … unknown to Vabamorf | 7 |
| … Vabamorf agrees but the card is probably wrong (plural lemma / participle) | 59 |
| Course words (lessonWords noun/adj/verb, one word) without forms | 730 |
| … added to `word-forms.json` (single unambiguous Vabamorf form) | 623 |
| … not added: several Vabamorf forms | 35 |
| … not added: unknown to Vabamorf | 14 |
| … not added: plural-only lemma | 17 |
| … not added: participle adjective (-nud/-tud) | 30 |
| … not added: not inflected (adverb-like) | 3 |
| … not added: lemma not analysed as a base form (check by hand) | 8 |
| Generator lexicon forms checked (314 words, all stored cases / verb forms) | 7088 |
| … identical to Vabamorf | 7061 |
| … pinned by `variants` (documented choice) | 14 |
| … unknown to Vabamorf | 13 |
| … differs | 0 |

## 1. `word-forms.json` — ours differs, unknown, or one of several

| lemma | field | ours | Vabamorf | note |
|---|---|---|---|---|
| iga | omastav | ea | iga | ours is not among Vabamorf forms |
| iga | osastav | iga | iga / igat | ours is one of several Vabamorf forms |
| miski | omastav | miski | millegi | ours is not among Vabamorf forms |
| miski | osastav | miskit | midagi | ours is not among Vabamorf forms |
| Daria | omastav | Daria | — | not in the Vabamorf lexicon; hand-checked generator lexicon (wins); no guess |
| Daria | osastav | Dariat | — | not in the Vabamorf lexicon; hand-checked generator lexicon (wins); no guess |
| blender | omastav | blendri | — | not in the Vabamorf lexicon; guess: blendri |
| blender | osastav | blendrit | — | not in the Vabamorf lexicon; guess: blendrit |
| breketid | omastav | breketidi | — | not in the Vabamorf lexicon; guess: breketidi |
| breketid | osastav | breketidit | — | not in the Vabamorf lexicon; guess: breketidit |
| ergonoomne | omastav | ergonoomse | — | not in the Vabamorf lexicon; guess: ergonoomse |
| ergonoomne | osastav | ergonoomset | — | not in the Vabamorf lexicon; guess: ergonoomset |
| kookos | omastav | kookose | — | not in the Vabamorf lexicon; guess: kookose |
| kookos | osastav | kookost | — | not in the Vabamorf lexicon; guess: kookost |
| popitama | da-tegevusnimi | popitada | — | not in the Vabamorf lexicon; guess: popitada |
| popitama | olevik 3. p | popitab | — | not in the Vabamorf lexicon; guess: popitab |
| väljaspoole | omastav | väljaspoolme | — | not in the Vabamorf lexicon; guess: väljaspoolme |
| väljaspoole | osastav | väljaspoolet | — | not in the Vabamorf lexicon; guess: väljaspoolet |
| Toomas | omastav | Toomase | Tooma / Toomase | ours is one of several Vabamorf forms; hand-checked generator lexicon (wins) |
| jooksma | da-tegevusnimi | joosta | jooksta / joosta | ours is one of several Vabamorf forms; hand-checked generator lexicon (wins) |
| juht | omastav | juhi | juhi / juhu | ours is one of several Vabamorf forms; hand-checked generator lexicon (wins) |
| juht | osastav | juhti | juhti / juhtu | ours is one of several Vabamorf forms; hand-checked generator lexicon (wins) |
| kaamel | omastav | kaameli | kaameli / kaamli | ours is one of several Vabamorf forms |
| kaamel | osastav | kaamelit | kaamelit / kaamlit | ours is one of several Vabamorf forms |
| kapp | omastav | kapi | kapa / kapi | ours is one of several Vabamorf forms; hand-checked generator lexicon (wins) |
| kapp | osastav | kappi | kappa / kappi | ours is one of several Vabamorf forms; hand-checked generator lexicon (wins) |
| kook | omastav | koogi | koogi / koogu | ours is one of several Vabamorf forms; hand-checked generator lexicon (wins) |
| kook | osastav | kooki | kooki / kooku | ours is one of several Vabamorf forms; hand-checked generator lexicon (wins) |
| kool | omastav | kooli | koola / kooli | ours is one of several Vabamorf forms; hand-checked generator lexicon (wins) |
| kool | osastav | kooli | koola / kooli | ours is one of several Vabamorf forms; hand-checked generator lexicon (wins) |
| kott | omastav | koti | kota / koti | ours is one of several Vabamorf forms; hand-checked generator lexicon (wins) |
| kott | osastav | kotti | kotta / kotti | ours is one of several Vabamorf forms; hand-checked generator lexicon (wins) |
| kurk | omastav | kurgi | kurgi / kurgu | ours is one of several Vabamorf forms; hand-checked generator lexicon (wins) |
| kurk | osastav | kurki | kurki / kurku | ours is one of several Vabamorf forms; hand-checked generator lexicon (wins) |
| muuseum | osastav | muuseumi | muuseumi / muuseumit | ours is one of several Vabamorf forms; hand-checked generator lexicon (wins) |
| mõru | omastav | mõru | mõru / mõruda | ours is one of several Vabamorf forms |
| mõru | osastav | mõru | mõru / mõrudat | ours is one of several Vabamorf forms |
| müts | omastav | mütsi | mütsi / mütsu | ours is one of several Vabamorf forms; hand-checked generator lexicon (wins) |
| müts | osastav | mütsi | mütsi / mütsu | ours is one of several Vabamorf forms; hand-checked generator lexicon (wins) |
| pool | omastav | poole | poole / pooli | ours is one of several Vabamorf forms; only without part-of-speech restriction |
| pool | osastav | poolt | poolt / pooli | ours is one of several Vabamorf forms; only without part-of-speech restriction |
| silm | omastav | silma | silma / silmu | ours is one of several Vabamorf forms; hand-checked generator lexicon (wins) |
| silm | osastav | silma | silma / silmu | ours is one of several Vabamorf forms; hand-checked generator lexicon (wins) |
| sool | omastav | soola | soola / soole / sooli | ours is one of several Vabamorf forms; hand-checked generator lexicon (wins) |
| sool | osastav | soola | soolt / soola / sooli | ours is one of several Vabamorf forms; hand-checked generator lexicon (wins) |
| staadion | osastav | staadioni | staadioni / staadionit | ours is one of several Vabamorf forms; hand-checked generator lexicon (wins) |
| sulgema | olevik 3. p | suleb | suleb / sulgeb | ours is one of several Vabamorf forms; hand-checked generator lexicon (wins) |
| väike | omastav | väikese | väikese / väikse | ours is one of several Vabamorf forms; hand-checked generator lexicon (wins) |
| õudne | omastav | õudse | õudsa / õudse | ours is one of several Vabamorf forms |
| õudne | osastav | õudset | õudsat / õudset | ours is one of several Vabamorf forms |

## 2. `word-forms.json` — Vabamorf agrees, but the card is probably wrong

Plural-only words get singular forms (püksid → „püksi, püksi”), participle adjectives get a genitive without -d
(väsinud → „väsinu”; EKI: väsinud, väsinud, väsinut). Suggested replacements; not changed.

| lemma | field | ours | Vabamorf | note |
|---|---|---|---|---|
| ahjukartulid | omastav, osastav | ahjukartuli, ahjukartulit | ahjukartulite, ahjukartuleid (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| austatud | omastav | austatu | austatu (Vabamorf too); suggested austatud | participle adjective: genitive equals the base form (väsinud → väsinud, väsinut) |
| dressid | omastav, osastav | dressi, dressi | dresside, dresse / dressisid (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| eelmainitud | omastav | eelmainitu | eelmainitu (Vabamorf too); suggested eelmainitud | participle adjective: genitive equals the base form (väsinud → väsinud, väsinut) |
| elamistingimused | omastav, osastav | elamistingimuse, elamistingimust | elamistingimuste, elamistingimusi (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| ettenähtud | omastav | ettenähtu | ettenähtu (Vabamorf too); suggested ettenähtud | participle adjective: genitive equals the base form (väsinud → väsinud, väsinut) |
| friikartulid | omastav, osastav | friikartuli, friikartulit | friikartulite, friikartuleid (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| haritud | omastav | haritu | haritu (Vabamorf too); suggested haritud | participle adjective: genitive equals the base form (väsinud → väsinud, väsinut) |
| hinnatud | omastav | hinnatu | hinnatu (Vabamorf too); suggested hinnatud | participle adjective: genitive equals the base form (väsinud → väsinud, väsinut) |
| hõivatud | omastav | hõivatu | hõivatu (Vabamorf too); suggested hõivatud | participle adjective: genitive equals the base form (väsinud → väsinud, väsinut) |
| jultunud | omastav | jultunu | jultunu (Vabamorf too); suggested jultunud | participle adjective: genitive equals the base form (väsinud → väsinud, väsinut) |
| jutumärgid | omastav, osastav | jutumärgi, jutumärki | jutumärkide, jutumärke / jutumärkisid (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| juuksed | omastav, osastav | juukse, juust | juuste, juukseid (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| jõulupühad | omastav, osastav | jõulupüha, jõulupüha | jõulupühade, jõulupühi / jõulupühasid (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| kaerahelbed | omastav, osastav | kaerahelbe, kaerahelvest | kaerahelveste, kaerahelbeid (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| keelatud | omastav | keelatu | keelatu (Vabamorf too); suggested keelatud | participle adjective: genitive equals the base form (väsinud → väsinud, väsinut) |
| kogenud | omastav | kogenu | kogenu (Vabamorf too); suggested kogenud | participle adjective: genitive equals the base form (väsinud → väsinud, väsinut) |
| koolitarbed | omastav, osastav | koolitarbe, koolitarvet | koolitarvete, koolitarbeid (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| krõpsud | omastav, osastav | krõpsu, krõpsu | krõpsude, krõpse / krõpsusid (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| kulunud | omastav | kulunu | kulunu (Vabamorf too); suggested kulunud | participle adjective: genitive equals the base form (väsinud → väsinud, väsinut) |
| kurnatud | omastav | kurnatu | kurnatu (Vabamorf too); suggested kurnatud | participle adjective: genitive equals the base form (väsinud → väsinud, väsinut) |
| kõrvaklapid | omastav, osastav | kõrvaklapi, kõrvaklappi | kõrvaklappide, kõrvaklappe / kõrvaklappisid (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| külmutatud | omastav | külmutatu | külmutatu (Vabamorf too); suggested külmutatud | participle adjective: genitive equals the base form (väsinud → väsinud, väsinut) |
| lahutatud | omastav | lahutatu | lahutatu (Vabamorf too); suggested lahutatud | participle adjective: genitive equals the base form (väsinud → väsinud, väsinut) |
| lihavõttepühad | omastav, osastav | lihavõttepüha, lihavõttepüha | lihavõttepühade, lihavõttepühi / lihavõttepühasid (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| lugupeetud | omastav | lugupeetu | lugupeetu (Vabamorf too); suggested lugupeetud | participle adjective: genitive equals the base form (väsinud → väsinud, väsinut) |
| läbirääkimised | omastav, osastav | läbirääkimise, läbirääkimist | läbirääkimiste, läbirääkimisi (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| maailmameistrivõistlused | omastav, osastav | maailmameistrivõistluse, maailmameistrivõistlust | maailmameistrivõistluste, maailmameistrivõistlusi / maailmameistrivõistluseid (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| meistrivõistlused | omastav, osastav | meistrivõistluse, meistrivõistlust | meistrivõistluste, meistrivõistlusi / meistrivõistluseid (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| möödunud | omastav | möödunu | möödunu (Vabamorf too); suggested möödunud | participle adjective: genitive equals the base form (väsinud → väsinud, väsinut) |
| prillid | omastav, osastav | prilli, prilli | prillide, prille / prillisid (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| päikeseprillid | omastav, osastav | päikeseprilli, päikeseprilli | päikeseprillide, päikeseprille / päikeseprillisid (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| püksid | omastav, osastav | püksi, püksi | pükste / pükside, pükse / püksisid (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| rahvariided | omastav, osastav | rahvariide, rahvariiet | rahvariiete, rahvariideid (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| rulluisud | omastav, osastav | rulluisu, rulluisku | rulluiskude, rulluiske / rulluiskusid (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| sademed | omastav, osastav | sademe, sadet | sademete, sademeid (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| surnud | omastav | surnu | surnu (Vabamorf too); suggested surnud | participle adjective: genitive equals the base form (väsinud → väsinud, väsinut) |
| säilmed | omastav, osastav | säilme, säilet | säilmete, säilmeid (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| teadmised | omastav, osastav | teadmise, teadmist | teadmiste, teadmisi / teadmiseid (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| teatud | omastav | teatu | teatu (Vabamorf too); suggested teatud | participle adjective: genitive equals the base form (väsinud → väsinud, väsinut) |
| teretulnud | omastav | teretulnu | teretulnu (Vabamorf too); suggested teretulnud | participle adjective: genitive equals the base form (väsinud → väsinud, väsinut) |
| tuntud | omastav | tuntu | tuntu (Vabamorf too); suggested tuntud | participle adjective: genitive equals the base form (väsinud → väsinud, väsinut) |
| täiskasvanud | omastav | täiskasvanu | täiskasvanu (Vabamorf too); suggested täiskasvanud | participle adjective: genitive equals the base form (väsinud → väsinud, väsinut) |
| tänusõnad | omastav, osastav | tänusõna, tänusõna | tänusõnade, tänusõnu / tänusõnasid (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| ujumisriided | omastav, osastav | ujumisriide, ujumisriiet | ujumisriiete, ujumisriideid (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| valimised | omastav, osastav | valimise, valimist | valimiste, valimisi (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| vanavanemad | omastav, osastav | vanavanema, vanavanemat | vanavanemate, vanavanemaid (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| vanemad | omastav, osastav | vanema, vanemat | vanemate, vanemaid (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| veendunud | omastav | veendunu | veendunu (Vabamorf too); suggested veendunud | participle adjective: genitive equals the base form (väsinud → väsinud, väsinut) |
| vilunud | omastav | vilunu | vilunu (Vabamorf too); suggested vilunud | participle adjective: genitive equals the base form (väsinud → väsinud, väsinut) |
| vuntsid | omastav, osastav | vuntsi, vuntsi | vuntside, vuntse / vuntsisid (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| välissuhted | omastav, osastav | välissuhte, välissuhet | välissuhete, välissuhteid (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| väsinud | omastav | väsinu | väsinu (Vabamorf too); suggested väsinud | participle adjective: genitive equals the base form (väsinud → väsinud, väsinut) |
| võltsitud | omastav | võltsitu | võltsitu (Vabamorf too); suggested võltsitud | participle adjective: genitive equals the base form (väsinud → väsinud, väsinut) |
| õpingud | omastav, osastav | õpingu, õpingut | õpingute, õpinguid (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| üldlevinud | omastav | üldlevinu | üldlevinu (Vabamorf too); suggested üldlevinud | participle adjective: genitive equals the base form (väsinud → väsinud, väsinut) |
| ülejäänud | omastav | ülejäänu | ülejäänu (Vabamorf too); suggested ülejäänud | participle adjective: genitive equals the base form (väsinud → väsinud, väsinut) |
| ülestõusmispühad | omastav, osastav | ülestõusmispüha, ülestõusmispüha | ülestõusmispühade, ülestõusmispühi / ülestõusmispühasid (mitmus) | plural-only lemma: the card shows singular forms; plural genitive/partitive suggested |
| üllatunud | omastav | üllatunu | üllatunu (Vabamorf too); suggested üllatunud | participle adjective: genitive equals the base form (väsinud → väsinud, väsinut) |

## 3. Course words without forms — not added

### Several Vabamorf forms (choose one)

| lemma | field | ours | Vabamorf | note |
|---|---|---|---|---|
| lõppema | olevik 3. p | — | lõpeb / lõppeb | a2-012; several Vabamorf forms — not added |
| pidu | omastav | — | peo / pidu | a2-018; several Vabamorf forms — not added |
| pakk | omastav | — | paki / paku | a2-021; several Vabamorf forms — not added |
| pakk | osastav | — | pakki / pakku | a2-021; several Vabamorf forms — not added |
| ost | omastav | — | osti / ostu | a2-035; several Vabamorf forms — not added |
| ost | osastav | — | osti / ostu | a2-035; several Vabamorf forms — not added |
| äike | omastav | — | äikese / äikse | a2-055; several Vabamorf forms — not added |
| päike | omastav | — | päikese / päikse | a2-055; several Vabamorf forms — not added |
| reis | omastav | — | reie / reisi | a2-057; several Vabamorf forms — not added |
| reis | osastav | — | reit / reisi | a2-057; several Vabamorf forms — not added |
| palk | omastav | — | palga / palgi | a2-063; several Vabamorf forms — not added |
| palk | osastav | — | palka / palki | a2-063; several Vabamorf forms — not added |
| ütlema | da-tegevusnimi | — | öelda / ütelda | a2-067; several Vabamorf forms — not added |
| piknik | osastav | — | piknikku / piknikut | a2-083; several Vabamorf forms — not added |
| teade | omastav | — | teate / teatme | a2-086; several Vabamorf forms — not added |
| seade | omastav | — | seade / seadme | a2-088; several Vabamorf forms — not added |
| pearoog | omastav | — | pearoa / pearoo | a2b1-027; several Vabamorf forms — not added |
| pearoog | osastav | — | pearooga / pearoogu | a2b1-027; several Vabamorf forms — not added |
| koor | omastav | — | koore / koori | a2b1-028; several Vabamorf forms — not added |
| koor | osastav | — | koort / koori | a2b1-028; several Vabamorf forms — not added |
| kaal | omastav | — | kaali / kaalu | a2b1-034; several Vabamorf forms — not added |
| kaal | osastav | — | kaali / kaalu | a2b1-034; several Vabamorf forms — not added |
| lõke | omastav | — | lõkke / lõkme | a2b1-057; several Vabamorf forms — not added |
| tipp | omastav | — | tipi / tipu | b1b2-012; several Vabamorf forms — not added |
| tipp | osastav | — | tippi / tippu | b1b2-012; several Vabamorf forms — not added |
| elukulud | osastav | — | elukulgu / elukulu | b1b2-020; several Vabamorf forms — not added |
| kriteerium | osastav | — | kriteeriumi / kriteeriumit | b1b2-024; several Vabamorf forms — not added |
| ümbrik | osastav | — | ümbrikku / ümbrikut | b1b2-025; several Vabamorf forms — not added |
| impulssost | omastav | — | impulssosti / impulssostu | b1b2-052; several Vabamorf forms — not added |
| impulssost | osastav | — | impulssosti / impulssostu | b1b2-052; several Vabamorf forms — not added |
| kahju | osastav | — | kahju / kahjut | b1b2-055; several Vabamorf forms — not added |
| saastama | da-tegevusnimi | — | saastada / saastata | b1b2-061; several Vabamorf forms — not added |
| lennureis | omastav | — | lennureie / lennureisi | b1b2-063; several Vabamorf forms — not added |
| lennureis | osastav | — | lennureit / lennureisi | b1b2-063; several Vabamorf forms — not added |
| maks | omastav | — | maksa / maksu | b1b2-070; several Vabamorf forms — not added |
| maks | osastav | — | maksa / maksu | b1b2-070; several Vabamorf forms — not added |
| päts | omastav | — | pätsi / pätsu | b1b2-078; several Vabamorf forms — not added |
| päts | osastav | — | pätsi / pätsu | b1b2-078; several Vabamorf forms — not added |
| pööre | omastav | — | pöörde / pöörme | est-c1-001; several Vabamorf forms — not added |
| lekkima | olevik 3. p | — | lekib / lekkib | est-c1-026; several Vabamorf forms — not added |
| süsinikuheide | omastav | — | süsinikuheite / süsinikuheitme | est-c1-027; several Vabamorf forms — not added |
| voor | omastav | — | voore / voori / vooru | est-c1-042; several Vabamorf forms — not added |
| voor | osastav | — | voort / voori / vooru | est-c1-042; several Vabamorf forms — not added |
| memo | osastav | — | memo / memot | est-c1-043; several Vabamorf forms — not added |
| meediažanr | osastav | — | meediažanri / meediažanrit | est-c1-075; several Vabamorf forms — not added |
| kommentaarium | osastav | — | kommentaariumi / kommentaariumit | est-c1-076; several Vabamorf forms — not added |
| tekstiliik | omastav | — | tekstiliigi / tekstiliigu | est-c1-079; several Vabamorf forms — not added |
| tekstiliik | osastav | — | tekstiliiki / tekstiliiku | est-c1-079; several Vabamorf forms — not added |
| stsenaarium | osastav | — | stsenaariumi / stsenaariumit | est-c1-094; several Vabamorf forms — not added |

### Unknown to Vabamorf

| lemma | field | ours | Vabamorf | note |
|---|---|---|---|---|
| isikuandmed | omastav | — | — | a2-005; not in the Vabamorf lexicon — not added; no guess |
| isikuandmed | osastav | — | — | a2-005; not in the Vabamorf lexicon — not added; no guess |
| spelleerima | da-tegevusnimi | — | — | a2-039; not in the Vabamorf lexicon — not added; guess: spelleerida |
| spelleerima | olevik 3. p | — | — | a2-039; not in the Vabamorf lexicon — not added; guess: spelleerib |
| kergendunud | omastav | — | — | a2b1-024; not in the Vabamorf lexicon — not added; guess: kergendunu |
| kergendunud | osastav | — | — | a2b1-024; not in the Vabamorf lexicon — not added; guess: kergendunut |
| tasuta | omastav | — | — | b1b2-022; not in the Vabamorf lexicon — not added; no guess |
| tasuta | osastav | — | — | b1b2-022; not in the Vabamorf lexicon — not added; no guess |
| andmed | omastav | — | — | b1b2-056; not in the Vabamorf lexicon — not added; no guess |
| andmed | osastav | — | — | b1b2-056; not in the Vabamorf lexicon — not added; no guess |
| jäätmed | omastav | — | — | b1b2-061; not in the Vabamorf lexicon — not added; no guess |
| jäätmed | osastav | — | — | b1b2-061; not in the Vabamorf lexicon — not added; no guess |
| olmejäätmed | omastav | — | — | b1b2-061; not in the Vabamorf lexicon — not added; no guess |
| olmejäätmed | osastav | — | — | b1b2-061; not in the Vabamorf lexicon — not added; no guess |
| tekstiilijäätmed | omastav | — | — | b1b2-065; not in the Vabamorf lexicon — not added; no guess |
| tekstiilijäätmed | osastav | — | — | b1b2-065; not in the Vabamorf lexicon — not added; no guess |
| talgud | omastav | — | — | b1b2-067; not in the Vabamorf lexicon — not added; no guess |
| talgud | osastav | — | — | b1b2-067; not in the Vabamorf lexicon — not added; no guess |
| elektroonikajäätmed | omastav | — | — | b1b2-088; not in the Vabamorf lexicon — not added; no guess |
| elektroonikajäätmed | osastav | — | — | b1b2-088; not in the Vabamorf lexicon — not added; no guess |
| ääneldama | da-tegevusnimi | — | — | est-c1-003; not in the Vabamorf lexicon — not added; guess: ääneldada |
| ääneldama | olevik 3. p | — | — | est-c1-003; not in the Vabamorf lexicon — not added; guess: ääneldab |
| reema | omastav | — | — | est-c1-018; not in the Vabamorf lexicon — not added; guess: reema |
| reema | osastav | — | — | est-c1-018; not in the Vabamorf lexicon — not added; guess: reemat |
| implitsiitne | omastav | — | — | est-c1-033; not in the Vabamorf lexicon — not added; guess: implitsiitse |
| implitsiitne | osastav | — | — | est-c1-033; not in the Vabamorf lexicon — not added; guess: implitsiitset |
| da-infinitiiv | omastav | — | — | est-c1-038; not in the Vabamorf lexicon — not added; guess: da-infinitiivi |
| da-infinitiiv | osastav | — | — | est-c1-038; not in the Vabamorf lexicon — not added; guess: da-infinitiivi |

### Plural-only lemmas (cards would need plural forms)

| lemma | field | ours | Vabamorf | note |
|---|---|---|---|---|
| silmad | omastav, osastav | — | silmade / silme / silmude, silme / silmi / silmasid / silmusid (mitmus); singular would be silma, silma | a2-008; plural-only lemma — not added |
| riided | omastav, osastav | — | riiete, riideid (mitmus); singular would be riide, riiet | a2-031; plural-only lemma — not added |
| jalanõud | omastav, osastav | — | jalanõude, jalanõusid (mitmus); singular would be jalanõu, jalanõu | a2-031; plural-only lemma — not added |
| kodukaubad | omastav, osastav | — | kodukaupade, kodukaupu / kodukaupasid (mitmus); singular would be kodukauba, kodukaupa | a2-031; plural-only lemma — not added |
| toidukaubad | omastav, osastav | — | toidukaupade, toidukaupu / toidukaupasid (mitmus); singular would be toidukauba, toidukaupa | a2-031; plural-only lemma — not added |
| saapad | omastav, osastav | — | saabaste, saapaid (mitmus); singular would be saapa, saabast | a2-031; plural-only lemma — not added |
| juhiload | omastav, osastav | — | juhilubade, juhilube / juhilubasid (mitmus); singular would be juhiloa, juhiluba | a2b1-025; plural-only lemma — not added |
| märkmed | omastav, osastav | — | märgete / märkmete, märkeid / märkmeid (mitmus); singular would be märkme, märget | a2b1-039; plural-only lemma — not added |
| ületunnid | omastav, osastav | — | ületundide, ületunde / ületundisid (mitmus); singular would be ületunni, ületundi | a2b1-043; plural-only lemma — not added |
| eluasemekulud | omastav, osastav | — | eluasemekulude, eluasemekulusid (mitmus); singular would be eluasemekulu, eluasemekulu | b1b2-027; plural-only lemma — not added |
| töötingimused | omastav, osastav | — | töötingimuste, töötingimusi (mitmus); singular would be töötingimuse, töötingimust | b1b2-027; plural-only lemma — not added |
| algklassid | omastav, osastav | — | algklasside, algklasse / algklassisid (mitmus); singular would be algklassi, algklassi | b1b2-033; plural-only lemma — not added |
| kasutustingimused | omastav, osastav | — | kasutustingimuste, kasutustingimusi (mitmus); singular would be kasutustingimuse, kasutustingimust | b1b2-056; plural-only lemma — not added |
| heitmed | omastav, osastav | — | heidete / heitmete, heiteid / heitmeid (mitmus); singular would be heitme, heidet | b1b2-061; plural-only lemma — not added |
| tulevikuoskused | omastav, osastav | — | tulevikuoskuste, tulevikuoskusi / tulevikuoskuseid (mitmus); singular would be tulevikuoskuse, tulevikuoskust | est-c1-037; plural-only lemma — not added |
| põhitõed | omastav, osastav | — | põhitõdede, põhitõdesid (mitmus); singular would be põhitõe, põhitõde | est-c1-037; plural-only lemma — not added |
| sulud | omastav, osastav | — | sulgede / sulgude, sulge / sulgi / sulgesid / sulgusid (mitmus); singular would be sulu, sulgu | est-c1-088; plural-only lemma — not added |

### Participle adjectives (-nud / -tud)

| lemma | field | ours | Vabamorf | note |
|---|---|---|---|---|
| avatud | omastav, osastav | — | avatu, avatut; suggested avatud, avatut | a2-024; participle adjective — not added |
| suletud | omastav, osastav | — | suletu, suletut; suggested suletud, suletut | a2-024; participle adjective — not added |
| lubatud | omastav, osastav | — | lubatu, lubatut; suggested lubatud, lubatut | a2-037; participle adjective — not added |
| kadunud | omastav, osastav | — | kadunu, kadunut; suggested kadunud, kadunut | a2b1-008; participle adjective — not added |
| hirmunud | omastav, osastav | — | hirmunu, hirmunut; suggested hirmunud, hirmunut | a2b1-069; participle adjective — not added |
| pettunud | omastav, osastav | — | pettunu, pettunut; suggested pettunud, pettunut | a2b1-069; participle adjective — not added |
| ülerahvastatud | omastav, osastav | — | ülerahvastatu, ülerahvastatut; suggested ülerahvastatud, ülerahvastatut | b1b2-040; participle adjective — not added |
| keskendunud | omastav, osastav | — | keskendunu, keskendunut; suggested keskendunud, keskendunut | b1b2-045; participle adjective — not added |
| ärritunud | omastav, osastav | — | ärritunu, ärritunut; suggested ärritunud, ärritunut | b1b2-047; participle adjective — not added |
| tõrjutud | omastav, osastav | — | tõrjutu, tõrjutut; suggested tõrjutud, tõrjutut | b1b2-047; participle adjective — not added |
| piiratud | omastav, osastav | — | piiratu, piiratut; suggested piiratud, piiratut | b1b2-051; participle adjective — not added |
| kasutatud | omastav, osastav | — | kasutatu, kasutatut; suggested kasutatud, kasutatut | b1b2-055; participle adjective — not added |
| varjatud | omastav, osastav | — | varjatu, varjatut; suggested varjatud, varjatut | est-c1-005; participle adjective — not added |
| liigutatud | omastav, osastav | — | liigutatu, liigutatut; suggested liigutatud, liigutatut | est-c1-005; participle adjective — not added |
| piiritletud | omastav, osastav | — | piiritletu, piiritletut; suggested piiritletud, piiritletut | est-c1-008; participle adjective — not added |
| markeeritud | omastav, osastav | — | markeeritu, markeeritut; suggested markeeritud, markeeritut | est-c1-018; participle adjective — not added |
| lõpetatud | omastav, osastav | — | lõpetatu, lõpetatut; suggested lõpetatud, lõpetatut | est-c1-028; participle adjective — not added |
| aegunud | omastav, osastav | — | aegunu, aegunut; suggested aegunud, aegunut | est-c1-037; participle adjective — not added |
| õigustatud | omastav, osastav | — | õigustatu, õigustatut; suggested õigustatud, õigustatut | est-c1-037; participle adjective — not added |
| raisatud | omastav, osastav | — | raisatu, raisatut; suggested raisatud, raisatut | est-c1-044; participle adjective — not added |
| ettevalmistunud | omastav, osastav | — | ettevalmistunu, ettevalmistunut; suggested ettevalmistunud, ettevalmistunut | est-c1-044; participle adjective — not added |
| tasakaalustatud | omastav, osastav | — | tasakaalustatu, tasakaalustatut; suggested tasakaalustatud, tasakaalustatut | est-c1-052; participle adjective — not added |
| pühendunud | omastav, osastav | — | pühendunu, pühendunut; suggested pühendunud, pühendunut | est-c1-053; participle adjective — not added |
| kaalutletud | omastav, osastav | — | kaalutletu, kaalutletut; suggested kaalutletud, kaalutletut | est-c1-076; participle adjective — not added |
| ülepaisutatud | omastav, osastav | — | ülepaisutatu, ülepaisutatut; suggested ülepaisutatud, ülepaisutatut | est-c1-077; participle adjective — not added |
| kohustatud | omastav, osastav | — | kohustatu, kohustatut; suggested kohustatud, kohustatut | est-c1-082; participle adjective — not added |
| informeeritud | omastav, osastav | — | informeeritu, informeeritut; suggested informeeritud, informeeritut | est-c1-090; participle adjective — not added |
| kallutatud | omastav, osastav | — | kallutatu, kallutatut; suggested kallutatud, kallutatut | est-c1-092; participle adjective — not added |
| väljamõeldud | omastav, osastav | — | väljamõeldu, väljamõeldut; suggested väljamõeldud, väljamõeldut | est-c1-092; participle adjective — not added |
| petetud | omastav, osastav | — | petetu, petetut; suggested petetud, petetut | est-c1-096; participle adjective — not added |

### Not inflected

| lemma | field | ours | Vabamorf | note |
|---|---|---|---|---|
| katki | omastav, osastav | — | katki / katki | a2-035; analysed as D, not inflected — not added |
| nõus | omastav, osastav | — | nõus / nõus | a2b1-076; analysed as D/S, not inflected — not added |
| rahul | omastav, osastav | — | rahul / rahul | b1b2-047; analysed as D/S, not inflected — not added |

### One Vabamorf form, but the lemma is not analysed as a base form (check by hand)

Most of these forms look right (kuumakse, lugemisoskus); abielus is indeclinable („abielusa” is wrong).

| lemma | field | ours | Vabamorf | note |
|---|---|---|---|---|
| abielus | omastav, osastav | — | abielusa, abielusat | a2-009; etana does not read the word as a base form (abi_elu S sg in) — not added |
| kaardimakse | omastav, osastav | — | kaardimakse, kaardimakset | b1b2-025; etana does not read the word as a base form (kaardi_maks S pl p) — not added |
| kuumakse | omastav, osastav | — | kuumakse, kuumakset | b1b2-052; etana does not read the word as a base form (kuu_maks S pl p) — not added |
| lugemisoskus | omastav, osastav | — | lugemisoskuse, lugemisoskust | b1b2-074; etana does not read the word as a base form (lugemi_sosku S sg in) — not added |
| laenumakse | omastav, osastav | — | laenumakse, laenumakset | est-c1-011; etana does not read the word as a base form (laenu_maks S pl p) — not added |
| ärevil | omastav, osastav | — | ärevil, ärevil | est-c1-051; etana does not read the word as a base form (ärevil A (indecl.); ärevil D (indecl.)) — not added |
| põhjendamata | omastav, osastav | — | põhjendamata, põhjendamata | est-c1-057; etana does not read the word as a base form (põhjenda V mata; põhjenda=mata A (indecl.)) — not added |
| heitkogus | omastav, osastav | — | heitkoguse, heitkogust | est-c1-064; etana does not read the word as a base form (heit_kogu S sg in) — not added |

## 4. Generator lexicon (`worksheet-generator/lexicon/forms.json`) — report only

Every stored form of every word was synthesised again with the same genitive hint as `build_forms.py`.
Rows below are the only ones that are not identical; all are known, documented choices in `source.json`.

| lemma | form | ours | Vabamorf | note |
|---|---|---|---|---|
| tee | pl p | teesid | teid / teesid | pinned by `variants` in source.json (documented choice) |
| Daria | sg n | Daria | — | not in the Vabamorf lexicon (regular forms written by hand) |
| Daria | sg g | Daria | — | not in the Vabamorf lexicon (regular forms written by hand) |
| Daria | sg p | Dariat | — | not in the Vabamorf lexicon (regular forms written by hand) |
| Daria | sg ill | Dariasse | — | not in the Vabamorf lexicon (regular forms written by hand) |
| Daria | sg in | Darias | — | not in the Vabamorf lexicon (regular forms written by hand) |
| Daria | sg el | Dariast | — | not in the Vabamorf lexicon (regular forms written by hand) |
| Daria | sg all | Dariale | — | not in the Vabamorf lexicon (regular forms written by hand) |
| Daria | sg ad | Darial | — | not in the Vabamorf lexicon (regular forms written by hand) |
| Daria | sg abl | Darialt | — | not in the Vabamorf lexicon (regular forms written by hand) |
| Daria | sg tr | Dariaks | — | not in the Vabamorf lexicon (regular forms written by hand) |
| Daria | sg ter | Dariani | — | not in the Vabamorf lexicon (regular forms written by hand) |
| Daria | sg es | Dariana | — | not in the Vabamorf lexicon (regular forms written by hand) |
| Daria | sg kom | Dariaga | — | not in the Vabamorf lexicon (regular forms written by hand) |
| minema | me | läheme / lähme | lähme / läheme | same forms, different order (pinned by `variants`) |
| minema | te | lähete | lähte / lähete | pinned by `variants` in source.json (documented choice) |
| minema | vad | lähevad | lähvad / lähevad | pinned by `variants` in source.json (documented choice) |
| pidama | s | pidi | pidi / pidas | pinned by `variants` in source.json (documented choice) |
| pidama | sin | pidin | pidin / pidasin | pinned by `variants` in source.json (documented choice) |
| pidama | sid | pidid | pidid / pidasid | pinned by `variants` in source.json (documented choice) |
| pidama | sime | pidime | pidime / pidasime | pinned by `variants` in source.json (documented choice) |
| pidama | site | pidite | pidite / pidasite | pinned by `variants` in source.json (documented choice) |
| jooksma | da | joosta | jooksta / joosta | pinned by `variants` in source.json (documented choice) |
| jooksma | des | joostes | jookstes / joostes | pinned by `variants` in source.json (documented choice) |
| jooksma | ge | jookske | jookske / jooske | pinned by `variants` in source.json (documented choice) |
| jooksma | tud | joostud | jookstud / joostud | pinned by `variants` in source.json (documented choice) |
| jooksma | takse | joostakse | jookstakse / joostakse | pinned by `variants` in source.json (documented choice) |
