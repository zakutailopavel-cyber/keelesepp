import { useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { lessonWorksheetsService, worksheetDocsService } from '../../../services/firebase/index.js';
import WorksheetStudioPage from '../../worksheet-studio/WorksheetStudioPage.jsx';
import { newDocument } from '../../worksheet-studio/engine/schema.js';
import { regenerateTask, regenerateTaskOptions } from '../engine/regenerate.js';
import { generatorProfileForLesson } from '../profiles/index.js';
import LessonGeneratorBar from './LessonGeneratorBar.jsx';
import { coreSheetMeta } from './lessonGeneration.js';
import { withArtLayout } from '../art/textbookArt.js';

const MISSING = 'Töölehte ei leitud.';

// Lesson constructor: one sheet of a roadmap lesson in the worksheet studio, with the lesson's sheets
// and the generator in a strip at the top. A core sheet that does not exist yet opens empty.
export default function LessonWorksheetStudioPage({ repository = lessonWorksheetsService, vocabularyRepository }) {
  const { lessonId, worksheetId } = useParams();
  // „?vaade=opilane” from Õppevara: a published sheet opens in the student view
  const [searchParams] = useSearchParams();
  const [reloadKey, setReloadKey] = useState(0);
  // „KeeleSepp AI” (owner 2026-10-26): a draft made by the GPT connector (functions/sheet-builder-api.js) is marked
  // until a person publishes it
  const [aiDraft, setAiDraft] = useState(null);
  const exists = useRef(true);
  const adapter = useMemo(() => ({
    async load() {
      let record;
      try {
        record = await repository.load(lessonId, worksheetId);
      } catch (error) {
        const meta = coreSheetMeta(worksheetId);
        if (!meta || error?.message !== MISSING) throw error;
        exists.current = false;
        const document = newDocument();
        return { document: { ...document, meta: { ...document.meta, title: meta.label.replace(/^\d\s*/, '') } }, source: 'lesson-new', lesson: {}, baseUpdatedAt: '', version: 0, status: 'draft', generation: null };
      }
      exists.current = true;
      setAiDraft(record.contentOrigin?.kind === 'gpt-connector' && record.worksheetDocStatus !== 'published' ? record.contentOrigin : null);
      // pictures added before they had their own row get ⅔ width and the „Vaata pilti” card (saved with the next save)
      return { document: withArtLayout(record.worksheetDoc), source: 'worksheetDoc', lesson: {}, baseUpdatedAt: record.worksheetDocUpdatedAt, version: record.worksheetDocVersion, status: record.worksheetDocStatus, generation: record.generation || null };
    },
    async save({ document, user, baseUpdatedAt, status, generation }) {
      const method = status === 'published' ? 'publish' : 'saveDraft';
      const meta = coreSheetMeta(worksheetId);
      const fresh = !exists.current;
      const record = await repository[method]({
        lessonId,
        worksheetId,
        worksheetDoc: document,
        user,
        baseUpdatedAt,
        ...(generation ? { generation } : {}),
        ...(fresh && meta ? { role: meta.id, slot: meta.slot, displayLabel: meta.label, source: 'manual' } : {}),
      });
      exists.current = true;
      if (record.worksheetDocStatus === 'published') setAiDraft(null);
      return { id: worksheetId, title: record.title, updatedAt: record.worksheetDocUpdatedAt, version: record.worksheetDocVersion, status: record.worksheetDocStatus, created: false };
    },
    regenerateBlock({ document, blockId, generation }) {
      const profile = generatorProfileForLesson(lessonId);
      const result = regenerateTask({ profile, generation, worksheetDoc: document, blockId });
      const blocking = result.diagnostics.filter((item) => item.severity === 'error');
      if (!result.block || blocking.length) throw new Error(blocking.map((item) => item.message).join(' ') || 'Uut ülesandevarianti ei saanud luua.');
      return result;
    },
    regenerateBlockOptions({ document, blockId, generation, difficulty }) {
      const profile = generatorProfileForLesson(lessonId);
      const { options, diagnostics } = regenerateTaskOptions({ profile, generation, worksheetDoc: document, blockId, difficulty, count: 3 });
      if (!options.length) throw new Error(diagnostics.filter((item) => item.severity === 'error').map((item) => item.message).join(' ') || 'Uut ülesandevarianti ei saanud luua.');
      return options.map((item) => item.block);
    },
    listVersions: () => repository.listVersions(lessonId, worksheetId),
    uploadImage: (file) => worksheetDocsService.uploadImage(file),
    uploadAudio: (file) => worksheetDocsService.uploadAudio(file),
    reloadKey,
  }), [lessonId, repository, worksheetId, reloadKey]);
  return (
    <WorksheetStudioPage
      key={worksheetId}
      repository={adapter}
      // opened from the Õpik („?tagasi=opik”): back leads to the book
      backTo={searchParams.get('tagasi') === 'opik' ? '/library/worksheets/book' : '/library'}
      backLabel={searchParams.get('tagasi') === 'opik' ? 'Õpik' : 'Õppevara'}
      allowCopy={false}
      initialMode={searchParams.get('vaade') === 'opilane' ? 'interactive' : 'edit'}
      draftId={`${lessonId}:${worksheetId}`}
      renderTop={({ dirty, doc, replaceDocument, insertBlocks }) => (<>
        {aiDraft ? <p className="st-banner st-banner--ai" role="note"><b>KeeleSepp AI</b> koostas selle mustandi{aiDraft.note ? ` · allikas: ${aiDraft.note}` : ''}{aiDraft.savedAt ? ` · ${new Date(aiDraft.savedAt).toLocaleString('et-EE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : ''}. Vaata üle ja vajuta „Avalda” — enne seda õpilased seda ei näe.</p> : null}
        <LessonGeneratorBar
          doc={doc}
          lessonId={lessonId}
          worksheetId={worksheetId}
          dirty={dirty}
          onPreviewSheet={replaceDocument}
          onInsertBlocks={insertBlocks}
          onGenerated={() => setReloadKey((value) => value + 1)}
          repository={repository}
          {...(vocabularyRepository ? { vocabularyRepository } : {})}
        />
      </>)}
    />
  );
}
