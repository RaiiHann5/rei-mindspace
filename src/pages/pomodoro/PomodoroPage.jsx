import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Play, Pause, RotateCcw, SkipForward, Timer as TimerIcon, Settings2,
  Volume2, VolumeX, Target, X, Check,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { PageHeader } from '@/components/ui'
import { usePomodoroStore } from '@/store/usePomodoroStore'
import { useCollection } from '@/hooks/useCollection'
import { formatDate, isSameDay, cn } from '@/lib/utils'
import { weeklyFocusMinutes } from '@/lib/stats'
import { playChime } from '@/lib/sound'
import WeeklyFocusChart from '@/components/charts/WeeklyFocusChart'

const MODE_LABEL = { focus: 'Focus', short_break: 'Short break', long_break: 'Long break' }
// Mode accents are token references, not literal hex, so nothing here invents a
// colour. They are handed to inline styles (SVG stroke, bar fills), which is why
// they are CSS custom properties rather than class names.
const MODE_COLOR = {
  focus: 'var(--color-ember-500)',
  short_break: 'var(--color-teal-500)',
  long_break: 'var(--color-amber-500)',
}
const MODE_TONE = { focus: 'primary', short_break: 'teal', long_break: 'amber' }
const QUICK_PRESETS = [15, 25, 30, 45, 60, 90, 120]

function notify(title, body) {
  if (typeof Notification === 'undefined') return
  if (Notification.permission === 'granted') {
    try { new Notification(title, { body, icon: '/favicon.svg' }) } catch { /* noop */ }
  }
}

/* ---------- tiny local primitives (the timer uses its own, not @/components/ui) ---------- */

function Panel({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-[color:var(--line)] bg-surface-light dark:bg-surface-dark shadow-card',
        className
      )}
      {...props}
    />
  )
}

function IconBtn({ className, active, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        'h-10 w-10 rounded-xl border border-[color:var(--line)] flex items-center justify-center',
        'bg-surface-light dark:bg-panel2-dark text-muted-light dark:text-muted-dark shadow-soft',
        'transition-colors neo-press hover:text-ink-light dark:hover:text-ink-dark hover:border-[color:var(--line-strong)]',
        active && 'bg-primary-500/10 border-primary-500/30 text-primary-600 dark:text-primary-400',
        className
      )}
      {...props}
    />
  )
}

// The one gradient surface on the screen: the primary timer action.
function BigButton({ className, tone = 'ink', ...props }) {
  const tones = {
    ink: 'ember-cta hover:brightness-[1.06] active:brightness-100',
    ghost: 'bg-surface-light dark:bg-panel2-dark border border-[color:var(--line)] text-ink-light dark:text-ink-dark hover:border-[color:var(--line-strong)]',
  }
  return (
    <button
      type="button"
      className={cn(
        'h-14 px-7 rounded-xl font-display font-semibold',
        'flex items-center justify-center gap-2 select-none shadow-soft neo-press',
        tones[tone],
        className
      )}
      {...props}
    />
  )
}

function Chip({ active, className, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        'px-3 h-8 rounded-[7px] border text-xs font-semibold transition-colors neo-press',
        active
          ? 'bg-primary-500/10 border-primary-500/35 text-primary-600 dark:text-primary-400'
          : 'border-[color:var(--line)] bg-black/[0.03] dark:bg-white/[0.05] text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark',
        className
      )}
      {...props}
    />
  )
}

function Pill({ tone = 'primary', className, children }) {
  const tones = {
    primary: 'bg-primary-500/10 text-primary-600 dark:text-primary-400',
    teal: 'bg-teal-500/10 text-teal-700 dark:text-teal-300',
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  }
  return (
    <span
      className={cn(
        'px-2.5 h-5 inline-flex items-center rounded-[7px] text-[11px] font-semibold',
        tones[tone] || tones.primary,
        className
      )}
    >
      {children}
    </span>
  )
}

