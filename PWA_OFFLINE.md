# PWA_OFFLINE.md — Progressive Web App & Offline-First Guide

> **Document Version:** 1.0.0  
> **Offline Engine:** Workbox Service Worker + Browser IndexedDB (Dexie.js)  
> **Target Capabilities:** Complete Air-Gapped Kiosk & Mobile PWA Execution  

---

## 1. PWA Architectural Overview

BYTE BATTLE is built as a **Progressive Web App (PWA)** to guarantee that once the application is loaded or installed on a host computer, tablet, or phone, it operates with complete autonomy—even in total absence of an internet connection.

```
                              ┌─────────────────────────┐
                              │     User / Browser      │
                              └────────────┬────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        │                                     │
                        ▼                                     ▼
             [Service Worker Proxy]                [IndexedDB Storage]
             (Workbox Cache Engine)                 (Dexie.js Engine)
                        │                                     │
         ┌──────────────┴──────────────┐                      │
         ▼                             ▼                      │
   [Pre-cached]                  [Stale-While-                │
 (HTML, JS, CSS,                 Revalidate]                  │
  Audio, Puzzles)              (Dynamic Config)               │
         │                             │                      │
         └──────────────┬──────────────┘                      │
                        │                                     │
                        ▼                                     ▼
                [Offline Render]                    [Offline Persistence]
              (Zero Network Calls)                  (Local Leaderboards)
```

---

## 2. Web App Manifest Specification

The Web App Manifest (`public/manifest.webmanifest`) informs the host operating system how BYTE BATTLE should behave when installed as a standalone application:

