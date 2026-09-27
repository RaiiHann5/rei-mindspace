import { Dumbbell, HeartPulse, Zap, PersonStanding, Trophy, Activity } from 'lucide-react'

export const WORKOUT_TYPES = [
  { value: 'strength', label: 'Strength', icon: Dumbbell, color: 'primary' },
  { value: 'cardio', label: 'Cardio', icon: HeartPulse, color: 'rose' },
  { value: 'hiit', label: 'HIIT', icon: Zap, color: 'amber' },
  { value: 'yoga', label: 'Yoga & Mobilitas', icon: PersonStanding, color: 'teal' },
  { value: 'sport', label: 'Olahraga/Sport', icon: Trophy, color: 'primary' },
  { value: 'other', label: 'Lainnya', icon: Activity, color: 'default' },
]

export function workoutTypeInfo(value) {
  return WORKOUT_TYPES.find((t) => t.value === value) || WORKOUT_TYPES[WORKOUT_TYPES.length - 1]
}

export const INTENSITY_LABELS = { 1: 'Santai', 2: 'Ringan', 3: 'Sedang', 4: 'Berat', 5: 'Maksimal' }
