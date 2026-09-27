// Ordered to match Date#getDay() (0 = Sunday ... 6 = Saturday)
export const WEEKDAYS = [
  { key: 'sun', short: 'Su', label: 'Sunday' },
  { key: 'mon', short: 'Mo', label: 'Monday' },
  { key: 'tue', short: 'Tu', label: 'Tuesday' },
  { key: 'wed', short: 'We', label: 'Wednesday' },
  { key: 'thu', short: 'Th', label: 'Thursday' },
  { key: 'fri', short: 'Fr', label: 'Friday' },
  { key: 'sat', short: 'Sa', label: 'Saturday' },
]

export const CADENCE_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Specific days' },
]

export function todayWeekdayKey(date = new Date()) {
  return WEEKDAYS[date.getDay()].key
}

// Short, human-friendly summary of a habit's schedule for cards & headers.
export function describeCadence(habit) {
  if (!habit) return ''
  switch (habit.cadence) {
    case 'daily':
      return 'Every day'
    case 'monthly':
      return `${habit.target || 1}× per month`
    case 'custom': {
      const days = habit.weekDays || []
      if (days.length === 0) return 'No days selected'
      if (days.length === 7) return 'Every day'
      return WEEKDAYS.filter((w) => days.includes(w.key)).map((w) => w.label.slice(0, 3)).join(', ')
    }
    case 'weekly':
    default:
      return `${habit.target || 1}× per week`
  }
}

// Whether a habit is "on schedule" for a given date — used to highlight
// today's expected habits. Weekly/monthly targets aren't tied to a specific
// day, so they're always considered relevant.
export function isScheduledOn(habit, date = new Date()) {
  if (!habit) return false
  if (habit.cadence === 'custom') return (habit.weekDays || []).includes(todayWeekdayKey(date))
  return true
}
