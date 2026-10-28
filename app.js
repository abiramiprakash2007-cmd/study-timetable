/**
 * StudyFlow — Interactive Study Timetable & Planner Application
 */

// Available Color Themes for Sessions
const COLOR_PRESETS = [
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Sky Blue', hex: '#0284c7' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Amber', hex: '#d97706' },
  { name: 'Purple', hex: '#9333ea' },
  { name: 'Teal', hex: '#0d9488' },
  { name: 'Orange', hex: '#ea580c' }
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Grid hours: 7:00 AM to 10:00 PM (22:00)
const GRID_START_HOUR = 7;
const GRID_END_HOUR = 22;
const HOUR_ROW_HEIGHT = 70; // px per hour in grid

// Default Initial Sample Data
const DEFAULT_SESSIONS = [
  {
    id: 's-1',
    subject: 'Mathematics & Calculus',
    day: 'Monday',
    startTime: '08:30',
    endTime: '10:00',
    topic: 'Differential Equations & Problem Set 3',
    priority: 'High',
    color: '#6366f1',
    notes: 'Textbook page 142. Bring scientific calculator.',
    completed: false
  },
  {
    id: 's-2',
    subject: 'Physics: Mechanics',
    day: 'Monday',
    startTime: '11:00',
    endTime: '12:30',
    topic: 'Rotational Dynamics & Torque Exercises',
    priority: 'High',
    color: '#0284c7',
    notes: 'Review lab results before lecture.',
    completed: true
  },
  {
    id: 's-3',
    subject: 'Computer Science',
    day: 'Tuesday',
    startTime: '09:00',
    endTime: '11:00',
    topic: 'Binary Search Trees & Graph Algorithms',
    priority: 'High',
    color: '#10b981',
    notes: 'Implement DFS and BFS in Python.',
    completed: false
  },
  {
    id: 's-4',
    subject: 'Organic Chemistry',
    day: 'Tuesday',
    startTime: '14:00',
    endTime: '15:30',
    topic: 'Reaction Mechanisms: Aldehydes & Ketones',
    priority: 'Medium',
    color: '#d97706',
    notes: 'Flashcards on functional groups.',
    completed: false
  },
  {
    id: 's-5',
    subject: 'World Literature',
    day: 'Wednesday',
    startTime: '10:00',
    endTime: '11:30',
    topic: 'Essay Outline & Comparative Analysis',
    priority: 'Medium',
    color: '#9333ea',
    notes: 'Draft thesis statement for assignment.',
    completed: false
  },
  {
    id: 's-6',
    subject: 'Mathematics Revision',
    day: 'Wednesday',
    startTime: '15:00',
    endTime: '16:30',
    topic: 'Integration by Parts practice test',
    priority: 'High',
    color: '#6366f1',
    notes: 'Mock test timing under 45 minutes.',
    completed: false
  },
  {
    id: 's-7',
    subject: 'Data Structures Lab',
    day: 'Thursday',
    startTime: '09:30',
    endTime: '11:30',
    topic: 'Hash Maps & Collision Resolution',
    priority: 'High',
    color: '#10b981',
    notes: 'Submit lab report by Friday morning.',
    completed: false
  },
  {
    id: 's-8',
    subject: 'History & Governance',
    day: 'Thursday',
    startTime: '13:00',
    endTime: '14:30',
    topic: 'Constitutional Reforms & Timelines',
    priority: 'Low',
    color: '#ea580c',
    notes: 'Summarize Chapter 6 timeline.',
    completed: false
  },
  {
    id: 's-9',
    subject: 'Physics Lab Prep',
    day: 'Friday',
    startTime: '10:00',
    endTime: '12:00',
    topic: 'Wave Optics & Interference experiments',
    priority: 'High',
    color: '#0284c7',
    notes: 'Review optical bench instructions.',
    completed: false
  },
  {
    id: 's-10',
    subject: 'Language Practice',
    day: 'Saturday',
    startTime: '10:00',
    endTime: '11:30',
    topic: 'Vocabulary Drills & Listening Comprehension',
    priority: 'Low',
    color: '#0d9488',
    notes: 'Podcast episode 12 discussion.',
    completed: false
  },
  {
    id: 's-11',
    subject: 'Weekly Review & Quiz',
    day: 'Sunday',
    startTime: '16:00',
    endTime: '18:00',
    topic: 'Self-assessment quiz & plan next week',
    priority: 'High',
    color: '#f43f5e',
    notes: 'Review mistaken quiz questions.',
    completed: false
  }
];

// App State
let sessions = [];
let activeView = 'weekly';
let searchQuery = '';
let selectedDayFilter = 'all';

// Audio Context for Chimes (Web Audio API)
let audioCtx = null;
function playChime(isBreak = false) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    // Harmonic chords
    const freq = isBreak ? 587.33 : 880.0; // D5 or A5
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.3);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.start(now);
    osc.stop(now + 1.2);
  } catch (e) {
    console.warn('Audio chime unsupported or blocked', e);
  }
}

