import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { id as idLocale } from 'date-fns/locale'
import { format } from 'date-fns'
import { Plus, Flame, Timer, Dumbbell, Zap, Pencil, Trash2, ListChecks, CalendarRange, CalendarClock } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCollection } from '@/hooks/useCollection'
import { PageHeader, Button, Card, Badge, EmptyState, Skeleton } from '@/components/ui'
import WorkoutFormModal from './WorkoutFormModal'
import WorkoutWeeklyChart from '@/components/charts/WorkoutWeeklyChart'
import { WORKOUT_TYPES, workoutTypeInfo, INTENSITY_LABELS } from '@/lib/workoutTypes'
import { weeklyWorkoutMinutes, workoutStreak, thisWeekStats, allTimeStats } from '@/lib/workoutStats'
import { cn } from '@/lib/utils'

const iconTone = {
  primary: 'bg-primary-500/10 text-primary-600 dark:text-primary-400',
  teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  default: 'bg-black/5 dark:bg-white/5 text-inherit',
}

export default function WorkoutPage() {
  const navigate = useNavigate()
  const { items, isLoading, createItem, updateItem, removeItem } = useCollection('workouts')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [typeFilter, setTypeFilter] = useState(null)

  const sorted = useMemo(() => [...items].sort((a, b) => new Date(b.date) - new Date(a.date)), [items])
  const filtered = useMemo(
    () => (typeFilter ? sorted.filter((w) => w.type === typeFilter) : sorted),
    [sorted, typeFilter]
  )

  const streak = workoutStreak(items)
  const week = thisWeekStats(items)
  const allTime = useMemo(() => allTimeStats(items), [items])
  const chartData = useMemo(() => weeklyWorkoutMinutes(items), [items])

  const save = async (data) => {
    if (editing) { await updateItem(editing.id, data); toast.success('Workout diperbarui') }
    else { await createItem(data); toast.success('Workout dicatat') }
    setModalOpen(false); setEditing(null)
  }
  const del = async (w) => { if (confirm(`Hapus workout "${w.title}"?`)) { await removeItem(w.id); toast.success('Workout dihapus') } }

  return (
    <div>
      <PageHeader
        title="Workout"
        description="Catat sesi latihan, pantau progres, dan bangun konsistensi."
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/workout/schedule')}><CalendarClock size={16} /> Jadwal</Button>
            <Button onClick={() => { setEditing(null); setModalOpen(true) }}><Plus size={16} /> Catat Workout</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card className="flex flex-col items-center text-center gap-1.5">
          <Flame size={18} className="text-amber-500" />
          <p className="num text-xl">{streak}</p>
          <p className="text-[11px] font-medium text-dusk">Hari beruntun</p>
        </Card>
        <Card className="flex flex-col items-center text-center gap-1.5">
          <Dumbbell size={18} className="text-primary-600 dark:text-primary-400" />
          <p className="num text-xl">{week.count}</p>
          <p className="text-[11px] font-medium text-dusk">Sesi minggu ini</p>
        </Card>
        <Card className="flex flex-col items-center text-center gap-1.5">
          <Timer size={18} className="text-teal-500" />
          <p className="num text-xl">{week.minutes}</p>
          <p className="text-[11px] font-medium text-dusk">Menit minggu ini</p>
        </Card>
        <Card className="flex flex-col items-center text-center gap-1.5">
          <Zap size={18} className="text-rose-500" />
          <p className="num text-xl">{week.calories || 0}</p>
          <p className="text-[11px] font-medium text-dusk">Kalori minggu ini</p>
        </Card>
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-primary-500/10 text-primary-600 dark:text-primary-400">
            <CalendarRange size={18} />
          </div>
          <p className="text-[11px] font-medium text-dusk">Total Sepanjang Waktu</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-dusk">
          <span>Sesi <span className="font-mono tabular-nums text-ink-light dark:text-ink-dark">{allTime.count}</span></span>
          <span>Menit <span className="font-mono tabular-nums text-ink-light dark:text-ink-dark">{allTime.minutes}</span></span>
          <span>Kalori <span className="font-mono tabular-nums text-ink-light dark:text-ink-dark">{allTime.calories}</span></span>
        </div>
      </Card>

      <Card className="mb-5">
        <h3 className="font-display text-sm font-semibold tracking-tight">Durasi Latihan</h3>
        <p className="text-[11px] font-medium text-dusk mb-2">7 hari terakhir</p>
        <WorkoutWeeklyChart data={chartData} />
      </Card>

      <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
        <button
          onClick={() => setTypeFilter(null)}
          className={cn('h-8 px-3 rounded-lg text-xs font-semibold shrink-0 neo-press transition-colors',
            !typeFilter
              ? 'bg-primary-500/10 text-primary-700 dark:text-ember-300'
              : 'border border-[color:var(--line)] text-muted-light dark:text-muted-dark hover:border-[color:var(--line-strong)] hover:text-ink-light dark:hover:text-ink-dark')}
        >
          Semua
        </button>
        {WORKOUT_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setTypeFilter(typeFilter === t.value ? null : t.value)}
            className={cn('h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 neo-press transition-colors',
              typeFilter === t.value
                ? 'bg-primary-500/10 text-primary-700 dark:text-ember-300'
                : 'border border-[color:var(--line)] text-muted-light dark:text-muted-dark hover:border-[color:var(--line-strong)] hover:text-ink-light dark:hover:text-ink-dark')}
          >
            <t.icon size={12} /> {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title={typeFilter ? 'Tidak ada workout jenis ini' : 'Belum ada workout tercatat'}
          description={typeFilter ? 'Coba pilih jenis lain atau catat sesi baru.' : 'Mulai catat sesi latihan pertamamu untuk membangun konsistensi.'}
          actionLabel="Catat Workout"
          onAction={() => { setEditing(null); setModalOpen(true) }}
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((w) => {
            const info = workoutTypeInfo(w.type)
            return (
              <Card key={w.id} hover className="group" onClick={() => navigate(`/workout/${w.id}`)}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', iconTone[info.color] || iconTone.default)}>
                      <info.icon size={19} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-display font-semibold tracking-tight truncate">{w.title}</p>
                      <p className="text-[11px] text-dusk capitalize">
                        {format(new Date(w.date), 'EEE, d MMM yyyy', { locale: idLocale })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); setEditing(w); setModalOpen(true) }} aria-label="Edit workout" className="h-7 w-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 neo-press"><Pencil size={13} /></button>
                    <button onClick={(e) => { e.stopPropagation(); del(w) }} className="h-7 w-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-500 neo-press"><Trash2 size={13} /></button>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <Badge tone={info.color === 'default' ? 'default' : info.color}><span className="font-mono tabular-nums">{w.durationMin}</span> mnt</Badge>
                  {!!w.calories && <Badge tone="rose"><span className="font-mono tabular-nums">{w.calories}</span> kal</Badge>}
                  <Badge>Intensitas: {INTENSITY_LABELS[w.intensity] || '—'}</Badge>
                  {(w.exercises || []).length > 0 && <Badge><ListChecks size={11} className="inline mr-1 -mt-0.5" /><span className="font-mono tabular-nums">{w.exercises.length}</span> exercise</Badge>}
                </div>

                {(w.exercises || []).length > 0 && (
                  <div className="rounded-xl bg-panel2-light dark:bg-panel2-dark p-2.5 mb-3 space-y-2">
                    {w.exercises.slice(0, 3).map((ex, i) => (
                      <div key={i} className="flex items-start justify-between gap-3 text-xs">
                        <span className="font-medium truncate">{ex.name}</span>
                        <span className="shrink-0 ml-2 text-right text-dusk font-mono tabular-nums leading-snug">
                          {ex.sets && <span className="block">{ex.sets} set</span>}
                          {ex.reps && <span className="block">{ex.reps} rep</span>}
                          {ex.weight && <span className="block">{ex.weight}</span>}
                        </span>
                      </div>
                    ))}
                    {w.exercises.length > 3 && <p className="text-[11px] text-dusk">+<span className="font-mono tabular-nums">{w.exercises.length - 3}</span> lainnya</p>}
                  </div>
                )}

                {w.notes && <p className="text-xs text-muted-light dark:text-muted-dark line-clamp-2">{w.notes}</p>}
              </Card>
            )
          })}
        </div>
      )}

      <WorkoutFormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }} onSubmit={save} initial={editing} />
    </div>
  )
}
