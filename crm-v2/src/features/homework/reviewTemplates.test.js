import { addLine, feedbackTemplates, quickFeedback, suggestedGrade } from './reviewTemplates.js';

describe('quick review', () => {
  it('suggests a grade from the automatic check', () => {
    expect([100, 90, 89, 75, 74, 50, 49, 30, 29, 0].map(suggestedGrade)).toEqual([5, 5, 4, 4, 3, 3, 2, 2, 1, 1]);
    expect(suggestedGrade(null)).toBeNull();
    expect(suggestedGrade(undefined)).toBeNull();
    expect(quickFeedback(95)).toBe('Suurepärane töö! Tubli!');
    expect(quickFeedback(20)).toMatch(/kordame/);
  });

  it('adds template lines once and puts „Korda” first when there are errors', () => {
    expect(addLine('', 'Tubli!')).toBe('Tubli!');
    expect(addLine('Tubli!', 'Tubli!')).toBe('Tubli!');
    expect(addLine('Tubli!', 'Korda.')).toBe('Tubli!\nKorda.');
    const doc = { blocks: [{ id: 'b1', type: 'truefalse', data: { title: 'Tõene või väär', statements: [{ text: 'x', answer: 'true' }] } }] };
    const lines = feedbackTemplates({ source: { worksheetDoc: doc }, errorLog: [{ key: 'b1:0', answer: 'false' }] });
    expect(lines[0]).toMatch(/^Korda: .*Tõene või väär\.$/);
    expect(feedbackTemplates({})[0]).toBe('Tubli!');
  });
});
