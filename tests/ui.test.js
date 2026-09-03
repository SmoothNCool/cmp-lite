import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { createUI, createReopenButton } from '../src/ui.js';
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

  it('applies custom overlay color and blur', () => {
    const config = {
      ...DEFAULT_CONFIG,
      display: { mode: 'modal', position: 'bottom', overlayColor: 'rgba(255,255,255,0.85)', overlayBlur: true },
    };
    const ui = createUI(config, getTranslations('cs'), makeCallbacks());
    ui.showBanner();
    const overlay = document.querySelector('.cmp-overlay');
    expect(overlay.classList.contains('cmp-overlay--blur')).toBe(true);
    expect(overlay.style.background).toContain('rgba');
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

describe('createReopenButton', () => {
  beforeEach(() => {
    document.body.textContent = '';
    document.querySelectorAll('style[data-cmp]').forEach(el => el.remove());
  });

  function cfg(reopen = {}) {
    return { ...DEFAULT_CONFIG, reopenButton: { ...DEFAULT_CONFIG.reopenButton, ...reopen } };
  }

  it('renders a button with the built-in cookie icon and position class', () => {
    const btn = createReopenButton(cfg({ position: 'bottom-right' }), getTranslations('cs'), vi.fn());
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.classList.contains('cmp-reopen--bottom-right')).toBe(true);
    expect(btn.querySelector('svg')).not.toBeNull();
  });

  it('fires the callback on click', () => {
    const onClick = vi.fn();
    const btn = createReopenButton(cfg(), getTranslations('cs'), onClick);
    btn.click();
    expect(onClick).toHaveBeenCalled();
  });

  it('falls back to the settings-modal title for aria-label', () => {
    const t = getTranslations('cs');
    const btn = createReopenButton(cfg(), t, vi.fn());
    expect(btn.getAttribute('aria-label')).toBe(t.modal.title);
  });

  it('uses an emoji icon as text without an svg', () => {
    const btn = createReopenButton(cfg({ icon: '🍪' }), getTranslations('cs'), vi.fn());
    expect(btn.querySelector('svg')).toBeNull();
    expect(btn.textContent).toBe('🍪');
  });

  it('renders an image when icon is a URL', () => {
    const btn = createReopenButton(cfg({ icon: 'https://x.test/cookie.svg' }), getTranslations('cs'), vi.fn());
    const img = btn.querySelector('img');
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe('https://x.test/cookie.svg');
  });
});

describe('styles.css', () => {
  it('uses no rem font sizes (host pages can shrink the html font size)', () => {
    const css = readFileSync('src/styles.css', 'utf8');
    expect(css).not.toMatch(/\d+rem/);
  });
});

describe('style variables', () => {
  beforeEach(() => {
    document.querySelectorAll('style[data-cmp]').forEach(el => el.remove());
  });

  function injectedCss(style) {
    createUI({ ...DEFAULT_CONFIG, style: { ...DEFAULT_CONFIG.style, ...style } },
      getTranslations('cs'), makeCallbacks()).showBanner();
    return document.querySelector('style[data-cmp]').textContent;
  }

  it('falls back to secondaryTextColor / secondaryColor when the optional colors are unset', () => {
    const css = injectedCss({ secondaryColor: '#aaa', secondaryTextColor: '#111' });
    expect(css).toContain('--cmp-secondary-hover-text: #111;');
    expect(css).toContain('--cmp-toggle-off: #aaa;');
  });

  it('uses secondaryHoverTextColor and toggleOffColor when set', () => {
    const css = injectedCss({ secondaryHoverTextColor: '#f0ece9', toggleOffColor: '#cfc7c1' });
    expect(css).toContain('--cmp-secondary-hover-text: #f0ece9;');
    expect(css).toContain('--cmp-toggle-off: #cfc7c1;');
  });
});