function Bar({ pct, accent }) {
  return (
    <div className="h-2.5 rounded-full bg-black/[0.06] dark:bg-white/[0.07] overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: accent }}
        animate={{ width: `${Math.min(100, pct)}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      />
    </div>
  )
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={cn(
        'w-12 h-7 rounded-full border border-[color:var(--line-strong)] relative transition-colors shrink-0 neo-press',
        checked ? 'bg-primary-500' : 'bg-black/10 dark:bg-white/10'
      )}
    >
      <motion.span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft"
        animate={{ left: checked ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

/* ---------------------------- main page ---------------------------- */

export default function PomodoroPage() {
  const {
    mode, secondsLeft, isRunning, cyclesCompleted, label, setLabel, taskId, setTaskId,
    tick, start, pause, reset, setMode, skipTo, durationFor,
    durations, setDuration, soundEnabled, setSoundEnabled,
    autoStart, setAutoStart, dailyGoal, setDailyGoal,
  } = usePomodoroStore()
  const { items: sessions, isLoading, createItem } = useCollection('pomodoros')
  const { items: tasks } = useCollection('tasks')
  const intervalRef = useRef()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [justFinished, setJustFinished] = useState(false)
  const accent = MODE_COLOR[mode]

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const prevMode = usePomodoroStore.getState().mode
      const prevSeconds = usePomodoroStore.getState().secondsLeft
      tick()
      const nowMode = usePomodoroStore.getState().mode
      if (prevSeconds === 1 && prevMode !== nowMode) {
        createItem({
          label: prevMode === 'focus' ? label : MODE_LABEL[prevMode],
          minutes: Math.round(durationFor(prevMode) / 60),
          completedAt: new Date().toISOString(),
          type: prevMode === 'focus' ? 'focus' : 'break',
          taskId: prevMode === 'focus' ? usePomodoroStore.getState().taskId : undefined,
        })
        const finishedFocus = prevMode === 'focus'
        if (usePomodoroStore.getState().soundEnabled) playChime(finishedFocus ? 'focus-done' : 'break-done')
        const msg = finishedFocus ? 'Sprint done — take a break' : 'Break over — back to it'
        toast.success(msg)
        notify('Meridian Pomodoro', msg)
        setJustFinished(true)
        setTimeout(() => setJustFinished(false), 1400)
      }
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [tick, createItem, label, durationFor])

  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Space') return
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return
      e.preventDefault()
      if (isRunning) pause(); else start()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isRunning, pause, start])

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const total = durationFor(mode)
  const pct = ((total - secondsLeft) / total) * 100
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')
  const currentMinutes = Math.round(total / 60)

  const todaySessions = sessions.filter((s) => isSameDay(s.completedAt, new Date()) && s.type === 'focus')
  const goalPct = Math.min(100, (todaySessions.length / dailyGoal) * 100)
  const focusData = weeklyFocusMinutes(sessions)

  const recentLabels = useMemo(() => {
    const seen = new Set()
    const out = []
    for (const s of sessions) {
      if (s.type !== 'focus' || !s.label || seen.has(s.label)) continue
      seen.add(s.label)
      out.push(s.label)
      if (out.length >= 5) break
    }
    return out
  }, [sessions])

  // Open tasks available to attach a focus session to.
  const openTasks = useMemo(
    () => tasks.filter((t) => !t.archived && t.status !== 'done').slice(0, 10),
    [tasks]
  )

  // Focus minutes grouped per task (open + completed), best first.
  const focusByTask = useMemo(() => {
    const byId = new Map()
    tasks.forEach((t) => byId.set(t.id, { id: t.id, title: t.title, minutes: 0 }))
    sessions
      .filter((s) => s.type === 'focus' && s.taskId)
      .forEach((s) => {
        const e = byId.get(s.taskId)
        if (e) e.minutes += s.minutes || 0
      })
    return [...byId.values()].filter((e) => e.minutes > 0).sort((a, b) => b.minutes - a.minutes).slice(0, 6)
  }, [sessions, tasks])

  const sessionLabel = (s) => {
    if (s.taskId) {
      const t = tasks.find((x) => x.id === s.taskId)
      if (t) return t.title
    }
    return s.label || 'Focus session'
  }

  const r = 88
  const circumference = 2 * Math.PI * r

  const applyMinutes = (mins) => {
    if (isRunning) return
    setDuration(mode, Math.max(1, Math.min(180, mins)))
  }

  const handleSkip = () => {
    const nextMode = mode === 'focus' ? 'short_break' : 'focus'
    skipTo(nextMode)
    toast('Skipped to ' + MODE_LABEL[nextMode])
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pomodoro"
        description="Distraction-free timer."
        actions={<IconBtn onClick={() => setSettingsOpen(true)} title="Timer settings"><Settings2 size={16} /></IconBtn>}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel className="lg:col-span-2 flex flex-col items-center py-10 px-6">
          {/* mode tabs */}
          <div className="relative flex gap-1 p-1 rounded-lg border border-[color:var(--line)] bg-black/[0.03] dark:bg-white/[0.05] mb-8">
            {Object.keys(MODE_LABEL).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="relative px-4 py-1.5 rounded-[7px] text-sm font-semibold neo-press"
              >
                {mode === m && (
                  <motion.div
                    layoutId="mode-pill"
                    className="absolute inset-0 rounded-[7px] border border-primary-500/30 bg-primary-500/10"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className={cn('relative', mode === m ? 'text-ink-light dark:text-ink-dark' : 'text-muted-light dark:text-muted-dark')}>
                  {MODE_LABEL[m]}
                </span>
              </button>
            ))}
          </div>

          {/* dial */}
          <motion.button
            type="button"
            onClick={() => (isRunning ? pause() : start())}
            whileTap={{ scale: 0.97 }}
            animate={justFinished ? { scale: [1, 1.06, 1] } : {}}
            className="relative h-60 w-60 mb-6 rounded-full hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
            title={isRunning ? 'Pause (Space)' : 'Start (Space)'}
          >
            <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
              <circle cx="100" cy="100" r={r} fill="none" strokeWidth="12" className="stroke-black/[0.08] dark:stroke-white/[0.09]" />
              <motion.circle
                cx="100" cy="100" r={r} fill="none" strokeWidth="12" strokeLinecap="round"
                style={{ stroke: accent }}
                strokeDasharray={circumference}
                animate={{ strokeDashoffset: circumference - (pct / 100) * circumference }}
                transition={{ duration: 0.6, ease: 'linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {/* Functional readout: mono with tabular numerals, never the gradient. */}
              <span className="font-mono tabular-nums text-5xl font-semibold leading-none text-ink-light dark:text-ink-dark">{mm}:{ss}</span>
              <Pill tone={MODE_TONE[mode]} className="mt-3">{MODE_LABEL[mode]}</Pill>
            </div>
          </motion.button>

          {/* flexible duration picker */}
          {!isRunning && (
            <div className="w-full max-w-sm mb-6 relative">
              <p className="text-[11px] font-medium text-dusk mb-2 text-center">
                duration <span className="font-mono tabular-nums">{currentMinutes} min</span>
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 mb-3">
                {QUICK_PRESETS.map((p) => (
                  <Chip key={p} active={currentMinutes === p} onClick={() => applyMinutes(p)}>
                    <span className="font-mono tabular-nums">{p < 60 ? `${p}m` : `${p / 60}h${p % 60 ? p % 60 + 'm' : ''}`}</span>
                  </Chip>
                ))}
              </div>
              <input
                type="range" min={5} max={180} step={5}
                value={currentMinutes}
                onChange={(e) => applyMinutes(Number(e.target.value))}
                className="w-full h-1.5 cursor-pointer accent-[color:var(--color-ember-500)]"
              />
              <div className="flex items-center justify-center gap-2 mt-2">
                <input
                  type="number" min={1} max={180}
                  value={currentMinutes}
                  onChange={(e) => applyMinutes(Number(e.target.value) || 1)}
                  className="w-16 h-8 text-center text-sm font-semibold font-mono tabular-nums rounded-md border border-[color:var(--line)] bg-surface-light dark:bg-surface-dark outline-none focus:border-ember-500/70 focus:ring-[3px] focus:ring-ember-500/15 transition-all"
                />
                <span className="text-[11px] text-dusk">1–180</span>
              </div>
            </div>
          )}

          {mode === 'focus' && (
            <div className="w-full max-w-sm mb-5 relative space-y-3">
              {openTasks.length > 0 && (
                <div>
                  <p className="text-[11px] font-medium text-dusk mb-2 text-center">
                    task
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {openTasks.map((t) => {
                      const active = t.id === taskId
                      return (
                        <Chip
                          key={t.id}
                          active={active}
                          title={active ? 'Clear task' : t.title}
                          onClick={() => {
                            if (active) { setTaskId(null); return }
                            setTaskId(t.id)
                            setLabel(t.title)
                          }}
                        >
                          <span className="max-w-[10rem] overflow-hidden text-ellipsis whitespace-nowrap">{t.title}</span>
                        </Chip>
                      )
                    })}
                  </div>
                </div>
              )}
              <input
                value={label}
                onChange={(e) => {
                  setLabel(e.target.value)
                  const active = tasks.find((t) => t.id === taskId)
                  if (active && e.target.value !== active.title) setTaskId(null)
                }}
                placeholder="name this sprint"
                className="w-full h-11 px-4 text-center text-sm rounded-md border border-[color:var(--line)] bg-surface-light dark:bg-surface-dark outline-none placeholder:text-dusk placeholder:font-normal focus:border-ember-500/70 focus:ring-[3px] focus:ring-ember-500/15 transition-all"
              />
              {recentLabels.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5">
                  {recentLabels.map((l) => (
                    <Chip key={l} active={l === label} onClick={() => setLabel(l)}>
                      {l}
                    </Chip>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 relative">
            <IconBtn onClick={reset} title="Reset"><RotateCcw size={16} /></IconBtn>
            <BigButton onClick={isRunning ? pause : start} className="w-36">
              {isRunning ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Start</>}
            </BigButton>
            <IconBtn onClick={handleSkip} title="Skip to next"><SkipForward size={16} /></IconBtn>
          </div>

          <p className="text-[11px] text-dusk mt-3 relative">Space to start/pause</p>

          <div className="w-full max-w-xs mt-6 relative">
            <div className="flex items-end justify-between mb-2">
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-dusk"><Target size={12} /> Daily goal</span>
              <span className="flex items-baseline gap-1.5">
                {/* The screen's single .ember-num hero number. */}
                <span className="num ember-num text-2xl leading-none">{todaySessions.length}</span>
                <span className="text-[11px] font-mono tabular-nums text-dusk">/ {dailyGoal}</span>
              </span>
            </div>
            <Bar pct={goalPct} accent={goalPct >= 100 ? MODE_COLOR.short_break : MODE_COLOR.focus} />
          </div>
          <p className="text-[11px] text-dusk mt-3 relative">
            <span className="font-mono tabular-nums">{cyclesCompleted}</span> this session
          </p>
        </Panel>

        <Panel className="p-5">
          <h3 className="font-display font-semibold tracking-tight mb-1">Focus minutes</h3>
          <p className="text-[11px] text-dusk mb-3">last 7 days</p>
          <WeeklyFocusChart data={focusData} />

          {focusByTask.length > 0 && (
            <div className="mt-5 pt-4 border-t border-[color:var(--line)]">
              <h3 className="font-display font-semibold tracking-tight mb-3">Focus by task</h3>
              <div className="space-y-2.5">
                {focusByTask.map((t) => (
                  <div key={t.id}>
                    <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                      <span className="truncate min-w-0 text-muted-light dark:text-muted-dark">{t.title}</span>
                      <span className="font-mono tabular-nums text-dusk shrink-0">{t.minutes}m</span>
                    </div>
                    <Bar pct={(t.minutes / focusByTask[0].minutes) * 100} accent={MODE_COLOR.focus} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>
      </div>

      <Panel className="p-5">
        <h3 className="font-display font-semibold tracking-tight mb-3 flex items-center gap-2"><TimerIcon size={16} /> Sessions</h3>
        {isLoading ? (
          <div className="h-24 rounded-2xl bg-black/[0.05] dark:bg-white/[0.05] animate-pulse" />
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-light dark:text-muted-dark text-center py-6">No sessions yet.</p>
        ) : (
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {sessions.slice(0, 20).map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-black/[0.03] dark:bg-white/[0.05]">
                <span className="truncate flex-1">{sessionLabel(s)}</span>
                {s.taskId && <span className="h-1.5 w-1.5 rounded-full bg-dusk shrink-0 mr-2" title="Linked to a task" />}
                <Pill tone={s.type === 'focus' ? 'primary' : 'teal'}><span className="font-mono tabular-nums">{s.minutes}m</span></Pill>
                <span className="text-[11px] font-mono tabular-nums text-dusk ml-3 w-32 text-right">
                  {formatDate(s.completedAt, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* settings sheet */}
      <AnimatePresence>
        {settingsOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-ink-light/55 dark:bg-ink-dark/72 backdrop-blur-[3px] z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSettingsOpen(false)}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 10, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                style={{ boxShadow: 'var(--shadow-pop)' }}
                className="w-full max-w-sm rounded-3xl border border-[color:var(--line)] bg-surface-light dark:bg-surface-dark p-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display text-lg font-semibold tracking-tight">Settings</h3>
                  <IconBtn onClick={() => setSettingsOpen(false)}><X size={16} /></IconBtn>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />} Chime
                      </p>
                      <p className="text-[11px] text-dusk">plays when a session ends</p>
                    </div>
                    <ToggleSwitch checked={soundEnabled} onChange={setSoundEnabled} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Auto-start</p>
                      <p className="text-[11px] text-dusk">next session starts on its own</p>
                    </div>
                    <ToggleSwitch checked={autoStart} onChange={setAutoStart} />
                  </div>

                  <div>
                    <label className="text-sm font-medium flex items-center gap-1.5 mb-1.5"><Target size={14} /> Daily goal (sessions)</label>
                    <input
                      type="number" min={1} max={20} value={dailyGoal}
                      onChange={(e) => setDailyGoal(Number(e.target.value) || 1)}
                      className="w-full h-10 px-3 font-mono tabular-nums rounded-md border border-[color:var(--line)] bg-surface-light dark:bg-surface-dark outline-none focus:border-ember-500/70 focus:ring-[3px] focus:ring-ember-500/15 transition-all"
                    />
                  </div>

                  {/* Flat secondary action: the Start/Pause button owns the gradient. */}
                  <BigButton tone="ghost" className="w-full" onClick={() => setSettingsOpen(false)}>
                    <Check size={16} /> Done
                  </BigButton>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}