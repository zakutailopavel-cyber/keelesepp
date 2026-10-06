import { vi } from 'vitest';
import { inAppBrowser, mediaErrorMessage, openMedia } from './mobileMedia.js';

const telegram = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Telegram-iOS';
const safari = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1';
const named = (name) => Object.assign(new Error(name), { name });

describe('camera and microphone on phones', () => {
  it('recognises in-app browsers and tells the student to open Chrome or Safari', async () => {
    expect(inAppBrowser(telegram)).toBe(true);
    expect(inAppBrowser(safari)).toBe(false);
    await expect(openMedia(undefined, {}, telegram)).rejects.toThrow(/Ava link Chrome’is või Safaris/);
  });

  it('falls back to a plain camera, then to the microphone only', async () => {
    const stream = { id: 's' };
    const getUserMedia = vi.fn()
      .mockRejectedValueOnce(named('OverconstrainedError'))
      .mockRejectedValueOnce(named('NotReadableError'))
      .mockResolvedValueOnce(stream);
    const result = await openMedia({ getUserMedia }, { audio: true, video: { width: { ideal: 1280 } } }, safari);
    expect(result).toEqual({ stream, audioOnly: true });
    expect(getUserMedia.mock.calls.map(([constraints]) => constraints.video)).toEqual([{ width: { ideal: 1280 } }, true, false]);
  });

  it('does not retry a refused permission and explains how to allow it', async () => {
    const getUserMedia = vi.fn().mockRejectedValue(named('NotAllowedError'));
    await expect(openMedia({ getUserMedia }, { audio: true, video: true }, safari)).rejects.toThrow(/lukuikoonist/);
    expect(getUserMedia).toHaveBeenCalledTimes(1);
    expect(mediaErrorMessage(named('NotReadableError'))).toMatch(/teine rakendus/);
  });
});
