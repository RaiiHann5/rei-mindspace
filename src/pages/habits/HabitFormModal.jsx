import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { Modal, Button, Input, Select, Textarea } from '@/components/ui'
import { HABIT_ICON_OPTIONS, DEFAULT_HABIT_ICON, HabitIcon } from '@/lib/habitIcons'
import { WEEKDAYS, CADENCE_OPTIONS } from '@/lib/habitSchedule'
import { cn } from '@/lib/utils'

const empty = { name: '', icon: DEFAULT_HABIT_ICON, color: 'primary', target: 7, cadence: 'daily', weekDays: [], reminderTime: '', description: '' }

export default function HabitFormModal({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(empty)
  useEffect(() => {
    if (!initial) { setForm(empty); return }
    // legacy habits may still carry an emoji string in `icon` — fall back cleanly
    const icon = HABIT_ICON_OPTIONS.includes(initial.icon) ? initial.icon : DEFAULT_HABIT_ICON
    setForm({ ...empty, ...initial, icon })
  }, [initial, open])
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const toggleWeekDay = (key) => setForm((f) => ({
    ...f,
    weekDays: f.weekDays.includes(key) ? f.weekDays.filter((d) => d !== key) : [...f.weekDays, key],
  }))
  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    if (form.cadence === 'custom' && form.weekDays.length === 0) return
    const target = form.cadence === 'daily' ? 7 : form.cadence === 'custom' ? form.weekDays.length : Number(form.target)
    onSubmit({ ...form, target, history: initial?.history || {} })
  }
  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit habit' : 'New habit'}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={submit}>{initial ? 'Save' : 'Create'}</Button></>}>
      <form onSubmit={submit} className="space-y-4">
        <div><label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Name</label><Input autoFocus value={form.name} onChange={(e) => set('name', e.target.value)} required /></div>
        <div>
          <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Icon</label>
          <div className="flex flex-wrap gap-2">
            {HABIT_ICON_OPTIONS.map((name) => (
              <button
                type="button"
                key={name}
                aria-label={name}
                onClick={() => set('icon', name)}
                className={cn(
                  'h-9 w-9 rounded-lg flex items-center justify-center border transition-colors',
                  form.icon === name
                    ? 'bg-primary-500/12 border-ember-500/50 text-primary-600 dark:text-ember-300'
                    : 'border-[color:var(--line)] text-muted-light dark:text-muted-dark hover:border-[color:var(--line-strong)]'
                )}
              >
                <HabitIcon name={name} size={16} />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Warna</label>
            <Select value={form.color} onChange={(e) => set('color', e.target.value)}>
              <option value="primary">Accent</option>
              <option value="teal">Teal</option>
              <option value="amber">Amber</option>
              <option value="rose">Rose</option>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Cadence</label>
            <Select value={form.cadence} onChange={(e) => set('cadence', e.target.value)}>
              {CADENCE_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Select>
          </div>
        </div>

        {form.cadence === 'custom' && (
          <div>
            <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Days</label>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map((d) => (
                <button
                  type="button"
                  key={d.key}
                  onClick={() => toggleWeekDay(d.key)}
                  className={cn(
                    'h-9 w-9 rounded-md text-xs font-semibold flex items-center justify-center border transition-colors',
                    form.weekDays.includes(d.key)
                      ? 'bg-primary-500/12 border-ember-500/50 text-primary-600 dark:text-ember-300'
                      : 'border-[color:var(--line)] text-muted-light dark:text-muted-dark hover:border-[color:var(--line-strong)]'
                  )}
                  title={d.label}
                >
                  {d.short}
                </button>
              ))}
            </div>
            {form.weekDays.length === 0 && <p className="text-[11px] text-rose-500 mt-1.5">Pick one day.</p>}
          </div>
        )}

        {(form.cadence === 'weekly' || form.cadence === 'monthly') && (
          <div>
            <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">
              Target per {form.cadence === 'weekly' ? 'week' : 'month'}
            </label>
            <Input type="number" min="1" max={form.cadence === 'weekly' ? 7 : 31} value={form.target} onChange={(e) => set('target', e.target.value)} />
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 flex items-center gap-1.5"><Bell size={12} /> Reminder <span className="opacity-60 font-normal">(optional)</span></label>
          <Input type="time" value={form.reminderTime} onChange={(e) => set('reminderTime', e.target.value)} className="w-40" />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Description <span className="opacity-60 font-normal">(optional)</span></label>
          <Textarea rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="What it is for, and the cue" />
        </div>
      </form>
    </Modal>
  )
}
