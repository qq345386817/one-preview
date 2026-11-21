// Keep the shortcut local to a focused document. Radio controls retain their native keys.
const paper = document.querySelector('.sample-paper');
if (paper) {
  paper.setAttribute('aria-keyshortcuts', 'Space');
  paper.setAttribute('aria-description', paper.dataset.keyHint);
  paper.addEventListener('keydown', event => {
    if (event.key !== ' ' || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    event.preventDefault();
    if (event.repeat) return;
    const next = paper.closest('.sample-desk').querySelector('input[name="mode"]:not(:checked)');
    next.click();
  });
}
