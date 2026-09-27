import {
  Dumbbell, Footprints, Bike, Droplets, Utensils, Apple, BookOpen, GraduationCap,
  PenLine, NotebookPen, Brain, Moon, Sun, AlarmClock, ShowerHead, Paintbrush,
  Music, Code2, PiggyBank, CigaretteOff, Leaf, HeartPulse, Smile, Sparkles,
  Target, Flame, CheckCircle2, Bed,
} from 'lucide-react'

// Curated icon set for habits — swaps free-form emoji for a consistent,
// theme-aware icon set so habit cards look intentional in both light/dark mode.
export const HABIT_ICONS = {
  Flame, Dumbbell, Footprints, Bike, Droplets, Utensils, Apple, BookOpen,
  GraduationCap, PenLine, NotebookPen, Brain, Moon, Bed, Sun, AlarmClock,
  ShowerHead, Paintbrush, Music, Code2, PiggyBank, CigaretteOff, Leaf,
  HeartPulse, Smile, Sparkles, Target, CheckCircle2,
}

export const HABIT_ICON_OPTIONS = Object.keys(HABIT_ICONS)

export const DEFAULT_HABIT_ICON = 'Flame'

// Renders a habit's icon by name. Falls back gracefully for legacy habits
// that still have an old emoji string saved as `icon`.
export function HabitIcon({ name, size = 18, className, ...props }) {
  const Icon = HABIT_ICONS[name] || HABIT_ICONS[DEFAULT_HABIT_ICON]
  return <Icon size={size} className={className} {...props} />
}
