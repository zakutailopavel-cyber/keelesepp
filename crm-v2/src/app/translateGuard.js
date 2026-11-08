// The browser's page translation (Chrome „Tõlgi lehte”, Safari, Edge) swaps the text nodes React rendered for its own
// <font> wrappers. When React later removes or moves such a text node, the node is no longer where React left it and
// the DOM throws („Failed to execute 'removeChild' on 'Node'” / Safari „The object can not be found here”, clientErrors
// 2026-11: /student, /homework) — the page falls to the error boundary in the middle of a lesson. Our learners do
// translate the Estonian screens into Russian, so translation stays allowed: a removal of a node that has already left
// its parent is a no-op, and an insertion before such a node goes to the end of the parent (the known React workaround,
// facebook/react#11538). Every other DOM call is untouched.
export function installTranslateGuard(NodeClass = globalThis.Node) {
  if (!NodeClass?.prototype || NodeClass.prototype.removeChild.__translateGuard) return false;
  const { removeChild, insertBefore } = NodeClass.prototype;
  const guardedRemove = function guardedRemove(child) {
    if (child && child.parentNode !== this) return child;
    return removeChild.call(this, child);
  };
  const guardedInsert = function guardedInsert(node, reference) {
    if (reference && reference.parentNode !== this) return insertBefore.call(this, node, null);
    return insertBefore.call(this, node, reference);
  };
  guardedRemove.__translateGuard = true;
  NodeClass.prototype.removeChild = guardedRemove;
  NodeClass.prototype.insertBefore = guardedInsert;
  return true;
}
