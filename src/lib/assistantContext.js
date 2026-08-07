import { dataService } from './dataService'
import { habitStreak } from './stats'
import { isSameDay } from './utils'

// Builds a compact, privacy-conscious snapshot of the user's current data so
// the assistant can give grounded, personalized advice instead of generic
// answers. Only summaries/counts and titles are included — not full note
// content or journal entries.
export async function buildContextSummary() {
  const [tasks, projects, habits, goals, events] = await Promise.all([
    dataService.getAll('tasks'),
    dataService.getAll('projects'),
    dataService.getAll('habits'),
    dataService.getAll('goals'),
    dataService.getAll('events'),
  ])

  const todayTasks = tasks.filter((t) => !t.archived && t.status !== 'done' && t.dueDate && isSameDay(t.dueDate, new Date()))
  const overdueTasks = tasks.filter((t) => !t.archived && t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date(new Date().setHours(0, 0, 0, 0)))
  const activeProjects = projects.filter((p) => p.status === 'active')
  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5)

  const lines = [
    `Hari ini: ${new Date().toDateString()}.`,
    `Task jatuh tempo hari ini (${todayTasks.length}): ${todayTasks.map((t) => `${t.title} [${t.priority}]`).join('; ') || '-'}.`,
    `Task overdue (${overdueTasks.length}): ${overdueTasks.map((t) => t.title).join('; ') || '-'}.`,
    `Project aktif (${activeProjects.length}): ${activeProjects.map((p) => `${p.name} (${p.progress}%)`).join('; ') || '-'}.`,
    `Habit & streak saat ini: ${habits.map((h) => `${h.name}=${habitStreak(h.history)}d`).join('; ') || '-'}.`,
    `Goals aktif: ${goals.filter((g) => g.status === 'active').map((g) => `${g.title} (${g.progress}%)`).join('; ') || '-'}.`,
    `Acara mendatang: ${upcomingEvents.map((e) => `${e.title} @ ${new Date(e.date).toLocaleString()}`).join('; ') || '-'}.`,
  ]
  return lines.join('\n')
}
