// Adapter: CRM v1 `worksheetData` (flat blocks) -> worksheet document v2.
// Lets every existing structured worksheet open in the new design without re-authoring.
// Pure function: no network, no mutation of the source.
import { SCHEMA, newId } from './schema.js';

const str = (v) => String(v ?? '').trim();
const opt = (o) => str(o);

function choiceOptions(opts = [], correct) {
  const set = new Set(Array.isArray(correct) ? correct.map(Number) : [Number(correct) || 0]);
  return opts.map(opt).filter(Boolean).map((o, i) => (set.has(i) ? `*${o}` : o)).join('\n');
}

const block = (type, data, extra = {}) => ({ id: newId(), type, width: extra.width || 'half', tone: extra.tone || 'blue', data });
const task = (title, instruction = '') => ({ title, instruction });

export function convertLegacyBlock(b = {}) {
  const label = str(b.label);
  switch (b.type) {
    case 'text':
      return [block('text', { heading: '', text: str(b.content || b.text) }, { width: 'full', tone: 'white' })];
    case 'image':
      return [block('image', { img: b.imageUrl ? { src: str(b.imageUrl), focus: { x: 50, y: 50 } } : null, aspect: '4:3', caption: str(b.caption), bubble: '' }, { tone: 'white' })];
    case 'fill':
      return [block('gaps', { ...task(label || 'Täida lüngad.'), bank: '', showBank: 'no', sentences: str(b.text) })];
    case 'choice':
    case 'multi_select':
      return [block('choice', { ...task(label || (b.type === 'choice' ? 'Vali õige vastus.' : 'Vali kõik õiged vastused.')), questions: (b.questions || []).map((q) => ({ q: str(q.q || q.question), options: choiceOptions(q.opts || q.options || [], q.correct) })) }, { tone: 'sky' })];
    case 'reading':
      return [
        block('text', { heading: str(b.title) || 'Loe teksti.', text: str(b.passage) }, { width: 'full', tone: 'cream' }),
        block('choice', { ...task(label || 'Vasta küsimustele.'), questions: (b.questions || []).map((q) => ({ q: str(q.q || q.question), options: choiceOptions(q.opts || q.options || [], q.correct) })) }, { tone: 'sky', width: 'full' }),
      ];
    case 'true_false':
      return [block('truefalse', { ...task(label || 'Õige või vale?'), statements: (b.statements || []).map((s) => ({ text: str(typeof s === 'string' ? s : s.text), answer: s?.correct ? 'true' : 'false' })) }, { tone: 'green' })];
    case 'match':
    case 'connect':
      return [block('match', { ...task(label || 'Ühenda.'), pairs: (b.pairs || []).map((p) => ({ left: str(p.l), right: str(p.r) })) }, { tone: 'peach' })];
    case 'dialogue': {
      const names = [...new Set((b.lines || []).map((l) => str(l.speaker)).filter(Boolean))];
      return [block('dialogue', { ...task(label || 'Dialoog.'), speakerA: names[0] || 'A', speakerB: names[1] || 'B', lines: (b.lines || []).map((l) => ({ who: str(l.speaker) === names[1] ? 'B' : 'A', text: str(l.text) })) }, { tone: 'green' })];
    }
    case 'writing':
      return [block('writing', { ...task(label || 'Kirjuta.', str(b.task)), lines: Number(b.lines) || 6, minSent: 3, maxSent: 12, keywords: '', minKeywords: 0, img: null }, { tone: 'cream' })];
    case 'order':
      return [block('wordorder', { ...task(label || 'Moodusta lause.'), sentences: str(b.sentence) }, { tone: 'sky' })];
    case 'table': {
      const heads = (b.headers || []).map(str).filter(Boolean);
      const rows = Array.from({ length: Number(b.rows) || 4 }, (_, ri) => heads.map((_, ci) => str((b.cellData || {})[`${ri},${ci}`])).join(' | ')).join('\n');
      return [block('table', { ...task(label || 'Täida tabel.'), headers: heads.join(', '), rows }, { width: 'full' })];
    }
    case 'dictation':
      return [block('listening', { ...task(label || 'Dikteerimine.', 'Kuula ja kirjuta laused.'), audio: b.audioUrl ? { src: str(b.audioUrl) } : null, sentences: (b.sentences || []).map((s) => `[${str(s?.text || s)}]`).join('\n'), transcript: '' }, { tone: 'sky' })];
    case 'audio':
    case 'video':
      return [
        block('listening', { ...task(label || (b.type === 'audio' ? 'Kuula.' : 'Vaata.'), str(b.title)), audio: b.audioUrl || b.videoUrl ? { src: str(b.audioUrl || b.videoUrl) } : null, sentences: '', transcript: '' }, { tone: 'sky' }),
        ...((b.questions || []).length ? [block('choice', { ...task('Vasta küsimustele.'), questions: b.questions.map((q) => ({ q: str(q.q), options: choiceOptions(q.opts || [], q.correct) })) }, { tone: 'sky' })] : []),
      ];
    case 'voice_recording':
      return [block('speaking', { ...task(label || 'Räägi.', str(b.prompt || b.task)), questions: '', img: null, aspect: '4:3', bubble: '', tipTitle: '', tipText: '', minSec: 30, maxSec: 180 }, { tone: 'green' })];
    case 'error_correction':
      return [block('reading', { ...task(label || 'Paranda vead.'), passageTitle: '', passage: '', questions: (b.sentences || []).map((s) => `${str(s.wrong)} [${str(s.correct)}]`).join('\n') }, { tone: 'peach', width: 'full' })];
    case 'transformation':
      return [block('reading', { ...task(label || 'Muuda laused.', str(b.instruction)), passageTitle: '', passage: '', questions: (b.sentences || []).map(str).join('\n') }, { tone: 'peach', width: 'full' })];
    default:
      return [block('text', { heading: `Vana plokk (${str(b.type) || 'tundmatu'})`, text: 'Seda plokitüüpi ei saanud automaatselt teisendada. Ava vana redaktoris või loo uuesti.' }, { width: 'full', tone: 'white' })];
  }
}

export function convertLegacyWorksheet(worksheetData = {}, lesson = {}) {
  const meta = worksheetData.meta || {};
  return {
    schema: SCHEMA,
    id: newId('ws'),
    convertedFrom: 'worksheetData/v1',
    meta: {
      title: str(meta.title || lesson.title) || 'Tööleht',
      subtitle: '',
      level: str(meta.level || lesson.level) || 'A2',
      module: str(meta.topic || lesson.topic),
      canDo: str(lesson.curriculumLessonGoal),
      badge: 'Iga päev on uus võimalus rääkida eesti keeles!',
      slogan: 'Rohkem kui lihtsalt keel!',
      footer: { tagline: 'Targem suhtlus. Suurem maailm.', url: 'www.epkoolitus.ee' },
      goals: {},
    },
    blocks: (worksheetData.blocks || []).flatMap(convertLegacyBlock),
  };
}
