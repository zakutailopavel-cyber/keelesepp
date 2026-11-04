// Screen sharing in a 1:1 lesson call (owner 2026-11-04: the other side sees the shared screen big, the camera stays
// in a small window).
//
// Transport: the offer (teacher) carries a second, own video transceiver — the „screen slot” — next to the camera.
// Sharing puts the screen track on that slot with RTCRtpSender.replaceTrack, stopping puts `null` back: no new
// offer/answer, and the camera keeps going on its own track. The student's answer turns the slot to `sendrecv`, so
// the student can share the same way. Old clients without `addTransceiver` (and tests) fall back to the previous
// behaviour: the screen replaces the camera track.
//
// Detection on the receiving side: a remote track's label and contentHint are not carried over WebRTC (the label is a
// random id), so they cannot say „screen”. The slot is recognised by its place — the second video transceiver of the
// connection (m-line order is the same on both sides) — and the sharer announces start / stop over the room data
// channel ({ t: 'screen', on, slot }). The announcement decides; without one (channel not open yet) a slot track that
// receives frames (unmuted) counts as a share.

/** The video transceivers of a connection, in m-line (creation) order. */
export function videoTransceivers(peer) {
  const list = typeof peer?.getTransceivers === 'function' ? peer.getTransceivers() : [];
  return list.filter((item) => (item?.receiver?.track?.kind || item?.sender?.track?.kind) === 'video' && !item.stopped);
}

/** The screen slot: the second video transceiver (the first one is the camera). */
export function screenSlotTransceiver(peer) {
  return videoTransceivers(peer)[1] || null;
}

export function isScreenSlot(peer, transceiver) {
  if (!transceiver) return false;
  return videoTransceivers(peer).indexOf(transceiver) >= 1;
}

/** A valid share announcement from the data channel, or null. */
export function shareMessage(message) {
  if (!message || message.t !== 'screen' || typeof message.on !== 'boolean') return null;
  return { on: message.on, slot: message.slot !== false };
}

/**
 * Is the other side sharing its screen?
 * @param {{ announced: {on: boolean, slot: boolean} | null, slotLive: boolean }} state
 */
export function remoteShareActive({ announced = null, slotLive = false } = {}) {
  if (announced) return announced.on;
  return Boolean(slotLive);
}

/** Which stream shows the share: the slot track's own stream, or (old clients) the camera stream that now carries it. */
export function remoteShareStream({ announced = null, slotStream = null, mainStream = null } = {}) {
  if (announced && announced.on && !announced.slot) return mainStream;
  return slotStream;
}
