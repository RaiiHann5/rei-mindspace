import { formatDate } from './utils'

export function last7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d)
  }
  return days
}

export function weeklyFocusMinutes(pomodoros = []) {
  const days = last7Days()
  return days.map((d) => {
    const key = d.toISOString().slice(0, 10)
    const minutes = pomodoros
      .filter((p) => p.type === 'focus' && (p.completedAt || '').slice(0, 10) === key)
      .reduce((sum, p) => sum + (p.minutes || 0), 0)
    return { label: formatDate(d, { weekday: 'short' }), minutes }
  })
}

export function tasksCompletedTrend(tasks = []) {
  const days = last7Days()
  return days.map((d) => {
    const key = d.toISOString().slice(0, 10)
    const completed = tasks.filter((t) => t.status === 'done' && (t.updatedAt || t.createdAt || '').slice(0, 10) === key).length
    return { label: formatDate(d, { weekday: 'short' }), completed }
  })
}

export function habitStreak(history = {}) {
  let streak = 0
  const d = new Date()
  for (;;) {
    const key = d.toISOString().slice(0, 10)
    if (history[key]) { streak++; d.setDate(d.getDate() - 1) } else break
  }
  return streak
}

export function habitCompletionRate(history = {}, days = 30) {
  let total = 0, done = 0
  const d = new Date()
  for (let i = 0; i < days; i++) {
    const key = d.toISOString().slice(0, 10)
    total++
    if (history[key]) done++
    d.setDate(d.getDate() - 1)
  }
  return Math.round((done / total) * 100)
}

export function habitBestStreak(history = {}) {
  const days = Object.keys(history).filter((k) => history[k]).sort()
  if (days.length === 0) return 0
  let best = 1, run = 1
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1])
    const cur = new Date(days[i])
    const diff = Math.round((cur - prev) / 86400000)
    run = diff === 1 ? run + 1 : 1
    if (run > best) best = run
  }
  return best
}

export function habitTotalCompletions(history = {}) {
  return Object.values(history).filter(Boolean).length
}
