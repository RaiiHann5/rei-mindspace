import { last7Days } from './stats'
import { formatDate } from './utils'

function dayKeyOf(dateStr) {
  return new Date(dateStr).toISOString().slice(0, 10)
}

export function weeklyWorkoutMinutes(workouts = []) {
  const days = last7Days()
  return days.map((d) => {
    const key = d.toISOString().slice(0, 10)
    const minutes = workouts
      .filter((w) => dayKeyOf(w.date) === key)
      .reduce((sum, w) => sum + (Number(w.durationMin) || 0), 0)
    return { label: formatDate(d, { weekday: 'short' }), minutes }
  })
}

export function workoutStreak(workouts = []) {
  const daySet = new Set(workouts.map((w) => dayKeyOf(w.date)))
  let streak = 0
  const d = new Date()
  for (;;) {
    const key = d.toISOString().slice(0, 10)
    if (daySet.has(key)) { streak++; d.setDate(d.getDate() - 1) } else break
  }
  return streak
}

export function thisWeekStats(workouts = []) {
  const days = last7Days()
  const keys = new Set(days.map((d) => d.toISOString().slice(0, 10)))
  const inWeek = workouts.filter((w) => keys.has(dayKeyOf(w.date)))
  return {
    count: inWeek.length,
    minutes: inWeek.reduce((s, w) => s + (Number(w.durationMin) || 0), 0),
    calories: inWeek.reduce((s, w) => s + (Number(w.calories) || 0), 0),
  }
}

export function allTimeStats(workouts = []) {
  return {
    count: workouts.length,
    minutes: workouts.reduce((s, w) => s + (Number(w.durationMin) || 0), 0),
    calories: workouts.reduce((s, w) => s + (Number(w.calories) || 0), 0),
  }
}

// Personal bests among workouts of the same type — used on the workout detail page.
export function personalBestsForType(workouts = [], type, excludeId) {
  const sameType = workouts.filter((w) => w.type === type && w.id !== excludeId)
  const longest = sameType.reduce((best, w) => (Number(w.durationMin) || 0) > (Number(best?.durationMin) || 0) ? w : best, null)
  const mostCalories = sameType.reduce((best, w) => (Number(w.calories) || 0) > (Number(best?.calories) || 0) ? w : best, null)
  return { sessionsOfType: sameType.length, longest, mostCalories }
}
