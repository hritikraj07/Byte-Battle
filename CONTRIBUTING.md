# Contributing to BYTE BATTLE

Thank you for your interest in contributing to **BYTE BATTLE**! We welcome bug reports, gameplay ideas, performance enhancements, and code contributions.

---

## Code of Conduct

Please be respectful, constructive, and collaborative in all issues, discussions, and pull requests.

---

## Local Development Workflow

1. **Fork and Clone the Repository:**
   ```bash
   git clone https://github.com/hritikraj07/BYTE-BATTLE.git
   cd BYTE-BATTLE
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the arcade locally.

4. **Run Verification & Test Suites:**
   ```bash
   # Run Vitest test runner
   npm test

   # Run Next.js production build verification
   npm run build
   ```

---

## Guidelines for Contributions

- **Preserve Core Identity & Performance:** Keep game engines modular, deterministic, and pure. Separation of engine calculation logic from UI rendering allows 100% test coverage.
- **Offline-First Directive:** Never introduce runtime fonts, libraries, or APIs that fail when an internet connection is absent. All client data must persist via browser-native IndexedDB (`Dexie.js`).
- **No Unhandled Promises or Secrets:** Always wrap database operations in `try/catch` handlers. Never commit credentials, API keys, or `.env` files.
- **Strict Typing:** TypeScript strict mode is enforced throughout the codebase. Avoid `any`.

---

## Reporting Issues & Feature Proposals

- Open an issue on GitHub describing the bug with steps to reproduce and system details.
- For new mini-games or arcade modes, provide game rules, scoring logic, and asset considerations in the issue before submitting a PR.
