import { describe, it, expect, beforeEach } from 'vitest';
import { trackConsentEvent, trackBannerShown } from '../src/analytics.js';

describe('trackConsentEvent', () => {
  beforeEach(() => {
    window.dataLayer = [];
  });

  it('pushes event when tracking enabled', () => {
    trackConsentEvent(
      { analytics: { trackConsent: true } },
      { id: 'abc-123', analytics: true, marketing: false },
      'accept_all'
    );
    const entry = window.dataLayer.find(e => e.event === 'consent_update');
    expect(entry).toBeTruthy();
    expect(entry.consent_id).toBe('abc-123');
    expect(entry.consent_analytics).toBe(true);
    expect(entry.consent_marketing).toBe(false);
    expect(entry.consent_action).toBe('accept_all');
  });

  it('does nothing when tracking disabled', () => {
    trackConsentEvent(
      { analytics: { trackConsent: false } },
      { analytics: true, marketing: true },
      'accept_all'
    );
    expect(window.dataLayer.length).toBe(0);
  });
});

describe('trackBannerShown', () => {
  beforeEach(() => {
    window.dataLayer = [];
  });

  it('pushes cmp_banner_shown with consent_id when tracking enabled', () => {
    trackBannerShown({ analytics: { trackConsent: true } }, 'abc-123');
    const entry = window.dataLayer.find(e => e.event === 'cmp_banner_shown');
    expect(entry).toBeTruthy();
    expect(entry.consent_id).toBe('abc-123');
  });

  it('does nothing when tracking disabled', () => {
    trackBannerShown({ analytics: { trackConsent: false } }, 'abc-123');
    expect(window.dataLayer.length).toBe(0);
  });
});
