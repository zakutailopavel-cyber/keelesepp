// Camera / microphone on phones and in-app browsers: clear messages and gentler fallbacks, so a student on a phone
// can join (at least with sound) and knows what to do when the browser cannot.

const IN_APP = /(FBAN|FBAV|Instagram|Line\/|Telegram|TelegramBot|WhatsApp|Snapchat|TikTok|wv\)|; wv;)/i;

export function inAppBrowser(userAgent = globalThis.navigator?.userAgent || '') {
  return IN_APP.test(userAgent);
}

export function unsupportedMessage(userAgent) {
  if (inAppBrowser(userAgent)) {
    return 'See rakenduse sisene brauser (Telegram, Instagram, Facebook…) ei luba kaamerat ega mikrofoni. Ava link Chrome’is või Safaris: menüüst „Ava brauseris”. / Откройте ссылку в Chrome или Safari («Открыть в браузере»).';
  }
  return 'Kaamera ja mikrofoni kasutamine pole selles brauseris saadaval. Kasuta Chrome’i või Safarit. / Используйте Chrome или Safari.';
}

export function mediaErrorMessage(error, userAgent) {
  const name = error?.name || '';
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return 'Kaamera või mikrofon on keelatud. Luba need brauseri aadressiriba lukuikoonist (või telefoni seadetes) ja liitu uuesti. / Разрешите камеру и микрофон в настройках браузера.';
  }
  if (name === 'NotReadableError' || name === 'TrackStartError' || name === 'AbortError') {
    return 'Kaamerat või mikrofoni kasutab praegu teine rakendus. Sulge see (nt Zoom, Messenger) ja liitu uuesti. / Камера занята другим приложением.';
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return 'Kaamerat ega mikrofoni ei leitud. / Камера и микрофон не найдены.';
  }
  if (inAppBrowser(userAgent)) return unsupportedMessage(userAgent);
  return error?.message || 'Kaamerat ja mikrofoni ei saanud käivitada.';
}

// preferred → plain camera+mic → microphone only; returns { stream, audioOnly }
export async function openMedia(mediaDevices, preferred, userAgent) {
  if (!mediaDevices?.getUserMedia) throw new Error(unsupportedMessage(userAgent));
  const attempts = [preferred, { audio: true, video: true }, { audio: true, video: false }];
  let lastError = null;
  for (const constraints of attempts) {
    try {
      const stream = await mediaDevices.getUserMedia(constraints);
      return { stream, audioOnly: constraints.video === false };
    } catch (error) {
      lastError = error;
      // a refused permission does not change with other constraints
      if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError') break;
    }
  }
  throw new Error(mediaErrorMessage(lastError, userAgent));
}
