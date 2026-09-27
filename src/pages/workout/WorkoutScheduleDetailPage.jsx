import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Clock, Timer, ListChecks, StickyNote, CalendarDays, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCollection } from '@/hooks/useCollection'
import { Card, Badge, Button, Switch, Skeleton } from '@/components/ui'
import WorkoutScheduleFormModal from './WorkoutScheduleFormModal'
import { workoutTypeInfo } from '@/lib/workoutTypes'
import { describeScheduleDays, isScheduledToday } from '@/lib/workoutSchedule'
import { cn } from '@/lib/utils'

const iconTone = {
  primary: 'bg-primary-500/10 text-primary-600 dark:text-primary-400',
  teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  default: 'bg-black/5 dark:bg-white/5 text-inherit',
}

export default function WorkoutScheduleDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { items, isLoading, updateItem, removeItem } = useCollection('workoutSchedules')
  const { createItem: createWorkout } = useCollection('workouts')
  const [modalOpen, setModalOpen] = useState(false)

  const schedule = items.find((s) => s.id === id)

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-40" /><Skeleton className="h-64 rounded-3xl" /></div>

  if (!schedule) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-light dark:text-muted-dark mb-4">Jadwal tidak ditemukan.</p>
        <Link to="/workout/schedule" className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
          <ArrowLeft size={15} /> Kembali ke Jadwal
        </Link>
      </div>
    )
  }

  const info = workoutTypeInfo(schedule.type)
  const dueToday = isScheduledToday(schedule)

  const save = async (data) => { await updateItem(schedule.id, data); toast.success('Jadwal diperbarui'); setModalOpen(false) }
  const del = async () => {
    if (confirm(`Hapus jadwal "${schedule.title}"?`)) {
      await removeItem(schedule.id); toast.success('Jadwal dihapus'); navigate('/workout/schedule')
    }
  }
  const toggleActive = () => updateItem(schedule.id, { active: !schedule.active })

  const logFromSchedule = async () => {
    await createWorkout({
      type: schedule.type,
      title: schedule.title,
      date: new Date().toISOString(),
      durationMin: schedule.durationMin,
      calories: '',
      intensity: 3,
      exercises: schedule.exercises || [],
      notes: schedule.notes || '',
    })
    toast.success('Workout dicatat dari jadwal ini')
    navigate('/workout')
  }

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/workout/schedule')} className="flex items-center gap-1.5 text-sm text-muted-light dark:text-muted-dark hover:text-inherit">
        <ArrowLeft size={15} /> Kembali ke Jadwal
      </button>

      <Card className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn('h-14 w-14 rounded-2xl flex items-center justify-center shrink-0', iconTone[info.color] || iconTone.default)}>
            <info.icon size={26} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="font-display text-xl font-semibold tracking-tight truncate">{schedule.title}</h1>
              <Badge tone={info.color === 'default' ? 'default' : info.color}>{info.label}</Badge>
              {dueToday && schedule.active !== false && <Badge tone="teal">Hari ini</Badge>}
              {schedule.active === false && <Badge tone="default">Nonaktif</Badge>}
            </div>
            <p className="text-[11px] text-dusk flex items-center gap-1.5">
              <CalendarDays size={13} /> {describeScheduleDays(schedule.days)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 mr-1">
            <span className="text-xs text-muted-light dark:text-muted-dark">Aktif</span>
            <Switch checked={schedule.active !== false} onChange={toggleActive} />
          </div>
          <Button variant="secondary" size="sm" onClick={() => setModalOpen(true)}><Pencil size={14} /> Edit</Button>
          <Button variant="danger" size="sm" onClick={del}><Trash2 size={14} /> Hapus</Button>
        </div>
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-wrap text-sm">
          {schedule.time && (
            <span className="flex items-center gap-1.5"><Clock size={15} className="text-primary-600 dark:text-primary-400" /> <span className="font-mono tabular-nums">{schedule.time}</span></span>
          )}
          <span className="flex items-center gap-1.5"><Timer size={15} className="text-teal-500" /> <span className="font-mono tabular-nums">{schedule.durationMin}</span> menit rencana</span>
          <span className="flex items-center gap-1.5"><ListChecks size={15} className="text-amber-500" /> <span className="font-mono tabular-nums">{(schedule.exercises || []).length}</span> exercise</span>
        </div>
        <Button size="sm" onClick={logFromSchedule}><CheckCircle2 size={14} /> Catat Workout dari Jadwal Ini</Button>
      </Card>

      {(schedule.exercises || []).length > 0 && (
        <Card>
          <h3 className="font-display text-sm font-semibold tracking-tight mb-3">Daftar Exercise</h3>
          <div className="space-y-1.5">
            {schedule.exercises.map((ex, i) => (
              <div key={ex.id || i} className="flex items-start justify-between gap-3 text-sm rounded-xl bg-panel2-light dark:bg-panel2-dark px-3 py-2">
                <span className="font-medium">{ex.name}</span>
                <span className="shrink-0 ml-2 text-right text-xs text-dusk font-mono tabular-nums leading-snug">
                  {ex.sets && <span className="block">{ex.sets} set</span>}
                  {ex.reps && <span className="block">{ex.reps} rep</span>}
                  {ex.weight && <span className="block">{ex.weight}</span>}
                  {!ex.sets && !ex.reps && !ex.weight && <span>—</span>}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <h3 className="font-display text-sm font-semibold tracking-tight mb-2 flex items-center gap-1.5"><StickyNote size={15} /> Catatan</h3>
        <p className="text-sm text-muted-light dark:text-muted-dark whitespace-pre-wrap">{schedule.notes || 'Belum ada catatan untuk jadwal ini.'}</p>
      </Card>

      <WorkoutScheduleFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={save} initial={schedule} />
    </div>
  )
}
