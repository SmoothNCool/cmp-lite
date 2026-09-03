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
<script src="https://cdn.jsdelivr.net/gh/SmoothNCool/cmp-lite@v0.6.0/dist/cmp.min.js"></script>
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

## Configuring other GTM tags

CMP Lite calls the standard `gtag('consent', 'default'/'update', ...)` API, so any tag that respects Google Consent Mode V2 picks it up automatically. **How you configure each tag in GTM depends on whether the tag has built-in CMP V2 support.**

### Tags WITH native Consent Mode V2 — fire on Page View, don't gate

These tags read the consent state internally. When `denied`, they run in cookieless / limited mode (no identifying cookies, just modeling pings). When `granted`, they switch to full mode automatically.

| Platform | GTM tag | Notes |
|---|---|---|
| GA4 | Google Tag / GA4 Configuration | reads `analytics_storage` |
| Google Ads | Conversion / Remarketing | reads `ad_storage` + `ad_user_data` + `ad_personalization` |
| Sklik (Seznam.cz) | Sklik Retargeting / Conversion (≥ 2024) | reads `ad_storage` |
| Meta Pixel | Custom HTML or template (≥ late 2023) | reads `ad_storage` for Limited Data Use |

**Setup:** trigger `Page View - All Pages` (or `Initialization - All Pages` for GA4 Config). Leave **Consent Settings → No additional consent required**. Do **not** check "Require additional consent for tag to fire" — gating these tags suppresses them entirely and breaks the cookieless modeling that platforms expect even from non-consenting users.

### Tags WITHOUT native V2 support — gate manually

These tags don't know about Consent Mode and will write cookies regardless. Block them until consent is granted.

Examples: Hotjar, Smartlook, Microsoft Clarity, LinkedIn Insight Tag (older), TikTok Pixel, Pinterest Tag, custom HTML for affiliate networks, A/B testing tools.

**Setup:** in tag → **Advanced Settings → Consent Settings** → **Require additional consent for tag to fire** → add the matching signal:

| Tag purpose | Required signal |
|---|---|
| Analytics / heatmap / session replay | `analytics_storage` |
| Marketing / retargeting / ads | `ad_storage` (often `ad_user_data` + `ad_personalization`) |
| Personalization | `personalization_storage` |

The tag stays inactive until the user clicks Accept (or enables that category in the customize modal). To also re-fire after a *late* consent (user accepts on a later interaction, not on first page view), add a **Custom Event** trigger:

- Trigger type: `Custom Event`
- Event name: `consent_update`
- Fire on: condition matching the granted signal (e.g. via `dataLayer` variable that reads `consent_marketing == true`)

CMP Lite emits `consent_update` to `dataLayer` automatically when you enable `window.cmpConfig.analytics.trackConsent = true`.

### How to check what your tag supports

GTM Admin → Container Settings → **Consent Configuration** lists every tag template with its built-in consent signals. If a tag shows signals there, treat it as "WITH native V2" above.

### Reading the consent state in GTM

CMP Lite stores the user's choice in a cookie and emits events. Pick whichever access pattern matches your need:

**Cookie:** name `cmp_consent` (configurable via `cookieName`), URL-encoded JSON. Decoded shape:

```json
{
  "analytics": true,
  "marketing": false,
  "ts": 1735689600000,
  "v": "1.0"
}
```

Keys come from `config.categories` (default `analytics` + `marketing`). `ts` is the Unix-ms timestamp of the decision; `v` is `bannerVersion` (used to invalidate consent when you change categories — bump it and old cookies are ignored).

**Reading it in GTM** — two variables, no JavaScript:

1. **1st-Party Cookie** variable (e.g. `cookie - cmp_consent`), Cookie Name: `cmp_consent`. Returns the raw URL-encoded JSON.

2. **RegEx Table** variable per category, to extract a clean `true` / `false`:
   - Input Variable: `{{cookie - cmp_consent}}`
   - Set Default Value: `false`
   - Enable **Capture Groups** in Format Value
   - One row — Pattern: `%22analytics%22%3A(true|false)` → Output: `$1`
   - For marketing: replace `analytics` with `marketing` in the pattern

Use the resulting variable (`cmp - analytics` / `cmp - marketing`) in trigger conditions or tag fields, e.g. *fire if `{{cmp - marketing}}` equals `true`*.

## Measuring consent rate

To measure **what share of visitors consent** (not just how many clicked), set `analytics.trackConsent = true`. CMP Lite then emits two `dataLayer` events, both carrying a stable `consent_id`:

| Event | Fires when | Fields |
|---|---|---|
| `cmp_banner_shown` | the banner/modal is displayed | `consent_id` — **denominator** (people who saw the bar) |
| `consent_update` | the user accepts / rejects / saves settings | `consent_id`, `consent_analytics`, `consent_marketing`, `consent_action` (`accept_all` \| `reject_all` \| `custom`) — **numerator** |