// Storage Helpers
function loadSessions() {
  const data = localStorage.getItem('studyflow_sessions');
  if (data) {
    try {
      sessions = JSON.parse(data);
    } catch (e) {
      sessions = [...DEFAULT_SESSIONS];
    }
  } else {
    sessions = [...DEFAULT_SESSIONS];
    saveSessions();
  }
}

function saveSessions() {
  localStorage.setItem('studyflow_sessions', JSON.stringify(sessions));
}

// DOM Elements
const weeklyGridEl = document.getElementById('weeklyGrid');
const agendaListEl = document.getElementById('agendaList');
const sessionModalEl = document.getElementById('sessionModal');
const sessionFormEl = document.getElementById('sessionForm');
const modalTitleEl = document.getElementById('modalTitle');
const addSessionBtn = document.getElementById('addSessionBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const printBtn = document.getElementById('printBtn');
const liveClockEl = document.getElementById('liveClock');
const headerDateTextEl = document.getElementById('headerDateText');
const searchInputEl = document.getElementById('searchInput');
const dayFilterSelect = document.getElementById('dayFilterSelect');
const backupMenuBtn = document.getElementById('backupMenuBtn');
const backupMenu = document.getElementById('backupMenu');
const exportJsonBtn = document.getElementById('exportJsonBtn');
const importJsonInput = document.getElementById('importJsonInput');
const loadSampleBtn = document.getElementById('loadSampleBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const toastContainer = document.getElementById('toastContainer');

// Stats Elements
const statTotalSlotsEl = document.getElementById('statTotalSlots');
const statTotalHoursEl = document.getElementById('statTotalHours');
const statCompletedEl = document.getElementById('statCompleted');
const statTodaySessionsEl = document.getElementById('statTodaySessions');

// Helper: Show Toast
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'danger') icon = 'fa-triangle-exclamation';

  toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Live Clock & Date Update
function updateLiveClock() {
  const now = new Date();
  liveClockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  headerDateTextEl.textContent = now.toLocaleDateString(undefined, options);
}
setInterval(updateLiveClock, 1000);
updateLiveClock();

// Theme Setup
function initTheme() {
  const savedTheme = localStorage.getItem('studyflow_theme') || 'light';
  document.body.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
  const icon = themeToggleBtn.querySelector('i');
  if (theme === 'dark') {
    icon.className = 'fa-solid fa-sun';
  } else {
    icon.className = 'fa-solid fa-moon';
  }
}

themeToggleBtn.addEventListener('click', () => {
  const currentTheme = document.body.getAttribute('data-theme');
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', nextTheme);
  localStorage.setItem('studyflow_theme', nextTheme);
  updateThemeIcon(nextTheme);
});

// Color Picker Swatches
function setupColorPicker() {
  const pickerEl = document.getElementById('colorPicker');
  pickerEl.innerHTML = '';
  const hiddenColorInput = document.getElementById('selectedColor');

  COLOR_PRESETS.forEach((preset, index) => {
    const swatch = document.createElement('div');
    swatch.className = `color-swatch ${index === 0 ? 'selected' : ''}`;
    swatch.style.backgroundColor = preset.hex;
    swatch.title = preset.name;
    swatch.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      swatch.classList.add('selected');
      hiddenColorInput.value = preset.hex;
    });
    pickerEl.appendChild(swatch);
  });
}

