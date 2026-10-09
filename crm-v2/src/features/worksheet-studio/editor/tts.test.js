import { fillGaps, joinWav, speechScript, splitForSpeech, wavSeconds } from './tts.js';

// a tiny 16-bit mono WAV with `samples` samples of value `v`
function wav(samples, v = 1000, rate = 22050) {
  const buf = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buf);
  const w = (at, t) => [...t].forEach((c, i) => view.setUint8(at + i, c.charCodeAt(0)));
  w(0, 'RIFF'); view.setUint32(4, 36 + samples * 2, true); w(8, 'WAVE'); w(12, 'fmt '); view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true); w(36, 'data'); view.setUint32(40, samples * 2, true);
  for (let i = 0; i < samples; i += 1) view.setInt16(44 + i * 2, v, true);
  return buf;
}

describe('Estonian speech helpers', () => {
  it('reads the first right answer in place of a gap and drops markup', () => {
    expect(fillGaps('Mari ärkab kell [seitse|7]. {{Tere}} *päev*')).toBe('Mari ärkab kell seitse. Tere päev');
  });

  it('splits long text after sentences, never above the limit', () => {
    const text = Array.from({ length: 40 }, (_, i) => `See on lause number ${i}.`).join(' ');
    const pieces = splitForSpeech(text, 120);
    expect(pieces.length).toBeGreaterThan(5);
    pieces.forEach((p) => { expect(p.length).toBeLessThanOrEqual(120); expect(p.endsWith('.')).toBe(true); });
    expect(splitForSpeech('a '.repeat(300), 100).every((p) => p.length <= 100)).toBe(true);
    expect(splitForSpeech('   ')).toEqual([]);
  });

  it('a dialogue gives each speaker their voice; listening prefers the transcript', () => {
    const dialogue = speechScript('dialogue', { voiceA: 'vesta', voiceB: 'tambet', lines: [{ who: 'A', text: 'Tere! Mis kell sa [ärkad]?' }, { who: 'B', text: 'Kell seitse.' }, { who: 'A', text: ' ' }] });
    expect(dialogue).toEqual([{ text: 'Tere! Mis kell sa ärkad?', speaker: 'vesta' }, { text: 'Kell seitse.', speaker: 'tambet' }]);
    expect(speechScript('listening', { sentences: 'Ta joob [kohvi].', transcript: '' })).toEqual([{ text: 'Ta joob kohvi.', speaker: 'mari' }]);
    expect(speechScript('listening', { sentences: 'x', transcript: 'Täistekst.', voice: 'albert' })).toEqual([{ text: 'Täistekst.', speaker: 'albert' }]);
    expect(speechScript('reading', { passageTitle: 'Mari päev', passage: 'Mari ärkab.' })[0].text).toBe('Mari päev. Mari ärkab.');
  });

  it('joins WAV pieces with a pause of silence and keeps the format', () => {
    const joined = joinWav([wav(100), wav(50, 2000)], 100);
    const pause = Math.round(22050 * 0.1);
    expect(joined.byteLength).toBe(44 + (100 + pause + 50) * 2);
    const view = new DataView(joined);
    expect(view.getUint32(40, true)).toBe((100 + pause + 50) * 2);
    expect(view.getInt16(44, true)).toBe(1000);
    expect(view.getInt16(44 + 100 * 2, true)).toBe(0);
    expect(view.getInt16(44 + (100 + pause) * 2, true)).toBe(2000);
    expect(wavSeconds(joined)).toBeCloseTo((150 + pause) / 22050);
    expect(() => joinWav([wav(10), wav(10, 1, 44100)])).toThrow(/eri vormingus/);
    expect(() => joinWav([new ArrayBuffer(20)])).toThrow(/WAV/);
  });
});
