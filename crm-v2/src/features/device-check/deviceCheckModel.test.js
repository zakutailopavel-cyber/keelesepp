import { readFileSync } from 'node:fs';
import { classifyCandidates, deviceCheckRecord, detectBrowser, evaluateDeviceCheck, ISSUE_CODES, recordKey, teacherWarning, mediaErrorKind, meterPercent, readCapabilities, recorderType, rmsFromBytes } from './deviceCheckModel.js';

const UA = {
  chromeMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  safariMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  ipadDesktop: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
  iphoneOld: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Mobile/15E148 Safari/604.1',
  chromeIos: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0 Mobile/15E148 Safari/604.1',
  instagram: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 300.0.0',
  facebookAndroid: 'Mozilla/5.0 (Linux; Android 14; Pixel 7 Build/UQ1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/440.0.0]',
  firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0',
  edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
  samsung: 'Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0 Mobile Safari/537.36',
};

const good = (overrides = {}) => ({
  browser: detectBrowser(UA.chromeMac),
  secure: true, webrtc: true, getUserMedia: true, enumerateDevices: true, displayMedia: true, audioContext: true,
  mediaRecorder: true, recorderMime: 'audio/webm;codecs=opus', online: true, connection: { effectiveType: '4g' },
  camera: 'ok', mic: 'ok', micHeard: true, speakersHeard: true,
  network: { hostingOk: true, hostingMs: 80, functionsOk: true, functionsMs: 300, stun: true, relay: 'ok' },
  role: 'student',
  ...overrides,
});
const keys = (result) => result.issues.map((item) => item.key);

describe('detectBrowser', () => {
  it('names the browsers the room is used with', () => {
    expect(detectBrowser(UA.chromeMac)).toMatchObject({ name: 'chrome', version: 130, ios: false });
    expect(detectBrowser(UA.safariMac)).toMatchObject({ name: 'safari', version: 17, ipad: false });
    expect(detectBrowser(UA.firefox)).toMatchObject({ name: 'firefox', version: 131 });
    expect(detectBrowser(UA.edge)).toMatchObject({ name: 'edge', version: 130 });
    expect(detectBrowser(UA.samsung)).toMatchObject({ name: 'samsung', android: true });
    expect(detectBrowser(UA.chromeIos)).toMatchObject({ name: 'chrome', ios: true, iosVersion: 17.01 });
  });
  it('tells an iPad with a desktop user agent from a Mac by the touch screen', () => {
    expect(detectBrowser(UA.ipadDesktop, { maxTouchPoints: 5 })).toMatchObject({ ipad: true, ios: true, iosVersion: 17.02 });
    expect(detectBrowser(UA.ipadDesktop, { maxTouchPoints: 0 })).toMatchObject({ ipad: false, ios: false });
  });
  it('recognises in-app browsers', () => {
    expect(detectBrowser(UA.instagram).inApp).toBe(true);
    expect(detectBrowser(UA.facebookAndroid).inApp).toBe(true);
    expect(detectBrowser(UA.iphone).inApp).toBe(false);
  });
});

describe('capabilities', () => {
  it('reads the globals the room and the recorder use', () => {
    class FakeRecorder { static isTypeSupported(type) { return type === 'audio/mp4'; } }
    const caps = readCapabilities({
      isSecureContext: true, RTCPeerConnection: function Peer() {}, AudioContext: function Ctx() {}, MediaRecorder: FakeRecorder,
      navigator: { userAgent: UA.iphone, maxTouchPoints: 5, onLine: true, mediaDevices: { getUserMedia() {}, enumerateDevices() {} }, connection: { effectiveType: '4g', downlink: 10 } },
    });
    expect(caps).toMatchObject({ webrtc: true, getUserMedia: true, displayMedia: false, audioContext: true, mediaRecorder: true, recorderMime: 'audio/mp4', online: true });
    expect(caps.connection).toMatchObject({ effectiveType: '4g', downlink: 10 });
    expect(caps.browser.ios).toBe(true);
  });
  it('finds no recorder type without MediaRecorder', () => {
    expect(recorderType(undefined)).toBe('');
    expect(readCapabilities({ navigator: {} })).toMatchObject({ webrtc: false, getUserMedia: false, mediaRecorder: false, connection: null });
  });
  it('maps getUserMedia errors', () => {
    expect(mediaErrorKind({ name: 'NotAllowedError' })).toBe('denied');
    expect(mediaErrorKind({ name: 'NotReadableError' })).toBe('busy');
    expect(mediaErrorKind({ name: 'NotFoundError' })).toBe('notfound');
    expect(mediaErrorKind(new Error('x'))).toBe('error');
  });
  it('measures the level and counts ICE candidate types', () => {
    expect(rmsFromBytes(new Uint8Array(64).fill(128))).toBe(0);
    expect(rmsFromBytes(new Uint8Array(64).fill(192))).toBeCloseTo(0.5);
    expect(meterPercent(0.5)).toBe(100);
    expect(meterPercent(0.05)).toBe(20);
    expect(classifyCandidates([
      'candidate:1 1 udp 2122260223 abc.local 5000 typ host generation 0',
      { candidate: 'candidate:2 1 udp 1686052607 1.2.3.4 5000 typ srflx raddr 0.0.0.0 rport 0' },
      { type: 'relay', candidate: '' },
    ])).toEqual({ host: 1, srflx: 1, prflx: 0, relay: 1 });
  });
});

