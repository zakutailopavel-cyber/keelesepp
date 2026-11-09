// Listening items need a real Estonian voice: a stored Neurokõne recording of the sentence (vocabulary/wordAudio.js,
// checked per item by the caller of buildLesson) or the browser's speechSynthesis with an et-EE voice. With neither the
// item stays a plain build.

export function estonianVoice(synth = typeof window !== 'undefined' ? window.speechSynthesis : null) {
  try {
    const voices = synth?.getVoices?.() || [];
    return voices.find((v) => /^et([-_]|$)/i.test(v.lang || '')) || null;
  } catch {
    return null;
  }
}

export function speakEstonian(text, { rate = 0.9, synth = typeof window !== 'undefined' ? window.speechSynthesis : null } = {}) {
  const voice = estonianVoice(synth);
  if (!voice || typeof window.SpeechSynthesisUtterance !== 'function') return false;
  const u = new window.SpeechSynthesisUtterance(String(text || ''));
  u.voice = voice;
  u.lang = voice.lang;
  u.rate = rate;
  synth.cancel();
  synth.speak(u);
  return true;
}