**How the ratio works.** The `consent_id` is a pseudonymous UUID stored in the `cmp_id` cookie (separate from `cmp_consent`), generated on the visitor's first load and reused afterwards. Because both events share it, one person is one identity across the *shown → decided* funnel — even if they change their mind and `consent_update` fires again.

In GA4 (events forwarded via GTM), GA4 also dedupes by user, so:

```
consent rate ≈ Users(consent_update, consent_analytics = true) ÷ Users(cmp_banner_shown)
```

Build it in a GA4 **Exploration** (Free-form), or for an exact per-person figure use `consent_id` server-side (see the consent-log backend on the roadmap).

The `consent_id` is pseudonymous (random UUID, no personal data) and used only for the CMP's own statistics/consent record. The `cmp_id` cookie is strictly functional to the consent tool; document it in your privacy policy alongside `cmp_consent`.

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
    secondaryHoverTextColor: null,  // secondary button text on hover; null = secondaryTextColor
    toggleOffColor: null,           // switched-off toggle track; null = secondaryColor
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
  idCookieName: 'cmp_id',        // pseudonymous visitor id (UUID), set on first load — see "Measuring consent rate"
  cookieDomain: 'auto',          // 'auto' = current domain, or set explicit ('.example.com' for subdomains)
  consentExpiry: 365,            // days; user must re-consent after this period (also the cmp_id lifetime)
  analytics: { trackConsent: false }, // emit cmp_banner_shown + consent_update dataLayer events (with consent_id)

  // Floating button that re-opens the consent settings (off by default)
  reopenButton: {
    show: false,             // turn the floating button on
    position: 'bottom-left', // 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
    icon: null,              // null = built-in cookie icon; or inline '<svg…>', an image URL, or an emoji
    ariaLabel: null,         // null = falls back to the settings-modal title
  },

  // Optional: POST consent events to your own endpoint (off by default)
  consentLog: { endpoint: null },
};
```

## Logging consent events to your own endpoint

Set `consentLog.endpoint` and the banner posts each consent event to it with
`navigator.sendBeacon` — useful for your own consent-rate stats or a proof-of-consent log:

```js
window.cmpConfig = {
  consentLog: { endpoint: 'https://your-endpoint.example.com/api/consent' }
};
```

Body (JSON, sent as `text/plain` so it stays a CORS simple request — no preflight):

```json
{
  "event": "banner_shown",       // or "consent_update"
  "consent_id": "…uuid…",        // the cmp_id cookie — dedupe on this
  "action": null,                 // "accept_all" | "reject_all" | "custom" on consent_update
  "analytics": null,              // category states on consent_update, null on banner_shown
  "marketing": null,
  "v": "1.0",                     // bannerVersion
  "ts": 1735689600000,
  "url": "https://example.com/page"
}
```

`banner_shown` fires only for the initial banner, not when a returning visitor re-opens the
settings — so `consent_update` ÷ `banner_shown` (deduped on `consent_id`) is a clean consent rate.
Delivery is fire-and-forget: it never blocks the banner and a failed send is silently dropped.
Your endpoint should verify the `Origin` header and answer `204`.

## JS API

| Method | Description |
|--------|-------------|
| `CMP.open()` | Open settings modal |
| `CMP.close()` | Close banner/modal |
| `CMP.acceptAll()` | Accept all categories |
| `CMP.rejectAll()` | Reject non-essential |
| `CMP.getConsent()` | Get current consent state (includes `id`, the visitor's `consent_id`) |
| `CMP.getId()` | Get the pseudonymous `consent_id` (UUID from the `cmp_id` cookie) |
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

## Release

Clients load a **floating minor tag** (`@0.7`) so a fix rolls out to every site without touching a single GTM container. To ship an update:

1. `npm test` — keep it green (a floating tag auto-deploys to **all** clients at once; a bad build breaks everyone).
2. Bump `version` in `package.json`, then `npm run build`.
3. `git commit`, `git tag v0.7.x`, `git push origin main --tags`.
4. **Purge the jsDelivr cache** so `@0.7` picks up the new tag immediately (otherwise ~12 h lag):

   ```bash
   curl "https://purge.jsdelivr.net/gh/SmoothNCool/cmp-lite@0.7/dist/cmp.min.js"
   ```

Patches and minor improvements stay within `0.7.x` and flow automatically. A `0.8.0` bump is a deliberate gate — `@0.7` clients won't get it until they change their snippet, so reserve it for breaking changes. Pin an exact version (`@v0.7.1`) for any client that must not auto-update.

## License

MIT
