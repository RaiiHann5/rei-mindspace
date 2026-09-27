import { useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { id as idLocale } from 'date-fns/locale'
import { format } from 'date-fns'
import { ArrowLeft, Pencil, Trash2, Timer, Flame, Gauge, ListChecks, Trophy, StickyNote } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCollection } from '@/hooks/useCollection'
import { Card, Badge, Button, Skeleton } from '@/components/ui'
import WorkoutFormModal from './WorkoutFormModal'
import { workoutTypeInfo, INTENSITY_LABELS } from '@/lib/workoutTypes'
import { personalBestsForType } from '@/lib/workoutStats'
import { cn } from '@/lib/utils'

const iconTone = {
  primary: 'bg-primary-500/10 text-primary-600 dark:text-primary-400',
  teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  default: 'bg-black/5 dark:bg-white/5 text-inherit',
}

export default function WorkoutDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { items, isLoading, updateItem, removeItem } = useCollection('workouts')
  const [modalOpen, setModalOpen] = useState(false)

  const workout = items.find((w) => w.id === id)
  const bests = useMemo(() => {
    if (!workout) return null
    return personalBestsForType(items, workout.type, workout.id)
  }, [items, workout])

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-40" /><Skeleton className="h-64 rounded-3xl" /></div>

  if (!workout) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-light dark:text-muted-dark mb-4">Workout tidak ditemukan.</p>
        <Link to="/workout" className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
          <ArrowLeft size={15} /> Kembali ke Workout
        </Link>
      </div>
    )
  }

  const info = workoutTypeInfo(workout.type)
  const isPRDuration = bests?.longest && (Number(workout.durationMin) || 0) > (Number(bests.longest.durationMin) || 0)
  const isPRCalories = bests?.mostCalories && !!workout.calories && (Number(workout.calories) || 0) > (Number(bests.mostCalories.calories) || 0)

  const save = async (data) => { await updateItem(workout.id, data); toast.success('Workout diperbarui'); setModalOpen(false) }
  const del = async () => {
    if (confirm(`Hapus workout "${workout.title}"?`)) {
      await removeItem(workout.id); toast.success('Workout dihapus'); navigate('/workout')
    }
  }

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/workout')} className="flex items-center gap-1.5 text-sm text-muted-light dark:text-muted-dark hover:text-inherit">
        <ArrowLeft size={15} /> Kembali ke Workout
      </button>

      <Card className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn('h-14 w-14 rounded-2xl flex items-center justify-center shrink-0', iconTone[info.color] || iconTone.default)}>
            <info.icon size={26} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="font-display text-xl font-semibold tracking-tight truncate">{workout.title}</h1>
              <Badge tone={info.color === 'default' ? 'default' : info.color}>{info.label}</Badge>
              {(isPRDuration || isPRCalories) && <Badge tone="amber"><Trophy size={10} className="inline mr-1 -mt-0.5" />Rekor pribadi</Badge>}
            </div>
            <p className="text-[11px] text-dusk capitalize">
              {format(new Date(workout.date), 'EEEE, d MMMM yyyy', { locale: idLocale })}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => setModalOpen(true)}><Pencil size={14} /> Edit</Button>
          <Button variant="danger" size="sm" onClick={del}><Trash2 size={14} /> Hapus</Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="flex flex-col items-center text-center gap-1.5">
          <Timer size={18} className="text-teal-500" />
          <p className="num text-xl">{workout.durationMin}</p>
          <p className="text-[11px] font-medium text-dusk">Menit</p>
        </Card>
        <Card className="flex flex-col items-center text-center gap-1.5">
          <Flame size={18} className="text-rose-500" />
          <p className="num text-xl">{workout.calories || 0}</p>
          <p className="text-[11px] font-medium text-dusk">Kalori</p>
        </Card>
        <Card className="flex flex-col items-center text-center gap-1.5">
          <Gauge size={18} className="text-amber-500" />
          <p className="text-xl font-semibold tracking-tight">{INTENSITY_LABELS[workout.intensity] || '—'}</p>
          <p className="text-[11px] font-medium text-dusk">Intensitas</p>
        </Card>
        <Card className="flex flex-col items-center text-center gap-1.5">
          <ListChecks size={18} className="text-primary-600 dark:text-primary-400" />
          <p className="num text-xl">{(workout.exercises || []).length}</p>
          <p className="text-[11px] font-medium text-dusk">Exercise</p>
        </Card>
      </div>

      {bests && bests.sessionsOfType > 0 && (
        <Card>
          <h3 className="font-display text-sm font-semibold tracking-tight mb-3 flex items-center gap-1.5"><Trophy size={15} className="text-amber-500" /> Rekor Jenis "{info.label}"</h3>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-panel2-light dark:bg-panel2-dark p-3">
              <p className="text-[11px] font-medium text-dusk mb-1">Durasi terlama</p>
              <p className="num text-base">{bests.longest ? `${bests.longest.durationMin} menit` : '—'}</p>
            </div>
            <div className="rounded-xl bg-panel2-light dark:bg-panel2-dark p-3">
              <p className="text-[11px] font-medium text-dusk mb-1">Kalori terbanyak</p>
              <p className="num text-base">{bests.mostCalories?.calories ? `${bests.mostCalories.calories} kal` : '—'}</p>
            </div>
          </div>
          <p className="text-[11px] text-dusk mt-2">Dibandingkan dengan <span className="font-mono tabular-nums">{bests.sessionsOfType}</span> sesi "{info.label}" lainnya.</p>
        </Card>
      )}

      {(workout.exercises || []).length > 0 && (
        <Card>
          <h3 className="font-display text-sm font-semibold tracking-tight mb-3">Daftar Exercise</h3>
          <div className="space-y-1.5">
            {workout.exercises.map((ex, i) => (
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
        <p className="text-sm text-muted-light dark:text-muted-dark whitespace-pre-wrap">{workout.notes || 'Belum ada catatan untuk sesi ini.'}</p>
      </Card>

      <WorkoutFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={save} initial={workout} />
    </div>
  )
}
