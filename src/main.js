import { resolveConfig } from './config.js';
import { createConsentManager } from './consent.js';
import { detectLanguage, getTranslations } from './i18n.js';
import { createUI } from './ui.js';
import { bindDataAttributes } from './events.js';
import { trackConsentEvent } from './analytics.js';

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
  });
  ui.showBanner();
}

// Show banner if needed
if (consent.needsBanner()) {
  showBanner();
}

// Bind data attributes
bindDataAttributes({
  open() {
    showBanner();
    if (ui) ui.showModal();
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
  open() { showBanner(); if (ui) ui.showModal(); },
  close() { if (ui) { ui.destroy(); ui = null; } },
  acceptAll() { consent.acceptAll(); if (ui) { ui.destroy(); ui = null; } },
  rejectAll() { consent.rejectAll(); if (ui) { ui.destroy(); ui = null; } },
  getConsent() { return consent.getConsent(); },
  hasConsent() { return consent.hasConsent(); },
  reset() { consent.reset(); showBanner(); },
  on(event, cb) { consent.on(event, cb); },
};
