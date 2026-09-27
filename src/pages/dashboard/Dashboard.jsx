import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus, ArrowUpRight, Bell, CalendarDays, CalendarCheck2, Timer,
  Target, Flame, Clock, Pencil, BellRing, CheckCircle2, Sparkles, FolderKanban,
} from 'lucide-react'
import { useCollection } from '@/hooks/useCollection'
import { useAuthStore } from '@/store/useAuthStore'
import { useNotificationStore } from '@/store/useNotificationStore'
import { Card, Badge, Avatar, Skeleton, Checkbox, CircularProgress, Progress } from '@/components/ui'
import { formatDate, isSameDay, daysUntil, PRIORITY_ORDER, nextOccurrence, cn } from '@/lib/utils'
import { habitStreak, habitCompletionRate, weeklyFocusMinutes } from '@/lib/stats'
import WeeklyFocusChart from '@/components/charts/WeeklyFocusChart'

const priorityTone = { urgent: 'rose', high: 'amber', medium: 'primary', low: 'default' }
// Resolved from the desaturated status tokens so the priority rail never
// shouts over the ember accent.
const priorityDot = {
  urgent: 'var(--color-rose-500)',
  high: 'var(--color-amber-500)',
  medium: 'var(--color-primary-500)',
  low: 'var(--color-dusk)',
}

const notifIcon = { event: CalendarDays, task: CheckCircle2, habit: Flame }