function selectColorInPicker(hex) {
  const hiddenColorInput = document.getElementById('selectedColor');
  hiddenColorInput.value = hex;
  const swatches = document.querySelectorAll('.color-swatch');
  swatches.forEach(s => {
    if (s.style.backgroundColor === hex || rgbToHex(s.style.backgroundColor) === hex.toLowerCase()) {
      s.classList.add('selected');
    } else {
      s.classList.remove('selected');
    }
  });
}

function rgbToHex(rgb) {
  if (!rgb || !rgb.startsWith('rgb')) return rgb;
  const parts = rgb.match(/\d+/g);
  if (!parts || parts.length < 3) return rgb;
  return "#" + parts.slice(0, 3).map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
}

// Convert "HH:MM" to float hour (e.g. "09:30" => 9.5)
function timeToDecimal(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h + m / 60;
}

// Format "HH:MM" to 12-hour format e.g. "9:30 AM"
function formatTime12(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, '0')} ${suffix}`;
}

// Stats Calculation
function updateStats() {
  statTotalSlotsEl.textContent = sessions.length;

  let totalHours = 0;
  let completedCount = 0;
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  let todaySessionsCount = 0;

  sessions.forEach(s => {
    const start = timeToDecimal(s.startTime);
    const end = timeToDecimal(s.endTime);
    if (end > start) {
      totalHours += (end - start);
    }
    if (s.completed) completedCount++;
    if (s.day === todayName) todaySessionsCount++;
  });

  statTotalHoursEl.textContent = `${totalHours.toFixed(1)}h`;
  statCompletedEl.textContent = `${completedCount} / ${sessions.length}`;
  statTodaySessionsEl.textContent = `${todaySessionsCount} sessions`;

  updatePomoTaskDropdown();
}

// Populate Pomodoro Subject Select
function updatePomoTaskDropdown() {
  const pomoSelect = document.getElementById('pomoTaskSelect');
  if (!pomoSelect) return;

  const currentVal = pomoSelect.value;
  pomoSelect.innerHTML = '<option value="General Study">🎯 General Study Session</option>';

  const uniqueSubjects = [...new Set(sessions.map(s => s.subject))];
  uniqueSubjects.forEach(subject => {
    const opt = document.createElement('option');
    opt.value = subject;
    opt.textContent = `📚 ${subject}`;
    pomoSelect.appendChild(opt);
  });

  if (currentVal) pomoSelect.value = currentVal;
}

// RENDER VIEW 1: Weekly Grid
function renderWeeklyGrid() {
  weeklyGridEl.innerHTML = '';

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // 1. Time Column
  const timeCol = document.createElement('div');
  timeCol.className = 'grid-time-column';

  const timeHeader = document.createElement('div');
  timeHeader.className = 'grid-header-cell';
  timeHeader.textContent = 'Time';
  timeCol.appendChild(timeHeader);

  for (let hour = GRID_START_HOUR; hour <= GRID_END_HOUR; hour++) {
    const slot = document.createElement('div');
    slot.className = 'time-slot-label';
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    slot.textContent = `${displayHour} ${suffix}`;
    timeCol.appendChild(slot);
  }
  weeklyGridEl.appendChild(timeCol);

  // 2. Day Columns
  DAYS_OF_WEEK.forEach(day => {
    const dayCol = document.createElement('div');
    const isToday = day === todayName;
    dayCol.className = `grid-day-column ${isToday ? 'today-col' : ''}`;
    dayCol.dataset.day = day;

    // Header
    const dayHeader = document.createElement('div');
    dayHeader.className = `grid-header-cell ${isToday ? 'today-col-header' : ''}`;
    dayHeader.innerHTML = `<span>${day.slice(0, 3)}</span> ${isToday ? '<small style="display:block;font-size:0.65rem;">(Today)</small>' : ''}`;
    dayCol.appendChild(dayHeader);

    // Guide lines
    for (let hour = GRID_START_HOUR; hour <= GRID_END_HOUR; hour++) {
      const guide = document.createElement('div');
      guide.className = 'day-hour-guide';
      dayCol.appendChild(guide);
    }

    // Filter sessions for this day & search query
    const daySessions = sessions.filter(s => {
      if (s.day !== day) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.subject.toLowerCase().includes(q) ||
        (s.topic && s.topic.toLowerCase().includes(q)) ||
        (s.notes && s.notes.toLowerCase().includes(q))
      );
    });

    // Render session cards into day column
    daySessions.forEach(session => {
      const startDec = timeToDecimal(session.startTime);
      const endDec = timeToDecimal(session.endTime);

      // Clamp within grid limits
      const validStart = Math.max(startDec, GRID_START_HOUR);
      const validEnd = Math.min(endDec, GRID_END_HOUR + 1);

      if (validEnd <= validStart) return;

      // Calculate position: header height is approx 55px
      const headerOffset = 55;
      const topPx = headerOffset + (validStart - GRID_START_HOUR) * HOUR_ROW_HEIGHT;
      const heightPx = Math.max((validEnd - validStart) * HOUR_ROW_HEIGHT - 6, 36);

      const card = document.createElement('div');
      card.className = `session-card ${session.completed ? 'completed' : ''}`;
      card.style.top = `${topPx}px`;
      card.style.height = `${heightPx}px`;
      card.style.backgroundColor = session.color || '#6366f1';

      card.innerHTML = `
        <div class="session-card-header">
          <span class="card-time">${formatTime12(session.startTime)} - ${formatTime12(session.endTime)}</span>
          <div class="card-action-btns">
            <button class="card-mini-btn" title="Toggle Complete" data-action="toggle" data-id="${session.id}">
              <i class="fa-solid ${session.completed ? 'fa-rotate-left' : 'fa-check'}"></i>
            </button>
            <button class="card-mini-btn" title="Edit" data-action="edit" data-id="${session.id}">
              <i class="fa-solid fa-pencil"></i>
            </button>
            <button class="card-mini-btn" title="Delete" data-action="delete" data-id="${session.id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
        <div>
          <div class="card-subject">${escapeHtml(session.subject)}</div>
          ${session.topic ? `<div class="card-topic">${escapeHtml(session.topic)}</div>` : ''}
        </div>
        <div class="card-footer">
          <span class="priority-badge">${getPriorityIcon(session.priority)} ${session.priority}</span>
          ${session.completed ? '<span style="font-size:0.65rem;font-weight:700;"><i class="fa-solid fa-circle-check"></i> Done</span>' : ''}
        </div>
      `;

      // Event delegation for actions inside card
      card.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (btn) {
          e.stopPropagation();
          const action = btn.dataset.action;
          const id = btn.dataset.id;
          handleSessionAction(action, id);
        } else {
          // Open edit modal on card click
          openEditModal(session.id);
        }
      });

      dayCol.appendChild(card);
    });

    weeklyGridEl.appendChild(dayCol);
  });
}

// RENDER VIEW 2: Agenda List
function renderAgendaList() {
  agendaListEl.innerHTML = '';

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const daysToRender = selectedDayFilter === 'all' ? DAYS_OF_WEEK : [selectedDayFilter];

  let renderedAny = false;

  daysToRender.forEach(day => {
    let daySessions = sessions.filter(s => s.day === day);

    // Apply search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      daySessions = daySessions.filter(s =>
        s.subject.toLowerCase().includes(q) ||
        (s.topic && s.topic.toLowerCase().includes(q)) ||
        (s.notes && s.notes.toLowerCase().includes(q))
      );
    }

    // Sort by startTime
    daySessions.sort((a, b) => timeToDecimal(a.startTime) - timeToDecimal(b.startTime));

    const isToday = day === todayName;

    const dayCard = document.createElement('div');
    dayCard.className = 'agenda-day-card';

    dayCard.innerHTML = `
      <div class="agenda-day-header">
        <div class="agenda-day-title">
          <span>${day}</span>
          ${isToday ? '<span class="agenda-day-badge">Today</span>' : ''}
        </div>
        <span style="font-size: 0.8rem; color: var(--text-muted); font-weight:600;">
          ${daySessions.length} ${daySessions.length === 1 ? 'session' : 'sessions'}
        </span>
      </div>
      <div class="agenda-items-list" id="agendaItems-${day}">
      </div>
    `;

    const itemsContainer = dayCard.querySelector(`#agendaItems-${day}`);

    if (daySessions.length === 0) {
      itemsContainer.innerHTML = `<div class="empty-day-state"><i class="fa-regular fa-calendar-xmark" style="font-size:1.5rem;margin-bottom:0.4rem;display:block;"></i>No study sessions scheduled for ${day}</div>`;
    } else {
      renderedAny = true;
      daySessions.forEach(session => {
        const item = document.createElement('div');
        item.className = `agenda-item ${session.completed ? 'completed' : ''}`;

        item.innerHTML = `
          <div class="agenda-item-left">
            <input type="checkbox" class="agenda-checkbox" ${session.completed ? 'checked' : ''} data-id="${session.id}">
            <div class="agenda-color-pill" style="background-color: ${session.color || '#6366f1'};"></div>
            <div class="agenda-item-details">
              <span class="agenda-item-title">${escapeHtml(session.subject)}</span>
              <span class="agenda-item-sub">
                ${session.topic ? escapeHtml(session.topic) + ' • ' : ''}
                <strong style="color:var(--text-primary);">${getPriorityIcon(session.priority)} ${session.priority} Priority</strong>
                ${session.notes ? ` • <em>${escapeHtml(session.notes)}</em>` : ''}
              </span>
            </div>
          </div>
          <div class="agenda-item-right">
            <div class="agenda-time-chip">
              <i class="fa-regular fa-clock"></i>
              <span>${formatTime12(session.startTime)} - ${formatTime12(session.endTime)}</span>
            </div>
            <div class="agenda-action-btns">
              <button class="icon-btn" title="Edit" data-action="edit" data-id="${session.id}">
                <i class="fa-solid fa-pencil"></i>
              </button>
              <button class="icon-btn text-danger" title="Delete" data-action="delete" data-id="${session.id}">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        `;

        // Checkbox click
        const checkbox = item.querySelector('.agenda-checkbox');
        checkbox.addEventListener('change', () => {
          toggleComplete(session.id);
        });

        // Action buttons
        item.querySelectorAll('button[data-action]').forEach(btn => {
          btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            const id = btn.dataset.id;
            handleSessionAction(action, id);
          });
        });

        itemsContainer.appendChild(item);
      });
    }

    agendaListEl.appendChild(dayCard);
  });
}

