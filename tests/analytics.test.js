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
    const event = window.dataLayer.find(e => e[0] === 'event');
    expect(event).toBeTruthy();
    expect(event[1]).toBe('consent_update');
    expect(event[2].consent_analytics).toBe(true);
    expect(event[2].consent_marketing).toBe(false);
    expect(event[2].consent_action).toBe('accept_all');
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
