import { useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw, SkipForward, Timer as TimerIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePomodoroStore } from '@/store/usePomodoroStore'
import { useCollection } from '@/hooks/useCollection'
import { PageHeader, Card, Button, Input, Tabs, Badge, Skeleton } from '@/components/ui'
import { formatDate, isSameDay } from '@/lib/utils'
import { weeklyFocusMinutes } from '@/lib/stats'
import WeeklyFocusChart from '@/components/charts/WeeklyFocusChart'

const MODE_LABEL = { focus: 'Focus', short_break: 'Short break', long_break: 'Long break' }
const MODE_TONE = { focus: 'primary', short_break: 'teal', long_break: 'amber' }

export default function PomodoroPage() {
  const { mode, secondsLeft, isRunning, cyclesCompleted, label, setLabel, tick, start, pause, reset, setMode, durationFor } = usePomodoroStore()
  const { items: sessions, isLoading, createItem } = useCollection('pomodoros')
  const intervalRef = useRef()

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
        })
        toast.success(prevMode === 'focus' ? 'Focus session complete — take a break' : 'Break over — back to it')
      }
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [tick, createItem, label, durationFor])

  const total = durationFor(mode)
  const pct = ((total - secondsLeft) / total) * 100
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')

  const todaySessions = sessions.filter((s) => isSameDay(s.completedAt, new Date()) && s.type === 'focus')
  const focusData = weeklyFocusMinutes(sessions)

  const r = 88
  const circumference = 2 * Math.PI * r

  return (
    <div className="space-y-6">
      <PageHeader title="Pomodoro" description="Focused sprints with tracked history." />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 flex flex-col items-center py-10">
          <Tabs
            tabs={[{ value: 'focus', label: 'Focus' }, { value: 'short_break', label: 'Short break' }, { value: 'long_break', label: 'Long break' }]}
            active={mode} onChange={setMode} className="mb-8"
          />
          <div className="relative h-56 w-56 mb-8">
            <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
              <circle cx="100" cy="100" r={r} fill="none" strokeWidth="10" className="stroke-black/[0.06] dark:stroke-white/[0.08]" />
              <circle
                cx="100" cy="100" r={r} fill="none" strokeWidth="10" strokeLinecap="round"
                stroke={mode === 'focus' ? '#5A4FFF' : mode === 'short_break' ? '#1EC4B0' : '#F7A331'}
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (pct / 100) * circumference}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-5xl font-semibold tabular-nums">{mm}:{ss}</span>
              <Badge tone={MODE_TONE[mode]} className="mt-2">{MODE_LABEL[mode]}</Badge>
            </div>
          </div>

          {mode === 'focus' && (
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="What are you focusing on?" className="max-w-xs text-center mb-5" />
          )}

          <div className="flex items-center gap-3">
            <Button variant="secondary" size="icon" onClick={reset}><RotateCcw size={16} /></Button>
            <Button size="lg" onClick={isRunning ? pause : start} className="w-32 justify-center">
              {isRunning ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Start</>}
            </Button>
            <Button variant="secondary" size="icon" onClick={() => setMode(mode === 'focus' ? 'short_break' : 'focus')}><SkipForward size={16} /></Button>
          </div>
          <p className="text-xs text-muted-light dark:text-muted-dark mt-6">{cyclesCompleted} focus sessions completed this session • {todaySessions.length} today</p>
        </Card>

        <Card>
          <h3 className="font-display font-semibold mb-1">This week</h3>
          <p className="text-xs text-muted-light dark:text-muted-dark mb-2">Focus minutes</p>
          <WeeklyFocusChart data={focusData} />
        </Card>
      </div>

      <Card>
        <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><TimerIcon size={16} /> Session history</h3>
        {isLoading ? <Skeleton className="h-24" /> : sessions.length === 0 ? (
          <p className="text-sm text-muted-light dark:text-muted-dark text-center py-6">No sessions logged yet.</p>
        ) : (
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {sessions.slice(0, 20).map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.05]">
                <span className="truncate flex-1">{s.label}</span>
                <Badge tone={s.type === 'focus' ? 'primary' : 'teal'}>{s.minutes}m</Badge>
                <span className="text-xs text-muted-light dark:text-muted-dark ml-3 w-32 text-right">{formatDate(s.completedAt, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