// Helpers
function getPriorityIcon(priority) {
  if (priority === 'High') return '🔴';
  if (priority === 'Medium') return '🟡';
  return '🟢';
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}

// Action Handlers
function handleSessionAction(action, id) {
  if (action === 'toggle') {
    toggleComplete(id);
  } else if (action === 'edit') {
    openEditModal(id);
  } else if (action === 'delete') {
    deleteSession(id);
  }
}

function toggleComplete(id) {
  const session = sessions.find(s => s.id === id);
  if (session) {
    session.completed = !session.completed;
    saveSessions();
    renderAll();
    showToast(session.completed ? `Completed "${session.subject}"!` : `Marked "${session.subject}" active`, 'success');
  }
}

function deleteSession(id) {
  const session = sessions.find(s => s.id === id);
  const name = session ? session.subject : 'Session';
  if (confirm(`Are you sure you want to delete "${name}"?`)) {
    sessions = sessions.filter(s => s.id !== id);
    saveSessions();
    renderAll();
    showToast(`Deleted "${name}"`, 'danger');
  }
}

// Modal Logic
function openAddModal(preselectedDay = 'Monday') {
  modalTitleEl.textContent = 'Add Study Session';
  sessionFormEl.reset();
  document.getElementById('editSessionId').value = '';
  document.getElementById('daySelect').value = preselectedDay;
  document.getElementById('startTimeInput').value = '09:00';
  document.getElementById('endTimeInput').value = '10:30';
  document.getElementById('prioritySelect').value = 'Medium';
  selectColorInPicker('#6366f1');

  sessionModalEl.classList.add('open');
  document.getElementById('subjectInput').focus();
}

