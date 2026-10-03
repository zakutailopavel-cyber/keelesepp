import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import roadmap from '../curriculum/a2Roadmap.json';
import Sheet from '../worksheet-studio/engine/Sheet.jsx';
import { generateFocusWorksheet, generateLessonBundle } from './engine/generator.js';
import a2DiagnosticProfile from './fixtures/a2-001.generator-profile.json';
import { validateGeneratorProfile } from './profiles/authoring.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };
afterEach(() => cleanup());

const lesson = roadmap.modules.flatMap((module) => module.lessons).find((item) => item.id === 'a2-001');

describe('a2-001 gold standard', () => {
  it('passes the real readiness and renders every core task in edit, learner and print modes', () => {
    const readiness = validateGeneratorProfile(a2DiagnosticProfile, { lessonId: lesson.id, lesson });
    expect(readiness.ready).toBe(true);
    const result = generateLessonBundle({ lesson, profile: readiness.profile, seed: 'a2-001-gold-standard' });
    expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
    expect(result.sheets).toHaveLength(3);

    result.sheets.forEach((sheet) => {
      expect(sheet.activityIds).toHaveLength(5);
      expect(new Set(sheet.activityIds).size).toBe(5);
      for (const mode of ['edit', 'interactive', 'print']) {
        const view = render(<Sheet doc={sheet.worksheetDoc} mode={mode} />);
        expect(view.container.querySelectorAll('.ws-page .ws-card')).toHaveLength(5);
        expect(view.container.querySelectorAll('.ws-page').length).toBeGreaterThan(0);
        view.unmount();
      }
    });
  });

  it('creates a standalone focus worksheet without leaking Russian roadmap metadata', () => {
    const result = generateFocusWorksheet({
      lesson,
      profile: a2DiagnosticProfile,
      focusIds: ['personal-info'],
      phase: 'full',
      seed: 'a2-001-personal-info-gold',
    });
    expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
    expect(result.sheet.worksheetDoc.blocks).toHaveLength(5);
    expect(result.sheet.worksheetDoc.meta.subtitle).not.toMatch(/[А-Яа-яЁё]/);
    expect(result.sheet.worksheetDoc.meta.canDo).not.toMatch(/[А-Яа-яЁё]/);
  });
});
