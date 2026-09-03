export function formatDate(value, language = 'en') {
  if (!value) return '-'
  const date = value?.toDate ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  const locale = language === 'id' ? 'id-ID' : 'en-US'
  return date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function addDaysISO(daysFromToday) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromToday)
  return d.toISOString().slice(0, 10)
}

export function isPastDue(dueDateISO) {
  if (!dueDateISO) return false
  const due = new Date(dueDateISO)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return due < now
}
