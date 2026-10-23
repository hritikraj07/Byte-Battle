# EVENT_RUNBOOK.md — Event-Day Field Operating Guide

> **Operational Scenario:** High-energy school STEM competition or university outreach workshop where **exactly one laptop is available, students have no phones, and internet access is unavailable or unreliable.**  
> **Host Role:** 1 Event Coordinator / Facilitator managing rotation and projector display.  

---

## 1. Golden Rules of the Single-Laptop Arena

1. **Never Rely on Venue Wi-Fi:** Always assume zero internet access. Ensure the app is pre-cached and verified offline before the first student arrives.
2. **One Laptop, Infinite Energy:** The laptop sits at the center table or kiosk stand. Students rotate in a rapid, structured queue (2–3 minutes per player).
3. **Dual Screen / Extended Mode is King:** When an external projector or TV is available, configure your laptop display to **Extend Desktop**. Keep host controls on the laptop screen and live spectator leaderboards on the projector.
4. **Immediate Backup:** Always export session results to a physical USB thumb drive immediately after the awards ceremony.

---

## 2. Pre-Event Preparation Checklist

### 24 Hours Prior to Event
- [ ] Ensure Node.js and dependencies are installed on the event laptop.
- [ ] Run `npm run build` to verify that production bundles compile without errors.
- [ ] Open the application in Google Chrome or Edge.
- [ ] Turn off Wi-Fi on the laptop and perform a full test play of all six games in offline mode.
- [ ] Pack hardware essentials:
  - Laptop power adapter (mains charger).
  - External HDMI or USB-C display adapter for the projector.
  - USB thumb drive for data backups.
  - External USB mouse (faster and more intuitive for students than a laptop trackpad).

### 2 Hours Prior to Event (Venue Setup)
- [ ] Connect laptop to AC mains power (do not run on battery power).
- [ ] Connect external mouse to the laptop.
- [ ] Connect HDMI cable to projector/TV.
- [ ] Disable operating system sleep, screen savers, and automatic updates:
  - *Windows:* Settings → System → Power & Sleep → Screen & Sleep: set to **Never**.
  - *Windows:* Turn on **Focus Assist** / **Do Not Disturb** to block popup notifications.
- [ ] Open dedicated Chrome/Edge profile.
- [ ] Launch BYTE BATTLE at `http://localhost:3000`.
- [ ] Verify audio volume is set to a comfortable level (40–50%).

---

## 3. Display Configuration: Projector & Dual-Screen Setup

### 3.1 Extended Desktop Setup (Recommended)
1. Press `Windows Key + P` and select **Extend**.
2. On your primary laptop screen:
   - Keep the main tournament window open at `http://localhost:3000/event` (where students register and play).
3. Open a secondary browser window:
   - Navigate to `http://localhost:3000/host/display`.
   - Drag this window over to the extended projector display.
   - Press `F11` to make the projector display fullscreen.
4. **Result:** The projector continuously displays auto-scrolling leaderboards across all games and live tournament standings, while students play on the laptop screen without revealing host controls.

### 3.2 Single-Screen Setup (If No Projector is Available)
If running without a secondary screen:
- Students play directly on the laptop screen.
- After each student finishes their turn, the screen displays a summary showing their newly earned score and rank before returning to the player selection screen.
- The host or student can tap the in-game Leaderboard button at any time to view the dedicated standings.

---

## 4. Host Workflow & Student Turn-Taking Protocol

```
[Student in Queue Approaches Table]
               │
               ▼
[Host Clicks "Next Player" or Student Enters Nickname]
               │
               ▼
[Student Selects Game Arena (or Tournament Circuit)]
               │
               ▼
[Student Plays Timed Round (60 - 120 Seconds)]
               │
               ▼
[Instant Score Screen + Confetti Animation]
               │
               ▼
[Host Clicks "Submit & Finish Turn"] ───► [IndexedDB Persists Score]
               │                         [Leaderboard Updates]
               ▼
[Screen Resets for Next Student]
```

### Step 1: Initializing the Session
1. Click **Host Panel** in the top navigation bar.
2. Enter Host PIN (`1234` or custom PIN).
3. Click **Start New Session**.
4. Enter Event Title: e.g., `Oak Creek High Tech Battle 2026`.
5. Click **Launch Kiosk Arena**.

