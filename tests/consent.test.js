import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createConsentManager } from '../src/consent.js';

function makeConfig(overrides = {}) {
  return {
    defaults: {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'granted',
      personalization_storage: 'denied',
      security_storage: 'granted',
    },
    categories: {
      analytics: { signals: ['analytics_storage'], default: 'denied' },
      marketing: { signals: ['ad_storage', 'ad_user_data', 'ad_personalization', 'personalization_storage'], default: 'denied' },
    },
    cookieName: 'cmp_consent',
    cookieDomain: 'auto',
    consentExpiry: 365,
    bannerVersion: '1.0',
    analytics: { trackConsent: false },
    ...overrides,
  };
}

describe('createConsentManager', () => {
  beforeEach(() => {
    document.cookie = 'cmp_consent=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    window.dataLayer = [];
  });

  it('sends default consent on init when no cookie exists', () => {
    const cm = createConsentManager(makeConfig());
    cm.init();
    const entry = window.dataLayer[0];
    expect(entry[0]).toBe('consent');
    expect(entry[1]).toBe('default');
    expect(entry[2]).toMatchObject({
      ad_storage: 'denied',
      functionality_storage: 'granted',
      wait_for_update: 500,
    });
  });

  it('sends update immediately if valid cookie exists', () => {
    const data = JSON.stringify({ analytics: true, marketing: false, ts: Date.now(), v: '1.0' });
    document.cookie = `cmp_consent=${encodeURIComponent(data)}; path=/`;
    const cm = createConsentManager(makeConfig());
    cm.init();
    const updateEntry = Array.from(window.dataLayer).find(e => e[0] === 'consent' && e[1] === 'update');
    expect(updateEntry).toBeTruthy();
    expect(updateEntry[2].analytics_storage).toBe('granted');
    expect(updateEntry[2].ad_storage).toBe('denied');
  });

  it('returns needsBanner=true when no cookie', () => {
    const cm = createConsentManager(makeConfig());
    cm.init();
    expect(cm.needsBanner()).toBe(true);
  });

  it('returns needsBanner=false when valid cookie exists', () => {
    const data = JSON.stringify({ analytics: true, marketing: false, ts: Date.now(), v: '1.0' });
    document.cookie = `cmp_consent=${encodeURIComponent(data)}; path=/`;
    const cm = createConsentManager(makeConfig());
    cm.init();
    expect(cm.needsBanner()).toBe(false);
  });

  it('returns needsBanner=true when bannerVersion changed', () => {
    const data = JSON.stringify({ analytics: true, marketing: false, ts: Date.now(), v: '0.9' });
    document.cookie = `cmp_consent=${encodeURIComponent(data)}; path=/`;
    const cm = createConsentManager(makeConfig({ bannerVersion: '1.0' }));
    cm.init();
    expect(cm.needsBanner()).toBe(true);
  });

  it('acceptAll sets all categories granted and saves cookie', () => {
    const cm = createConsentManager(makeConfig());
    cm.init();
    cm.acceptAll();
    expect(cm.getConsent().analytics).toBe(true);
    expect(cm.getConsent().marketing).toBe(true);
    expect(document.cookie).toContain('cmp_consent');
  });

  it('rejectAll sets non-essential categories denied', () => {
    const cm = createConsentManager(makeConfig());
    cm.init();
    cm.rejectAll();
    expect(cm.getConsent().analytics).toBe(false);
    expect(cm.getConsent().marketing).toBe(false);
  });

  it('updateConsent sets specific categories', () => {
    const cm = createConsentManager(makeConfig());
    cm.init();
    cm.updateConsent({ analytics: true, marketing: false });
    expect(cm.getConsent().analytics).toBe(true);
    expect(cm.getConsent().marketing).toBe(false);
  });

  it('hasConsent returns false before any action', () => {
    const cm = createConsentManager(makeConfig());
    cm.init();
    expect(cm.hasConsent()).toBe(false);
  });

  it('hasConsent returns true after acceptAll', () => {
    const cm = createConsentManager(makeConfig());
    cm.init();
    cm.acceptAll();
    expect(cm.hasConsent()).toBe(true);
  });

  it('reset clears cookie and state', () => {
    const cm = createConsentManager(makeConfig());
    cm.init();
    cm.acceptAll();
    cm.reset();
    expect(cm.hasConsent()).toBe(false);
    expect(cm.needsBanner()).toBe(true);
  });
});
