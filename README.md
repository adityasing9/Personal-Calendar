# 🗓️ Life Command — Personal Life Calendar & Command Center PWA

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue?style=for-the-badge&logo=github)](https://adityasing9.github.io/Personal-Calendar/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable%20%26%20Offline-emerald?style=for-the-badge&logo=pwa)](https://adityasing9.github.io/Personal-Calendar/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](#)

> *"One place to remember everything that matters."*

**Life Command** is a modern, privacy-first, offline-ready **Personal Life Operating System & Productivity PWA**. Rather than just another static calendar clone, it acts as an action-oriented personal command center for your deadlines, college exams, coursework, project milestones, reminders, shopping, and cultural festivals.

🌐 **Live URL**: [https://adityasing9.github.io/Personal-Calendar/](https://adityasing9.github.io/Personal-Calendar/)

---

## ✨ Features & Highlights

### ⚡ 1. Action-Oriented Dashboard ("Needs Attention")
When you open the app, it immediately answers: *"What do I need to care about right now?"*
- **Overdue Detection & Resolution**: Automatically flags past-due items with instant actions: `[Complete]`, `[Move to Today]`, `[Tomorrow]`, or `[Pick Date]`.
- **Automatic Carry-Forward**: Configurable option to roll uncompleted tasks to the next day while preserving original deadline audit logs.
- **Due Today**: Time-sorted deadlines and critical items.
- **Chronological Today Timeline**: View and mark events completed on schedule.
- **Urgent Purchases**: High-priority shopping items due today.
- **Live Exam Countdowns**: Displays `EXAM TODAY`, `1 DAY LEFT`, or `X DAYS LEFT`.

---

### 📅 2. Dual Calendar System (Gregorian + Nepali Bikram Sambat BS)
- Accurate conversion between Gregorian dates and authentic **Nepali Bikram Sambat (BS)** (e.g. *October 8, 2026* ↔ *असोज २२, २०८३*).
- Subtle Devanagari numerals and month display in header, month cells, day drawer, agenda, and quick-add modals.
- Multiple views:
  - **Month View**: Overview with color-coded badges (Exams, Festivals, Events, Tasks).
  - **Week View**: 7-day schedule breakdown.
  - **Day View**: Detailed single-day agenda.
  - **Agenda View**: Chronological upcoming stream.

---

### 🎓 3. College & Academic Module
- **Subject Hub**: Track semesters, course codes (e.g. `DBMS CS301`), faculty, credits, syllabus, and revision notes.
- **Exam Countdown**: Covers `IA`, `Internal`, `Lab`, `Practical`, `SEE`, `Quiz`, `Viva`, and `Presentation`.
- **Preparation Tracker**: Keep track of study status (`Not Started`, `Revising`, `Ready`).

---

### 🚀 4. Project & Milestones Tracker
- Project workspace with start dates, hard deadlines, priorities, and automated progress percentage bars.
- Interactive milestone checklists that recalculate overall progress upon completion.
- Filter and view tasks linked to specific engineering/course projects.

---

### 🛒 5. Shopping & Purchases Manager
- Organized by urgency tiers:
  - 🔴 **Urgent**: Needed today
  - 🟡 **Soon**: This week
  - 🔵 **Later**: Eventually
  - ⚪ **Wishlist**: Optional / long-term desires
- Budget metrics: Track estimated budget versus actual money spent.

---

### 🪔 6. Festivals & Cultural Calendar
- Authentic **Indian** and **Nepali** festival dates (Dashain, Tihar, Diwali, Chhath, Holi, Teej, etc.) with cultural descriptions and holiday markers.
- Add your own custom institutional/college holidays.

---

### 🤖 7. Local AI Assistant & Natural Language Quick Add
- **100% On-Device & Zero Cloud Leak**: 0 bytes sent over the network; works completely offline.
- **Deterministic Natural Language Parser**: Type `"DBMS exam on Friday at 10 AM"` or `"Buy USB cable today"` to see a verified preview modal before saving.
- **Local Schedule Advisor**: Inquires your IndexedDB database directly to recommend next steps, summarize your week, or reschedule missed tasks.

---

### 🔔 8. Offline Reminder Center
- Web Audio harmonic chimes generated dynamically without audio asset downloads.
- Browser Web Notifications support.
- Snooze (+15m, +1h) and dismiss actions.

---

### 🔒 9. 100% Local-First Data & Privacy
- Powered by browser **IndexedDB** through **Dexie**.
- No account registration required.
- **Data Portability**: Full JSON backup export & validated import.
- **Danger Zone**: One-click wipe of all personal data with no automatic re-seeding.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4 |
| **Storage** | IndexedDB via Dexie & dexie-react-hooks |
| **PWA** | vite-plugin-pwa, Service Worker, Web App Manifest |
| **Date & Calendar** | `date-fns`, `nepali-date-converter` |
| **Icons & UI** | `lucide-react`, `canvas-confetti` |
| **Deployment** | GitHub Actions / GitHub Pages (`gh-pages`) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm, pnpm, or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/adityasing9/Personal-Calendar.git
cd Personal-Calendar

# Install dependencies
npm install

# Start local development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build & Production Preview
```bash
# Typecheck & build production bundle
npm run build

# Preview production build locally
npm run preview
```

### Deployment (GitHub Pages)
```bash
npm run deploy
```

---

## 📱 Progressive Web App (PWA) Installation

### Desktop (Windows, macOS, Linux)
1. Open the [Live App](https://adityasing9.github.io/Personal-Calendar/) in Chrome, Edge, or Brave.
2. Click the **Install** icon in the address bar (or Menu → *Install Life Command*).
3. The app will launch in an isolated native window with full offline caching.

### Android / iOS Mobile
1. Open in Chrome or Safari.
2. Tap **Menu (⋮ or Share icon)** → **Add to Home screen** / **Install app**.
3. Use like a native mobile app directly from your home screen.

---

## ⌨️ Useful Shortcuts

- `Ctrl + K` or `Cmd + K`: Global Instant Search across all entities
- `Esc`: Close any active modal, drawer, or search window

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