### Step 2: Student Registration (30 Seconds)
1. Invite the next student in line to the laptop.
2. Prompt: *"Type in your gamer tag! Keep it clean and creative."*
3. Student types nickname (e.g., `CyberTiger_42`).
4. Click **Enter Arena**.

### Step 3: Game Execution (60–120 Seconds)
1. Student selects their arena:
   - **Pattern Shift:** 60 seconds (Sequence prediction).
   - **Word Weave:** 90 seconds (Tech terminology & word ladders).
   - **Code Cracker:** 120 seconds (Deduction & cryptanalysis).
   - **Grid Tactician:** 120 seconds (Matrix constraint solving).
2. The student plays using the external mouse or keyboard.
3. The host encourages spectators watching the projector.

### Step 4: Round Completion & Handover (15 Seconds)
1. Round ends upon correct answer or timer expiration.
2. The screen displays awarded points, time bonus, and new rank.
3. The student sees their rank updated on the projector leaderboard.
4. Click **Next Player** button. The session is cleared, ready for the next student.

---

## 5. Leaderboard Navigation & Display Views

The host can cycle through five distinct leaderboards on screen or projector:

- **Key `1` or Click "Overall":** Shows cumulative tournament standings (sum of best scores in each game).
- **Key `2` or Click "Pattern":** Shows top scores in Pattern Shift.
- **Key `3` or Click "Weave":** Shows top scores in Word Weave.
- **Key `4` or Click "Cracker":** Shows top scores in Code Cracker.
- **Key `5` or Click "Grid":** Shows top scores in Grid Tactician.
- **Projector Auto-Cycle:** In projector mode, the display automatically transitions between the Overall board (visible for 20 seconds) and each individual arena board (visible for 10 seconds each).

---

## 6. Emergency & Crash Handling Procedures

### Scenario A: A Student Accidentally Closes or Refreshes the Browser
- **Action:** Simply reopen Chrome and navigate to `http://localhost:5173`.
- **Why It's Safe:** All prior completed scores are permanently stored in IndexedDB. Nothing is lost. If a round was in progress, the recovery engine detects the active turn in `sessionStorage` and offers to resume.

### Scenario B: Laptop Loses Power or Unexpectedly Reboots
1. Reconnect power cable immediately and turn on laptop.
2. Launch Chrome/Edge.
3. Open `http://localhost:5173`.
4. Open the Host Panel. All session data, registered participants, and completed scores are fully restored from IndexedDB.

### Scenario C: Two Students Tie for Top Score
- **Resolution:** The system automatically sorts tied scores using:
  1. Lowest total solve time across best attempts.
  2. Smallest cumulative hints used.
  3. Earliest completion timestamp.
- Announce the tie-breaker criteria transparently to the room.

---

## 7. End-of-Event Data Export & Backup

Immediately after the final student plays and before shutting down the laptop:

1. Press `Ctrl + Shift + H` or click **Host Panel**.
2. Enter Host PIN.
3. Click **Export Tournament Results (CSV)**:
   - A file named `ByteBattle_Results_[SessionID].csv` downloads automatically.
4. Click **Export Full Session (JSON)**:
   - A file named `ByteBattle_Session_[SessionID].json` downloads automatically.
5. Insert your USB thumb drive and copy both downloaded files onto the drive.
6. Open the CSV file in Excel or Notepad to verify that all participant names, scores, and timestamps are present.

---

## 8. Resetting Data Between Batches or New Events

To start fresh for a new school or afternoon session without mixing data:
1. Open the Host Panel.
2. Confirm the previous session has been exported to CSV/USB.
3. Click **End Current Session**.
4. Enter Host PIN to confirm:
   - Click **Archive & Clear Active Session**.
5. The leaderboards reset to empty, and the system is ready to launch a new tournament.

---

## 9. End-of-Day Shutdown Checklist

- [ ] All session files exported to CSV and backed up on USB drive.
- [ ] Final winners announced and photographed with projector podium.
- [ ] Projector turned off via remote control (allow fan cooling).
- [ ] HDMI and mouse cables safely disconnected and packed.
- [ ] Laptop closed and power adapter packed.

---

## 10. Cross-References

- [Project Specification](PROJECT_SPEC.md) — Scoring formulas and event rules.
- [Data Model](DATA_MODEL.md) — CSV columns and schema definitions.
- [Testing Guide](TESTING.md) — Pre-event 15-point regression checklist.