```json
{
  "name": "BYTE BATTLE: Neo-Arcade Arena",
  "short_name": "ByteBattle",
  "description": "An interactive gamified technology arena for school students.",
  "start_url": "/",
  "id": "/",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#101116",
  "theme_color": "#C8FF3D",
  "categories": ["education", "games", "productivity"],
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-maskable-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

---

## 3. Service Worker & Caching Strategy

The service worker is configured via Next.js PWA and Workbox caching strategies:

### 3.1 Caching Tiers
1. **Core App Shell (CacheFirst):**
   - Assets: HTML shell, bundled `.js` scripts, `.css` stylesheets, and SVG graphics.
   - Behavior: Always served directly from local Cache Storage. Updates are downloaded in the background when online.
2. **Game Puzzles & Static Data (CacheFirst):**
   - Assets: `src/data/puzzles/*.json`.
   - Behavior: Pre-cached during installation, ensuring all 110 puzzles are instantly readable offline.
3. **Sound Effects & Media (CacheFirst):**
   - Assets: `/audio/*.mp3`, `/audio/*.ogg`.
   - Behavior: Cached on first request with a dedicated media cache quota.

---

## 4. Offline vs. Online Capability Matrix

| Feature | Offline (No Internet) | Online (Connected) |
| :--- | :---: | :---: |
| **All 6 Game Arenas** | **100% Operational** | **100% Operational** |
| **Puzzle Bank Access** | **100% Operational** | **100% Operational** |
| **Participant Registration** | **100% Operational** | **100% Operational** |
| **Six Independent Leaderboards**| **100% Operational** | **100% Operational** |
| **Host PIN & Control Panel** | **100% Operational** | **100% Operational** |
| **Projector / Dual Display** | **100% Operational** | **100% Operational** |
| **CSV & JSON Data Export** | **100% Operational** | **100% Operational** |
| **Remote Multi-Device Cloud Sync** | Queued Locally | Live Sync via Supabase |
| **Public Live Web Standings** | N/A (Local Only) | Synchronized in Real-Time |

---

## 5. Offline-to-Online Synchronization & Conflict Recovery

When the application is run in hybrid mode (offline kiosk with periodic online synchronization):

1. **Transaction Queuing:** Every score attempt is stamped with a client-generated UUID v4, UTC completion timestamp, and local sequence counter.
2. **Reconnection Listener:** The application listens for `window.addEventListener('online', ...)`.
3. **Batch Sync Worker:** When connection is detected, un-synced rows in the `scores` table (where `synced = false`) are transmitted in batches to Supabase.
4. **Conflict Resolution Strategy:**
   - **Participant Records:** Keyed by compound `[eventId + nickname]`. First registered timestamp takes precedence.
   - **Score Records:** Keyed by immutable attempt UUID. New records are inserted; duplicate UUIDs are ignored (`ON CONFLICT (id) DO NOTHING`).
   - **Leaderboard Recalculation:** Cloud Postgres triggers recalculate the best-score standings automatically upon batch ingestion.

---

## 6. Native Browser Installation Policy (No In-Site Prompts)

Per design requirements, BYTE BATTLE maintains a zero-clutter interface with **strictly no in-site "Install App" buttons, popups, or intrusive floating cards**. Installation is cleanly handled via the browser's native platform menu:

### 6.1 Android (Google Chrome & Microsoft Edge)
1. Open the hosted BYTE BATTLE application URL in Google Chrome or Microsoft Edge.
2. Tap the browser's three-dot overflow menu (`⋮`) in the top right corner.
3. Select **Add to Home screen** or **Install app**.
4. Confirm installation. The application will launch as an immersive standalone PWA with its own icon in the app drawer.

### 6.2 iOS & iPadOS (Apple Safari)
1. Open the BYTE BATTLE application URL in Apple Safari.
2. Tap the native **Share** icon (square with upward arrow) on the browser toolbar.
3. Scroll down and select **Add to Home Screen**.
4. Tap **Add** in the top right corner.
5. BYTE BATTLE will appear on your iOS Home Screen and launch in full-screen standalone mode without browser chrome.

### 6.3 Windows & macOS (Chrome / Edge Desktop)
1. Navigate to the application URL in Chrome or Edge.
2. Click the **Install** icon in the address bar (or Menu → Save and Share → Install BYTE BATTLE).
3. Confirm installation to run BYTE BATTLE in a dedicated window.

---

## 7. HTTPS Requirements & Browser Sandboxing

### 7.1 Production HTTPS Mandate
- Progressive Web App installation, Service Worker registration, and Cache Storage APIs are **strictly disabled by modern browsers over unencrypted HTTP**.
- The production domain must be served with a valid TLS/SSL certificate (e.g., via Let's Encrypt, Cloudflare, or Vercel SSL).
- **Development Exception:** Browsers permit service worker registration over `http://localhost` and `http://127.0.0.1` for local testing.

### 7.2 Native App Distinctions & Limitations
It is critical to understand the distinction between a PWA and a native binary:
- **A PWA is not an Android APK:** It is not downloaded as a compiled Dalvik/ART binary.
- **A PWA is not an iOS IPA:** It is not installed via the Apple App Store.
- **Hardware Access Limits:** A PWA cannot access low-level OS APIs (e.g., Bluetooth pairing without Web Bluetooth prompt, background execution without active browser process).
- **Storage Limits:** Browsers grant IndexedDB substantial storage (often up to 60% of available disk space), but storage can be purged if an aggressive disk cleanup is triggered by the operating system.

---

## 8. Cache Updates & Storage Troubleshooting

### 8.1 How Updates Are Deployed
When a new version of BYTE BATTLE is deployed to production:
1. The service worker detects a byte-diff in `sw.js`.
2. The new service worker downloads in the background (`waiting` state).
3. The UI presents a subtle notification: *"New tournament version available. [Reload to Update]"*.
4. Calling `skipWaiting()` activates the new service worker immediately.

### 8.2 Clearing Stale Caches
If stale assets persist on an event laptop:
1. Open Chrome/Edge DevTools (`F12` or `Ctrl + Shift + I`).
2. Navigate to the **Application** tab.
3. Select **Storage** on the left panel.
4. Click **Clear site data** (clears Cache Storage, Service Workers, and IndexedDB).
5. Refresh the page to perform a fresh, clean load.

---

## 9. Cross-References

- [Deployment Guide](DEPLOYMENT.md) — Hosting setup, SSL certificates, and build commands.
- [Data Model](DATA_MODEL.md) — IndexedDB table structures and persistence logic.
- [Event Runbook](EVENT_RUNBOOK.md) — Pre-event offline verification procedures.
