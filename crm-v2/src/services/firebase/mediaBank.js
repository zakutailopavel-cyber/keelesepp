import { collection, doc, getDocs, limit, query, setDoc, writeBatch } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { extractAssets, LEVELS, tagsOf } from '../../features/worksheet-studio/mediaBank.js';
import { publishedWorksheetDoc } from '../../features/library/libraryModel.js';
import { publishedPhaseDoc } from '../../features/worksheet-studio/bookProgram.js';

// `mediaAssets/{key}`: the school's picture and text bank for the worksheet constructor (staff only). The key is a
// hash of the picture address or the text, so indexing again never makes duplicates.
const MAX_ASSETS = 5000;

const str = (value, max) => String(value ?? '').slice(0, max);
function clean(asset) {
  const image = asset.kind === 'image';
  return {
    kind: image ? 'image' : 'text',
    level: LEVELS.includes(asset.level) ? asset.level : '',
    topic: str(asset.topic, 200),
    sheetTitle: str(asset.sheetTitle, 200),
    lessonId: str(asset.lessonId, 120),
    phase: str(asset.phase, 20),
    tags: (asset.tags || []).slice(0, 60).map((tag) => str(tag, 40)),
    source: str(asset.source || 'worksheet', 20),
    ...(image
      ? { src: str(asset.src, 2000), storagePath: str(asset.storagePath, 500), width: Number(asset.width) || 0, height: Number(asset.height) || 0, caption: str(asset.caption, 300), credit: str(asset.credit, 300) }
      : { title: str(asset.title, 200), text: str(asset.text, 6000), words: Number(asset.words) || 0, textType: asset.textType === 'dialogue' ? 'dialogue' : 'reading' }),
  };
}

export const mediaBankService = {
  async list() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'mediaAssets'), limit(MAX_ASSETS)));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  },

  // one picture or text (a new upload in the constructor, or a text the teacher saves to the bank)
  async save(asset, user) {
    if (!asset?.key) throw new Error('Varal puudub võti.');
    const { db } = requireFirebaseClient();
    const now = new Date().toISOString();
    const value = { ...clean(asset), tags: asset.tags?.length ? clean(asset).tags : tagsOf(asset.caption, asset.title, asset.topic), updatedAt: now, createdAt: asset.createdAt || now, createdBy: user?.uid || '', createdByName: str(user?.displayName || user?.email, 160) };
    await setDoc(doc(db, 'mediaAssets', asset.key), value, { merge: true });
    return { id: asset.key, ...value };
  },

  // Admin: every published curriculum worksheet (the old lesson sheet and the Avasta / Harjuta / Kasuta phases)
  // goes through `extractAssets`; pictures and longer texts are written with their level and topic.
  async indexCurriculum({ library, lessonWorksheets, user, onProgress = () => {} }) {
    const { db } = requireFirebaseClient();
    const { curriculumLessons = [] } = await library.list();
    const found = new Map();
    let done = 0;
    for (const lesson of curriculumLessons) {
      const context = { lessonId: lesson.id, lessonTitle: lesson.title || '', level: lesson.level || '', module: lesson.roadmapModuleTitle || lesson.module || '' };
      const docs = [];
      const legacy = publishedWorksheetDoc(lesson);
      if (legacy?.blocks?.length) docs.push({ doc: legacy, phase: '' });
      const phases = Object.entries(lesson.worksheetPhases || {}).filter(([, summary]) => Number(summary?.publishedVersion) > 0);
      if (phases.length && lessonWorksheets?.list) {
        const records = await lessonWorksheets.list(lesson.id).catch(() => []);
        for (const record of records) {
          const published = publishedPhaseDoc(record);
          if (published?.blocks?.length) docs.push({ doc: published, phase: record.worksheetId || record.id || '' });
        }
      }
      for (const { doc: sheet, phase } of docs) {
        const { images, texts } = extractAssets(sheet, { ...context, phase });
        [...images, ...texts].forEach((asset) => { if (!found.has(asset.key)) found.set(asset.key, asset); });
      }
      done += 1;
      onProgress({ done, total: curriculumLessons.length, assets: found.size });
    }
    const now = new Date().toISOString();
    const list = [...found.values()].slice(0, MAX_ASSETS);
    for (let offset = 0; offset < list.length; offset += 400) {
      const batch = writeBatch(db);
      list.slice(offset, offset + 400).forEach((asset) => batch.set(doc(db, 'mediaAssets', asset.key), {
        ...clean({ ...asset, source: 'curriculum' }), updatedAt: now, createdAt: now, createdBy: user?.uid || '', createdByName: str(user?.displayName || user?.email, 160),
      }, { merge: true }));
      await batch.commit();
    }
    return { lessons: curriculumLessons.length, images: list.filter((asset) => asset.kind === 'image').length, texts: list.filter((asset) => asset.kind === 'text').length };
  },
};
