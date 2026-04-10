/**
 * CMP Lite — UI Components
 * Builds all DOM using createElement + textContent (never innerHTML).
 */

import cssText from './styles.css?raw';

/** Inject <style data-cmp> once, applying config theme as custom properties. */
function injectStyles(config) {
  if (document.querySelector('style[data-cmp]')) return;
  const style = document.createElement('style');
  style.setAttribute('data-cmp', '');
  const s = config.style;
  const vars = `
:root {
  --cmp-primary: ${s.primaryColor};
  --cmp-primary-text: ${s.primaryTextColor};
  --cmp-secondary: ${s.secondaryColor};
  --cmp-secondary-text: ${s.secondaryTextColor};
  --cmp-bg: ${s.backgroundColor};
  --cmp-text: ${s.textColor};
  --cmp-radius: ${s.borderRadius};
  --cmp-font: ${s.fontFamily};
  --cmp-z: ${s.zIndex};
}`;
  style.textContent = vars + '\n' + cssText;
  document.head.appendChild(style);
}

/** Map button style name to CSS modifier class. */
function btnClass(styleName) {
  const map = { primary: 'cmp-btn--primary', secondary: 'cmp-btn--secondary', link: 'cmp-btn--link' };
  return map[styleName] || 'cmp-btn--primary';
}

/** Create a <button> element. */
function makeButton(text, classes, onClick) {
  const btn = document.createElement('button');
  btn.className = 'cmp-btn ' + classes;
  btn.textContent = text;
  btn.type = 'button';
  btn.addEventListener('click', onClick);
  return btn;
}

/** Build the banner/wall content fragment (title, desc, privacy link, buttons). */
function buildBannerContent(config, t, callbacks) {
  const frag = document.createDocumentFragment();

  const title = document.createElement('div');
  title.className = 'cmp-banner__title';
  title.textContent = t.banner.title;
  frag.appendChild(title);

  const desc = document.createElement('div');
  desc.className = 'cmp-banner__text';
  desc.textContent = t.banner.description;
  frag.appendChild(desc);

  if (config.privacyPolicyUrl) {
    const link = document.createElement('a');
    link.className = 'cmp-privacy-link';
    link.href = config.privacyPolicyUrl;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = t.privacyPolicy;
    frag.appendChild(link);
  }

  const actions = document.createElement('div');
  actions.className = 'cmp-banner__actions';

  const { buttons } = config;

  if (buttons.acceptAll.show) {
    actions.appendChild(
      makeButton(t.buttons.acceptAll, btnClass(buttons.acceptAll.style) + ' cmp-btn-accept', callbacks.onAcceptAll),
    );
  }

  if (buttons.rejectAll.show) {
    actions.appendChild(
      makeButton(t.buttons.rejectAll, btnClass(buttons.rejectAll.style) + ' cmp-btn-reject', callbacks.onRejectAll),
    );
  }

  if (buttons.settings.show) {
    actions.appendChild(
      makeButton(t.buttons.settings, btnClass(buttons.settings.style) + ' cmp-btn-settings', callbacks.onOpenSettings),
    );
  }

  frag.appendChild(actions);
  return frag;
}

