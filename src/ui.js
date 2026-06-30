/**
 * CMP Lite — UI Components
 * Builds all DOM using createElement + textContent (never innerHTML).
 */

import cssText from './styles.css';

// Built-in cookie icon (transparent, tints via currentColor). Cleaned from the brand artwork.
const COOKIE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="1060 1060 1880 1880"><path d="M1970.602 2930.656c-123.754 0-243.821-24.244-356.866-72.057-109.174-46.177-207.217-112.278-291.404-196.466-84.189-84.188-150.289-182.23-196.466-291.404-47.813-113.044-72.057-233.111-72.057-356.866 0-232.256 87.011-453.816 245.004-623.865 157.149-169.142 370.01-272.168 599.372-290.099a27.14 27.14 0 0 1 22.318 8.945 27.13 27.13 0 0 1 6.442 23.165c-1.421 7.47-2.141 15.024-2.141 22.454 0 65.808 53.538 119.346 119.346 119.346 19.86 0 38.761-4.723 56.178-14.039a27.126 27.126 0 0 1 39.897 22.88c3.739 97.691 80.129 175.706 177.687 181.469a27.12 27.12 0 0 1 24.049 35.901c-6.801 19.77-10.25 40.488-10.25 61.579 0 104.325 84.875 189.2 189.2 189.2 37.158 0 73.127-10.771 104.018-31.149a27.123 27.123 0 0 1 41.59 17.612c11.132 58.985 62.841 101.796 122.953 101.796 16.045 0 31.72-3.027 46.588-8.995a27.123 27.123 0 0 1 36.8 20.365c9.646 53.592 14.537 108.579 14.537 163.434 0 123.755-24.244 243.822-72.057 356.866-46.177 109.174-112.277 207.217-196.466 291.404-84.188 84.188-182.23 150.289-291.405 196.466-113.046 47.815-233.113 72.058-356.867 72.058m-100.027-1773.584c-430.127 49.851-762.518 420.141-762.518 856.792 0 475.609 386.936 862.545 862.545 862.545s862.545-386.936 862.545-862.545c0-41.495-2.971-83.058-8.847-123.953a179 179 0 0 1-34.83 3.397c-73.735 0-138.656-44.961-165.857-110.938-31.99 14.911-66.921 22.679-102.702 22.679-134.238 0-243.448-109.211-243.448-243.448 0-16.035 1.553-31.91 4.635-47.474-47.886-9.414-91.997-33.085-126.648-68.422-33.663-34.328-56.137-77.376-65.158-123.896a174 174 0 0 1-46.142 6.249c-94.85 0-172.176-76.463-173.575-170.986"/><circle cx="1531.869" cy="1511.634" r="73.027" transform="rotate(-76.714 1531.967 1511.644)"/><circle cx="1498.288" cy="2366.109" r="157.977" transform="rotate(-45 1498.288 2366.109)"/><circle cx="2047.754" cy="2656.703" r="91.529"/><circle cx="1876.342" cy="1669.257" r="133.406" transform="rotate(-45 1876.342 1669.257)"/><circle cx="2595.255" cy="1490.988" r="154.052" transform="rotate(-45 2595.254 1490.988)"/><circle cx="2540.776" cy="2296.595" r="134.984"/><circle cx="2239.431" cy="2015.237" r="81.274"/><circle cx="1859.09" cy="2161.611" r="91.018"/><ellipse cx="2298.198" cy="1284.385" rx="52.552" ry="52.551" transform="rotate(-80.782 2298.23 1284.379)"/><circle cx="2513.274" cy="1169.381" r="100.038" transform="rotate(-45 2513.274 1169.381)"/><circle cx="2872.429" cy="1410.698" r="73.762"/><circle cx="2749.306" cy="1234.635" r="49.749"/><circle cx="1415.55" cy="1861.855" r="62.064"/></svg>';

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

/** Build banner content fragment (title, desc, privacy link, buttons). */
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
      makeButton(buttons.acceptAll.text || t.buttons.acceptAll, btnClass(buttons.acceptAll.style) + ' cmp-btn-accept', callbacks.onAcceptAll),
    );
  }

  if (buttons.settings.show) {
    actions.appendChild(
      makeButton(buttons.settings.text || t.buttons.settings, btnClass(buttons.settings.style) + ' cmp-btn-settings', callbacks.onOpenSettings),
    );
  }

  if (buttons.rejectAll.show) {
    actions.appendChild(
      makeButton(buttons.rejectAll.text || t.buttons.rejectAll, btnClass(buttons.rejectAll.style) + ' cmp-btn-reject', callbacks.onRejectAll),
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
    makeButton(config.buttons.acceptAll.text || t.buttons.acceptAll, 'cmp-btn--primary cmp-btn-accept', callbacks.onAcceptAll),
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

/** Parse trusted SVG markup into a DOM node (DOMParser does not execute scripts). */
function parseSvg(markup) {
  const doc = new DOMParser().parseFromString(markup, 'image/svg+xml');
  return doc.documentElement;
}

/** Render an icon into the reopen button: built-in svg, inline svg, image url, or emoji/text. */
function renderIcon(el, icon) {
  if (!icon) {
    el.appendChild(parseSvg(COOKIE_ICON)); // built-in
    return;
  }
  const s = String(icon).trim();
  if (s.startsWith('<svg')) {
    el.appendChild(parseSvg(s)); // site-owner config, parsed (not innerHTML)
  } else if (/^(https?:|\/|\.)/.test(s) || /\.svg$/i.test(s)) {
    const img = document.createElement('img');
    img.src = s;
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    el.appendChild(img);
  } else {
    el.textContent = s; // emoji / short text
  }
}

/** Create the floating button that re-opens the consent settings. */
export function createReopenButton(config, t, onClick) {
  injectStyles(config);
  const rb = config.reopenButton;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'cmp-reopen cmp-reopen--' + (rb.position || 'bottom-left');
  btn.setAttribute('aria-label', rb.ariaLabel || t.modal.title);
  renderIcon(btn, rb.icon);
  btn.addEventListener('click', onClick);
  return btn;
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
      // Overlay + centered card with banner content
      const overlay = document.createElement('div');
      overlay.className = config.display.overlayBlur ? 'cmp-overlay cmp-overlay--blur' : 'cmp-overlay';
      overlay.style.background = config.display.overlayColor || 'rgba(0, 0, 0, 0.5)';
      const card = document.createElement('div');
      card.className = 'cmp-modal cmp-modal--banner';
      card.setAttribute('role', 'dialog');
      card.setAttribute('aria-modal', 'true');
      card.setAttribute('aria-label', t.banner.title);
      const content = document.createElement('div');
      content.className = 'cmp-banner__content';
      content.appendChild(buildBannerContent(config, t, callbacks));
      card.appendChild(content);
      overlay.appendChild(card);
      setupFocusTrap(overlay, card);
      overlayEl = overlay;
      document.body.appendChild(overlayEl);
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
    // Apply overlay config
    overlayEl.style.background = config.display.overlayColor || 'rgba(0, 0, 0, 0.5)';
    if (config.display.overlayBlur) {
      overlayEl.classList.add('cmp-overlay--blur');
    }
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
