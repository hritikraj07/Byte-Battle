# SECURITY.md — BYTE BATTLE Security, Privacy & Threat Assessment

> **Document Version:** 1.0.0  
> **Status:** Security Specification & Threat Model Baseline  
> **Target Environment:** School Outreach Arenas, Kiosk Laptops, Public Web Deployments  

---

## 1. Security Philosophy & Honesty Disclaimer

BYTE BATTLE is designed for school educational competitions and university outreach events. While standard industry best practices for web application security have been integrated into this specification, **no application can be deemed 100% impenetrable**, particularly in client-side single-page applications.

> **Crucial Trust Boundary Reality:**  
> In any purely client-side web application running without a secure backend validation server, code executed on the user's browser is fundamentally under the control of the client machine. Anyone with access to browser Developer Tools (`F12`) or memory debuggers can manipulate JavaScript variables, clock counters, or IndexedDB records. For physical events, security is primarily maintained through **host supervision, kiosk isolation, and sanitization**, rather than cryptographic server proofs.

---

## 2. Input Validation & Safe Nickname Handling

To protect school students and prevent Cross-Site Scripting (XSS) or database corruption:

```
[User Input String]
        │
        ▼
[Trim & Normalize Unicode]
        │
        ▼
[Regex Validator: ^[a-zA-Z0-9_\-\s]{2,15}$] ─── (Fail) ──► [Reject: Invalid Characters]
        │
        ▼ (Pass)
[Profanity & Toxic Filter] ─────────────────── (Fail) ──► [Reject: Disallowed Nickname]
        │
        ▼ (Pass)
[DOM Context Escaping] ─────────────────────────────────► [Safe Render in React JSX]
```

### 2.1 Sanitization Rules
1. **Character Set Restrictions:** Only English alphanumeric characters, hyphens, underscores, and single spaces are accepted (`^[a-zA-Z0-9_\-\s]{2,15}$`). HTML control characters (`<`, `>`, `&`, `"`, `'`, `/`, `\`) are strictly forbidden.
2. **React Context Escaping:** All user-supplied nicknames are rendered as standard React text children (e.g., `<span>{participant.nickname}</span>`). React automatically escapes characters before insertion into the DOM, mitigating DOM-based XSS attacks.
3. **Profanity Filter:** A client-side dictionary of offensive, discriminatory, and inappropriate keywords is checked prior to registration. If flagged, the student is prompted: *"Please choose a friendly, creative gamer tag!"*

---

## 3. Score Validation & Manipulation Risks

### 3.1 Client-Side Vulnerability Assessment
Because BYTE BATTLE evaluates puzzle answers in the browser runtime:
- **Risk:** An advanced user could open the browser console and invoke internal functions or modify the `scores` table in IndexedDB directly.
- **Physical Event Mitigation:** The event laptop is operated under host supervision or locked in **Kiosk Mode** (Chrome `--kiosk` flag with `F12` disabled).
- **Algorithmic Sanity Bounds:** The scoring engine enforces hard ceiling limits:
  - An Easy puzzle score cannot exceed `BasePoints (500) + MaxTimeBonus (300) = 800`.
  - A game completed in $< 1.0$ second is flagged as biologically improbable and discarded.
  - Replays cannot submit negative point adjustments.

### 3.2 Optional Server-Side Verification (Supabase Edge Functions)
If BYTE BATTLE is deployed in an untrusted online environment where participants use their own devices, puzzle answers must **not** be validated client-side. Instead:
1. Puzzles are delivered without `canonicalSolution`.
2. The user's guess is submitted via an authenticated HTTPS POST to a Supabase Edge Function.
3. The server validates the solution against an unexposed database table, computes the score, and writes the verified attempt to PostgreSQL.

---

## 4. Supabase Row Level Security (RLS) Policies

When optional cloud synchronization is enabled, PostgreSQL tables must be guarded by strict **Row Level Security (RLS)**:

```sql
-- 1. Enable RLS on all tables
ALTER TABLE public.event_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

-- 2. Allow Public Read Access for Live Leaderboards
CREATE POLICY "Allow public read access to leaderboard scores"
ON public.game_scores FOR SELECT
TO anon
USING (is_valid = true);

-- 3. Restrict Score Insertion (Rate-limited, valid event check)
CREATE POLICY "Allow anon insert for active session participants"
ON public.game_scores FOR INSERT
TO anon
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.event_sessions
        WHERE id = event_id AND status = 'active'
    )
);

