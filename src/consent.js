function gtag() {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(...arguments);
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name, value, days, domain) {
  let cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 86400000);
    cookie += `; expires=${date.toUTCString()}`;
  }
  if (domain && domain !== 'auto') {
    cookie += `; domain=${domain}`;
  }
  document.cookie = cookie;
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export function createConsentManager(config) {
  let consentState = null;
  let _needsBanner = true;
  const listeners = {};

  function buildConsentSignals(categories) {
    const signals = {};
    signals.functionality_storage = 'granted';
    signals.security_storage = 'granted';
    for (const [catKey, catConfig] of Object.entries(config.categories)) {
      const granted = categories[catKey] ? 'granted' : 'denied';
      for (const signal of catConfig.signals) {
        signals[signal] = granted;
      }
    }
    return signals;
  }

  function saveCookie() {
    if (!consentState) return;
    const data = JSON.stringify(consentState);
    setCookie(config.cookieName, data, config.consentExpiry, config.cookieDomain);
  }

  function sendUpdate() {
    if (!consentState) return;
    const signals = buildConsentSignals(consentState);
    gtag('consent', 'update', signals);
    emit('consent_update', { ...consentState });
  }

  function emit(event, data) {
    if (listeners[event]) {
      listeners[event].forEach(cb => cb(data));
    }
  }

  return {
    init() {
      gtag('consent', 'default', {
        ...config.defaults,
        wait_for_update: 500,
      });

      const raw = getCookie(config.cookieName);
      if (raw) {
        try {
          const saved = JSON.parse(raw);
          if (saved && saved.v === config.bannerVersion && saved.ts) {
            const age = (Date.now() - saved.ts) / 86400000;
            if (age <= config.consentExpiry) {
              consentState = saved;
              _needsBanner = false;
              sendUpdate();
            }
          }
        } catch (e) {
          // Invalid cookie, ignore
        }
      }
    },

    needsBanner() { return _needsBanner; },

    hasConsent() { return consentState !== null && !_needsBanner; },

    getConsent() {
      if (!consentState) return null;
      const { analytics, marketing, ts, v } = consentState;
      return { analytics, marketing, ts, v };
    },

    acceptAll() {
      const categories = {};
      for (const catKey of Object.keys(config.categories)) {
        categories[catKey] = true;
      }
      consentState = { ...categories, ts: Date.now(), v: config.bannerVersion };
      _needsBanner = false;
      saveCookie();
      sendUpdate();
    },

    rejectAll() {
      const categories = {};
      for (const catKey of Object.keys(config.categories)) {
        categories[catKey] = false;
      }
      consentState = { ...categories, ts: Date.now(), v: config.bannerVersion };
      _needsBanner = false;
      saveCookie();
      sendUpdate();
    },

    updateConsent(categories) {
      consentState = { ...categories, ts: Date.now(), v: config.bannerVersion };
      _needsBanner = false;
      saveCookie();
      sendUpdate();
    },

    reset() {
      consentState = null;
      _needsBanner = true;
      deleteCookie(config.cookieName);
    },

    on(event, cb) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(cb);
    },
  };
}
