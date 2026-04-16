# CMP Lite

Lightweight Cookie Management Platform with Google Consent Mode V2 support. Deploys via a single GTM tag.

## Features

- Google Consent Mode V2 (all 7 signals)
- Single GTM tag deployment
- Configurable: display modes, buttons, colors, translations
- < 6 kB gzipped
- CZ + EN with auto-detection
- No dependencies
- GDPR compliant

## Quick Start

Add a single **Custom HTML** tag in GTM with trigger **Consent Initialization - All Pages**:

```html
<script>
window.cmpConfig = {
  privacyPolicyUrl: '/privacy-policy'
};
</script>
<script src="https://cdn.jsdelivr.net/gh/SmoothNCool/cmp-lite@v0.1.0/dist/cmp.min.js"></script>
```

That's it. Default config works out of the box.

## GTM Installation (Step-by-step)

1. Open [Google Tag Manager](https://tagmanager.google.com/) and select your container
2. Go to **Tags → New**
3. Name the tag (e.g. `CMP Lite - Consent Banner`)
4. Tag type: **Custom HTML**
5. Paste the Quick Start snippet above (update `privacyPolicyUrl` to your actual URL)
6. Triggering: click **Consent Initialization - All Pages**
   - If this trigger doesn't exist: go to **Triggers → New → Consent Initialization → All Pages**
7. Save and **Preview** to test
8. Once verified, **Submit** the container

### Verifying Consent Mode

After deployment, verify in browser DevTools console:

```js
// Check current consent state
CMP.getConsent()

// Check if dataLayer has consent_default and consent_update
dataLayer.filter(e => e[0] === 'consent')
```

In GTM Preview mode, you should see:
- `Consent Initialization` event fires first
- Default consent state is set (`denied` for analytics/marketing)
- After user interaction, `consent_update` fires with the new state

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
