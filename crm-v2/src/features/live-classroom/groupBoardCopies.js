import { lessonCopiesService } from '../../services/firebase/studentBoard.js';
import { isWorksheetPage } from '../board/lessonBoards.js';

/**
 * „Tunni tahvlid” for a group lesson (features/board/lessonBoards.js): when the teacher ends the room, the group board
 * (main board + its lesson pages, empty ones skipped) is copied read-only onto every member's own board, so each
 * student (and his parents) finds it in his area. One lesson key = the room id.
 */
export async function saveGroupBoardCopies({ roomId, room, user, boardService, copies = lessonCopiesService }) {
  const members = (room?.members || []).filter((member) => member?.studentId);
  if (!roomId || !members.length || !copies?.save) return [];
  const listed = boardService?.listPages ? await boardService.listPages(roomId) : [];
  const pages = [{ id: '', title: 'Tahvel' }, ...listed.filter((page) => !isWorksheetPage(page)).map((page) => ({ id: page.id, title: page.title || 'Leht' }))].slice(0, 20);
  const prefix = room?.title ? `${room.title}: ` : '';
  const saved = [];
  for (const member of members) {
    saved.push(...await copies.save({ studentId: member.studentId, sourceRoot: 'groupBoards', sourceId: roomId, pages, lessonKey: roomId, titlePrefix: prefix, user }));
  }
  return saved;
}
