// Fire-and-forget POST of a consent event to an optional endpoint (config.consentLog.endpoint).
// text/plain keeps it a CORS "simple request" — no preflight. Origin is checked server-side.
// ponytail: best-effort, no retry queue — a lost event must never break the consent UX.
function logEvent(config, payload) {
  const endpoint = config.consentLog && config.consentLog.endpoint;
  if (!endpoint || typeof navigator === 'undefined' || !navigator.sendBeacon) return;
  const body = JSON.stringify({
    ...payload,
    v: config.bannerVersion ?? null,
    ts: Date.now(),
    url: typeof location !== 'undefined' ? location.href : null,
  });
  try {
    navigator.sendBeacon(endpoint, body); // a plain string goes out as text/plain
  } catch {
    /* ignore */
  }
}

export function trackConsentEvent(config, consent, action) {
  if (config.analytics.trackConsent) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'consent_update',
      consent_id: consent.id ?? null,
      consent_analytics: consent.analytics ?? false,
      consent_marketing: consent.marketing ?? false,
      consent_action: action,
    });
  }
  logEvent(config, {
    event: 'consent_update',
    consent_id: consent.id ?? null,
    action,
    analytics: consent.analytics ?? false,
    marketing: consent.marketing ?? false,
  });
}

export function trackBannerShown(config, consentId) {
  if (config.analytics.trackConsent) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'cmp_banner_shown',
      consent_id: consentId ?? null,
    });
  }
  logEvent(config, {
    event: 'banner_shown',
    consent_id: consentId ?? null,
    action: null,
    analytics: null,
    marketing: null,
  });
}
