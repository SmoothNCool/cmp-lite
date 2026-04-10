import { describe, it, expect, beforeEach } from 'vitest';
import { DEFAULT_CONFIG, resolveConfig } from '../src/config.js';

describe('resolveConfig', () => {
  beforeEach(() => {
    delete globalThis.window;
    globalThis.window = {};
  });

  it('returns DEFAULT_CONFIG when no cmpConfig is set', () => {
    const config = resolveConfig();
    expect(config.defaults.ad_storage).toBe('denied');
    expect(config.defaults.functionality_storage).toBe('granted');
    expect(config.display.mode).toBe('banner');
    expect(config.consentExpiry).toBe(365);
  });

  it('deep merges user config over defaults', () => {
    window.cmpConfig = {
      display: { mode: 'wall' },
      consentExpiry: 180,
    };
    const config = resolveConfig();
    expect(config.display.mode).toBe('wall');
    expect(config.display.position).toBe('bottom');
    expect(config.consentExpiry).toBe(180);
    expect(config.defaults.ad_storage).toBe('denied');
  });

  it('overrides nested defaults without losing siblings', () => {
    window.cmpConfig = {
      buttons: { rejectAll: { show: false } },
    };
    const config = resolveConfig();
    expect(config.buttons.rejectAll.show).toBe(false);
    expect(config.buttons.rejectAll.style).toBe('secondary');
    expect(config.buttons.acceptAll.show).toBe(true);
  });

  it('does not merge arrays — replaces them', () => {
    window.cmpConfig = {
      categories: {
        analytics: { signals: ['analytics_storage', 'personalization_storage'] },
      },
    };
    const config = resolveConfig();
    expect(config.categories.analytics.signals).toEqual(['analytics_storage', 'personalization_storage']);
  });
});
