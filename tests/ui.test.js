import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createUI } from '../src/ui.js';
import { getTranslations } from '../src/i18n.js';
import { DEFAULT_CONFIG } from '../src/config.js';

function makeCallbacks() {
  return {
    onAcceptAll: vi.fn(),
    onRejectAll: vi.fn(),
    onSaveSettings: vi.fn(),
    onOpenSettings: vi.fn(),
    getCategories: () => DEFAULT_CONFIG.categories,
  };
}

describe('createUI', () => {
  beforeEach(() => {
    document.body.textContent = '';
    // Remove any injected styles
    document.querySelectorAll('style[data-cmp]').forEach(el => el.remove());
  });

  it('renders banner into DOM', () => {
    const ui = createUI(DEFAULT_CONFIG, getTranslations('cs'), makeCallbacks());
    ui.showBanner();
    expect(document.querySelector('.cmp-banner')).not.toBeNull();
  });

  it('shows accept all button', () => {
    const ui = createUI(DEFAULT_CONFIG, getTranslations('cs'), makeCallbacks());
    ui.showBanner();
    expect(document.querySelector('.cmp-btn-accept')).not.toBeNull();
  });

  it('shows reject all button by default', () => {
    const ui = createUI(DEFAULT_CONFIG, getTranslations('cs'), makeCallbacks());
    ui.showBanner();
    expect(document.querySelector('.cmp-btn-reject')).not.toBeNull();
  });

  it('hides reject all when config says so', () => {
    const config = {
      ...DEFAULT_CONFIG,
      buttons: { ...DEFAULT_CONFIG.buttons, rejectAll: { show: false, style: 'secondary' } },
    };
    const ui = createUI(config, getTranslations('cs'), makeCallbacks());
    ui.showBanner();
    expect(document.querySelector('.cmp-btn-reject')).toBeNull();
  });

  it('calls onAcceptAll when accept button clicked', () => {
    const cbs = makeCallbacks();
    const ui = createUI(DEFAULT_CONFIG, getTranslations('cs'), cbs);
    ui.showBanner();
    document.querySelector('.cmp-btn-accept').click();
    expect(cbs.onAcceptAll).toHaveBeenCalled();
  });

  it('calls onRejectAll when reject button clicked', () => {
    const cbs = makeCallbacks();
    const ui = createUI(DEFAULT_CONFIG, getTranslations('cs'), cbs);
    ui.showBanner();
    document.querySelector('.cmp-btn-reject').click();
    expect(cbs.onRejectAll).toHaveBeenCalled();
  });

  it('removes banner on destroy', () => {
    const ui = createUI(DEFAULT_CONFIG, getTranslations('cs'), makeCallbacks());
    ui.showBanner();
    ui.destroy();
    expect(document.querySelector('.cmp-banner')).toBeNull();
    expect(document.querySelector('.cmp-overlay')).toBeNull();
  });

  it('renders modal with toggles when showModal called', () => {
    const ui = createUI(DEFAULT_CONFIG, getTranslations('cs'), makeCallbacks());
    ui.showModal();
    expect(document.querySelector('.cmp-modal')).not.toBeNull();
    // 2 toggles: analytics + marketing (necessary has no toggle)
    expect(document.querySelectorAll('.cmp-toggle').length).toBe(2);
  });

  it('necessary category shows always active label, no toggle', () => {
    const ui = createUI(DEFAULT_CONFIG, getTranslations('cs'), makeCallbacks());
    ui.showModal();
    const necessarySection = document.querySelector('.cmp-category--necessary');
    expect(necessarySection).not.toBeNull();
    expect(necessarySection.querySelector('.cmp-toggle')).toBeNull();
  });

  it('calls onSaveSettings with toggle states when save clicked', () => {
    const cbs = makeCallbacks();
    const ui = createUI(DEFAULT_CONFIG, getTranslations('cs'), cbs);
    ui.showModal();
    // Click save without changing toggles (both should be off by default)
    document.querySelector('.cmp-btn-save').click();
    expect(cbs.onSaveSettings).toHaveBeenCalledWith({ analytics: false, marketing: false });
  });

  it('renders wall mode with blurred overlay and card', () => {
    const config = { ...DEFAULT_CONFIG, display: { mode: 'wall', position: 'bottom' } };
    const ui = createUI(config, getTranslations('cs'), makeCallbacks());
    ui.showBanner();
    expect(document.querySelector('.cmp-overlay--wall')).not.toBeNull();
    expect(document.querySelector('.cmp-modal--banner')).not.toBeNull();
    expect(document.querySelector('.cmp-btn-accept')).not.toBeNull();
  });

  it('renders modal mode as overlay with banner content card', () => {
    const config = { ...DEFAULT_CONFIG, display: { mode: 'modal', position: 'bottom' } };
    const ui = createUI(config, getTranslations('cs'), makeCallbacks());
    ui.showBanner();
    expect(document.querySelector('.cmp-overlay')).not.toBeNull();
    expect(document.querySelector('.cmp-modal--banner')).not.toBeNull();
    expect(document.querySelector('.cmp-btn-accept')).not.toBeNull();
    // Should NOT show toggles — that's the settings modal
    expect(document.querySelector('.cmp-toggle')).toBeNull();
  });

  it('shows settings button that calls onOpenSettings', () => {
    const cbs = makeCallbacks();
    const ui = createUI(DEFAULT_CONFIG, getTranslations('cs'), cbs);
    ui.showBanner();
    const settingsBtn = document.querySelector('.cmp-btn-settings');
    expect(settingsBtn).not.toBeNull();
    settingsBtn.click();
    expect(cbs.onOpenSettings).toHaveBeenCalled();
  });

  it('shows privacy policy link when URL is provided', () => {
    const config = { ...DEFAULT_CONFIG, privacyPolicyUrl: '/privacy' };
    const ui = createUI(config, getTranslations('cs'), makeCallbacks());
    ui.showBanner();
    const link = document.querySelector('.cmp-privacy-link');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('/privacy');
  });

  it('applies position class to banner', () => {
    const config = { ...DEFAULT_CONFIG, display: { mode: 'banner', position: 'top' } };
    const ui = createUI(config, getTranslations('cs'), makeCallbacks());
    ui.showBanner();
    expect(document.querySelector('.cmp-banner--top')).not.toBeNull();
  });
});
