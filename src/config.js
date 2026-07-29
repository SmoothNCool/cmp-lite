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
    mode: 'banner',       // 'banner' | 'modal'
    position: 'bottom',   // 'bottom' | 'top' | 'bottom-left' | 'bottom-right'
    overlayColor: 'rgba(0, 0, 0, 0.5)',
    overlayBlur: false,
  },
  buttons: {
    acceptAll: { show: true, style: 'primary' },
    settings: { show: true, style: 'secondary' },
    rejectAll: { show: true, style: 'link' },
  },
  style: {
    primaryColor: '#000000',
    primaryTextColor: '#ffffff',
    secondaryColor: '#d1d5db',
    secondaryTextColor: '#000000',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    borderRadius: '8px',
    fontFamily: 'inherit',
    zIndex: 99999,
  },
  lang: 'auto',
  privacyPolicyUrl: null,
  texts: null,
  bannerVersion: '1.0',
  cookieName: 'cmp_consent',
  idCookieName: 'cmp_id',
  cookieDomain: 'auto',
  consentExpiry: 365,
  analytics: {
    trackConsent: false,
  },
  reopenButton: {
    show: false,            // floating button to re-open consent settings
    position: 'bottom-left',// 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
    icon: null,             // null = built-in cookie icon; else inline <svg>, image URL, or emoji/text
    ariaLabel: null,        // null = falls back to the settings-modal title
  },
  consentLog: {
    endpoint: null,       // POST consent events here (fire-and-forget beacon); null = off
  },
};

export function deepMerge(target, source) {
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