function openEditModal(id) {
  const session = sessions.find(s => s.id === id);
  if (!session) return;

  modalTitleEl.textContent = 'Edit Study Session';
  document.getElementById('editSessionId').value = session.id;
  document.getElementById('subjectInput').value = session.subject;
  document.getElementById('daySelect').value = session.day;
  document.getElementById('startTimeInput').value = session.startTime;
  document.getElementById('endTimeInput').value = session.endTime;
  document.getElementById('topicInput').value = session.topic || '';
  document.getElementById('prioritySelect').value = session.priority || 'Medium';
  document.getElementById('notesInput').value = session.notes || '';
  selectColorInPicker(session.color || '#6366f1');

  sessionModalEl.classList.add('open');
}

function closeModal() {
  sessionModalEl.classList.remove('open');
}

sessionFormEl.addEventListener('submit', (e) => {
  e.preventDefault();

  const editId = document.getElementById('editSessionId').value;
  const subject = document.getElementById('subjectInput').value.trim();
  const day = document.getElementById('daySelect').value;
  const startTime = document.getElementById('startTimeInput').value;
  const endTime = document.getElementById('endTimeInput').value;
  const topic = document.getElementById('topicInput').value.trim();
  const priority = document.getElementById('prioritySelect').value;
  const color = document.getElementById('selectedColor').value || '#6366f1';
  const notes = document.getElementById('notesInput').value.trim();

  if (timeToDecimal(endTime) <= timeToDecimal(startTime)) {
    alert('End time must be later than start time.');
    return;
  }

  if (editId) {
    // Update existing
    const session = sessions.find(s => s.id === editId);
    if (session) {
      session.subject = subject;
      session.day = day;
      session.startTime = startTime;
      session.endTime = endTime;
      session.topic = topic;
      session.priority = priority;
      session.color = color;
      session.notes = notes;
      showToast(`Updated "${subject}"`, 'success');
    }
  } else {
    // Create new
    const newSession = {
      id: 's-' + Date.now(),
      subject,
      day,
      startTime,
      endTime,
      topic,
      priority,
      color,
      notes,
      completed: false
    };
    sessions.push(newSession);
    showToast(`Added "${subject}" to ${day}!`, 'success');
  }

  saveSessions();
  renderAll();
  closeModal();
});

