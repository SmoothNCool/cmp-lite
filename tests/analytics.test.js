import { describe, it, expect, beforeEach } from 'vitest';
import { trackConsentEvent } from '../src/analytics.js';

describe('trackConsentEvent', () => {
  beforeEach(() => {
    window.dataLayer = [];
  });

  it('pushes event when tracking enabled', () => {
    trackConsentEvent(
      { analytics: { trackConsent: true } },
      { analytics: true, marketing: false },
      'accept_all'
    );
    const entry = window.dataLayer.find(e => e.event === 'consent_update');
    expect(entry).toBeTruthy();
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
