# 📚 StudyFlow — Smart Study Timetable & Planner

A modern, responsive, and intuitive web application designed for students and self-learners to easily plan, track, and manage their study timetable.

---

## 🌟 Key Features

1. **Interactive Weekly Timetable Grid**
   - Visual time slots from 7:00 AM to 10:00 PM across Monday through Sunday.
   - Color-coded subject blocks with start/end times, topics, and priority tags.
   - Highlights the current day and past/present slots.
   - Hover cards for quick inline actions: **Mark Completed**, **Edit**, or **Delete**.

2. **Daily Agenda View**
   - Clean, grouped list view by day.
   - Interactive completion checkboxes.
   - Filter by day or view all days simultaneously.

3. **Built-in Pomodoro Study Timer**
   - 25-minute Focus / 5-minute Short Break / 15-minute Long Break modes.
   - Circular SVG animated countdown timer.
   - Subject selector to focus on specific timetable subjects.
   - Harmonic audio bell chime on completion via the Web Audio API (no external sound files required).
   - Pomodoro cycle tracker.

4. **Session Management (CRUD)**
   - Add new study sessions with Subject, Day of week, Start & End times, Chapter/Topics, Priority (High/Medium/Low), Notes, and Color theme presets.
   - Edit any existing session with pre-filled details.
   - Remove sessions with confirmation.

5. **Local Storage & Data Portability**
   - Auto-saves all schedules directly in your browser's `localStorage` — no login or database server required.
   - **Export as JSON**: Backup your study schedule anytime.
   - **Import from JSON**: Restore or transfer your schedule across devices.
   - **Sample Data Pre-loaded**: Instant preview with a realistic student timetable.

6. **Print & Dark Mode Support**
   - One-click print stylesheet formatted specifically for clean A4/Letter paper printouts.
   - Elegant dark/light mode toggle that respects your preference.

---

## 🚀 How to Run the Website

### Option 1: Direct Browser Launch
Simply double-click or open `index.html` in any web browser (Chrome, Edge, Firefox, Safari):
```powershell
Start-Process "C:\Users\RAJ KIRAN\.gemini\antigravity\scratch\study-timetable\index.html"
```

### Option 2: Local HTTP Server (Optional)
If you prefer running via a local server (e.g., using Python or Node):
```powershell
cd "C:\Users\RAJ KIRAN\.gemini\antigravity\scratch\study-timetable"
python -m http.server 3000
```
Then visit `http://localhost:3000` in your browser.

---

## 📁 Project Structure

```
study-timetable/
├── index.html     # Semantic HTML5 layout and modal structure
├── style.css      # Modern responsive styling, dark/light themes, print stylesheet
├── app.js         # State management, grid calculations, Pomodoro timer & Web Audio
└── README.md      # Documentation & quick start guide
```
