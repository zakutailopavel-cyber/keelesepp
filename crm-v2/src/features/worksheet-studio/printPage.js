// While a worksheet screen is open, the whole print job is A4 without margins, whatever the browser default
// paper or margins are (a 270 mm sheet zoomed to A4 only fits on A4 with zero margins).
// Call from an effect; returns the cleanup.
export function applyPrintA4() {
  document.body.classList.add('ws-studio-open');
  const style = document.createElement('style');
  style.dataset.wsPrint = 'a4';
  style.textContent = '@page { size: A4; margin: 0; }';
  document.head.appendChild(style);
  return () => {
    document.body.classList.remove('ws-studio-open');
    style.remove();
  };
}
