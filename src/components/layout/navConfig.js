import {
  LayoutDashboard, CheckSquare, FolderKanban, CalendarDays, Timer,
  StickyNote, BookOpen, Lightbulb, Flame, Target, Library, Bookmark,
  FolderOpen, Wrench, BarChart3, Settings, Sparkles, Gamepad2, PenTool, Dumbbell, Wallet,
  GraduationCap, Telescope, Clapperboard, Lock,
} from 'lucide-react'

export const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Productivity',
    items: [
      { to: '/tasks', label: 'Tasks', icon: CheckSquare },
      { to: '/projects', label: 'Projects', icon: FolderKanban },
      { to: '/calendar', label: 'Calendar', icon: CalendarDays },
      { to: '/pomodoro', label: 'Pomodoro', icon: Timer },
    ],
  },
  {
    label: 'Break',
    items: [
      { to: '/arcade', label: 'Arcade', icon: Gamepad2 },
      { to: '/whiteboard', label: 'Whiteboard', icon: PenTool },
    ],
  },
  {
    label: 'Knowledge',
    items: [
      { to: '/notes', label: 'Notes', icon: StickyNote },
      { to: '/journal', label: 'Journal', icon: BookOpen },
      { to: '/brainstorm', label: 'Brainstorm', icon: Lightbulb },
      { to: '/vault', label: 'Private vault', icon: Lock },
    ],
  },
  {
    label: 'Fitness',
    items: [{ to: '/workout', label: 'Workout', icon: Dumbbell }],
  },
  {
    label: 'Finance',
    items: [{ to: '/finance', label: 'Finance', icon: Wallet }],
  },
  {
    label: 'Tracking',
    items: [
      { to: '/habits', label: 'Habits', icon: Flame },
      { to: '/goals', label: 'Goals', icon: Target },
      { to: '/learning', label: 'Skills', icon: GraduationCap },
      { to: '/vision-board', label: 'Vision board', icon: Telescope },
    ],
  },
  {
    label: 'Library',
    items: [
      { to: '/library', label: 'Media', icon: Library },
      { to: '/movies', label: 'Movies', icon: Clapperboard },
    ],
  },
  {
    label: 'Utilities',
    items: [
      { to: '/assistant', label: 'Assistant', icon: Sparkles },
      { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
      { to: '/files', label: 'Files', icon: FolderOpen },
      { to: '/devtools', label: 'Dev Tools', icon: Wrench },
    ],
  },
  {
    label: 'Insights',
    items: [{ to: '/analytics', label: 'Analytics', icon: BarChart3 }],
  },
]

export const SETTINGS_ITEM = { to: '/settings', label: 'Settings', icon: Settings }
