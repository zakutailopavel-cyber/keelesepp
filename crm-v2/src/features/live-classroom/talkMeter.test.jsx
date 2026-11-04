import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTalkTracker, createVad, EMPTY_TALK, minutes, percent, rms, rmsBytes, talkHint } from './talkMeter.js';
import TalkMeter from './TalkMeter.jsx';

const SPEECH = 0.08;
const NOISE = 0.003;
// feed `ms` of one level in 100 ms steps; returns the credited ms
const feed = (vad, level, ms) => { let sum = 0; for (let t = 0; t < ms; t += 100) sum += vad.step(level, 100); return sum; };

describe('talk meter VAD', () => {
  it('counts steady speech and nothing for silence', () => {
    const vad = createVad({ smoothing: 1 });
    expect(feed(vad, NOISE, 3000)).toBe(0);
    expect(feed(vad, SPEECH, 5000)).toBe(5000);
    expect(vad.speaking).toBe(true);
  });

  it('ignores short blips (cough, click)', () => {
    const vad = createVad({ smoothing: 1 });
    feed(vad, NOISE, 1000);
    expect(feed(vad, SPEECH, 200)).toBe(0);
    expect(feed(vad, NOISE, 1000)).toBe(0);
    expect(vad.speaking).toBe(false);
  });

  it('bridges short pauses inside speech, drops long ones', () => {
    const vad = createVad({ smoothing: 1 });
    feed(vad, NOISE, 500);
    let total = feed(vad, SPEECH, 1000);
    total += feed(vad, NOISE, 300); // inside the 400 ms hangover: credited when speech resumes
    total += feed(vad, SPEECH, 1000);
    expect(total).toBe(2300);
    total += feed(vad, NOISE, 2000); // long pause: not counted
    expect(total).toBe(2300);
    expect(vad.speaking).toBe(false);
  });

  it('adapts to a noisy line: steady hum is not speech, louder voice over it is', () => {
    const vad = createVad({ smoothing: 1 });
    expect(feed(vad, 0.02, 5000)).toBe(0); // above minLevel, but it is the floor
    expect(feed(vad, 0.1, 2000)).toBe(2000);
  });

  it('smooths a single spike away and caps late timer steps', () => {
    const vad = createVad();
    feed(vad, NOISE, 1000);
    expect(vad.step(0.5, 100) + vad.step(NOISE, 100) + vad.step(NOISE, 100)).toBe(0);
    const capped = createVad({ smoothing: 1, minSpeechMs: 0 });
    capped.step(NOISE, 100);
    expect(capped.step(SPEECH, 5000)).toBe(500);
  });
});

describe('talk tracker', () => {
  it('sums both sides and gives the student share', () => {
    const tracker = createTalkTracker({ vad: { smoothing: 1 } });
    let now = 0;
    const run = (teacher, student, ms) => { for (let t = 0; t < ms; t += 100) { now += 100; tracker.sample({ teacher, student }, now, 100); } };
    run(NOISE, NOISE, 1000);
    run(SPEECH, NOISE, 40_000);
    run(NOISE, SPEECH, 60_000);
    const snap = tracker.snapshot(now);
    expect(snap.teacherSec).toBe(40);
    expect(snap.studentSec).toBe(60);
    expect(snap.share).toBeCloseTo(0.6, 2);
    expect(snap.speaking).toEqual({ teacher: false, student: true });
  });

  it('keeps only the last 10 minutes in `recent` and warns when the student talks little', () => {
    const tracker = createTalkTracker({ vad: { smoothing: 1 } });
    let now = 0;
    const run = (teacher, student, ms) => { for (let t = 0; t < ms; t += 100) { now += 100; tracker.sample({ teacher, student }, now, 100); } };
    // real speech has breaths: 4.5 s talk + 0.5 s pause (the pause is longer than the hangover, so not counted)
    const talking = (side, ms) => { for (let t = 0; t < ms; t += 5000) { run(side === 'teacher' ? SPEECH : NOISE, side === 'student' ? SPEECH : NOISE, 4500); run(NOISE, NOISE, 500); } };
    run(NOISE, NOISE, 1000);
    talking('student', 15 * 60_000); // student talks 15 minutes
    talking('teacher', 10 * 60_000); // then the teacher 10 minutes
    expect(tracker.snapshot(now).studentSec).toBe(810);
    const snap = tracker.snapshot(now);
    expect(snap.share).toBeCloseTo(0.6, 2);
    expect(snap.recent.studentSec).toBeLessThan(15);
    expect(snap.recent.share).toBeLessThan(0.05);
    expect(talkHint(snap)).toBe('low');
  });

  it('treats a missing side as silence', () => {
    const tracker = createTalkTracker({ vad: { smoothing: 1 } });
    for (let i = 1; i <= 10; i += 1) tracker.sample({ teacher: NOISE }, i * 100, 100);
    for (let i = 11; i <= 60; i += 1) tracker.sample({ teacher: SPEECH }, i * 100, 100);
    expect(tracker.snapshot(6000)).toMatchObject({ teacherSec: 5, studentSec: 0, share: 0 });
  });
});

