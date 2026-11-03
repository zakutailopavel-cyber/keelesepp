import { isScreenSlot, remoteShareActive, remoteShareStream, screenSlotTransceiver, shareMessage, videoTransceivers } from './screenShare.js';

const transceiver = (kind, extra = {}) => ({ receiver: { track: { kind } }, sender: { track: null }, ...extra });

describe('screenShare: the screen slot', () => {
  it('is the second video transceiver; audio and stopped ones do not count', () => {
    const audio = transceiver('audio');
    const camera = transceiver('video');
    const stopped = transceiver('video', { stopped: true });
    const slot = transceiver('video');
    const peer = { getTransceivers: () => [audio, camera, stopped, slot] };
    expect(videoTransceivers(peer)).toEqual([camera, slot]);
    expect(screenSlotTransceiver(peer)).toBe(slot);
    expect(isScreenSlot(peer, slot)).toBe(true);
    expect(isScreenSlot(peer, camera)).toBe(false);
    expect(isScreenSlot(peer, audio)).toBe(false);
    expect(isScreenSlot(peer, undefined)).toBe(false);
  });

  it('an old connection (one video, no transceiver API) has no slot', () => {
    expect(screenSlotTransceiver({ getTransceivers: () => [transceiver('audio'), transceiver('video')] })).toBeNull();
    expect(screenSlotTransceiver({})).toBeNull();
    expect(isScreenSlot({}, transceiver('video'))).toBe(false);
  });
});

describe('screenShare: is the other side sharing?', () => {
  it('reads only valid announcements', () => {
    expect(shareMessage({ t: 'screen', on: true, slot: true })).toEqual({ on: true, slot: true });
    expect(shareMessage({ t: 'screen', on: true })).toEqual({ on: true, slot: true });
    expect(shareMessage({ t: 'screen', on: true, slot: false })).toEqual({ on: true, slot: false });
    expect(shareMessage({ t: 'screen', on: 'yes' })).toBeNull();
    expect(shareMessage({ t: 'page', pageId: 'p1' })).toBeNull();
    expect(shareMessage(null)).toBeNull();
  });

  it('the announcement decides; without one a slot that gets frames counts', () => {
    expect(remoteShareActive({ announced: { on: true, slot: true }, slotLive: false })).toBe(true);
    expect(remoteShareActive({ announced: { on: false, slot: true }, slotLive: true })).toBe(false);
    expect(remoteShareActive({ announced: null, slotLive: true })).toBe(true);
    expect(remoteShareActive({ announced: null, slotLive: false })).toBe(false);
    expect(remoteShareActive()).toBe(false);
  });

  it('shows the slot stream, or the camera stream when an old client replaced the camera with the screen', () => {
    const slotStream = { id: 'slot' };
    const mainStream = { id: 'main' };
    expect(remoteShareStream({ announced: { on: true, slot: true }, slotStream, mainStream })).toBe(slotStream);
    expect(remoteShareStream({ announced: null, slotStream, mainStream })).toBe(slotStream);
    expect(remoteShareStream({ announced: { on: true, slot: false }, slotStream, mainStream })).toBe(mainStream);
  });
});
