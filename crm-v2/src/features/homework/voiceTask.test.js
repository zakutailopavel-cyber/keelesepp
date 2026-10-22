import { clockLabel, isAudioFile, voicePrompts } from './voiceTask.js';

describe('Häälülesanne helpers', () => {
  it('knows an audio answer, cuts the questions to three and shows the clock', () => {
    expect(isAudioFile({ name: 'haalvastus-40s.webm' })).toBe(true);
    expect(isAudioFile({ name: 'vihik.jpg' })).toBe(false);
    expect(isAudioFile({ name: 'x', type: 'audio/mp4' })).toBe(true);
    expect(voicePrompts(' Mida sa tegid? \n\nKuhu läksid?\nMis meeldis?\nNeljas')).toEqual(['Mida sa tegid?', 'Kuhu läksid?', 'Mis meeldis?']);
    expect(clockLabel(75)).toBe('1:15');
  });
});
