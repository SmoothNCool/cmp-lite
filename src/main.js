import { resolveConfig } from './config.js';
import { createConsentManager } from './consent.js';
import { detectLanguage, getTranslations } from './i18n.js';
import { createUI } from './ui.js';
import { bindDataAttributes } from './events.js';
import { trackConsentEvent } from './analytics.js';

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
const t = getTranslations(lang);

// Create consent manager
const consent = createConsentManager(config);
consent.init();

// UI state
let ui = null;

function showBanner() {
  if (ui) ui.destroy();
  ui = createUI(config, t, {
    onAcceptAll() {
      consent.acceptAll();
      trackConsentEvent(config, consent.getConsent(), 'accept_all');
      if (ui) { ui.destroy(); ui = null; }
    },
    onRejectAll() {
      consent.rejectAll();
      trackConsentEvent(config, consent.getConsent(), 'reject_all');
      if (ui) { ui.destroy(); ui = null; }
    },
    onSaveSettings(categories) {
      consent.updateConsent(categories);
      trackConsentEvent(config, consent.getConsent(), 'custom');
      if (ui) { ui.destroy(); ui = null; }
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
  });
  ui.showBanner();
}

// Show banner if needed
if (consent.needsBanner()) {
  showBanner();
}

// Open settings modal (reuses existing UI or creates fresh one)
function openSettings() {
  if (!ui) {
    ui = createUI(config, t, {
      onAcceptAll() {
        consent.acceptAll();
        trackConsentEvent(config, consent.getConsent(), 'accept_all');
        if (ui) { ui.destroy(); ui = null; }
      },
      onRejectAll() {
        consent.rejectAll();
        trackConsentEvent(config, consent.getConsent(), 'reject_all');
        if (ui) { ui.destroy(); ui = null; }
      },
      onSaveSettings(categories) {
        consent.updateConsent(categories);
        trackConsentEvent(config, consent.getConsent(), 'custom');
        if (ui) { ui.destroy(); ui = null; }
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
    });
  }
  ui.showModal();
}

// Bind data attributes
bindDataAttributes({
  open() {
    openSettings();
  },
  acceptAll() {
    consent.acceptAll();
    if (ui) { ui.destroy(); ui = null; }
  },
  rejectAll() {
    consent.rejectAll();
    if (ui) { ui.destroy(); ui = null; }
  },
});

// Expose public API
window.CMP = {
  open() { openSettings(); emitMain('open'); },
  close() { if (ui) { ui.destroy(); ui = null; } emitMain('close'); },
  acceptAll() { consent.acceptAll(); if (ui) { ui.destroy(); ui = null; } },
  rejectAll() { consent.rejectAll(); if (ui) { ui.destroy(); ui = null; } },
  getConsent() { return consent.getConsent(); },
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