addSessionBtn.addEventListener('click', () => openAddModal());
closeModalBtn.addEventListener('click', closeModal);
cancelModalBtn.addEventListener('click', closeModal);
sessionModalEl.addEventListener('click', (e) => {
  if (e.target === sessionModalEl) closeModal();
});

// View Tab Switcher
const tabButtons = document.querySelectorAll('.tab-btn');
const viewSections = {
  weekly: document.getElementById('weeklyView'),
  agenda: document.getElementById('agendaView'),
  pomodoro: document.getElementById('pomodoroView')
};

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const view = btn.dataset.view;
    activeView = view;

    Object.keys(viewSections).forEach(key => {
      if (key === view) {
        viewSections[key].classList.add('active');
      } else {
        viewSections[key].classList.remove('active');
      }
    });

    if (view === 'agenda') {
      dayFilterSelect.style.display = 'inline-block';
    } else {
      dayFilterSelect.style.display = 'none';
    }
  });
});

// Search and Day Filter
searchInputEl.addEventListener('input', (e) => {
  searchQuery = e.target.value.trim();
  renderAll();
});

dayFilterSelect.addEventListener('change', (e) => {
  selectedDayFilter = e.target.value;
  renderAgendaList();
});

// Timetable Options & Backup Menu
backupMenuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  backupMenu.classList.toggle('show');
});

document.addEventListener('click', () => {
  backupMenu.classList.remove('show');
});

