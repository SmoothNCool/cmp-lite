export function bindDataAttributes(actions) {
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-cmp-open], [data-cmp-accept-all], [data-cmp-reject-all]');
    if (!el) return;
    e.preventDefault();
    if (el.hasAttribute('data-cmp-open')) actions.open();
    if (el.hasAttribute('data-cmp-accept-all')) actions.acceptAll();
    if (el.hasAttribute('data-cmp-reject-all')) actions.rejectAll();
  });
}