/** Build modal element. */
function buildModal(config, t, callbacks) {
  const overlay = document.createElement('div');
  overlay.className = 'cmp-overlay';

  const modal = document.createElement('div');
  modal.className = 'cmp-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', t.modal.title);

  const heading = document.createElement('div');
  heading.className = 'cmp-modal__title';
  heading.textContent = t.modal.title;
  modal.appendChild(heading);

  // Toggles state map
  const toggles = {};

  // Necessary category (always active, no toggle)
  const necSection = document.createElement('div');
  necSection.className = 'cmp-category cmp-category--necessary';
  const necHeader = document.createElement('div');
  necHeader.className = 'cmp-category__header';
  const necTitle = document.createElement('span');
  necTitle.className = 'cmp-category__title';
  necTitle.textContent = t.categories.necessary.title;
  necHeader.appendChild(necTitle);
  const necBadge = document.createElement('span');
  necBadge.className = 'cmp-category__badge';
  necBadge.textContent = t.modal.alwaysActive;
  necHeader.appendChild(necBadge);
  necSection.appendChild(necHeader);
  const necDesc = document.createElement('div');
  necDesc.className = 'cmp-category__desc';
  necDesc.textContent = t.categories.necessary.description;
  necSection.appendChild(necDesc);
  modal.appendChild(necSection);

  // Configurable categories
  for (const key of Object.keys(config.categories)) {
    const cat = config.categories[key];
    const catT = t.categories[key];
    if (!catT) continue;

    const section = document.createElement('div');
    section.className = 'cmp-category';

    const header = document.createElement('div');
    header.className = 'cmp-category__header';

    const catTitle = document.createElement('span');
    catTitle.className = 'cmp-category__title';
    catTitle.textContent = catT.title;
    header.appendChild(catTitle);

    // Toggle switch
    const label = document.createElement('label');
    label.className = 'cmp-toggle';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    const currentConsent = callbacks.getCurrentConsent ? callbacks.getCurrentConsent() : null;
    checkbox.checked = currentConsent ? (currentConsent[key] ?? false) : (cat.default === 'granted');
    toggles[key] = checkbox;
    label.appendChild(checkbox);
    const slider = document.createElement('span');
    slider.className = 'cmp-toggle__slider';
    label.appendChild(slider);
    header.appendChild(label);

    section.appendChild(header);

    const catDesc = document.createElement('div');
    catDesc.className = 'cmp-category__desc';
    catDesc.textContent = catT.description;
    section.appendChild(catDesc);

    modal.appendChild(section);
  }

  // Modal actions
  const actions = document.createElement('div');
  actions.className = 'cmp-modal__actions';

  actions.appendChild(
    makeButton(t.buttons.saveSettings, 'cmp-btn--secondary cmp-btn-save', () => {
      const result = {};
      for (const [key, cb] of Object.entries(toggles)) {
        result[key] = cb.checked;
      }
      callbacks.onSaveSettings(result);
    }),
  );

  actions.appendChild(
    makeButton(t.buttons.acceptAll, 'cmp-btn--primary cmp-btn-accept', callbacks.onAcceptAll),
  );

  modal.appendChild(actions);

  overlay.appendChild(modal);

  // Focus trap
  setupFocusTrap(overlay, modal);

  return overlay;
}

/** Trap focus within modal for accessibility. */
function setupFocusTrap(overlay, modal) {
  overlay.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}

/**
 * Create the CMP UI controller.
 * @param {object} config - Resolved config
 * @param {object} t - Translations object
 * @param {object} callbacks - { onAcceptAll, onRejectAll, onSaveSettings, onOpenSettings, getCategories }
 * @returns {{ showBanner, showModal, destroy, closeBanner, closeModal }}
 */
export function createUI(config, t, callbacks) {
  injectStyles(config);

  let bannerEl = null;
  let overlayEl = null;

  function removeBanner() {
    if (bannerEl) {
      bannerEl.remove();
      bannerEl = null;
    }
  }

  function removeOverlay() {
    if (overlayEl) {
      overlayEl.remove();
      overlayEl = null;
    }
  }

  function showBanner() {
    removeBanner();
    removeOverlay();

    const mode = config.display.mode;
    const position = config.display.position;

    if (mode === 'modal') {
      // Show modal directly
      overlayEl = buildModal(config, t, callbacks);
      document.body.appendChild(overlayEl);
      return;
    }

    if (mode === 'wall') {
      const wall = document.createElement('div');
      wall.className = 'cmp-wall';
      const inner = document.createElement('div');
      inner.className = 'cmp-wall__inner cmp-banner__content';
      inner.appendChild(buildBannerContent(config, t, callbacks));
      wall.appendChild(inner);
      bannerEl = wall;
      document.body.appendChild(bannerEl);
      return;
    }

    // Default: banner mode
    const banner = document.createElement('div');
    banner.className = 'cmp-banner cmp-banner--' + position;
    const content = document.createElement('div');
    content.className = 'cmp-banner__content';
    content.appendChild(buildBannerContent(config, t, callbacks));
    banner.appendChild(content);
    bannerEl = banner;
    document.body.appendChild(bannerEl);
  }

  function showModal() {
    removeOverlay();
    overlayEl = buildModal(config, t, callbacks);
    document.body.appendChild(overlayEl);
  }

  function closeBanner() {
    removeBanner();
  }

  function closeModal() {
    removeOverlay();
  }

  function destroy() {
    removeBanner();
    removeOverlay();
  }

  return { showBanner, showModal, destroy, closeBanner, closeModal };
}
