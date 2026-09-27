// Ordered to match Date#getDay() (0 = Sunday ... 6 = Saturday)
export const SCHEDULE_WEEKDAYS = [
  { key: 'sun', short: 'Min', label: 'Minggu' },
  { key: 'mon', short: 'Sen', label: 'Senin' },
  { key: 'tue', short: 'Sel', label: 'Selasa' },
  { key: 'wed', short: 'Rab', label: 'Rabu' },
  { key: 'thu', short: 'Kam', label: 'Kamis' },
  { key: 'fri', short: 'Jum', label: 'Jumat' },
  { key: 'sat', short: 'Sab', label: 'Sabtu' },
]

export function todayScheduleKey(date = new Date()) {
  return SCHEDULE_WEEKDAYS[date.getDay()].key
}

// Short, human-friendly summary of which days a schedule repeats on.
export function describeScheduleDays(days = []) {
  if (!days || days.length === 0) return 'Belum ada hari dipilih'
  if (days.length === 7) return 'Setiap hari'
  return SCHEDULE_WEEKDAYS.filter((d) => days.includes(d.key)).map((d) => d.short).join(', ')
}

export function isScheduledToday(schedule, date = new Date()) {
  return (schedule.days || []).includes(todayScheduleKey(date))
}

// Schedules due today, sorted by time (schedules without a time sort last).
export function schedulesForToday(schedules = [], date = new Date()) {
  return schedules
    .filter((s) => isScheduledToday(s, date))
    .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'))
}

// Next weekday (0 = today) a schedule is due on, or null if no days are set.
export function nextDueInDays(schedule, date = new Date()) {
  const days = schedule.days || []
  if (days.length === 0) return null
  const todayIdx = date.getDay()
  for (let i = 0; i < 7; i++) {
    const idx = (todayIdx + i) % 7
    if (days.includes(SCHEDULE_WEEKDAYS[idx].key)) return i
  }
  return null
}
