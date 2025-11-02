# LINE LIFF (LINE Front-end Framework)

Official guidance for LINE miniapp development with LIFF SDK

**Source**: LINE Developers official documentation and @line/liff npm package specifications
**Version**: Based on LIFF SDK v2.27.2 (latest as of documentation)
**Last Updated**: 2025-11-02

---

## Philosophy

LIFF (LINE Front-end Framework) enables web apps to run within LINE and access LINE Platform features. Follow official specifications strictly to ensure compatibility across LIFF browser and external browsers.

**Core Principles**:

- Initialize properly at endpoint URL level or below
- Handle LIFF browser vs external browser differences
- Never expose access tokens or credentials
- Respect LIFF lifecycle and redirect flows

---

## Official Resources

- **Docs**: https://developers.line.biz/en/docs/liff/overview/
- **API Reference**: https://developers.line.biz/en/reference/liff/
- **npm Package**: https://www.npmjs.com/package/@line/liff
- **Starter**: https://github.com/line/line-liff-v2-starter
- **Playground**: https://liff-playground.netlify.app/ (official demo)

---

## Installation & Setup

### Package Installation

```bash
npm install --save @line/liff
# or
yarn add @line/liff
```

**Latest Version**: 2.27.2
**TypeScript**: Type definitions included in package (no @types needed)

### Import Pattern

```typescript
import liff from '@line/liff';

// Initialize with LIFF ID
liff.init({
  liffId: '1234567890-AbcdEfgh', // From LINE Developers Console
});
```

**Critical**: Never declare or modify `window.liff` (breaks LINE app compatibility)

---

## Initialization Lifecycle

### Core Flow

1. User accesses LIFF URL in LINE
2. Redirect to endpoint URL (may include query params: `liff.state`, `access_token`)
3. Execute `liff.init()` at endpoint URL or lower-level path
4. LIFF app becomes functional after Promise resolves

### Initialization Rules

**Execute at correct URL level**:

```typescript
// Endpoint URL: https://example.com/path1/

// ✅ Guaranteed to work
https://example.com/path1/
https://example.com/path1/language/

// ❌ Not guaranteed
https://example.com/
https://example.com/path2/
```

**Warning in v2.27.2+**: Console warning if `liff.init()` called at non-guaranteed URL

### Critical Timing Rules

```typescript
// ✅ Correct: Wait for init to complete before URL changes
liff.init({ liffId: 'xxx' }).then(() => {
  // Safe to manipulate URL after resolution
  window.location.replace(location.href + '/entry/');
});

// ❌ Wrong: URL manipulation before init completes
window.location.replace('/new-path'); // Don't do this first
liff.init({ liffId: 'xxx' });
```

**Forbidden before init resolves**:

- `Document.location` or `Window.location` changes
- `history.pushState()` or `history.replaceState()`
- Server-side 301/302 redirects

### External Browser Login

Enable automatic login in external browsers:

```typescript
liff
  .init({
    liffId: '1234567890-AbcdEfgh',
    withLoginOnExternalBrowser: true, // Auto-login in external browsers
  })
  .then(() => {
    // LIFF API ready
  })
  .catch((err) => {
    console.log(err);
  });
```

### liff.ready Pattern

Get Promise that resolves when first `liff.init()` completes:

```typescript
liff.ready.then(() => {
  // Safe to use LIFF APIs
});
```

---

## Environment Detection

### Available Before Init

These methods work even before `liff.init()` completes:

- `liff.ready` (Promise)
- `liff.getOS()` - OS detection
- `liff.getAppLanguage()` - App language
- `liff.getLanguage()` - Deprecated, use getAppLanguage()
- `liff.getVersion()` - LIFF SDK version
- `liff.getLineVersion()` - LINE app version
- `liff.isInClient()` - Check if in LIFF browser
- `liff.closeWindow()` - Close LIFF window (v2.4.0+)
- `liff.use()` - Plugin system
- `liff.i18n.setLang()` - Set language

### Runtime Environment Checks

```typescript
// Check environment
console.log(liff.getAppLanguage()); // User's app language
console.log(liff.getVersion()); // LIFF SDK version
console.log(liff.isInClient()); // true if LIFF browser
console.log(liff.isLoggedIn()); // Login status
console.log(liff.getOS()); // "ios" | "android" | "web"
console.log(liff.getLineVersion()); // LINE app version
```

---

## LIFF Browser vs External Browser

### LIFF Browser Specifications

