# Life Command — Personal Life Calendar & Command Center PWA

A modern, privacy-focused, offline-first **Personal Life Calendar & Productivity Operating System** built with React, TypeScript, Tailwind CSS, Dexie (IndexedDB), and Vite PWA.

> *"One place to remember everything that matters."*

---

## 🌟 Key Highlights & Architecture

- **100% Local-First & Privacy Guaranteed**: All events, tasks, notes, exams, projects, and shopping items remain strictly on your device inside browser **IndexedDB** using Dexie. Zero tracking, no compulsory cloud account or registration required.
- **Action-Oriented Home Command Center**: Immediately answers *"What do I need to care about right now?"*:
  - **Overdue Attention**: High-priority alert banner with quick actions (`[Complete]`, `[Move to Today]`, `[Tomorrow]`, `[Pick Date]`, `[Keep Overdue]`).
  - **Due Today**: Live deadlines with time countdowns.
  - **Today's Timeline**: Chronological schedule for today with status toggle and location details.
  - **Live Countdowns**: College exam countdown cards (`EXAM TODAY`, `X DAYS LEFT`).
  - **Urgent Purchases**: Shopping items needed today.
  - **Upcoming Festivals**: Upcoming Indian & Nepali cultural celebrations.
- **Dual Gregorian & Nepali Calendar (बिक्रम सम्बत BS)**:
  - Accurate Bikram Sambat conversion matching authentic calendar tables (`October 8, 2026` ↔ `असोज २२, २०८३`).
  - Dual date display in Header, Day Cells, Agenda, Festivals, and Quick Add.
- **College & Academic Module**:
  - Enrolled subjects with credits, faculty, syllabus, and course notes.
  - Exam management with countdowns (`IA`, `Internal`, `Lab`, `Practical`, `SEE`, `Viva`, `Presentation`).
  - Preparation status tracking (`Not Started`, `Revising`, `Ready`).
- **Project & Milestones Tracker**:
  - Codebases and projects (e.g. StudyAI, AutoFlow) with progress bars, milestone checklists, and deadline countdowns.
- **Shopping Urgency Tiers**:
  - **Urgent** (Buy today), **Soon** (Buy this week), **Later** (Buy eventually), and **Wishlist**.
  - Budget calculations (Estimated cost vs Actual spend).
- **Internal Reminder Center**:
  - Works offline with Web Audio synthesized double chimes.
  - Snooze (+15m, +1h, tomorrow), dismiss, and browser Web Notifications.
- **Local AI Assistant & Natural Language Quick Add**:
  - Natural Language parser (e.g., `"DBMS exam on October 14 at 10 AM"`, `"Buy USB-C cable today"`).
  - Displays structured preview modal for confirmation **before saving**.
  - Local schedule advisor that analyzes real database state with 0 bytes sent over the network.
- **Data Safety & Portability**:
  - Full portable JSON backup export.
  - Safe restore with schema validation and entity summary preview.
  - One-click sample demo data reload and safe removal.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn / pnpm

### Development

Run the development server:

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Production Build & PWA Testing

To create the production PWA bundle with service workers and offline caching:

```bash
npm run build
npm run preview
```

---

## 📱 PWA Installation

### Windows / macOS / Linux Desktop
1. Open the application in Chrome, Edge, or Brave.
2. Click the **Install** button in the address bar (or Menu → *Install Life Command*).
3. The application will launch in its own dedicated, native-like window with offline support.

### Android
1. Open in Google Chrome or any Chromium browser.
2. Tap the three dots menu (⋮) → **Add to Home screen** or **Install app**.
3. Launch from your home screen as a standalone application.

---

## ⌨️ Keyboard Shortcuts

- `Ctrl + K` / `Cmd + K`: Open Global Instant Search
- `Esc`: Close any active modal or day panel

---

## 🛡️ Privacy Guarantee

Your data never leaves your device:
- Stored locally in browser **IndexedDB** (`PersonalLifeCalendarDB`).
- No external analytics, no tracking cookies, no background cloud synchronizers.
- All AI queries by default execute via the local rule-based scheduling engine without external API calls.