exportJsonBtn.addEventListener('click', () => {
  const jsonStr = JSON.stringify(sessions, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `studyflow_timetable_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Timetable data exported successfully!', 'success');
});

importJsonInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      if (Array.isArray(imported)) {
        sessions = imported;
        saveSessions();
        renderAll();
        showToast(`Imported ${sessions.length} study sessions!`, 'success');
      } else {
        alert('Invalid timetable JSON file structure.');
      }
    } catch (err) {
      alert('Error parsing JSON file.');
    }
  };
  reader.readAsText(file);
});

loadSampleBtn.addEventListener('click', () => {
  if (confirm('Reset your timetable to the default sample schedule? Any current custom sessions will be replaced.')) {
    sessions = JSON.parse(JSON.stringify(DEFAULT_SESSIONS));
    saveSessions();
    renderAll();
    showToast('Loaded sample timetable data!', 'info');
  }
});

clearAllBtn.addEventListener('click', () => {
  if (confirm('Clear all timetable sessions? This action cannot be undone.')) {
    sessions = [];
    saveSessions();
    renderAll();
    showToast('All sessions cleared.', 'danger');
  }
});

// Print Button
printBtn.addEventListener('click', () => {
  window.print();
});

// ============================================================
// Pomodoro Timer Logic
// ============================================================
const POMO_MODES = {
  study: { duration: 25 * 60, label: 'Focus Mode' },
  shortBreak: { duration: 5 * 60, label: 'Short Break' },
  longBreak: { duration: 15 * 60, label: 'Long Break' }
};

let currentPomoMode = 'study';
let pomoTimeLeft = POMO_MODES.study.duration;
let pomoInterval = null;
let pomoSessionsCount = parseInt(localStorage.getItem('studyflow_pomocount') || '0', 10);

const timerDigitsEl = document.getElementById('timerDigits');
const timerStateLabelEl = document.getElementById('timerStateLabel');
const timerProgressRing = document.getElementById('timerProgressRing');
const pomoStartBtn = document.getElementById('pomoStartBtn');
const pomoPauseBtn = document.getElementById('pomoPauseBtn');
const pomoResetBtn = document.getElementById('pomoResetBtn');
const pomoSessionsCompletedEl = document.getElementById('pomoSessionsCompleted');
const pomoModeBtns = document.querySelectorAll('.pomo-mode-btn');

// Circular SVG Progress Ring config
const RING_RADIUS = 120;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
timerProgressRing.style.strokeDasharray = `${CIRCUMFERENCE} ${CIRCUMFERENCE}`;
timerProgressRing.style.strokeDashoffset = '0';

function setRingProgress(percent) {
  const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;
  timerProgressRing.style.strokeDashoffset = offset;
}

function updateTimerDisplay() {
  const minutes = Math.floor(pomoTimeLeft / 60);
  const seconds = pomoTimeLeft % 60;
  timerDigitsEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  timerStateLabelEl.textContent = POMO_MODES[currentPomoMode].label;

  const total = POMO_MODES[currentPomoMode].duration;
  const elapsed = total - pomoTimeLeft;
  const percent = (elapsed / total) * 100;
  setRingProgress(percent);
}

function startTimer() {
  if (pomoInterval) return;

  pomoStartBtn.disabled = true;
  pomoPauseBtn.disabled = false;

  pomoInterval = setInterval(() => {
    if (pomoTimeLeft > 0) {
      pomoTimeLeft--;
      updateTimerDisplay();
    } else {
      clearInterval(pomoInterval);
      pomoInterval = null;
      pomoStartBtn.disabled = false;
      pomoPauseBtn.disabled = true;

      const isBreak = currentPomoMode !== 'study';
      playChime(isBreak);

      if (currentPomoMode === 'study') {
        pomoSessionsCount++;
        localStorage.setItem('studyflow_pomocount', pomoSessionsCount.toString());
        pomoSessionsCompletedEl.textContent = pomoSessionsCount;
        showToast('🎉 Focus session completed! Take a well-deserved break.', 'success');
        switchPomoMode('shortBreak');
      } else {
        showToast('🔔 Break finished! Ready to dive back in?', 'info');
        switchPomoMode('study');
      }
    }
  }, 1000);
}

function pauseTimer() {
  if (pomoInterval) {
    clearInterval(pomoInterval);
    pomoInterval = null;
    pomoStartBtn.disabled = false;
    pomoPauseBtn.disabled = true;
  }
}

function resetTimer() {
  pauseTimer();
  pomoTimeLeft = POMO_MODES[currentPomoMode].duration;
  updateTimerDisplay();
}

function switchPomoMode(mode) {
  pauseTimer();
  currentPomoMode = mode;
  pomoModeBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  pomoTimeLeft = POMO_MODES[mode].duration;
  updateTimerDisplay();
}

pomoModeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    switchPomoMode(btn.dataset.mode);
  });
});

pomoStartBtn.addEventListener('click', startTimer);
pomoPauseBtn.addEventListener('click', pauseTimer);
pomoResetBtn.addEventListener('click', resetTimer);

pomoSessionsCompletedEl.textContent = pomoSessionsCount;
updateTimerDisplay();

// Master Render
function renderAll() {
  renderWeeklyGrid();
  renderAgendaList();
  updateStats();
}

// Initial Boot
function init() {
  initTheme();
  setupColorPicker();
  loadSessions();
  renderAll();
}

init();
