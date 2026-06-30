export function trackConsentEvent(config, consent, action) {
  if (!config.analytics.trackConsent) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'consent_update',
    consent_id: consent.id ?? null,
    consent_analytics: consent.analytics ?? false,
    consent_marketing: consent.marketing ?? false,
    consent_action: action,
  });
}

export function trackBannerShown(config, consentId) {
  if (!config.analytics.trackConsent) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'cmp_banner_shown',
    consent_id: consentId ?? null,
  });
}
