// „Teema” before the first paint: <html data-theme="light|dark|system"> from this device's last choice (app/theme.js).
// A plain file, not inline: the site's Content-Security-Policy allows only scripts from 'self'.
/* global window, document */
(function () {
  var theme = 'system';
  try {
    var saved = window.localStorage.getItem('keelesepp.theme');
    if (saved === 'light' || saved === 'dark') theme = saved;
  } catch (error) { // eslint-disable-line no-unused-vars -- a plain catch (error) runs on old browsers too
    /* storage blocked: follow the system */
  }
  document.documentElement.setAttribute('data-theme', theme);
}());
