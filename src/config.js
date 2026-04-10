export const DEFAULT_CONFIG = {
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
    analytics: {
      signals: ['analytics_storage'],
      default: 'denied',
    },
    marketing: {
      signals: ['ad_storage', 'ad_user_data', 'ad_personalization', 'personalization_storage'],
      default: 'denied',
    },
  },
  display: {
    mode: 'banner',
    position: 'bottom',
  },
  buttons: {
    acceptAll: { show: true, style: 'primary' },
    rejectAll: { show: true, style: 'secondary' },
    settings: { show: true, style: 'link' },
  },
  style: {
    primaryColor: '#2563eb',
    primaryTextColor: '#ffffff',
    secondaryColor: '#e5e7eb',
    secondaryTextColor: '#1f2937',
    backgroundColor: '#ffffff',
    textColor: '#374151',
    borderRadius: '8px',
    fontFamily: 'inherit',
    zIndex: 99999,
  },
  lang: 'auto',
  privacyPolicyUrl: null,
  bannerVersion: '1.0',
  cookieName: 'cmp_consent',
  cookieDomain: 'auto',
  consentExpiry: 365,
  analytics: {
    trackConsent: false,
  },
  backend: null,
};

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      typeof target[key] === 'object' &&
      target[key] !== null &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

export function resolveConfig() {
  const userConfig = (typeof window !== 'undefined' && window.cmpConfig) || {};
  return deepMerge(DEFAULT_CONFIG, userConfig);
}
