// Starter document: the approved "Minu päev ja kellaaeg" sheet rebuilt from blocks.
import { SCHEMA } from './schema.js';

const P = () => null; // sample ships without photos in the CRM build

export const sampleDocument = () => ({
  schema: SCHEMA,
  id: 'ws_minu_paev',
  meta: {
    title: 'Minu päev ja kellaaeg',
    subtitle: 'Mis kell? Mida ma teen? Kuidas on minu tavaline päev?',
    level: 'A2',
    module: 'A2 lähtepunkt ja igapäevaelu',
    canDo: 'Räägin oma igapäevaelust lihtsalt ja arusaadavalt.',
    badge: 'Iga päev on uus võimalus rääkida eesti keeles!',
    slogan: 'Rohkem kui lihtsalt keel!',
    footer: { tagline: 'Targem suhtlus. Suurem maailm.', url: 'www.epkoolitus.ee' },
    goals: {
      g_time: 'Ütlen ja küsin kellaaega (Kell on …).',
      g_markers: 'Kasutan ajamärkereid (hommikul, päeval, õhtul, enne, pärast, tavaliselt).',
      g_speak: 'Räägin oma päevast 1,5–2 minutit.',
      g_write: 'Kirjutan lühikese teksti oma päevast (6–8 lauset).',
    },
  },
  blocks: [
    { id: 'b1', type: 'clock', width: 'half', tone: 'blue', goal: 'g_time', data: { title: 'Soojendus.', titleMore: 'Mis kell on?', instruction: 'Kirjuta, mis kell on. Kasuta fraasi *Kell on …*', columns: '3', items: [{ time: '07:00', extra: '' }, { time: '08:10', extra: 'kaheksa kümme' }, { time: '03:00', extra: '' }, { time: '06:30', extra: '' }, { time: '12:00', extra: '' }, { time: '10:20', extra: 'kümme kakskümmend' }] } },
    { id: 'b2', type: 'manymatch', width: 'half', tone: 'green', goal: 'g_markers', data: { title: 'Millal sa teed neid tegevusi?', instruction: 'Ühenda tegevus sobiva ajaga. Mõned tegevused võivad sobida mitmesse aega.', left: 'ärkan\nsöön hommikusööki\nlähen tööle / kooli\nsöön lõunat\ntulen koju\nsöön õhtusööki\nvaatan televiisorit\nlähen magama', right: 'hommikul\npäeval\nõhtul\nöösel\ntavaliselt\nenne\npärast' } },
    { id: 'b3', type: 'pictures', width: 'half', tone: 'peach', goal: 'g_markers', data: { title: 'Minu päeva lugu.', titleMore: 'Pane pildid õigesse järjekorda.', instruction: 'Kirjuta numbrid 1–8 piltide alla.', mode: 'order', columns: '4', aspect: '4:3', items: [
      { img: P('photo_arkan.jpg'), caption: 'Ärkan.', answer: '1' }, { img: P('photo_hommikusook.jpg'), caption: 'Söön hommikusööki.', answer: '' },
      { img: P('photo_toole.jpg'), caption: 'Lähen tööle / kooli.', answer: '' }, { img: P('photo_lounat.jpg'), caption: 'Söön lõunat.', answer: '' },
      { img: P('photo_trenn.jpg'), caption: 'Teen trenni.', answer: '' }, { img: P('photo_koju.jpg'), caption: 'Tulen koju.', answer: '' },
      { img: P('photo_teler.jpg'), caption: 'Vaatan televiisorit.', answer: '' }, { img: P('photo_magama.jpg'), caption: 'Lähen magama.', answer: '8' },
    ] } },
    { id: 'b4', type: 'gaps', width: 'half', tone: 'blue', goal: 'g_markers', data: { title: 'Täienda laused.', instruction: 'Kasuta sobivat sõna või sõnaühendit.', bank: 'kell on, hommikul, päeval, õhtul, enne, pärast, tavaliselt', showBank: 'yes', sentences: 'Ma ärkan [tavaliselt|hommikul] kell 7.\nMa söön hommikusööki [hommikul|tavaliselt].\nMa lähen tööle [hommikul|tavaliselt] kell 8.\nMa söön lõunat [päeval|tavaliselt] kell 12.\nMa tulen koju [pärast] tööd.\nMa teen trenni [tavaliselt] õhtul.\nMa vaatan filme [õhtul|tavaliselt].\nMa lähen magama [tavaliselt|õhtul] kell 23.' } },
    { id: 'b5', type: 'speaking', width: 'half', tone: 'green', goal: 'g_speak', data: { title: 'Räägi.', titleMore: 'Minu tavaline päev.', instruction: 'Vaata pilte ja kasuta küsimusi. Räägi 1,5–2 minutit.', questions: 'Mis kell sa ärkad?\nMida sa teed hommikul?\nMis kell sa lähed tööle / kooli?\nMida sa teed päeval?\nMis kell sa tuled koju?\nMida sa teed õhtul?\nMis kell sa lähed magama?', img: P('man_mug.jpg'), aspect: '4:3', bubble: '', tipTitle: 'Kasuta erinevaid ajamarkereid:', tipText: 'hommikul, päeval, õhtul, tavaliselt, enne, pärast, siis, ja, ka.', minSec: 90, maxSec: 120 } },
    { id: 'b6', type: 'writing', width: 'half', tone: 'cream', goal: 'g_write', data: { title: 'Kirjuta.', titleMore: 'Minu tavaline tööpäev.', instruction: 'Kirjuta lühike tekst (6–8 lauset) oma tavalisest tööpäevast või koolipäevast. Kasuta vähemalt 5 ajamarkerit.', lines: 9, minSent: 6, maxSent: 8, keywords: 'hommikul, päeval, õhtul, öösel, tavaliselt, enne, pärast, siis, kell', minKeywords: 5, img: P('notebook.jpg') } },
    { id: 'b7', type: 'selfcheck', width: 'full', tone: 'sky', data: { title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '', items: 'Ma oskan küsida ja öelda kellaaega.\nMa kasutan ajamärkereid (*hommikul, päeval, õhtul, enne, pärast, tavaliselt*).\nMa oskan rääkida oma päevast 3–5 lausega.\nMa oskan kirjutada lühikese teksti oma päevast.', stamp: 'Ma teen edusamme!' } },
  ],
});