describe('evaluateDeviceCheck', () => {
  it('is green when everything works', () => {
    expect(evaluateDeviceCheck(good())).toEqual({ status: 'green', complete: true, issues: [] });
  });
  it('is not complete before the microphone and speaker questions are answered', () => {
    expect(evaluateDeviceCheck(good({ micHeard: null, speakersHeard: null })).complete).toBe(false);
    expect(evaluateDeviceCheck(good({ camera: 'untested', mic: 'untested', network: null })).complete).toBe(false);
  });
  it('is red in an in-app browser and says to open Chrome or Safari', () => {
    const result = evaluateDeviceCheck(good({ browser: detectBrowser(UA.instagram), getUserMedia: false }));
    expect(result.status).toBe('red');
    expect(keys(result)).toContain('in-app');
    expect(keys(result)).not.toContain('no-webrtc');
    expect(result.issues[0].fix).toMatch(/Chrome.*Safari/);
    expect(result.issues[0].ru).toMatch(/Chrome или Safari/);
  });
  it('is red without WebRTC and asks for Chrome or Safari', () => {
    const result = evaluateDeviceCheck(good({ webrtc: false }));
    expect(result.status).toBe('red');
    expect(result.issues.find((item) => item.key === 'no-webrtc').fix).toBe('Kasuta Chrome’i või Safarit (uusim versioon).');
  });
  it('gives the microphone and camera fixes', () => {
    const denied = evaluateDeviceCheck(good({ mic: 'denied', camera: 'denied' }));
    expect(denied.status).toBe('red');
    expect(denied.issues.find((item) => item.key === 'mic-denied').fix).toMatch(/^Luba mikrofon brauseri seadetes/);
    const busy = evaluateDeviceCheck(good({ camera: 'busy' }));
    expect(busy.issues.find((item) => item.key === 'camera-busy').fix).toMatch(/^Sulge teised rakendused, mis kasutavad kaamerat/);
    expect(evaluateDeviceCheck(good({ camera: 'notfound' })).status).toBe('yellow');
    expect(evaluateDeviceCheck(good({ mic: 'notfound' })).status).toBe('red');
  });
  it('tells iPad users where the permission is', () => {
    const result = evaluateDeviceCheck(good({ browser: detectBrowser(UA.ipadDesktop, { maxTouchPoints: 5 }), displayMedia: false, mic: 'denied' }));
    expect(result.issues.find((item) => item.key === 'mic-denied').fix).toMatch(/Seaded → Safari/);
  });
  it('is yellow when the microphone hears nothing or the sound was not heard', () => {
    expect(keys(evaluateDeviceCheck(good({ micHeard: false })))).toEqual(['mic-silent']);
    expect(evaluateDeviceCheck(good({ speakersHeard: false })).status).toBe('yellow');
  });
  it('explains screen sharing on iPad without making a student yellow', () => {
    const ipad = detectBrowser(UA.ipadDesktop, { maxTouchPoints: 5 });
    const student = evaluateDeviceCheck(good({ browser: ipad, displayMedia: false }));
    expect(student.status).toBe('green');
    expect(student.issues).toEqual([expect.objectContaining({ key: 'screen-ios', level: 'info' })]);
    expect(evaluateDeviceCheck(good({ browser: ipad, displayMedia: false, role: 'teacher' })).status).toBe('yellow');
  });
  it('flags an old iOS and a missing recorder', () => {
    expect(keys(evaluateDeviceCheck(good({ browser: detectBrowser(UA.iphoneOld), displayMedia: false })))).toContain('ios-old');
    const teacher = evaluateDeviceCheck(good({ mediaRecorder: false, recorderMime: '', role: 'teacher' }));
    expect(teacher.issues.find((item) => item.key === 'no-recorder').title).toMatch(/tundi salvestada/);
  });
  it('rates the network', () => {
    expect(evaluateDeviceCheck(good({ online: false })).status).toBe('red');
    expect(keys(evaluateDeviceCheck(good({ network: { ...good().network, hostingOk: false } })))).toContain('hosting');
    expect(keys(evaluateDeviceCheck(good({ network: { ...good().network, hostingMs: 2400 } })))).toEqual(['slow']);
    expect(keys(evaluateDeviceCheck(good({ connection: { effectiveType: '2g' } })))).toEqual(['2g']);
    expect(evaluateDeviceCheck(good({ connection: { effectiveType: '3g' } })).status).toBe('yellow');
    // no STUN but the relay works: the call goes through TURN, nothing to fix
    expect(evaluateDeviceCheck(good({ network: { ...good().network, stun: false, relay: 'ok' } })).status).toBe('green');
    expect(keys(evaluateDeviceCheck(good({ network: { ...good().network, stun: false, relay: 'unavailable' } })))).toEqual(['stun']);
    expect(evaluateDeviceCheck(good({ network: { ...good().network, stun: false, relay: 'none' } })).status).toBe('red');
    expect(keys(evaluateDeviceCheck(good({ network: { ...good().network, relay: 'none' } })))).toEqual(['relay']);
    // the relay is checked only with a lesson link; without one that is no problem
    expect(evaluateDeviceCheck(good({ network: { ...good().network, relay: 'unavailable' } })).status).toBe('green');
  });
});

