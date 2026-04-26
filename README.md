# CMP Lite

Lightweight Cookie Management Platform with Google Consent Mode V2 support. Deploys via a single GTM tag.

**Live configurator:** [tools.davidzelenka.cz/cs/cookie](https://tools.davidzelenka.cz/cs/cookie) — generates a snippet for your site visually.

## Features

- Google Consent Mode V2 (all 7 signals)
- Single GTM tag deployment
- Configurable: display modes, buttons, colors, all texts
- < 7 kB gzipped, no dependencies
- CZ + EN with auto-detection
- GDPR compliant

## Quick Start

Add a single **Custom HTML** tag in GTM with trigger **Consent Initialization - All Pages**:

```html
<script>
window.cmpConfig = {
  privacyPolicyUrl: '/privacy-policy'
};
</script>
<script src="https://cdn.jsdelivr.net/gh/SmoothNCool/cmp-lite@v0.5.1/dist/cmp.min.js"></script>
```

That's it. Default config works out of the box (black/white, banner at the bottom).

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

Override only what differs from defaults. The full shape:

```js
window.cmpConfig = {
  // Consent defaults — Consent Mode V2 signals
  defaults: {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    personalization_storage: 'denied',
    security_storage: 'granted',
  },

  // UI categories mapped to consent signals (shown in settings modal)
  categories: {
    analytics: { signals: ['analytics_storage'], default: 'denied' },
    marketing: {
      signals: ['ad_storage', 'ad_user_data', 'ad_personalization', 'personalization_storage'],
      default: 'denied',
    },
  },

  // Display
  display: {
    mode: 'banner',                   // 'banner' | 'modal'
    position: 'bottom',               // 'bottom' | 'top' | 'bottom-left' | 'bottom-right' (banner mode only)
    overlayColor: 'rgba(0,0,0,0.5)',  // modal mode only
    overlayBlur: false,               // modal mode only
  },

  // Buttons — render order in the banner is: acceptAll, settings, rejectAll.
  // `text` overrides the translation; empty/missing falls back to translation.
  buttons: {
    acceptAll: { show: true, style: 'primary',   text: '' },
    settings:  { show: true, style: 'secondary', text: '' },
    rejectAll: { show: true, style: 'link',      text: '' },
  },

  // Styling
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

  // Text overrides — deep-merged on top of the active translation.
  // Override any key from src/translations/{cs,en}.json. Skip what you don't change.
  // Below is the full set of overridable keys, with the EN defaults shown as values.
  texts: {
    banner: {
      title: 'Cookie Settings',
      description: 'This website uses cookies for proper functionality, traffic analysis, and marketing purposes. Choose which cookies you want to allow.',
    },
    modal: {
      title: 'Cookie Settings',
      alwaysActive: 'Always Active',
    },
    buttons: {
      // acceptAll/rejectAll/settings text is set on the buttons.* config above (per-button styling).
      saveSettings: 'Save Settings',
    },
    privacyPolicy: 'Privacy Policy',         // text shown on the privacyPolicyUrl link
    categories: {
      necessary: {
        title: 'Necessary',
        description: 'These cookies are required for the website to function properly. They cannot be disabled.',
      },
      analytics: {
        title: 'Analytics',
        description: 'Help us understand how you use the website so we can improve it.',
      },
      marketing: {
        title: 'Marketing',
        description: 'Used to display relevant ads and measure their effectiveness.',
      },
    },
  },

  // Other
  lang: 'auto',                  // 'auto' | 'cs' | 'en'
  privacyPolicyUrl: null,        // omit the link entirely if null
  cookieName: 'cmp_consent',
  cookieDomain: 'auto',          // 'auto' = current domain, or set explicit ('.example.com' for subdomains)
  consentExpiry: 365,            // days; user must re-consent after this period
  analytics: { trackConsent: false }, // emit a custom dataLayer event on every consent decision
};
```

## JS API

| Method | Description |
|--------|-------------|
| `CMP.open()` | Open settings modal |
| `CMP.close()` | Close banner/modal |
| `CMP.acceptAll()` | Accept all categories |
| `CMP.rejectAll()` | Reject non-essential |
| `CMP.getConsent()` | Get current consent state |
| `CMP.hasConsent()` | Check if user already responded |
| `CMP.reset()` | Clear consent, show banner again |
| `CMP.on(event, cb)` | Listen to events: `open`, `close`, `consent_update` |

## Data Attributes

Drop these on any element to wire up actions without JS:

```html
<a data-cmp-open>Cookie Settings</a>
<button data-cmp-accept-all>Accept</button>
<button data-cmp-reject-all>Reject</button>
```

## Display Modes

- **banner** — Fixed bar (default). Position controlled by `display.position`.
- **modal** — Centered dialog with overlay (focus-trapped, blur option).

## Translations

Built-in: Czech (`cs`), English (`en`). Auto-detected from `<html lang>` or `navigator.language`. Override any string via `texts.*` (see above) — no need to fork the library to relabel a button or category.

To add a new language, fork and add `src/translations/<lang>.json`, then submit a PR.

## License

MIT
