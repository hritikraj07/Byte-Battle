# DEPLOYMENT.md — BYTE BATTLE Build, Hosting & Release Guide

> **Document Version:** 2.0.0  
> **Framework:** Next.js 14 (App Router) + React 18 + TypeScript  
> **Styling & Assets:** Tailwind CSS + Lucide Icons + Native HTML5 Canvas  
> **Build Target:** Next.js Production Build / Progressive Web App (PWA)  

---

## 1. Local Development Setup

To run BYTE BATTLE on a local workstation or dedicated event laptop:

### 1.1 Prerequisites
- **Node.js:** `18.17.0` or higher (Node.js 20+ LTS recommended).
- **Package Manager:** `npm` (v9+) or `pnpm`.
- **Operating System:** Windows 10/11, macOS 12+, or Ubuntu/Debian Linux.

### 1.2 Step-by-Step Local Launch
```bash
# 1. Clone repository or navigate to project directory
cd "c:/Users/hriti/OneDrive/Documents/GAMES/BYTE BATTLE"

# 2. Install dependencies
npm install

# 3. Create local environment configuration
cp .env.example .env

# 4. Launch local development server
npm run dev
```
The application will launch at `http://localhost:3000`. Open this URL in Google Chrome, Microsoft Edge, or Apple Safari.

---

## 2. Production Build Pipeline

To compile the application into high-performance, optimized production chunks:

```bash
# Compile and build Next.js production bundle
npm run build

# Start the optimized production server
npm start
```

### 2.1 Build Artifacts
Upon completion, Next.js compiles all static and dynamic routes into the `.next` directory:
- Optimized route bundles for all 6 games (`/play/pattern-shift`, `/play/word-weave`, `/play/code-cracker`, `/play/grid-tactician`, `/play/pulse-jumper`, `/play/palmdrive-rally`).
- Shared Neo-Arcade CSS styling and Tailwind classes.
- Public PWA Web App Manifest (`public/manifest.webmanifest`).
- Public sound assets (`public/audio/`).

### 2.2 Local Production Testing
Before deploying to external hosting, verify the production build locally:
```bash
npm run build
npm start
```
This runs the production bundle at `http://localhost:3000`, allowing verification of asset bundling, route loading, and offline IndexedDB persistence.

---

## 3. Environment Variable Configuration

BYTE BATTLE relies on client-side environment variables prefixed with `VITE_`. 

> **Important Note:** In Vite, variables prefixed with `VITE_` are embedded directly into public client JavaScript bundles during compilation. **Never place private database service-role keys or administrative secrets in client-facing `.env` files.**

### Example Configuration Schema (`.env.example`)
```env
# Application Metadata
VITE_APP_TITLE="BYTE BATTLE"
VITE_APP_VERSION="1.0.0"
VITE_APP_ENV="production"

# Tournament & Kiosk Settings
VITE_DEFAULT_EVENT_MODE="kiosk"
VITE_ENABLE_OFFLINE_STORAGE="true"
VITE_DEFAULT_HOST_PIN="1234"

# Optional Cloud Database Sync (Leave blank for 100% offline local storage)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 4. HTTPS Hosting Requirements

### 4.1 The Secure Context Requirement
Modern web browsers strictly enforce that **Progressive Web App features, Service Workers, and Cache Storage APIs are only available within a Secure Context (HTTPS)**.
- **Allowed Insecure Context:** `http://localhost` and `http://127.0.0.1` are permitted for local development and offline event execution.
- **Remote Production:** Any public domain or intranet deployment must be secured with a valid TLS/SSL certificate.

---

## 5. Deployment Options & Step-by-Step Guides

*(The following hosting platforms are suggested options for static web applications).*