describe('stored result and teacher warning', () => {
  it('keeps only status, red / yellow codes and a short browser label', () => {
    const ipad = detectBrowser(UA.ipadDesktop, { maxTouchPoints: 5 });
    const result = evaluateDeviceCheck(good({ browser: ipad, displayMedia: false, micHeard: false }));
    const record = deviceCheckRecord(result, ipad, new Date('2026-11-04T10:00:00Z'));
    expect(record).toEqual({ at: '2026-11-04T10:00:00.000Z', status: 'warn', issues: ['mic-silent'], browser: 'Safari 17 iPad' });
    expect(deviceCheckRecord(evaluateDeviceCheck(good()), detectBrowser(UA.chromeMac)).status).toBe('ok');
    expect(deviceCheckRecord(evaluateDeviceCheck(good({ mic: 'denied', camera: 'denied' })), {}).status).toBe('fail');
    expect(recordKey(record)).toBe('warn|mic-silent|Safari 17 iPad');
  });
  it('caps the codes at 12', () => {
    const many = { status: 'red', issues: ISSUE_CODES.map((key) => ({ key, level: 'red' })) };
    expect(deviceCheckRecord(many, {}).issues).toHaveLength(12);
  });
  it('every issue the evaluation can give has a code the rules accept', () => {
    const rules = readFileSync(`${globalThis.process.cwd()}/../firestore.rules`, 'utf8');
    const list = /deviceCheck\.issues\.hasOnly\(\[([^\]]*)\]\)/.exec(rules)[1].split(',').map((item) => item.trim().replace(/'/g, ''));
    expect(list.sort()).toEqual([...ISSUE_CODES].sort());
    const model = readFileSync(`${globalThis.process.cwd()}/src/features/device-check/deviceCheckModel.js`, 'utf8');
    const used = [...model.matchAll(/issue\('([a-z0-9-]+)'/g)].map((match) => match[1]);
    expect(new Set(used)).toEqual(new Set(ISSUE_CODES));
  });
  it('warns the teacher about fail / warn and about a student who never checked before a first lesson', () => {
    expect(teacherWarning({ deviceCheck: { status: 'ok', issues: [], at: 'x', browser: 'Chrome' } })).toBeNull();
    expect(teacherWarning({ deviceCheck: { status: 'fail', issues: ['mic-denied', 'unknown'], at: '2026-11-04T10:00:00Z', browser: 'Chrome 130' } }))
      .toEqual({ level: 'fail', title: 'Õpilase seadmes on viga', issues: ['mikrofon on keelatud'], at: '2026-11-04T10:00:00Z', browser: 'Chrome 130' });
    expect(teacherWarning({ deviceCheck: { status: 'warn', issues: ['slow'] } }).title).toBe('Õpilase seadmes on märkusi');
    expect(teacherWarning({ deviceCheck: null, hadLiveLesson: false })).toMatchObject({ level: 'none', title: 'Õpilane pole seadet kontrollinud' });
    expect(teacherWarning({ deviceCheck: null, hadLiveLesson: true })).toBeNull();
    expect(teacherWarning({ deviceCheck: { status: 'weird' }, hadLiveLesson: true })).toBeNull();
  });
});
