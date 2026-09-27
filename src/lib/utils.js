import { clsx } from 'clsx'

export function cn(...inputs) {
  return clsx(inputs)
}

export function uid() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
  )
}

export function formatDate(d, opts) {
  if (!d) return ''
  const date = typeof d === 'string' ? new Date(d) : d
  return new Intl.DateTimeFormat('en-US', opts || { month: 'short', day: 'numeric' }).format(date)
}

export function isSameDay(a, b) {
  const da = new Date(a), db = new Date(b)
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate()
}

export function daysUntil(dateStr) {
  if (!dateStr) return null
  const now = new Date(); now.setHours(0,0,0,0)
  const target = new Date(dateStr); target.setHours(0,0,0,0)
  return Math.round((target - now) / 86400000)
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

export function debounce(fn, wait = 250) {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), wait)
  }
}

export const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 }

export const REPEAT_OPTIONS = [
  { value: '', label: 'Never' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

export const REPEAT_LABELS = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' }

// Computes the next due date for a recurring task. `from` is the current
// occurrence's dueDate (falls back to today). Monthly clamps to the last day
// of the month when the target month is shorter (Jan 31 → Feb 28/29).
export function nextOccurrence(from, repeat) {
  const d = from ? new Date(from) : new Date()
  if (repeat === 'daily') d.setDate(d.getDate() + 1)
  else if (repeat === 'weekly') d.setDate(d.getDate() + 7)
  else if (repeat === 'monthly') {
    const day = d.getDate()
    d.setMonth(d.getMonth() + 1)
    if (d.getDate() !== day) d.setDate(0)
  }
  return d.toISOString()
}
