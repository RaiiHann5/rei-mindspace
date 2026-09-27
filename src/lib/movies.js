// A movie's `logs` array holds one entry per watch (diary-style, à la Letterboxd):
// { id, date, rating, review, rewatch }. No logs yet = still on the watchlist.

export function latestLog(movie) {
  const logs = movie.logs || []
  if (logs.length === 0) return null
  return [...logs].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
}

export function sortedLogs(movie) {
  return [...(movie.logs || [])].sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function isWatched(movie) {
  return (movie.logs || []).length > 0
}

export function movieSummary(items = []) {
  const watched = items.filter((m) => isWatched(m))
  const allLogs = items.flatMap((m) => m.logs || [])
  const ratedLogs = allLogs.filter((l) => Number(l.rating) > 0)
  const avgRating = ratedLogs.length ? ratedLogs.reduce((s, l) => s + Number(l.rating), 0) / ratedLogs.length : 0
  const thisYear = allLogs.filter((l) => l.date && new Date(l.date).getFullYear() === new Date().getFullYear()).length
  const favorites = items.filter((m) => m.favorite).length
  return { watchedCount: watched.length, diaryCount: allLogs.length, avgRating, thisYear, favorites }
}

// Genre -> count, sorted most-watched first.
export function genreBreakdown(items = []) {
  const counts = {}
  items.forEach((m) => (m.genres || []).forEach((g) => { counts[g] = (counts[g] || 0) + 1 }))
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([genre, count]) => ({ genre, count }))
}

export function parseGenres(input = '') {
  return input.split(',').map((g) => g.trim()).filter(Boolean)
}
