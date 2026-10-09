import { arrayUnion, collection, doc, getDocs, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { requireFirebaseClient } from './client.js';

// Lesson recordings from the Live Classroom room.
// The teacher's browser records two audio tracks (teacher microphone, student's incoming audio) in 5-minute
// segments and uploads them to Storage `lessonRecordings/{recordingId}/`. A worker on the school Mac transcribes
// them for free (whisper.cpp) and writes the dialogue back; audio is deleted after 60 days, the text stays.
// Recording is allowed only when the student card has recordingConsent === true (enforced by the rules). Staff set
// it on the card; the student or linked parent answers once on first login (RecordingConsentPrompt).

export const RECORDING_STATUS = Object.freeze({
  recording: 'recording', uploaded: 'uploaded', transcribing: 'transcribing', done: 'done', failed: 'failed',
});
export const SEGMENT_MS = 5 * 60 * 1000;
const MAX_SEGMENT_BYTES = 19 * 1024 * 1024;

export function recordingLanguage(subject = '') {
  return /inglise|english/i.test(subject) ? 'en' : 'et';
}

export function normalizeRecording(id, data = {}) {
  return {
    id,
    ...data,
    segments: Array.isArray(data.segments) ? data.segments : [],
    transcript: Array.isArray(data.transcript) ? data.transcript : [],
    status: data.status || RECORDING_STATUS.recording,
  };
}

export const lessonRecordingsService = {
  async start({ invitation, user, subject = '' }) {
    if (!invitation?.id || !invitation.studentId) throw new Error('Tund puudub.');
    const { db } = requireFirebaseClient();
    const startedAt = new Date().toISOString();
    const id = `${invitation.id}_${Date.now()}`;
    const record = {
      invitationId: invitation.id,
      teacherUid: user.uid,
      teacherName: user.displayName || invitation.teacherName || '',
      studentId: invitation.studentId,
      studentUid: invitation.studentUid || '',
      studentName: invitation.studentName || '',
      title: invitation.title || '',
      language: recordingLanguage(subject),
      status: RECORDING_STATUS.recording,
      segments: [],
      startedAt,
      updatedAt: startedAt,
    };
    await setDoc(doc(db, 'lessonRecordings', id), record);
    return { id, ...record };
  },

  async uploadSegment({ recordingId, track, seq, blob, startMs, durationMs }) {
    if (!blob?.size) return null;
    if (blob.size > MAX_SEGMENT_BYTES) throw new Error('Salvestuse osa on liiga suur.');
    const { db, storage } = requireFirebaseClient();
    const type = String(blob.type || 'audio/webm').split(';')[0];
    const ext = type.includes('mp4') ? 'm4a' : type.includes('ogg') ? 'ogg' : 'webm';
    const path = `lessonRecordings/${recordingId}/${track}_${String(seq).padStart(3, '0')}.${ext}`;
    const storageRef = ref(storage, path);
    await new Promise((resolve, reject) => {
      const task = uploadBytesResumable(storageRef, blob, { contentType: type });
      task.on('state_changed', null, reject, resolve);
    });
    const segment = { track, seq, path, startMs: Math.round(startMs), durationMs: Math.round(durationMs) };
    await updateDoc(doc(db, 'lessonRecordings', recordingId), { segments: arrayUnion(segment), updatedAt: new Date().toISOString() });
    return segment;
  },

  // „Tekst kohe”: the teacher asks for the text of what was just said (the recorder closes its files first); the
  // transcriber on the school Mac takes this recording before anything else
  async requestText(recordingId) {
    const { db } = requireFirebaseClient();
    const at = new Date().toISOString();
    await updateDoc(doc(db, 'lessonRecordings', recordingId), { textRequestedAt: at });
    return at;
  },
  // the recording as it is now (its transcript grows during the lesson)
  subscribeRecording(recordingId, onData, onError) {
    const { db } = requireFirebaseClient();
    return onSnapshot(doc(db, 'lessonRecordings', recordingId), (snapshot) => onData(snapshot.exists() ? normalizeRecording(snapshot.id, snapshot.data()) : null), (error) => onError?.(error));
  },

  async finish(recordingId) {
    const { db } = requireFirebaseClient();
    const endedAt = new Date().toISOString();
    await updateDoc(doc(db, 'lessonRecordings', recordingId), { status: RECORDING_STATUS.uploaded, endedAt, updatedAt: endedAt });
    return endedAt;
  },

  // student side: is this room being recorded right now?
  subscribeForStudent({ uid, invitationId }, onData, onError) {
    const { db } = requireFirebaseClient();
    // rules let the student read only a recording that is running (status 'recording'); the query must say so
    const q = query(collection(db, 'lessonRecordings'), where('studentUid', '==', uid), where('invitationId', '==', invitationId), where('status', '==', RECORDING_STATUS.recording));
    return onSnapshot(q, (snapshot) => onData(snapshot.docs.map((d) => normalizeRecording(d.id, d.data()))), (error) => onError?.(error));
  },

  // staff: recordings of one student (a teacher sees the ones they recorded; an admin sees all)
  async listForStudent({ studentId, user, isAdmin = false }) {
    const { db } = requireFirebaseClient();
    const filters = [where('studentId', '==', studentId)];
    if (!isAdmin) filters.push(where('teacherUid', '==', user.uid));
    const snapshot = await getDocs(query(collection(db, 'lessonRecordings'), ...filters));
    return snapshot.docs.map((d) => normalizeRecording(d.id, d.data()))
      .sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)));
  },

  // staff: consent for recording lives on the student card (students cannot change it)
  async setConsent({ studentId, value, user }) {
    const { db } = requireFirebaseClient();
    const now = new Date().toISOString();
    await updateDoc(doc(db, 'students', studentId), {
      recordingConsent: Boolean(value),
      recordingConsentAt: now,
      recordingConsentBy: user?.displayName || user?.email || user?.uid || '',
    });
    return { recordingConsent: Boolean(value), recordingConsentAt: now };
  },

  // student or linked parent: their own answer to the one-time consent question (rules require their own uid)
  async answerConsent({ studentId, value, user }) {
    const { db } = requireFirebaseClient();
    const now = new Date().toISOString();
    await updateDoc(doc(db, 'students', studentId), {
      recordingConsent: Boolean(value),
      recordingConsentAt: now,
      recordingConsentBy: String(user?.displayName || user?.email || '').slice(0, 200),
      recordingConsentByUid: user.uid,
    });
    return { recordingConsent: Boolean(value), recordingConsentAt: now };
  },

  // staff: heartbeat of the transcriber on the school Mac (written by the worker with the Admin SDK)
  subscribeTranscribers(onData, onError) {
    const { db } = requireFirebaseClient();
    return onSnapshot(collection(db, 'transcriberStatus'), (snapshot) => onData(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))), (error) => onError?.(error));
  },

  async audioUrl(path) {
    const { storage } = requireFirebaseClient();
    return getDownloadURL(ref(storage, path));
  },
};
