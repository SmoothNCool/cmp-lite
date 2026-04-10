# CMP Lite

Lightweight Cookie Management Platform with Google Consent Mode V2 support. Deploys via a single GTM tag.

## Features

- Google Consent Mode V2 (all 7 signals)
- Single GTM tag deployment
- Configurable: display modes, buttons, colors, translations
- < 15 kB gzipped
- CZ + EN with auto-detection
- No dependencies
- GDPR compliant

## Quick Start

Add a single Custom HTML tag in GTM with trigger **Consent Initialization - All Pages**:

```html
<script>
window.cmpConfig = {
  privacyPolicyUrl: '/privacy-policy'
};
</script>
<script src="https://cdn.jsdelivr.net/gh/davidzelenka/cmp-lite@v1/dist/cmp.min.js"></script>
```

That's it. Default config works out of the box.

## Configuration

Only override what differs from defaults:

```js
window.cmpConfig = {
  // Consent defaults (all denied except functional/security)
  defaults: {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    personalization_storage: 'denied',
    security_storage: 'granted',
  },

  // UI categories mapped to consent signals
  categories: {
    analytics: { signals: ['analytics_storage'], default: 'denied' },
    marketing: { signals: ['ad_storage', 'ad_user_data', 'ad_personalization', 'personalization_storage'], default: 'denied' },
  },

  // Display
  display: {
    mode: 'banner',        // 'banner' | 'modal' | 'wall'
    position: 'bottom',    // 'bottom' | 'top' | 'bottom-left' | 'bottom-right'
  },

  // Buttons
  buttons: {
    acceptAll: { show: true, style: 'primary' },    // always shown
    rejectAll: { show: true, style: 'secondary' },  // can hide or restyle
    settings:  { show: true, style: 'link' },
  },

  // Styling
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

  // Other
  lang: 'auto',              // 'auto' | 'cs' | 'en'
  privacyPolicyUrl: null,
  bannerVersion: '1.0',
  cookieName: 'cmp_consent',
  cookieDomain: 'auto',
  consentExpiry: 365,         // days
  analytics: { trackConsent: false },
};
```

## JS API

| Method | Description |
|--------|-------------|
| `CMP.open()` | Open settings modal |
| `CMP.close()` | Close banner/modal |
| `CMP.acceptAll()` | Accept all categories |
| `CMP.rejectAll()` | Reject non-essential |
| `CMP.getConsent()` | Get current state |
| `CMP.hasConsent()` | Check if user responded |
| `CMP.reset()` | Clear consent, show banner |
| `CMP.on(event, cb)` | Listen to events |

## Data Attributes

```html
<a data-cmp-open>Cookie Settings</a>
<button data-cmp-accept-all>Accept</button>
<button data-cmp-reject-all>Reject</button>
```

## Display Modes

- **banner** — Fixed bar (default)
- **modal** — Centered dialog with overlay
- **wall** — Fullscreen blocker

## License

MIT
