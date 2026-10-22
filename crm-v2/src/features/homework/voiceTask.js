// „Häälülesanne” helpers (VoiceAnswer.jsx, HomeworkPage.jsx)
export const VOICE_MAX_SECONDS = 120;
export const clockLabel = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
// an answer file the task list plays instead of linking
export const isAudioFile = (file) => /\.(webm|m4a|ogg|mp3|wav|aac)$/i.test(String(file?.name || '')) || String(file?.type || '').startsWith('audio/');
// up to three helper questions, one per line
export const voicePrompts = (text) => String(text || '').split('\n').map((line) => line.trim()).filter(Boolean).slice(0, 3).map((line) => line.slice(0, 200));
