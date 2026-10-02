import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { lessonWorksheetsService, worksheetDocsService } from '../../../services/firebase/index.js';
import WorksheetStudioPage from '../../worksheet-studio/WorksheetStudioPage.jsx';

export default function LessonWorksheetStudioPage({ repository = lessonWorksheetsService }) {
  const { lessonId, worksheetId } = useParams();
  const adapter = useMemo(() => ({
    async load() {
      const record = await repository.load(lessonId, worksheetId);
      return { document: record.worksheetDoc, source: 'worksheetDoc', lesson: {}, baseUpdatedAt: record.worksheetDocUpdatedAt, version: record.worksheetDocVersion, status: record.worksheetDocStatus };
    },
    async save({ document, user, baseUpdatedAt, status }) {
      const method = status === 'published' ? 'publish' : 'saveDraft';
      const record = await repository[method]({ lessonId, worksheetId, worksheetDoc: document, user, baseUpdatedAt });
      return { id: worksheetId, title: record.title, updatedAt: record.worksheetDocUpdatedAt, version: record.worksheetDocVersion, status: record.worksheetDocStatus, created: false };
    },
    listVersions: () => repository.listVersions(lessonId, worksheetId),
    uploadImage: (file) => worksheetDocsService.uploadImage(file),
    uploadAudio: (file) => worksheetDocsService.uploadAudio(file),
  }), [lessonId, repository, worksheetId]);
  return <WorksheetStudioPage repository={adapter} backTo={`/library/lessons/${encodeURIComponent(lessonId)}/worksheets`} allowCopy={false} />;
}