### Option A: Vercel (Recommended)
1. Install the Vercel CLI: `npm i -g vercel`.
2. Ensure `vercel.json` exists in project root for SPA routing:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```
3. Deploy to production:
   ```bash
   vercel --prod
   ```

### Option B: Netlify
1. Install Netlify CLI: `npm i -g netlify-cli`.
2. Ensure `public/_redirects` contains SPA routing fallback:
   ```
   /*    /index.html   200
   ```
3. Build and deploy:
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

### Option C: Cloudflare Pages
1. Log in to the Cloudflare Dashboard and navigate to **Workers & Pages**.
2. Connect your Git repository.
3. Configure build settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Build Output Directory:** `dist`
4. Add single-page application fallback rule in `_routes.json` or project settings.

### Option D: GitHub Pages
1. Install the `gh-pages` helper: `npm install -D gh-pages`.
2. Add deploy script to `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
3. In `vite.config.ts`, set the base path to match your repository name:
   ```typescript
   export default defineConfig({
     base: '/byte-battle/',
   });
   ```
4. Run `npm run deploy`.

---

## 6. Optional Supabase Setup

If your event requires live multi-device synchronization over Wi-Fi:
1. Create a new project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Paste and run the DDL schema provided in [DATA_MODEL.md](DATA_MODEL.md).
4. Navigate to **Project Settings → API** and copy:
   - `Project URL` → Paste into `VITE_SUPABASE_URL`.
   - `anon public key` → Paste into `VITE_SUPABASE_ANON_KEY`.
5. Re-run `npm run build` to package the credentials into the bundle.

---

## 7. Post-Deployment Smoke Tests

Execute these 8 checks immediately following any production deployment:

1. **HTTPS Lock:** Confirm browser displays a secure padlock icon in the address bar.
2. **SPA Routing:** Navigate to `/projector` and press `F5` (browser refresh). Confirm the page reloads cleanly without a 404 Not Found error.
3. **PWA Install Banner:** Confirm the install icon appears in Chrome address bar or Safari share sheet.
4. **Service Worker Active:** Open Chrome DevTools → Application → Service Workers; verify status is `Activated and running`.
5. **Offline Air-Gap Check:** Open DevTools → Network → Select **Offline** throttling. Refresh page; confirm application loads instantly from cache.
6. **IndexedDB Commit:** Register a test participant, play one puzzle, and verify the record appears in DevTools → Application → IndexedDB → `ByteBattleDB`.
7. **Export Test:** In the Host Panel, download a CSV export and verify the file opens cleanly in Excel or Notepad.
8. **Responsive Layout:** Switch DevTools to mobile viewport (320px width) to ensure no UI clipping occurs.

---

## 8. Rollback & Disaster Recovery

If an issue occurs after deploying a new production bundle:
1. **Instant Hosting Rollback:** In the Vercel/Netlify dashboard, select the prior successful deployment and click **Promote to Production** (takes $< 5$ seconds).
2. **Client-Side Cache Invalidation:** The service worker automatically invalidates stale assets on subsequent visits. To force an immediate update for on-site kiosk laptops:
   - Navigate to `chrome://serviceworker-internals/` and click **Unregister**.
   - Or press `Ctrl + F5` (Hard Reload).

---

## 9. Troubleshooting Common Deployment Failures

- **Issue:** 404 Not Found when refreshing sub-pages (e.g., `/projector` or `/arena/pattern-shift`).
  - *Fix:* Ensure rewrite rules (`vercel.json` or `_redirects`) route all paths back to `/index.html`.
- **Issue:** Service Worker fails to register.
  - *Fix:* Ensure the site is served over HTTPS or `localhost`. Check console for MIME type errors on `sw.js`.
- **Issue:** Blank screen on load.
  - *Fix:* Check browser console for JavaScript bundle errors. Verify that `base` in `vite.config.ts` matches the deployment subdirectory.

---

## 10. Cross-References

- [PWA & Offline Guide](PWA_OFFLINE.md) — Service worker lifecycle and caching mechanics.
- [Security Guide](SECURITY.md) — Secret protection and RLS configuration.
- [Event Runbook](EVENT_RUNBOOK.md) — Day-of-event hardware and setup instructions.