describe('helpers', () => {
  it('rms and labels', () => {
    expect(rms(new Float32Array([0.5, -0.5, 0.5, -0.5]))).toBeCloseTo(0.5);
    expect(rmsBytes(new Uint8Array([128, 128]))).toBe(0);
    expect(rms([])).toBe(0);
    expect(percent(0.537)).toBe('54 %');
    expect(percent(null)).toBe('—');
    expect(minutes(125)).toBe('2:05');
  });

  it('hints: none before talk, good at the target, ok below, low only with enough recent talk', () => {
    expect(talkHint(EMPTY_TALK)).toBe('none');
    expect(talkHint({ share: 0.65, recent: { teacherSec: 100, studentSec: 200, share: 0.66 } })).toBe('good');
    expect(talkHint({ share: 0.5, recent: { teacherSec: 100, studentSec: 100, share: 0.5 } })).toBe('ok');
    expect(talkHint({ share: 0.5, recent: { teacherSec: 50, studentSec: 10, share: 0.17 } })).toBe('ok');
    expect(talkHint({ share: 0.5, recent: { teacherSec: 200, studentSec: 30, share: 0.13 } })).toBe('low');
  });
});

describe('TalkMeter', () => {
  afterEach(cleanup);

  it('shows the student share, the target line and the details', () => {
    const meter = { teacherSec: 300, studentSec: 352, share: 0.54, recent: { teacherSec: 200, studentSec: 250, share: 0.556 }, speaking: { teacher: false, student: false } };
    render(<TalkMeter meter={meter} />);
    const pill = screen.getByRole('button', { name: 'Kõneaeg: õpilane räägib 54 %' });
    expect(pill.className).toContain('tm-pill--ok');
    fireEvent.click(pill);
    const box = screen.getByRole('dialog', { name: 'Kõneaeg' });
    expect(box.textContent).toContain('Õpilane räägib 54 % rääkimise ajast');
    expect(box.textContent).toContain('5:52');
    expect(box.textContent).toContain('mitte keelt');
    expect(box.textContent).not.toMatch(/eesti keel/i);
  });

  it('turns amber when the last 10 minutes were mostly the teacher', () => {
    render(<TalkMeter meter={{ teacherSec: 900, studentSec: 400, share: 0.31, recent: { teacherSec: 400, studentSec: 60, share: 0.13 }, speaking: {} }} />);
    const pill = screen.getByRole('button', { name: /Kõneaeg/ });
    expect(pill.className).toContain('tm-pill--low');
    fireEvent.click(pill);
    expect(screen.getByRole('dialog').textContent).toContain('räägib õpilane vähe');
  });

  it('renders nothing without a call', () => {
    const { container } = render(<TalkMeter streams={{ local: null, remote: null }} />);
    expect(container.innerHTML).toBe('');
  });

  it('measures the streams with Web Audio, never to the speakers, and closes the context', () => {
    vi.useFakeTimers();
    const connect = vi.fn();
    const contexts = [];
    class FakeContext {
      constructor() { this.state = 'running'; this.close = vi.fn(() => Promise.resolve()); this.suspend = vi.fn(() => Promise.resolve()); this.resume = vi.fn(() => Promise.resolve()); contexts.push(this); }
      createAnalyser() { return { fftSize: 0, getFloatTimeDomainData: (data) => data.fill(this.loud ? 0.1 : 0) }; }
      createMediaStreamSource() { return { connect, disconnect: vi.fn() }; }
    }
    const track = (id) => ({ id, kind: 'audio', enabled: true, readyState: 'live' });
    const stream = (id) => ({ getAudioTracks: () => [track(id)] });
    vi.stubGlobal('AudioContext', FakeContext);
    vi.stubGlobal('MediaStream', class { constructor(tracks) { this.tracks = tracks; } });
    try {
      const { unmount } = render(<TalkMeter streams={{ local: stream('t'), remote: stream('s') }} />);
      expect(contexts).toHaveLength(1);
      act(() => { vi.advanceTimersByTime(500); });
      contexts[0].loud = true;
      act(() => { vi.advanceTimersByTime(3000); });
      // both sides are loud here: equal share
      expect(screen.getByRole('button', { name: 'Kõneaeg: õpilane räägib 50 %' })).toBeTruthy();
      // only analysers are connected, never the destination (no extra playback, no echo)
      expect(connect.mock.calls.every(([node]) => node && 'getFloatTimeDomainData' in node)).toBe(true);
      unmount();
      expect(contexts[0].close).toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
  });
});
