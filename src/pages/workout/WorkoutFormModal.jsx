import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Modal, Button, Input, Select, Textarea } from '@/components/ui'
import { WORKOUT_TYPES, INTENSITY_LABELS } from '@/lib/workoutTypes'
import { uid, cn } from '@/lib/utils'

const emptyExercise = () => ({ id: uid(), name: '', sets: '', reps: '', weight: '' })

const empty = {
  type: 'strength',
  title: '',
  date: new Date().toISOString().slice(0, 10),
  durationMin: 30,
  calories: '',
  intensity: 3,
  exercises: [],
  notes: '',
}

export default function WorkoutFormModal({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(empty)

  useEffect(() => {
    if (!initial) { setForm({ ...empty, exercises: [] }); return }
    setForm({
      ...empty,
      ...initial,
      date: (initial.date || new Date().toISOString()).slice(0, 10),
      exercises: (initial.exercises || []).map((ex) => ({ id: ex.id || uid(), ...ex })),
    })
  }, [initial, open])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const addExercise = () => setForm((f) => ({ ...f, exercises: [...f.exercises, emptyExercise()] }))
  const updateExercise = (id, k, v) => setForm((f) => ({ ...f, exercises: f.exercises.map((ex) => (ex.id === id ? { ...ex, [k]: v } : ex)) }))
  const removeExercise = (id) => setForm((f) => ({ ...f, exercises: f.exercises.filter((ex) => ex.id !== id) }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.date) return
    const dateIso = new Date(`${form.date}T${initial ? new Date(initial.date).toTimeString().slice(0, 8) : new Date().toTimeString().slice(0, 8)}`).toISOString()
    onSubmit({
      ...form,
      date: dateIso,
      durationMin: Number(form.durationMin) || 0,
      calories: form.calories === '' ? null : Number(form.calories),
      intensity: Number(form.intensity),
      exercises: form.exercises.filter((ex) => ex.name.trim()),
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit workout' : 'Catat workout baru'}
      size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button onClick={submit}>{initial ? 'Simpan' : 'Tambah Workout'}</Button></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Judul</label>
            <Input autoFocus value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="cth. Upper body day" required />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Tanggal</label>
            <Input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} max={new Date().toISOString().slice(0, 10)} required />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Jenis workout</label>
          <div className="flex flex-wrap gap-1.5">
            {WORKOUT_TYPES.map((t) => (
              <button
                type="button"
                key={t.value}
                onClick={() => set('type', t.value)}
                className={cn(
                  'h-9 px-3 rounded-md text-xs font-semibold flex items-center gap-1.5 border transition-colors',
                  form.type === t.value
                    ? 'bg-primary-500/12 border-ember-500/50 text-primary-600 dark:text-ember-300'
                    : 'border-[color:var(--line)] text-muted-light dark:text-muted-dark hover:border-[color:var(--line-strong)]'
                )}
              >
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Durasi (menit)</label>
            <Input type="number" min="1" value={form.durationMin} onChange={(e) => set('durationMin', e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Kalori <span className="opacity-60 font-normal">(opsional)</span></label>
            <Input type="number" min="0" value={form.calories} onChange={(e) => set('calories', e.target.value)} placeholder="cth. 320" />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1.5 block">Intensitas</label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => set('intensity', n)}
                title={INTENSITY_LABELS[n]}
                className={cn(
                  'flex-1 h-9 rounded-md text-xs font-semibold font-mono tabular-nums border transition-colors',
                  form.intensity === n
                    ? 'bg-primary-500/12 border-ember-500/50 text-primary-600 dark:text-ember-300'
                    : 'border-[color:var(--line)] text-muted-light dark:text-muted-dark hover:border-[color:var(--line-strong)]'
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-light dark:text-muted-dark mt-1">{INTENSITY_LABELS[form.intensity]}</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-muted-light dark:text-muted-dark">Exercise <span className="opacity-60 font-normal">(opsional)</span></label>
            <button type="button" onClick={addExercise} className="text-[11px] font-semibold flex items-center gap-1 text-primary-600 dark:text-ember-300 hover:opacity-80 transition-opacity">
              <Plus size={12} strokeWidth={2.2} /> Tambah baris
            </button>
          </div>
          {form.exercises.length > 0 && (
            <div className="space-y-1.5">
              <div className="grid grid-cols-[1fr_56px_56px_64px_28px] gap-1.5 px-0.5">
                <span className="text-[10px] font-medium text-dusk">Nama</span>
                <span className="text-[10px] font-medium text-dusk">Set</span>
                <span className="text-[10px] font-medium text-dusk">Rep</span>
                <span className="text-[10px] font-medium text-dusk">Beban</span>
                <span />
              </div>
              {form.exercises.map((ex) => (
                <div key={ex.id} className="grid grid-cols-[1fr_56px_56px_64px_28px] gap-1.5 items-center">
                  <Input value={ex.name} onChange={(e) => updateExercise(ex.id, 'name', e.target.value)} placeholder="Bench press" className="h-8 text-xs px-2.5" />
                  <Input value={ex.sets} onChange={(e) => updateExercise(ex.id, 'sets', e.target.value)} placeholder="3" className="h-8 text-xs px-2" />
                  <Input value={ex.reps} onChange={(e) => updateExercise(ex.id, 'reps', e.target.value)} placeholder="10" className="h-8 text-xs px-2" />
                  <Input value={ex.weight} onChange={(e) => updateExercise(ex.id, 'weight', e.target.value)} placeholder="20kg" className="h-8 text-xs px-2" />
                  <button type="button" onClick={() => removeExercise(ex.id)} aria-label="Hapus baris" className="h-8 w-7 rounded-lg flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-500">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Catatan <span className="opacity-60 font-normal">(opsional)</span></label>
          <Textarea rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Bagaimana rasanya, apa yang perlu ditingkatkan..." />
        </div>
      </form>
    </Modal>
  )
}
