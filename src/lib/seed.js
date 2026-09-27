import { uid } from './utils'

const today = new Date()
const iso = (offsetDays = 0, hour = 9) => {
  const d = new Date(today)
  d.setDate(d.getDate() + offsetDays)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

export const SEED = {
  tasks: [
    { id: uid(), title: 'Ship onboarding redesign', notes: 'Finalize the empty states and animation timing.', status: 'in_progress', priority: 'high', dueDate: iso(0), tags: ['design', 'app'], checklist: [ { id: uid(), text: 'Review Figma handoff', done: true }, { id: uid(), text: 'Implement empty states', done: false }, { id: uid(), text: 'QA on mobile', done: false } ], archived: false, createdAt: iso(-3) },
    { id: uid(), title: 'Write Q3 retro doc', notes: '', status: 'todo', priority: 'medium', dueDate: iso(0), tags: ['writing'], checklist: [], archived: false, createdAt: iso(-2) },
    { id: uid(), title: 'Reply to investor update thread', notes: '', status: 'todo', priority: 'urgent', dueDate: iso(0), tags: ['comms'], checklist: [], archived: false, createdAt: iso(-1) },
    { id: uid(), title: 'Refactor auth store', notes: 'Split guards from provider logic.', status: 'in_progress', priority: 'medium', dueDate: iso(1), tags: ['dev'], checklist: [ { id: uid(), text: 'Extract hooks', done: true }, { id: uid(), text: 'Add tests', done: false } ], archived: false, createdAt: iso(-5) },
    { id: uid(), title: 'Plan next habit cycle', notes: '', status: 'todo', priority: 'low', dueDate: iso(2), tags: ['planning'], checklist: [], archived: false, createdAt: iso(-1) },
    { id: uid(), title: 'Book dentist appointment', notes: '', status: 'done', priority: 'low', dueDate: iso(-1), tags: ['personal'], checklist: [], archived: false, createdAt: iso(-6) },
    { id: uid(), title: 'Review pull requests', notes: '', status: 'done', priority: 'medium', dueDate: iso(-1), tags: ['dev'], checklist: [], archived: false, createdAt: iso(-4) },
    { id: uid(), title: 'Draft newsletter #12', notes: '', status: 'todo', priority: 'medium', dueDate: iso(3), tags: ['writing'], checklist: [], archived: false, createdAt: iso(-1) },
  ],
  projects: [
    { id: uid(), name: 'Meridian Mobile App', description: 'Native companion app for the productivity OS.', status: 'active', progress: 62, deadline: iso(20), tags: ['product', 'mobile'], notes: 'Focus on offline-first sync this milestone.', files: [], createdAt: iso(-40) },
    { id: uid(), name: 'Personal Finance Rebuild', description: 'Automate budget tracking and net worth snapshots.', status: 'active', progress: 34, deadline: iso(45), tags: ['finance'], notes: '', files: [], createdAt: iso(-20) },
    { id: uid(), name: 'Home Studio Setup', description: 'Acoustic treatment + audio interface upgrade.', status: 'on_hold', progress: 15, deadline: iso(70), tags: ['home'], notes: '', files: [], createdAt: iso(-10) },
    { id: uid(), name: '2026 Reading Challenge', description: 'Read 30 books this year across genres.', status: 'active', progress: 48, deadline: iso(150), tags: ['personal', 'reading'], notes: '', files: [], createdAt: iso(-90) },
    { id: uid(), name: 'Website v3', description: 'Portfolio relaunch with new case studies.', status: 'completed', progress: 100, deadline: iso(-10), tags: ['design'], notes: '', files: [], createdAt: iso(-120) },
  ],
  events: [
    { id: uid(), title: 'Design sync', date: iso(0, 10), end: iso(0, 11), category: 'work', reminder: true },
    { id: uid(), title: 'Gym — upper body', date: iso(0, 18), end: iso(0, 19), category: 'health', reminder: false },
    { id: uid(), title: '1:1 with mentor', date: iso(1, 15), end: iso(1, 16), category: 'work', reminder: true },
    { id: uid(), title: 'Dentist appointment', date: iso(2, 9), end: iso(2, 10), category: 'personal', reminder: true },
    { id: uid(), title: 'Family dinner', date: iso(3, 19), end: iso(3, 21), category: 'personal', reminder: false },
    { id: uid(), title: 'Product review', date: iso(4, 13), end: iso(4, 14), category: 'work', reminder: true },
  ],
  pomodoros: [
    { id: uid(), label: 'Deep work — onboarding', minutes: 25, completedAt: iso(0, 9), type: 'focus' },
    { id: uid(), label: 'Break', minutes: 5, completedAt: iso(0, 9.5), type: 'break' },
    { id: uid(), label: 'Auth refactor', minutes: 25, completedAt: iso(0, 11), type: 'focus' },
    { id: uid(), label: 'Deep work', minutes: 25, completedAt: iso(-1, 10), type: 'focus' },
    { id: uid(), label: 'Deep work', minutes: 25, completedAt: iso(-1, 14), type: 'focus' },
    { id: uid(), label: 'Writing', minutes: 25, completedAt: iso(-2, 9), type: 'focus' },
  ],
  notes: [
    { id: uid(), title: 'Design system tokens', content: '## Colors\n- Primary: #A3E635\n- Amber accent for streaks\n\n## Type\nSpace Grotesk for display, Inter for body.', folder: 'Work', tags: ['design'], pinned: true, favorite: true, createdAt: iso(-10), updatedAt: iso(-1) },
    { id: uid(), title: 'Book notes — Deep Work', content: 'Cal Newport on the value of undistracted focus blocks. Key idea: schedule deep work like meetings.', folder: 'Reading', tags: ['books', 'focus'], pinned: false, favorite: true, createdAt: iso(-30), updatedAt: iso(-30) },
    { id: uid(), title: 'Recipe: weekday miso ramen', content: 'Broth base, soft egg, scallion, chili oil. 20 minutes total.', folder: 'Personal', tags: ['cooking'], pinned: false, favorite: false, createdAt: iso(-15), updatedAt: iso(-15) },
    { id: uid(), title: 'Meeting notes — roadmap review', content: 'Aligned on Q3 priorities. Mobile app ships before finance rebuild.', folder: 'Work', tags: ['meetings'], pinned: true, favorite: false, createdAt: iso(-2), updatedAt: iso(-2) },
  ],
  journal: [
    { id: uid(), date: iso(0), mood: 4, gratitude: ['Good coffee', 'Quiet morning', 'Progress on redesign'], highlights: 'Shipped the empty state animations.', learning: 'Framer Motion easing curves matter more than I thought.', tags: ['Produktif'], pinned: false, createdAt: iso(0) },
    { id: uid(), date: iso(-1), mood: 3, gratitude: ['Call with an old friend'], highlights: 'Cleared the backlog of pull requests.', learning: 'Small PRs really do get reviewed faster.', tags: ['Kerja'], pinned: false, createdAt: iso(-1) },
    { id: uid(), date: iso(-2), mood: 5, gratitude: ['Sunny walk', 'Finished a book'], highlights: 'Finished Deep Work.', learning: 'Batch shallow work into one block.', tags: ['Growth', 'Istirahat'], pinned: true, createdAt: iso(-2) },
  ],
  workouts: [
    { id: uid(), date: iso(0, 7), type: 'strength', title: 'Upper body day', durationMin: 50, calories: 320, intensity: 4, exercises: [{ id: uid(), name: 'Bench press', sets: '4', reps: '8', weight: '60kg' }, { id: uid(), name: 'Pull-up', sets: '3', reps: '10', weight: 'bodyweight' }], notes: 'Terasa kuat hari ini, naikkan beban minggu depan.', createdAt: iso(0) },
    { id: uid(), date: iso(-1, 6), type: 'cardio', title: 'Morning run', durationMin: 35, calories: 300, intensity: 3, exercises: [], notes: '5K pace stabil, cuaca sejuk.', createdAt: iso(-1) },
    { id: uid(), date: iso(-3, 18), type: 'yoga', title: 'Evening mobility flow', durationMin: 25, calories: 90, intensity: 2, exercises: [], notes: 'Fokus pinggul dan bahu.', createdAt: iso(-3) },
    { id: uid(), date: iso(-4, 7), type: 'hiit', title: 'HIIT circuit', durationMin: 20, calories: 250, intensity: 5, exercises: [{ id: uid(), name: 'Burpees', sets: '4', reps: '15', weight: '' }], notes: 'Berat tapi worth it.', createdAt: iso(-4) },
  ],
  transactions: [
    { id: uid(), type: 'income', category: 'gaji', amount: 8500000, date: iso(-2, 9), note: 'Gaji bulan ini', createdAt: iso(-2) },
    { id: uid(), type: 'income', category: 'freelance', amount: 1200000, date: iso(-5, 14), note: 'Proyek desain logo', createdAt: iso(-5) },
    { id: uid(), type: 'expense', category: 'makanan', amount: 65000, date: iso(0, 12), note: 'Makan siang', createdAt: iso(0) },
    { id: uid(), type: 'expense', category: 'transportasi', amount: 150000, date: iso(-1, 8), note: 'Bensin', createdAt: iso(-1) },
    { id: uid(), type: 'expense', category: 'tagihan', amount: 450000, date: iso(-3, 10), note: 'Listrik & internet', createdAt: iso(-3) },
    { id: uid(), type: 'expense', category: 'belanja', amount: 320000, date: iso(-4, 16), note: 'Kebutuhan rumah', createdAt: iso(-4) },
    { id: uid(), type: 'expense', category: 'hiburan', amount: 120000, date: iso(-6, 20), note: 'Nonton bioskop', createdAt: iso(-6) },
  ],
  budgets: [
    { id: uid(), category: 'makanan', limit: 1500000, createdAt: iso(-10) },
    { id: uid(), category: 'transportasi', limit: 500000, createdAt: iso(-10) },
    { id: uid(), category: 'hiburan', limit: 300000, createdAt: iso(-10) },
  ],
  brainstorm: [
    { id: uid(), title: 'Weekly review ritual widget', category: 'Product', tags: ['idea'], status: 'exploring', favorite: true, notes: 'A Sunday-night guided review inside the dashboard.', createdAt: iso(-5) },
    { id: uid(), title: 'Local-first sync engine', category: 'Engineering', tags: ['architecture'], status: 'new', favorite: false, notes: '', createdAt: iso(-3) },
    { id: uid(), title: 'Habit “streak freeze” tokens', category: 'Product', tags: ['habits'], status: 'validated', favorite: true, notes: 'Like Duolingo streak freezes but for habit tracker.', createdAt: iso(-12) },
  ],
  habits: [
    { id: uid(), name: 'Morning meditation', icon: '🧘', color: 'teal', target: 7, cadence: 'daily', history: buildHistory(0.8), createdAt: iso(-60) },
    { id: uid(), name: 'Read 20 pages', icon: '📚', color: 'amber', target: 7, cadence: 'daily', history: buildHistory(0.65), createdAt: iso(-60) },
    { id: uid(), name: 'No sugar', icon: '🍬', color: 'rose', target: 7, cadence: 'daily', history: buildHistory(0.5), createdAt: iso(-60) },
    { id: uid(), name: 'Strength training', icon: '🏋️', color: 'primary', target: 4, cadence: 'weekly', history: buildHistory(0.7), createdAt: iso(-60) },
  ],
  goals: [
    { id: uid(), title: 'Launch Meridian mobile v1', category: 'Career', progress: 62, deadline: iso(20), status: 'active', milestones: ['Design complete', 'Offline sync', 'Beta testers'], createdAt: iso(-40) },
    { id: uid(), title: 'Read 30 books this year', category: 'Personal', progress: 48, deadline: iso(150), status: 'active', milestones: [], createdAt: iso(-90) },
    { id: uid(), title: 'Run a half marathon', category: 'Health', progress: 30, deadline: iso(80), status: 'active', milestones: ['Base mileage', '10k race', 'Long runs'], createdAt: iso(-30) },
    { id: uid(), title: 'Save 3 month emergency fund', category: 'Finance', progress: 100, deadline: iso(-5), status: 'completed', milestones: [], createdAt: iso(-200) },
  ],
  library: [
    { id: uid(), type: 'book', title: 'Deep Work', creator: 'Cal Newport', tags: ['focus', 'nonfiction'], rating: 5, status: 'completed', favorite: true, review: 'Reframed how I plan my weeks.', cover: 'https://picsum.photos/seed/deepwork/300/450' },
    { id: uid(), type: 'movie', title: 'Arrival', creator: 'Denis Villeneuve', tags: ['scifi'], rating: 5, status: 'completed', favorite: true, review: '', cover: 'https://picsum.photos/seed/arrival/300/450' },
    { id: uid(), type: 'game', title: 'Outer Wilds', creator: 'Mobius Digital', tags: ['exploration'], rating: 5, status: 'completed', favorite: true, review: 'A perfect puzzle box of a solar system.', cover: 'https://picsum.photos/seed/outerwilds/300/450' },
    { id: uid(), type: 'course', title: 'CS50', creator: 'Harvard', tags: ['cs'], rating: 4, status: 'in_progress', favorite: false, review: '', cover: 'https://picsum.photos/seed/cs50/300/450' },
    { id: uid(), type: 'music', title: 'In Rainbows', creator: 'Radiohead', tags: ['rock'], rating: 5, status: 'completed', favorite: true, review: '', cover: 'https://picsum.photos/seed/inrainbows/300/450' },
    { id: uid(), type: 'book', title: 'Atomic Habits', creator: 'James Clear', tags: ['habits'], rating: 4, status: 'in_progress', favorite: false, review: '', cover: 'https://picsum.photos/seed/atomichabits/300/450' },
  ],
  bookmarks: [
    { id: uid(), title: 'Linear — Method', url: 'https://linear.app/method', tags: ['product'], favorite: true, folder: 'Inspiration' },
    { id: uid(), title: 'Refactoring UI notes', url: 'https://refactoringui.com', tags: ['design'], favorite: false, folder: 'Design' },
    { id: uid(), title: 'React Query docs', url: 'https://tanstack.com/query', tags: ['dev'], favorite: true, folder: 'Dev' },
  ],
  files: [
    { id: uid(), name: 'roadmap-q3.pdf', type: 'pdf', size: 245000, folder: 'Work', createdAt: iso(-10) },
    { id: uid(), name: 'brand-palette.png', type: 'image', size: 88000, folder: 'Design', createdAt: iso(-20) },
    { id: uid(), name: 'meeting-notes.md', type: 'doc', size: 4200, folder: 'Work', createdAt: iso(-2) },
  ],
  snippets: [
    { id: uid(), title: 'Debounce fn', language: 'javascript', code: 'function debounce(fn, wait) {\n  let t;\n  return (...a) => {\n    clearTimeout(t);\n    t = setTimeout(() => fn(...a), wait);\n  };\n}', tags: ['utils'], favorite: true },
    { id: uid(), title: 'Tailwind glass card', language: 'css', code: '.glass {\n  background: rgba(255,255,255,.55);\n  backdrop-filter: blur(20px);\n}', tags: ['css'], favorite: false },
  ],
}

function buildHistory(rate) {
  const history = {}
  for (let i = 0; i < 84; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    history[key] = Math.random() < rate
  }
  return history
}
