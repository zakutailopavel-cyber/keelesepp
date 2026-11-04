// „Seadme kontroll” (/kontroll): pure helpers — browser detection, capability flags and the evaluation that turns
// them into green / yellow / red with plain fixes. No DOM access here except in `readCapabilities`, which takes the
// globals as arguments (tests pass fakes).
import { inAppBrowser } from '../live-classroom/mobileMedia.js';

// the same order as the lesson recorder (lesson-recording/RoomRecorder.jsx) and the voice answers
export const RECORDER_TYPES = Object.freeze(['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']);

const BROWSER_NAMES = { chrome: 'Chrome', safari: 'Safari', firefox: 'Firefox', edge: 'Edge', opera: 'Opera', samsung: 'Samsung Internet', other: 'Tundmatu brauser' };

/**
 * Which browser and device. iPadOS 13+ says „Macintosh” in the user agent; a touch screen tells it apart from a Mac.
 * @returns {{ name: string, label: string, version: number, ios: boolean, ipad: boolean, android: boolean, mobile: boolean, inApp: boolean, iosVersion: number }}
 */
export function detectBrowser(userAgent = '', { maxTouchPoints = 0 } = {}) {
  const ua = String(userAgent || '');
  const ipad = /iPad/.test(ua) || (/Macintosh/.test(ua) && Number(maxTouchPoints) > 1);
  const iphone = /iPhone|iPod/.test(ua);
  const ios = ipad || iphone;
  const android = /Android/i.test(ua);
  const pick = (re) => { const match = re.exec(ua); return match ? Number(match[1]) || 0 : 0; };
  let name = 'other';
  let version = 0;
  if (/Edg(e|A|iOS)?\//.test(ua)) { name = 'edge'; version = pick(/Edg(?:e|A|iOS)?\/(\d+)/); }
  else if (/SamsungBrowser\//.test(ua)) { name = 'samsung'; version = pick(/SamsungBrowser\/(\d+)/); }
  else if (/OPR\//.test(ua)) { name = 'opera'; version = pick(/OPR\/(\d+)/); }
  else if (/CriOS\//.test(ua)) { name = 'chrome'; version = pick(/CriOS\/(\d+)/); }
  else if (/FxiOS\//.test(ua)) { name = 'firefox'; version = pick(/FxiOS\/(\d+)/); }
  else if (/Firefox\//.test(ua)) { name = 'firefox'; version = pick(/Firefox\/(\d+)/); }
  else if (/Chrome\//.test(ua)) { name = 'chrome'; version = pick(/Chrome\/(\d+)/); }
  else if (/Safari\//.test(ua) && /Version\//.test(ua)) { name = 'safari'; version = pick(/Version\/(\d+)/); }
  let iosVersion = 0;
  if (ios) {
    const os = /OS (\d+)[_.](\d+)/.exec(ua);
    const safari = /Version\/(\d+)\.(\d+)/.exec(ua);
    const found = os || safari;
    iosVersion = found ? Number(found[1]) + Number(found[2]) / 100 : 0;
  }
  return { name, label: BROWSER_NAMES[name], version, ios, ipad, android, mobile: ios || android || /Mobile/.test(ua), inApp: inAppBrowser(ua), iosVersion };
}

/** First audio type the recorder can write (as RoomRecorder picks it), '' when none or no MediaRecorder. */
export function recorderType(MediaRecorderImpl) {
  if (typeof MediaRecorderImpl !== 'function') return '';
  return RECORDER_TYPES.find((type) => { try { return MediaRecorderImpl.isTypeSupported?.(type); } catch { return false; } }) || '';
}

/** What the browser offers, read from the globals once. Every argument is injectable for tests. */
export function readCapabilities(env = globalThis) {
  const nav = env.navigator || {};
  const media = nav.mediaDevices || null;
  const browser = detectBrowser(nav.userAgent || '', { maxTouchPoints: nav.maxTouchPoints || 0 });
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection || null;
  return {
    browser,
    secure: env.isSecureContext !== false,
    webrtc: typeof env.RTCPeerConnection === 'function',
    getUserMedia: typeof media?.getUserMedia === 'function',
    enumerateDevices: typeof media?.enumerateDevices === 'function',
    displayMedia: typeof media?.getDisplayMedia === 'function',
    audioContext: typeof (env.AudioContext || env.webkitAudioContext) === 'function',
    mediaRecorder: typeof env.MediaRecorder === 'function',
    recorderMime: recorderType(env.MediaRecorder),
    online: nav.onLine !== false,
    connection: connection ? { effectiveType: String(connection.effectiveType || ''), downlink: Number(connection.downlink) || 0, rtt: Number(connection.rtt) || 0, type: String(connection.type || ''), saveData: Boolean(connection.saveData) } : null,
  };
}

/** getUserMedia error → 'denied' | 'busy' | 'notfound' | 'error' */
export function mediaErrorKind(error) {
  const name = error?.name || '';
  if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') return 'denied';
  if (name === 'NotReadableError' || name === 'TrackStartError' || name === 'AbortError') return 'busy';
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError' || name === 'OverconstrainedError') return 'notfound';
  return 'error';
}

/** RMS of 8-bit time-domain samples (AnalyserNode.getByteTimeDomainData), 0…1. */
export function rmsFromBytes(samples) {
  if (!samples?.length) return 0;
  let sum = 0;
  for (let index = 0; index < samples.length; index += 1) { const value = (samples[index] - 128) / 128; sum += value * value; }
  return Math.sqrt(sum / samples.length);
}

// speech near a laptop microphone is ~0.05–0.2 RMS; the bar is full at 0.25
export const HEARD_RMS = 0.04;
export const meterPercent = (rms) => Math.max(0, Math.min(100, Math.round((Number(rms) || 0) / 0.25 * 100)));

/** ICE candidates → counts per type. Accepts RTCIceCandidate-like objects or candidate strings. */
export function classifyCandidates(candidates = []) {
  const counts = { host: 0, srflx: 0, prflx: 0, relay: 0 };
  for (const item of candidates) {
    const text = typeof item === 'string' ? item : item?.candidate || '';
    const type = (typeof item === 'object' && item?.type) || / typ (\w+)/.exec(text)?.[1] || '';
    if (type in counts) counts[type] += 1;
  }
  return counts;
}

const issue = (key, level, title, fix, ru) => ({ key, level, title, fix, ru });

/**
 * Capability flags + test results → overall status and the fixes to show.
 * flags: readCapabilities() fields plus
 *   camera, mic: 'untested' | 'ok' | 'denied' | 'busy' | 'notfound' | 'error'
 *   micHeard, speakersHeard: null (not tested) | true | false
 *   network: { hostingOk, hostingMs, functionsOk, functionsMs, stun: null|bool, relay: 'untested'|'ok'|'none'|'unavailable' } | null
 *   role: 'student' | 'teacher'
 * @returns {{ status: 'green'|'yellow'|'red', complete: boolean, issues: Array<{key, level: 'red'|'yellow'|'info', title, fix, ru}> }}
 */
export function evaluateDeviceCheck(flags = {}) {
  const issues = [];
  const browser = flags.browser || detectBrowser('');
  const teacher = flags.role === 'teacher';
  const cameraLabel = browser.ios ? 'Seaded → Safari → Kaamera ja Mikrofon → Luba' : 'aadressiriba lukuikoon → Kaamera / Mikrofon → Luba';

  // 1. browser
  if (browser.inApp) issues.push(issue('in-app', 'red', 'Leht on avatud rakenduse sees (Instagram, Facebook, Telegram…).', 'Ava link Chrome’is või Safaris: menüü „…” → „Ava brauseris”.', 'Откройте ссылку в Chrome или Safari: меню «…» → «Открыть в браузере».'));
  if (flags.secure === false) issues.push(issue('insecure', 'red', 'Leht ei ole turvaline (http).', 'Ava leht aadressilt https://crm.epkoolitus.ee.', 'Откройте страницу по адресу https://crm.epkoolitus.ee.'));
  if (browser.ios && browser.iosVersion && browser.iosVersion < 14.3) issues.push(issue('ios-old', 'red', `iOS ${browser.iosVersion.toFixed(1)} on liiga vana videotunniks.`, 'Uuenda iPadi / iPhone’i tarkvara (Seaded → Üldine → Tarkvarauuendus).', 'Обновите iOS: Настройки → Основные → Обновление ПО.'));
  if (!flags.webrtc || !flags.getUserMedia) {
    if (!browser.inApp) issues.push(issue('no-webrtc', 'red', 'See brauser ei toeta videotundi.', 'Kasuta Chrome’i või Safarit (uusim versioon).', 'Используйте Chrome или Safari (последнюю версию).'));
  } else if (browser.name === 'samsung' || browser.name === 'other') {
    issues.push(issue('browser-other', 'yellow', `${browser.label}: videotund võib töötada, kuid seda pole kontrollitud.`, 'Kindlam on Chrome või Safari.', 'Надёжнее Chrome или Safari.'));
  }

  // 2. camera and microphone
  const mic = flags.mic || 'untested';
  const camera = flags.camera || 'untested';
  if (mic === 'denied') issues.push(issue('mic-denied', 'red', 'Mikrofon on keelatud.', `Luba mikrofon brauseri seadetes (${cameraLabel}) ja vajuta „Kontrolli uuesti”.`, 'Разрешите микрофон в настройках браузера.'));
  else if (mic === 'busy') issues.push(issue('mic-busy', 'red', 'Mikrofoni kasutab teine rakendus.', 'Sulge teised rakendused, mis kasutavad mikrofoni (Zoom, Teams, Messenger, WhatsApp).', 'Закройте другие приложения, которые используют микрофон.'));
  else if (mic === 'notfound') issues.push(issue('mic-missing', 'red', 'Mikrofoni ei leitud.', 'Ühenda kõrvaklapid mikrofoniga või vali teine mikrofon.', 'Подключите наушники с микрофоном.'));
  else if (mic === 'error') issues.push(issue('mic-error', 'red', 'Mikrofoni ei saanud käivitada.', 'Sulge teised rakendused, mis kasutavad mikrofoni, ja vajuta „Kontrolli uuesti”.', 'Закройте другие приложения и проверьте ещё раз.'));
  else if (mic === 'ok' && flags.micHeard === false) issues.push(issue('mic-silent', 'yellow', 'Mikrofon ei kuulnud sind.', 'Vali teine mikrofon või vaata, kas see on vaigistatud (klahv või kõrvaklappide nupp).', 'Микрофон вас не слышит: выберите другой или проверьте, не выключен ли он.'));

  if (camera === 'denied' && mic !== 'denied') issues.push(issue('camera-denied', 'red', 'Kaamera on keelatud.', `Luba kaamera brauseri seadetes (${cameraLabel}).`, 'Разрешите камеру в настройках браузера.'));
  else if (camera === 'denied') issues.push(issue('camera-denied', 'red', 'Kaamera on keelatud.', 'Luba ka kaamera samas kohas.', 'Разрешите и камеру.'));
  else if (camera === 'busy') issues.push(issue('camera-busy', 'red', 'Kaamerat kasutab teine rakendus.', 'Sulge teised rakendused, mis kasutavad kaamerat (Zoom, Teams, Messenger, FaceTime).', 'Закройте другие приложения, которые используют камеру.'));
  else if (camera === 'notfound') issues.push(issue('camera-missing', 'yellow', 'Kaamerat ei leitud.', 'Tund toimub ka ainult heliga. Kui tahad videot, ühenda kaamera.', 'Камера не найдена: урок может идти только со звуком.'));
  else if (camera === 'error') issues.push(issue('camera-error', 'yellow', 'Kaamerat ei saanud käivitada.', 'Sulge teised rakendused, mis kasutavad kaamerat, ja proovi uuesti.', 'Закройте другие приложения с камерой и попробуйте снова.'));

  if (flags.speakersHeard === false) issues.push(issue('speakers', 'yellow', 'Heli ei olnud kuulda.', 'Keera heli valjemaks, lülita vaikne režiim välja või ühenda kõrvaklapid.', 'Сделайте звук громче или подключите наушники.'));

  if (!flags.audioContext && flags.webrtc) issues.push(issue('no-audio-context', 'yellow', 'Brauser ei luba heli mõõta.', 'Uuenda brauserit (Chrome või Safari).', 'Обновите браузер.'));
  if (!flags.mediaRecorder || !flags.recorderMime) {
    issues.push(teacher
      ? issue('no-recorder', 'yellow', 'Selles brauseris ei saa tundi salvestada.', 'Tunni salvestamiseks kasuta arvutis Chrome’i.', 'Для записи урока используйте Chrome на компьютере.')
      : issue('no-recorder', 'yellow', 'Selles brauseris ei saa häält salvestada (häälvastused).', 'Uuenda brauserit või kasuta Chrome’i / Safarit.', 'Голосовые ответы не записываются: обновите браузер.'));
  }

  // 4. network
  const net = flags.network || null;
  if (flags.online === false) issues.push(issue('offline', 'red', 'Internet puudub.', 'Ühenda WiFi või mobiilne internet.', 'Нет интернета: подключите Wi-Fi или мобильный интернет.'));
  else if (net) {
    if (net.hostingOk === false) issues.push(issue('hosting', 'red', 'KeeleSepa server ei vasta.', 'Kontrolli internetti või proovi teist võrku.', 'Сервер KeeleSepp не отвечает: проверьте интернет.'));
    else if (net.hostingMs > 1500) issues.push(issue('slow', 'yellow', `Ühendus on aeglane (${Math.round(net.hostingMs)} ms).`, 'Mine WiFi-ruuterile lähemale või sulge teised videod / allalaadimised.', 'Связь медленная: подойдите ближе к роутеру.'));
    const stunOk = net.stun === true;
    const relayOk = net.relay === 'ok';
    if (net.stun === false && net.relay === 'none') issues.push(issue('ice-blocked', 'red', 'Võrk blokeerib videokõne.', 'Proovi teist võrku (nt telefoni internet) või palu IT-l lubada videokõned.', 'Сеть блокирует видеозвонок: попробуйте другую сеть.'));
    else if (net.stun === false && !relayOk) issues.push(issue('stun', 'yellow', 'Otseühendus pole selles võrgus võimalik.', 'Kõne läheb vahendusserveri kaudu. Kui tund ei ühendu, proovi teist võrku (nt telefoni internet).', 'Прямое соединение невозможно: если урок не подключится, попробуйте другую сеть.'));
    else if (net.relay === 'none' && stunOk) issues.push(issue('relay', 'yellow', 'Vahendusserver ei vastanud.', 'Enamasti see ei sega. Kui tund ei ühendu, proovi teist võrku.', 'Резервный сервер не ответил: обычно это не мешает.'));
    if (net.functionsOk === false) issues.push(issue('functions', 'yellow', 'Tunni abiserver ei vastanud.', 'Kontrolli internetti; kui see jääb nii, kirjuta õpetajale.', 'Вспомогательный сервер не ответил: сообщите учителю, если так останется.'));
  }
  const slowType = flags.connection?.effectiveType;
  if (flags.online !== false && (slowType === 'slow-2g' || slowType === '2g')) issues.push(issue('2g', 'red', 'Mobiilne ühendus on video jaoks liiga aeglane.', 'Kasuta WiFi-t või mine kohta, kus on parem levi.', 'Слишком медленная связь: используйте Wi-Fi.'));
  else if (flags.online !== false && slowType === '3g') issues.push(issue('3g', 'yellow', 'Ühendus on aeglane (3G).', 'Video võib hakkida; parem on WiFi.', 'Медленная связь (3G): лучше Wi-Fi.'));

  // 5. screen sharing
  if (!flags.displayMedia) {
    if (browser.ios) issues.push(issue('screen-ios', teacher ? 'yellow' : 'info', 'iPadis ja iPhone’is ei saa ekraani jagada.', teacher ? 'See on Apple’i piirang. Ekraani jagamiseks kasuta arvutit.' : 'See on Apple’i piirang. Tunnis see ei sega: õpetaja näitab materjale tahvlil.', 'На iPad и iPhone нельзя показывать экран — это ограничение Apple. На уроке это не мешает.'));
    else if (browser.android || browser.mobile) issues.push(issue('screen-mobile', teacher ? 'yellow' : 'info', 'Telefonis ei saa ekraani jagada.', teacher ? 'Ekraani jagamiseks kasuta arvutit.' : 'Tunnis see ei sega.', 'С телефона нельзя показать экран; на уроке это не мешает.'));
    else issues.push(issue('screen', teacher ? 'yellow' : 'info', 'Selles brauseris ei saa ekraani jagada.', 'Ekraani jagamiseks kasuta Chrome’i, Edge’i, Firefoxi või Safarit arvutis.', 'Для показа экрана используйте Chrome или Safari на компьютере.'));
  }

  const complete = mic !== 'untested' && camera !== 'untested' && flags.micHeard != null && flags.speakersHeard != null && Boolean(net);
  const status = issues.some((item) => item.level === 'red') ? 'red' : issues.some((item) => item.level === 'yellow') ? 'yellow' : 'green';
  return { status, complete, issues };
}

export const STATUS_TEXT = {
  green: { title: 'Kõik on korras', ru: 'Всё в порядке' },
  yellow: { title: 'Tund toimub, aga vaata märkusi', ru: 'Урок пройдёт, но посмотрите замечания' },
  red: { title: 'Enne tundi on vaja midagi parandada', ru: 'Перед уроком нужно кое-что исправить' },
};
