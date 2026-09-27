import { useEffect, useState } from 'react'
import { Modal, Button, Input, Textarea } from '@/components/ui'
import { SKILL_CATEGORIES, deriveStatus } from '@/lib/learning'
import { cn } from '@/lib/utils'

const empty = {
  title: '',
  category: 'programming',
  status: 'planned',
  progress: 0,
  platform: '',
  resourceUrl: '',
  targetDate: '',
  notes: '',
}

export default function LearningFormModal({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(empty)

  useEffect(() => {
    if (!initial) { setForm(empty); return }
    setForm({ ...empty, ...initial, targetDate: initial.targetDate ? initial.targetDate.slice(0, 10) : '' })
  }, [initial, open])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const progress = Number(form.progress) || 0
    onSubmit({
      ...form,
      progress,
      status: deriveStatus(progress),
      targetDate: form.targetDate ? new Date(form.targetDate).toISOString() : null,
      milestones: initial?.milestones || [],
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit skill' : 'New skill'}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={submit}>{initial ? 'Save' : 'Add'}</Button></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Title</label>
          <Input autoFocus value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Advanced React patterns" required />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1.5 block">Category</label>
          <div className="flex flex-wrap gap-1.5">
            {SKILL_CATEGORIES.map((c) => (
              <button
                type="button"
                key={c.value}
                onClick={() => set('category', c.value)}
                className={cn(
                  'h-9 px-3 rounded-md text-xs font-semibold flex items-center gap-1.5 border transition-colors',
                  form.category === c.value
                    ? 'bg-primary-500/12 border-ember-500/50 text-primary-600 dark:text-ember-300'
                    : 'border-[color:var(--line)] text-muted-light dark:text-muted-dark hover:border-[color:var(--line-strong)]'
                )}
              >
                <c.icon size={14} /> {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Platform <span className="opacity-60 font-normal">(optional)</span></label>
            <Input value={form.platform} onChange={(e) => set('platform', e.target.value)} placeholder="e.g. Udemy, YouTube" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Target date <span className="opacity-60 font-normal">(optional)</span></label>
            <Input type="date" value={form.targetDate} onChange={(e) => set('targetDate', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Resource link <span className="opacity-60 font-normal">(optional)</span></label>
          <Input value={form.resourceUrl} onChange={(e) => set('resourceUrl', e.target.value)} placeholder="https://..." />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Progress</label>
          <Input type="number" min="0" max="100" value={form.progress} onChange={(e) => set('progress', e.target.value)} />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Notes <span className="opacity-60 font-normal">(optional)</span></label>
          <Textarea rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Why it matters, what to be able to do" />
        </div>
      </form>
    </Modal>
  )
}