**iOS**: WKWebView (https://developer.apple.com/documentation/webkit/wkwebview)
**Android**: Android WebView (https://developer.android.com/reference/android/webkit/WebView)

**Features**:

- No login prompt required (runs in LINE)
- Access to LINE-specific features (scanCode, sendMessages, etc.)
- Three view sizes: Full, Tall, Compact
- Action button with multi-tab view (LINE 15.12.0+)
- Cache controlled via HTTP headers (Cache-Control)

### External Browser

**Supported**: Latest versions of Microsoft Edge, Chrome, Firefox, Safari

**Differences**:

- LINE Login required (use `liff.login()`)
- Some APIs unavailable (e.g., `scanCode()`, camera features)
- Standard web browser behavior

### API Availability Check

```typescript
if (liff.isApiAvailable('scanCode')) {
  // Use scanCode in LIFF browser
} else {
  // Fallback for external browser
}
```

---

## Screen Size & View Types

### Three View Sizes

Set in LINE Developers Console when registering LIFF app:

1. **Full**: Full-screen, displays action button by default
2. **Tall**: 80% of screen height
3. **Compact**: 50% of screen height

### Module Mode

Enable to hide action button on Full view apps (LINE Developers Console setting)

### Multi-Tab View (LINE 15.12.0+)

Action button shows:

- Options (Share, Minimize, Refresh, Permission Settings)
- Recently used services (up to 50 LIFF apps, last 12 hours)

**Resume conditions** (last 10 items, within 12 hours):

- Access token, history, scroll position retained

**Reload conditions** (older than 12 hours or not in top 10):

- Re-initialized at last URL, credentials discarded

**Appearance requirements**:

- LINE 15.12.0+
- View size = Full
- Module mode = OFF

---

## Core API Patterns

### Login Flow

```typescript
// In external browser or LINE's in-app browser
if (!liff.isLoggedIn()) {
  liff.login({ redirectUri: window.location.href });
}
```

**Note**: `liff.login()` not needed in LIFF browser (auto-login on init)

### Get User Profile

```typescript
liff
  .getProfile()
  .then((profile) => {
    console.log(profile.userId);
    console.log(profile.displayName);
    console.log(profile.pictureUrl);
    console.log(profile.statusMessage);
  })
  .catch((err) => console.error(err));
```

### Get Access Token

```typescript
const accessToken = liff.getAccessToken();
// Use for API calls to LINE Platform
```

**Security**: Access token in primary redirect URL is confidential

- Don't send to external logging (Google Analytics, etc.)
- Safe to log after `liff.init()` resolves (v2.11.0+ strips credentials)

### Send Messages

```typescript
// Send to current chat room (LIFF browser only)
liff
  .sendMessages([
    {
      type: 'text',
      text: 'Hello from LIFF!',
    },
  ])
  .then(() => console.log('Message sent'))
  .catch((err) => console.error(err));
```

### Share Target Picker

```typescript
// Share to user's friend (requires user selection)
liff
  .shareTargetPicker([
    {
      type: 'text',
      text: 'Check this out!',
    },
  ])
  .then(() => console.log('Shared'))
  .catch((err) => console.error(err));
```

### Get Context

```typescript
// Get launch context
liff.getContext().then((context) => {
  console.log(context.type); // "utou" | "room" | "group" | "none"
  console.log(context.userId); // User ID (if available)
  console.log(context.utouId); // 1:1 chat ID
  console.log(context.roomId); // Room ID
  console.log(context.groupId); // Group ID
});
```

### Get Friendship Status

```typescript
// Check if user added official account as friend
liff.getFriendship().then((data) => {
  if (data.friendFlag) {
    console.log('User is friend');
  }
});
```

### Open External URL

```typescript
// Open URL in external browser
liff.openWindow({
  url: 'https://example.com',
  external: true,
});
```

### Close LIFF App

```typescript
liff.closeWindow(); // Close LIFF browser
```

### Scan QR Code (LIFF browser only)

```typescript
if (liff.isApiAvailable('scanCode')) {
  liff.scanCode().then((result) => {
    console.log(result.value); // Scanned value
  });
}
```

### Permanent Link

```typescript
// Get permanent link for current page
const permanentLink = liff.permanentLink.createUrl();
console.log(permanentLink);
```

**Note**: Fails if current URL doesn't start with endpoint URL

---

## Query Parameters

### Reserved Parameters

LIFF SDK adds these automatically:

- `liff.state` - Additional info from LIFF URL
- `liff.referrer` - Referrer for LIFF-to-LIFF transitions
- `access_token=xxx` - User access token (primary redirect only)

**Critical**: Don't modify `liff.*` parameters before `liff.init()` resolves

---

## Pluggable SDK (File Size Optimization)

Modular approach to reduce bundle size:

```typescript
import liff from '@line/liff/core';
import getProfile from '@line/liff/get-profile';
import sendMessages from '@line/liff/send-messages';

liff.use(getProfile);
liff.use(sendMessages);

liff.init({ liffId: 'xxx' });
```

**Available Modules** (from package.json exports):

- Core: `/core`
- Features: `/get-profile`, `/send-messages`, `/share-target-picker`, etc.
- Analytics: `/analytics`
- IAP: `/iap`
- Scan: `/scan-code-v2`
- Others: See package.json exports for full list

---

## Recommended Operating Environment

### LIFF Browser

| Platform | Recommended                | Minimum               |
| -------- | -------------------------- | --------------------- |
| iOS      | Latest version (WKWebView) | Per LINE system specs |
| Android  | Latest version (WebView)   | Per LINE system specs |
| LINE     | Latest version             | Per LINE system specs |

**Best Practice**: Always recommend latest OS and LINE versions

### External Browser

Latest versions of:

- Microsoft Edge
- Google Chrome
- Firefox
- Safari

---

## Security Best Practices

### Access Token Handling

```typescript
// ❌ Don't send access token to analytics
window.location.href; // May contain access_token before init

// ✅ Safe after init (v2.11.0+ strips credentials)
liff.init({ liffId: 'xxx' }).then(() => {
  ga('send', 'pageview'); // Safe now
});
```

### Credential Protection

- Never log primary redirect URL (contains access_token)
- Never share access tokens with third parties
- Use HTTPS for all LIFF apps
- Validate server-side with access token verification

---

## Compatibility Notes

### Not Supported

- OpenChat (official account features unavailable)
- LIFF browser doesn't support all web technologies
  - See: https://developers.line.biz/en/docs/liff/differences-between-liff-browser-and-external-browser/

### Cache Management

- LIFF browser caches per HTTP headers (Cache-Control)
- No explicit cache deletion API
- Control via HTTP response headers

---

## Next.js / Static Export Considerations

### Static Export Pattern

LIFF apps work well with static exports:

```typescript
// pages/_app.tsx or app layout
import { useEffect } from 'react';
import liff from '@line/liff';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID })
      .then(() => {
        console.log('LIFF initialized');
      });
  }, []);

  return <Component {...pageProps} />;
}
```

### Server-Side Rendering (SSR)

```typescript
// Prevent SSR errors (liff requires browser)
if (typeof window !== 'undefined') {
  liff.init({ liffId: 'xxx' });
}
```

---

## Error Handling

### Common Patterns

```typescript
liff
  .init({ liffId: 'xxx' })
  .then(() => {
    // Success
  })
  .catch((error) => {
    console.error('LIFF init failed', error);
    // Handle initialization errors
  });

// Check API availability
if (!liff.isApiAvailable('scanCode')) {
  console.warn('scanCode not available in this environment');
}
```

---

## Testing & Development

### Official Tools

- **LIFF Playground**: https://liff-playground.netlify.app/
  - Try LIFF features without setup
  - Source: https://github.com/line/liff-playground

- **LIFF Starter**: https://github.com/line/line-liff-v2-starter
  - Official template project
  - Deploy to Netlify button available

### Local Development

```bash
# Using LIFF Starter
npm ci
npm start

# Build with LIFF ID
LIFF_ID="your-liff-id" npm run build
```

---

## Migration & Version Notes

### v2.27.2 Changes

- Warning for incorrect URL initialization
- Enhanced multi-tab view support
- Improved type definitions

### Deprecated APIs

- `liff.getLanguage()` → Use `liff.getAppLanguage()`

---

## Common Patterns Summary

**Initialization**:

```typescript
liff
  .init({ liffId: 'xxx', withLoginOnExternalBrowser: true })
  .then(() => liff.ready)
  .then(() => {
    // App logic here
  });
```

**Environment-Aware Logic**:

```typescript
if (liff.isInClient()) {
  // LIFF browser specific
} else {
  // External browser
  if (!liff.isLoggedIn()) liff.login();
}
```

**Feature Detection**:

```typescript
if (liff.isApiAvailable('scanCode')) {
  // Use feature
}
```

---

## Key Takeaways

1. **Always initialize at endpoint URL or below**
2. **Wait for init Promise before URL manipulation**
3. **Never expose access tokens to external services**
4. **Check API availability before use**
5. **Test in both LIFF browser and external browsers**
6. **Use official type definitions (included in package)**
7. **Follow redirect flow for proper initialization**
8. **Respect query parameter `liff.*` namespace**

---

**Reference Implementation**: See official LIFF Playground source code for production-ready patterns