function weekStrip(anchor = new Date()) {
  const start = new Date(anchor)
  start.setDate(start.getDate() - start.getDay() + 1) // Monday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { items: tasks, isLoading: loadingTasks, updateItem: updateTask, createItem: createTask } = useCollection('tasks')
  const { items: events } = useCollection('events')
  const { items: habits } = useCollection('habits')
  const { items: projects } = useCollection('projects')
  const { items: pomodoros } = useCollection('pomodoros')
  const { items: notifItems } = useNotificationStore()

  const firstName = (user?.displayName || 'there').split(' ')[0]

  const todayTasks = useMemo(
    () => tasks.filter((t) => !t.archived && t.status !== 'done' && t.dueDate && isSameDay(t.dueDate, new Date()))
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]),
    [tasks]
  )

  const weekTasks = useMemo(
    () => tasks.filter((t) => !t.archived && t.status !== 'done' && t.dueDate && !isSameDay(t.dueDate, new Date()) && daysUntil(t.dueDate) > 0 && daysUntil(t.dueDate) <= 6)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)),
    [tasks]
  )

  const featuredTask = todayTasks[0] || tasks.find((t) => !t.archived && t.status !== 'done')

  const todayEvents = useMemo(
    () => events.filter((e) => isSameDay(e.date, new Date())).sort((a, b) => new Date(a.date) - new Date(b.date)),
    [events]
  )

  const nextEvent = useMemo(
    () => [...events].filter((e) => new Date(e.date) >= new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0],
    [events]
  )

  const eventDaySet = useMemo(() => new Set(events.map((e) => new Date(e.date).toDateString())), [events])
  const activeProjects = useMemo(() => projects.filter((p) => p.status === 'active').slice(0, 3), [projects])
  const focusData = useMemo(() => weeklyFocusMinutes(pomodoros), [pomodoros])

  const days = weekStrip()
  const bestHabit = habits.reduce((best, h) => (habitStreak(h.history) > habitStreak(best?.history || {}) ? h : best), habits[0])

  // Completing a recurring task from here schedules its next occurrence too.
  const toggleDone = async (task) => {
    const finishing = task.status !== 'done'
    await updateTask(task.id, { status: finishing ? 'done' : 'todo', updatedAt: new Date().toISOString() })
    if (finishing && task.repeat) {
      await createTask({
        ...task,
        id: undefined,
        title: task.title,
        status: 'todo',
        archived: false,
        dueDate: nextOccurrence(task.dueDate || new Date().toISOString(), task.repeat),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
  }
  const doneToday = tasks.filter((t) => t.status === 'done' && t.updatedAt && isSameDay(t.updatedAt, new Date())).length
  const weekTasksTotal = tasks.filter((t) => t.dueDate && daysUntil(t.dueDate) >= -6 && daysUntil(t.dueDate) <= 0).length || 1
  const weekTasksDone = tasks.filter((t) => t.status === 'done' && t.updatedAt && daysUntil(t.updatedAt) >= -6 && daysUntil(t.updatedAt) <= 0).length
  const weekCompletionPct = Math.round((weekTasksDone / weekTasksTotal) * 100)
  const habitPct = bestHabit ? habitCompletionRate(bestHabit.history, 30) : 0

  const shortcuts = [
    { label: 'Week', desc: 'Plan the week', icon: CalendarCheck2, to: '/calendar', tone: 'teal' },
    { label: 'Focus', desc: 'Run a timer', icon: Timer, to: '/pomodoro', tone: 'amber' },
    { label: 'Goals', desc: 'Track progress', icon: Target, to: '/goals', tone: 'rose' },
  ]

  const toneClasses = {
    primary: 'bg-primary-500/12 text-primary-600 dark:text-ember-300',
    teal: 'bg-teal-500/12 text-teal-600 dark:text-teal-300',
    amber: 'bg-amber-500/12 text-amber-600 dark:text-amber-300',
    rose: 'bg-rose-500/12 text-rose-600 dark:text-rose-300',
  }

  return (
    <div className="space-y-4 pb-10">
      {/* Hero row */}
      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-4 items-stretch">
        <div className="flex flex-col justify-center px-1 py-4">
          <p className="text-sm text-muted-light dark:text-muted-dark mb-2 flex items-center gap-1.5">
            {formatDate(new Date(), { weekday: 'long', month: 'long', day: 'numeric' })} <Sparkles size={14} className="text-primary-600 dark:text-primary-400" />
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.1]">
            {firstName}.<br />Here's the day.
          </h1>
          <p className="text-sm text-muted-light dark:text-muted-dark mt-3 max-w-sm">
            Tasks, focus, and money in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* The one gradient surface on this screen: the primary action.
              Single column on a phone — at two columns the CTA label and the
              shortcut text clip. */}
          <Link
            to="/tasks"
            className="ember-cta rounded-2xl flex flex-col items-center justify-center gap-2 font-semibold hover:brightness-[1.06] transition-all min-h-[112px]"
          >
            <Plus size={26} strokeWidth={2.2} />
            <span className="text-xs font-medium opacity-90">New task</span>
          </Link>
          {shortcuts.map((s) => (
            <Link key={s.label} to={s.to} className="glass rounded-2xl p-4 flex flex-col justify-between min-h-[112px] card-hover">
              <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', toneClasses[s.tone])}>
                <s.icon size={18} strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">{s.label}</p>
                <p className="text-[11px] text-muted-light dark:text-muted-dark leading-tight mt-0.5">{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Notifications / Featured task / Calendar */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold flex items-center gap-1.5"><Bell size={15} /> Notifications</h2>
            {notifItems.length > 0 && <button onClick={() => useNotificationStore.getState().clearAll()} className="text-xs text-primary-600 dark:text-primary-400">Clear</button>}
          </div>
          {notifItems.length === 0 ? (
            <p className="text-sm text-dusk py-8 text-center">Nothing new.</p>
          ) : (
            <ul className="space-y-1">
              {notifItems.slice(0, 4).map((n) => {
                const Icon = notifIcon[n.type] || BellRing
                return (
                  <li key={n.id} className="flex items-start gap-2.5 px-2 py-2 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.04]">
                    <span className="h-8 w-8 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={15} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      {n.body && <p className="text-xs text-muted-light dark:text-muted-dark line-clamp-2">{n.body}</p>}
                    </div>
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />}
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold">Up next</h2>
            <Link to="/tasks" className="text-xs text-primary-600 dark:text-primary-400">Edit</Link>
          </div>
          {featuredTask ? (
            <>
                <p className="text-[11px] text-muted-light dark:text-muted-dark mb-1">
                  {featuredTask.tags?.[0] || 'General'}
                </p>
              <p className="font-display font-semibold leading-snug mb-3">{featuredTask.title}</p>
              <div className="flex items-center gap-2 mb-4">
                <Badge tone={priorityTone[featuredTask.priority]}>{featuredTask.priority}</Badge>
                {featuredTask.dueDate && (
                  <Badge tone="default">{daysUntil(featuredTask.dueDate) === 0 ? 'Due today' : formatDate(featuredTask.dueDate)}</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <Avatar name={user?.displayName || 'You'} src={user?.photoURL} size={30} />
                <Link to="/tasks" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-300 text-xs font-medium hover:bg-primary-500/15 transition-colors">
                  <Plus size={13} /> New task
                </Link>
              </div>
            </>
          ) : (
            <p className="text-sm text-dusk py-8 text-center">Nothing pending.</p>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold">{formatDate(new Date(), { month: 'long', year: 'numeric' })}</h2>
            <Link to="/calendar" className="text-primary-600 dark:text-primary-400"><ArrowUpRight size={16} /></Link>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {days.map((d) => {
              const today = isSameDay(d, new Date())
              const hasEvent = eventDaySet.has(d.toDateString())
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => navigate('/calendar', { state: { date: d.toISOString(), view: 'day' } })}
                  className="flex flex-col items-center gap-1 py-1.5 rounded-lg hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                >
                  <span className="text-[10px] text-muted-light dark:text-muted-dark">{formatDate(d, { weekday: 'narrow' })}</span>
                  <span className={cn(
                    'h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium',
                    today ? 'bg-primary-500 text-ink-light' : 'text-inherit'
                  )}>
                    {d.getDate()}
                  </span>
                  <span className={cn('h-1 w-1 rounded-full', hasEvent && !today ? 'bg-primary-400' : 'bg-transparent')} />
                </button>
              )
            })}
          </div>
          {todayEvents.length === 0 ? (
            <p className="text-sm text-muted-light dark:text-muted-dark py-4 text-center">No events today.</p>
          ) : (
            <ul className="space-y-3">
              {todayEvents.slice(0, 3).map((e) => (
                <li key={e.id} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-primary-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{e.title}</p>
                    <p className="text-xs text-muted-light dark:text-muted-dark">
                      {formatDate(e.date, { hour: 'numeric', minute: '2-digit' })}
                      {e.end && ` – ${formatDate(e.end, { hour: 'numeric', minute: '2-digit' })}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Today tasks + right rail */}
      <div className="grid lg:grid-cols-3 gap-4 items-start">
        <Card className="lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold">Today's tasks</h2>
            <Link to="/tasks" className="text-sm text-primary-600 dark:text-ember-300 hover:opacity-80 transition-opacity">View all</Link>
          </div>
          {loadingTasks ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : todayTasks.length === 0 ? (
            <p className="text-sm text-dusk py-6 text-center">Clear day.</p>
          ) : (
            <ul className="space-y-1.5">
              {todayTasks.slice(0, 6).map((t) => (
                <li
                  key={t.id}
                  className="flex items-center gap-3 pl-3 pr-2 py-2.5 rounded-xl border-l-[3px] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
                  style={{ borderColor: priorityDot[t.priority] }}
                >
                  <Checkbox checked={t.status === 'done'} onChange={() => toggleDone(t)} />
                  <span className="flex-1 text-sm truncate">{t.title}</span>
                  {t.tags?.[0] && <Badge tone="default">{t.tags[0]}</Badge>}
                  <span className="hidden sm:flex items-center gap-1 text-xs text-muted-light dark:text-muted-dark">
                    <Clock size={12} /> {formatDate(t.dueDate, { hour: 'numeric', minute: '2-digit' })}
                  </span>
                  <button className="h-7 w-7 rounded-lg hidden sm:flex items-center justify-center hover:bg-black/[0.05] dark:hover:bg-white/[0.07] text-muted-light dark:text-muted-dark">
                    <Pencil size={13} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark flex-1 flex flex-col">
            <p className="text-xs font-semibold text-dusk mb-2">Later this week</p>
            {weekTasks.length === 0 ? (
              <p className="text-sm text-dusk py-4 text-center flex-1 flex items-center justify-center">Nothing else this week.</p>
            ) : (
              <ul className="space-y-1">
                {weekTasks.slice(0, 5).map((t) => (
                  <li key={t.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors">
                    <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: priorityDot[t.priority] }} />
                    <span className="flex-1 text-sm truncate text-ink-light/80 dark:text-ink-dark/80">{t.title}</span>
                    {t.tags?.[0] && <Badge tone="default" className="hidden sm:inline-flex">{t.tags[0]}</Badge>}
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-muted-light dark:text-muted-dark shrink-0">
                      {formatDate(t.dueDate, { weekday: 'short' })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          {/* Streak card — the one hero number on this screen. The panel stays
              a flat dark surface; only the numeral carries the gradient. */}
          <Card className="relative overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] text-dusk mb-1">Best streak</p>
                {bestHabit ? (
                  <>
                    <p className="ember-num font-display text-[42px] leading-none tracking-tight">
                      {habitStreak(bestHabit.history)}
                    </p>
                    <p className="text-sm text-muted-light dark:text-muted-dark mt-1.5 line-clamp-1">
                      on {bestHabit.name}
                    </p>
                  </>
                ) : (
                  <p className="font-display text-xl leading-snug">No streak yet</p>
                )}
              </div>
              <span className="h-10 w-10 rounded-lg shrink-0 flex items-center justify-center text-amber-500" style={{ background: 'var(--accent-gradient-soft)' }}>
                <Flame size={19} strokeWidth={2} />
              </span>
            </div>
            <p className="text-sm text-muted-light dark:text-muted-dark mt-4 mb-5">
              {doneToday > 0
                ? `${doneToday} task${doneToday === 1 ? '' : 's'} done today.`
                : 'Pick a task, then start a timer.'}
            </p>
            <Link to="/pomodoro" className="inline-flex items-center h-9 px-3.5 rounded-lg text-sm font-semibold border border-[color:var(--line-strong)] hover:border-ember-500/60 hover:text-ember-500 transition-colors">
              Start a session
            </Link>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="flex flex-col items-center text-center gap-2">
              <CircularProgress value={weekCompletionPct} tone="teal" size={54} />
              <div>
                <p className="text-xs font-medium">This week</p>
                <p className="text-[11px] text-muted-light dark:text-muted-dark">{weekTasksDone}/{weekTasksTotal} done</p>
              </div>
            </Card>
            <Card className="flex flex-col items-center text-center gap-2">
              <CircularProgress value={habitPct} tone="rose" size={54} />
              <div>
                <p className="text-xs font-medium">{bestHabit ? bestHabit.name : 'Habit'}</p>
                <p className="text-[11px] text-dusk">30-day rate</p>
              </div>
            </Card>
          </div>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-semibold text-sm">Coming up</h2>
              <Link to="/calendar" className="text-primary-600 dark:text-primary-400"><CalendarDays size={15} /></Link>
            </div>
            {nextEvent ? (
              <>
                <p className="text-sm font-medium mb-1">{nextEvent.title}</p>
                <p className="text-xs text-muted-light dark:text-muted-dark mb-4">
                  {formatDate(nextEvent.date, { weekday: 'short', month: 'short', day: 'numeric' })}
                  <span className="block font-mono mt-0.5">
                    {formatDate(nextEvent.date, { hour: 'numeric', minute: '2-digit' })}
                  </span>
                </p>
                <div className="flex gap-2">
                  <Link to="/calendar" className="flex-1 h-8 rounded-md text-xs font-semibold glass-solid inline-flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.06]">Reschedule</Link>
                  <Link to="/calendar" className="flex-1 h-8 rounded-md text-xs font-semibold border border-[color:var(--line-strong)] inline-flex items-center justify-center hover:border-ember-500/60 hover:text-ember-500 transition-colors">View</Link>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-light dark:text-muted-dark py-4 text-center">Nothing scheduled.</p>
            )}
          </Card>
        </div>
      </div>

      {/* Active projects + focus trend */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold">Projects</h2>
            <Link to="/projects" className="text-sm text-primary-600 dark:text-ember-300 hover:opacity-80 transition-opacity">View all</Link>
          </div>
          {activeProjects.length === 0 ? (
            <p className="text-sm text-muted-light dark:text-muted-dark py-8 text-center">No active projects.</p>
          ) : (
            <div className="grid sm:grid-cols-3 gap-3">
              {activeProjects.map((p, idx) => {
                const dleft = daysUntil(p.deadline)
                const tones = ['primary', 'teal', 'amber']
                const tone = tones[idx % tones.length]
                return (
                  <Link
                    to={`/projects/${p.id}`}
                    key={p.id}
                    className="rounded-xl p-4 bg-black/[0.025] dark:bg-white/[0.04] hover:bg-black/[0.05] dark:hover:bg-white/[0.07] transition-colors block"
                  >
                    <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center mb-3', toneClasses[tone] || toneClasses.teal)}>
                      <FolderKanban size={15} />
                    </div>
                    <p className="text-sm font-medium truncate mb-2">{p.name}</p>
                    <Progress value={p.progress} tone={tone === 'default' ? 'primary' : tone} className="mb-2" />
                    <div className="flex justify-between text-[11px] text-muted-light dark:text-muted-dark">
                      <span>{p.progress}%</span>
                      {dleft !== null && <span>{dleft >= 0 ? `${dleft}d left` : 'overdue'}</span>}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-display font-semibold text-sm">Focus</h2>
            <Link to="/pomodoro" className="text-primary-600 dark:text-primary-400"><Timer size={15} /></Link>
          </div>
          <p className="text-xs text-dusk mb-2">Minutes, 7 days</p>
          <WeeklyFocusChart data={focusData} />
        </Card>
      </div>
    </div>
  )
}