-- 4. Prohibit Score Deletions or Direct Updates by Clients
CREATE POLICY "Prevent public score modifications"
ON public.game_scores FOR UPDATE
TO anon
USING (false);

CREATE POLICY "Prevent public score deletions"
ON public.game_scores FOR DELETE
TO anon
USING (false);
```

---

## 5. Environment Variable Protection & Secret Management

1. **The `VITE_` Prefix Rule:**
   - Any environment variable starting with `VITE_` (e.g., `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) is statically injected into public JavaScript bundles during `npm run build`.
   - **Never store secret tokens** (e.g., `SUPABASE_SERVICE_ROLE_KEY`, AWS secrets, host master passwords) in files prefixed with `VITE_`.
2. **Repository Hygiene:**
   - `.env`, `.env.local`, and `.env.production` are strictly listed in `.gitignore`.
   - Only `.env.example` containing blank or dummy values is tracked in source control.

---

## 6. Privacy & Data Minimization (COPPA / GDPR Alignment)

Because BYTE BATTLE targets school-aged youth:
- **No Personal Data Collected:** We do not collect student names, birthdates, emails, phone numbers, or photos.
- **Session Ephemerality:** All event data is tied to a temporary session UUID.
- **Local Data Control:** Event hosts and players have complete sovereignty over data and can clear local history at any time.

### 6.1 Camera & Hand Gesture Privacy Safeguards (PalmDrive Rally)
PalmDrive Rally features optional webcam-based hand gesture controls (Open Palm = Accelerate, Closed Fist = Brake). To protect user privacy:
1. **100% Local In-Browser Processing:** Hand gestures are analyzed exclusively on the client machine using HTML5 Canvas pixel sampling and optical thresholding.
2. **Zero Media Storage:** Video streams and individual video frames are **never stored in IndexedDB, cookies, local storage, or temporary disk cache**.
3. **Zero Network Transmission:** Camera frames are strictly processed in volatile RAM. No image, video, or biometric landmark data is ever transmitted across a network or sent to remote servers.
4. **Explicit User Activation:** Camera access is never requested automatically upon loading the website or entering Settings. The browser camera prompt is triggered **only** when the user explicitly clicks "Enable Camera Controls" inside PalmDrive Rally or tests calibration in Settings.
5. **Clean Hardware Teardown:** Whenever the user toggles the camera off, navigates away from PalmDrive Rally, or closes the tab, all active `MediaStreamTrack` instances are immediately invoked with `.stop()`, ensuring the camera hardware indicator light turns off completely.
6. **Graceful Manual Fallback:** If camera permission is denied or no webcam is detected, the game seamlessly provides full keyboard and on-screen touch pedals with identical scoring rules.

---

## 7. Safe JSON and CSV Export (Formula Injection Defense)

When hosts export tournament results to CSV for spreadsheet software (Excel, Google Sheets, LibreOffice):
- **Vulnerability:** If a student registers a nickname starting with an formula operator (`=`, `+`, `-`, `@`), opening the CSV in Microsoft Excel could execute arbitrary system commands via dynamic data exchange (CSV Injection).
- **Mitigation:** The export engine prefixes any string starting with `=`, `+`, `-`, or `@` with a single apostrophe (`'`), forcing spreadsheet programs to treat the cell as raw text:
  ```typescript
  export function sanitizeCsvCell(cell: string | number): string {
    const str = String(cell);
    if (/^[=+\-@]/.test(str)) {
      return `"'${str.replace(/"/g, '""')}"`;
    }
    return `"${str.replace(/"/g, '""')}"`;
  }
  ```

---

## 8. Backup, Recovery & Event-Data Protection

1. **Pre-Event Local Backup:** Hosts should execute a test export prior to starting the official tournament.
2. **Post-Event USB Mirroring:** Immediately upon event conclusion, the host must download the `.json` and `.csv` files and copy them to a dedicated USB drive.
3. **Host PIN Protection:** Critical operations (deleting a session, purging scores, editing tournament parameters) require entry of the Host PIN.

---

## 9. Cross-References

- [Project Specification](PROJECT_SPEC.md) — Functional rules and participant identity models.
- [Data Model](DATA_MODEL.md) — IndexedDB and PostgreSQL schemas.
- [Event Runbook](EVENT_RUNBOOK.md) — Kiosk setup instructions and host procedures.
