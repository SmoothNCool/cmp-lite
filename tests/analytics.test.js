import { describe, it, expect, beforeEach, vi } from 'vitest';
import { trackConsentEvent, trackBannerShown } from '../src/analytics.js';

// jsdom has no sendBeacon — stub it and read back the JSON body.
let beacon;
function sentBody() {
  expect(beacon).toHaveBeenCalledTimes(1);
  return JSON.parse(beacon.mock.calls[0][1]);
}
beforeEach(() => {
  beacon = vi.fn(() => true);
  navigator.sendBeacon = beacon;
});

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

describe('consentLog beacon', () => {
  const cfg = {
    analytics: { trackConsent: false },
    bannerVersion: '1.0',
    consentLog: { endpoint: 'https://report.example.com/api/consent' },
  };

  it("sends consent_update with action and category states", () => {
    trackConsentEvent(cfg, { id: 'abc-123', analytics: true, marketing: false }, 'custom');
    expect(beacon.mock.calls[0][0]).toBe(cfg.consentLog.endpoint);
    const body = sentBody();
    expect(body).toMatchObject({
      event: 'consent_update',
      consent_id: 'abc-123',
      action: 'custom',
      analytics: true,
      marketing: false,
      v: '1.0',
    });
    expect(typeof body.ts).toBe('number');
    expect(body.url).toBe(location.href);
  });

  it("sends banner_shown", () => {
    trackBannerShown(cfg, 'abc-123');
    const body = sentBody();
    expect(body).toMatchObject({ event: 'banner_shown', consent_id: 'abc-123', action: null });
  });

  it('stays silent without an endpoint', () => {
    trackConsentEvent({ analytics: { trackConsent: false } }, { id: 'x' }, 'accept_all');
    trackBannerShown({ analytics: { trackConsent: false }, consentLog: {} }, 'x');
    expect(beacon).not.toHaveBeenCalled();
  });

  it('swallows a throwing sendBeacon', () => {
    navigator.sendBeacon = () => { throw new Error('boom'); };
    expect(() => trackBannerShown(cfg, 'abc-123')).not.toThrow();
  });
});
