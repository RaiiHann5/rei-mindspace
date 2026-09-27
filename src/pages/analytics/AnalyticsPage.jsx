import { useMemo } from 'react'
import { CheckSquare, Clock, Flame, Target } from 'lucide-react'
import { useCollection } from '@/hooks/useCollection'
import { PageHeader, Card, Progress } from '@/components/ui'
import { weeklyFocusMinutes, tasksCompletedTrend, habitStreak } from '@/lib/stats'
import WeeklyFocusChart from '@/components/charts/WeeklyFocusChart'
import TasksTrendChart from '@/components/charts/TasksTrendChart'
import GoalsBarChart from '@/components/charts/GoalsBarChart'
import HabitStreakChart from '@/components/charts/HabitStreakChart'

export default function AnalyticsPage() {
  const { items: tasks } = useCollection('tasks')
  const { items: pomodoros } = useCollection('pomodoros')
  const { items: habits } = useCollection('habits')
  const { items: goals } = useCollection('goals')

  const focusData = weeklyFocusMinutes(pomodoros)
  const tasksTrend = tasksCompletedTrend(tasks)
  const totalFocusMinutes = pomodoros.filter((p) => p.type === 'focus').reduce((s, p) => s + p.minutes, 0)
  const completedTasks = tasks.filter((t) => t.status === 'done').length
  const habitData = useMemo(() => habits.map((h) => ({ name: h.name, streak: habitStreak(h.history), color: h.color })), [habits])
  const goalData = useMemo(() => goals.map((g) => ({ title: g.title, progress: g.progress })), [goals])

  // Focus minutes grouped per linked task (from Pomodoro → task picker).
  const taskFocus = useMemo(() => {
    const byId = new Map()
    tasks.forEach((t) => byId.set(t.id, { id: t.id, title: t.title, status: t.status, minutes: 0 }))
    pomodoros
      .filter((p) => p.type === 'focus' && p.taskId)
      .forEach((p) => {
        const e = byId.get(p.taskId)
        if (e) e.minutes += p.minutes || 0
      })
    return [...byId.values()]
      .filter((e) => e.minutes > 0)
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 8)
  }, [tasks, pomodoros])

  const summary = [
    { label: 'Total tasks completed', value: completedTasks, icon: CheckSquare, bg: 'bg-primary-500/10', color: 'text-primary-600 dark:text-primary-400' },
    { label: 'Total focus minutes', value: totalFocusMinutes, icon: Clock, bg: 'bg-teal-500/10', color: 'text-teal-500' },
    { label: 'Longest active streak', value: `${Math.max(0, ...habitData.map((h) => h.streak))}d`, icon: Flame, bg: 'bg-amber-500/10', color: 'text-amber-500' },
    { label: 'Goals tracked', value: goals.length, icon: Target, bg: 'bg-rose-500/10', color: 'text-rose-500' },
  ]

  return (
    <div className="space-y-4">
      <PageHeader title="Analytics" description="Your productivity, quantified." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map((s) => (
          <Card key={s.label} className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}><s.icon size={18} className={s.color} /></div>
            <div className="min-w-0">
              <p className="num text-xl leading-tight">{s.value}</p>
              <p className="text-[11px] font-medium text-dusk truncate">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card><h3 className="font-display text-sm font-semibold tracking-tight mb-1">Focus time</h3><p className="text-[11px] font-medium text-dusk mb-2">Last 7 days</p><WeeklyFocusChart data={focusData} /></Card>
        <Card><h3 className="font-display text-sm font-semibold tracking-tight mb-1">Tasks completed</h3><p className="text-[11px] font-medium text-dusk mb-2">Last 7 days</p><TasksTrendChart data={tasksTrend} /></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-display text-sm font-semibold tracking-tight mb-1">Focus time by task</h3>
          <p className="text-[11px] font-medium text-dusk mb-3">Linked focus sessions, all time</p>
          {taskFocus.length === 0 ? (
            <p className="text-sm text-muted-light dark:text-muted-dark py-10 text-center">No linked sessions yet — pick a task on the Pomodoro page before starting a focus session.</p>
          ) : (
            <div className="space-y-3">
              {taskFocus.map((t) => (
                <div key={t.id}>
                  <div className="flex items-center justify-between gap-2 text-xs mb-1">
                    <span className="truncate">{t.title}</span>
                    <span className="font-mono tabular-nums shrink-0 text-dusk">{t.minutes}m</span>
                  </div>
                  <Progress value={Math.round((t.minutes / taskFocus[0].minutes) * 100)} tone="teal" className="h-2" />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card><h3 className="font-display text-sm font-semibold tracking-tight mb-1">Habit streaks</h3><p className="text-[11px] font-medium text-dusk mb-2">Current streak per habit</p>{habitData.length ? <HabitStreakChart data={habitData} /> : <p className="text-sm text-muted-light dark:text-muted-dark py-10 text-center">No habits yet.</p>}</Card>
        <Card><h3 className="font-display text-sm font-semibold tracking-tight mb-1">Goal progress</h3><p className="text-[11px] font-medium text-dusk mb-2">Completion by goal</p>{goalData.length ? <GoalsBarChart data={goalData} /> : <p className="text-sm text-muted-light dark:text-muted-dark py-10 text-center">No goals yet.</p>}</Card>
      </div>
    </div>
  )
}
