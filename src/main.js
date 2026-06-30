import { resolveConfig, deepMerge } from './config.js';
import { createConsentManager } from './consent.js';
import { detectLanguage, getTranslations } from './i18n.js';
import { createUI, createReopenButton } from './ui.js';
import { bindDataAttributes } from './events.js';
import { trackConsentEvent, trackBannerShown } from './analytics.js';

// Simple event emitter for open/close events
const mainListeners = {};
function emitMain(event, data) {
  if (mainListeners[event]) {
    mainListeners[event].forEach(cb => cb(data));
  }
}

// Resolve config
const config = resolveConfig();
const lang = detectLanguage(config.lang);
const t = config.texts ? deepMerge(getTranslations(lang), config.texts) : getTranslations(lang);

// Create consent manager
const consent = createConsentManager(config);
consent.init();

// UI state
let ui = null;
let reopenBtn = null;

function setReopenVisible(visible) {
  if (reopenBtn) reopenBtn.style.display = visible ? '' : 'none';
}

function mountReopenButton() {
  if (!config.reopenButton.show || reopenBtn) return;
  reopenBtn = createReopenButton(config, t, openSettings);
  document.body.appendChild(reopenBtn);
}

// Close any open UI and bring the reopen button back.
function closeUI() {
  if (ui) { ui.destroy(); ui = null; }
  setReopenVisible(true);
}

// Shared callbacks for banner + settings modal.
const uiCallbacks = {
  onAcceptAll() {
    consent.acceptAll();
    trackConsentEvent(config, consent.getConsent(), 'accept_all');
    closeUI();
  },
  onRejectAll() {
    consent.rejectAll();
    trackConsentEvent(config, consent.getConsent(), 'reject_all');
    closeUI();
  },
  onSaveSettings(categories) {
    consent.updateConsent(categories);
    trackConsentEvent(config, consent.getConsent(), 'custom');
    closeUI();
  },
  onOpenSettings() {
    if (ui) ui.showModal();
  },
  getCategories() {
    return config.categories;
  },
  getCurrentConsent() {
    return consent.getConsent();
  },
};

function showBanner() {
  if (ui) ui.destroy();
  ui = createUI(config, t, uiCallbacks);
  ui.showBanner();
  trackBannerShown(config, consent.getId());
  setReopenVisible(false);
}

// Open settings modal (reuses existing UI or creates fresh one)
function openSettings() {
  if (!ui) ui = createUI(config, t, uiCallbacks);
  ui.showModal();
  setReopenVisible(false);
}

// Mount the persistent reopen button (if enabled), then show banner if needed.
mountReopenButton();
if (consent.needsBanner()) {
  showBanner();
}

// Bind data attributes
bindDataAttributes({
  open() {
    openSettings();
  },
  acceptAll() {
    consent.acceptAll();
    closeUI();
  },
  rejectAll() {
    consent.rejectAll();
    closeUI();
  },
});

// Expose public API
window.CMP = {
  open() { openSettings(); emitMain('open'); },
  close() { closeUI(); emitMain('close'); },
  acceptAll() { consent.acceptAll(); closeUI(); },
  rejectAll() { consent.rejectAll(); closeUI(); },
  getConsent() { return consent.getConsent(); },
  getId() { return consent.getId(); },
  hasConsent() { return consent.hasConsent(); },
  reset() { consent.reset(); showBanner(); },
  on(event, cb) {
    if (event === 'open' || event === 'close') {
      if (!mainListeners[event]) mainListeners[event] = [];
      mainListeners[event].push(cb);
    } else {
      consent.on(event, cb);
    }
  },
};
