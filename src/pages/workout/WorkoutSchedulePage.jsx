import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowLeft, Clock, Timer, ListChecks, Pencil, Trash2, CalendarCheck2, CalendarClock } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCollection } from '@/hooks/useCollection'
import { PageHeader, Button, Card, Badge, EmptyState, Skeleton, Switch } from '@/components/ui'
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

export default function WorkoutSchedulePage() {
  const navigate = useNavigate()
  const { items, isLoading, createItem, updateItem, removeItem } = useCollection('workoutSchedules')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const sorted = useMemo(
    () => [...items].sort((a, b) => (isScheduledToday(b) - isScheduledToday(a)) || (a.time || '99:99').localeCompare(b.time || '99:99')),
    [items]
  )
  const todayCount = useMemo(() => items.filter((s) => isScheduledToday(s)).length, [items])

  const save = async (data) => {
    if (editing) { await updateItem(editing.id, data); toast.success('Jadwal diperbarui') }
    else { await createItem(data); toast.success('Jadwal ditambahkan') }
    setModalOpen(false); setEditing(null)
  }
  const del = async (s) => { if (confirm(`Hapus jadwal "${s.title}"?`)) { await removeItem(s.id); toast.success('Jadwal dihapus') } }
  const toggleActive = async (s) => { await updateItem(s.id, { active: !s.active }) }

  return (
    <div>
      <button onClick={() => navigate('/workout')} className="flex items-center gap-1.5 text-sm text-muted-light dark:text-muted-dark hover:text-inherit mb-3">
        <ArrowLeft size={15} /> Kembali ke Workout
      </button>

      <PageHeader
        title="Jadwal Workout"
        description="Rutinitas mingguan, tetap jalan."
        actions={<Button onClick={() => { setEditing(null); setModalOpen(true) }}><Plus size={16} /> Tambah jadwal</Button>}
      />

      <Card className="flex items-center gap-2.5 mb-5">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-primary-500/10 text-primary-600 dark:text-primary-400">
          <CalendarCheck2 size={18} />
        </div>
        <p className="text-sm">
          <span className="num text-base">{todayCount}</span>{' '}
          <span className="text-muted-light dark:text-muted-dark">jadwal hari ini</span>
        </p>
      </Card>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="Belum ada jadwal."
          description="Rutinitas butuh jadwal."
          actionLabel="Tambah jadwal"
          onAction={() => { setEditing(null); setModalOpen(true) }}
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {sorted.map((s) => {
            const info = workoutTypeInfo(s.type)
            const dueToday = isScheduledToday(s)
            return (
              <Card
                key={s.id}
                hover
                className={cn('group', !s.active && 'opacity-60')}
                onClick={() => navigate(`/workout/schedule/${s.id}`)}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', iconTone[info.color] || iconTone.default)}>
                      <info.icon size={19} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-display font-semibold tracking-tight truncate">{s.title}</p>
                        {dueToday && s.active && <Badge tone="teal">Hari ini</Badge>}
                      </div>
                      <p className="text-[11px] text-dusk">{describeScheduleDays(s.days)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Switch checked={s.active !== false} onChange={() => toggleActive(s)} />
                    <button onClick={() => { setEditing(s); setModalOpen(true) }} aria-label="Edit jadwal" className="h-7 w-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 neo-press"><Pencil size={13} /></button>
                    <button onClick={() => del(s)} className="h-7 w-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-500 neo-press"><Trash2 size={13} /></button>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {s.time && <Badge><Clock size={11} className="inline mr-1 -mt-0.5" /><span className="font-mono tabular-nums">{s.time}</span></Badge>}
                  <Badge><Timer size={11} className="inline mr-1 -mt-0.5" /><span className="font-mono tabular-nums">{s.durationMin}</span> mnt</Badge>
                  {(s.exercises || []).length > 0 && <Badge><ListChecks size={11} className="inline mr-1 -mt-0.5" /><span className="font-mono tabular-nums">{s.exercises.length}</span> exercise</Badge>}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <WorkoutScheduleFormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }} onSubmit={save} initial={editing} />
    </div>
  )
}
