import { useEffect, useState } from 'react'
import { Modal, Button, Input, Textarea } from '@/components/ui'
import { VISION_CATEGORIES, TIMEFRAME_OPTIONS } from '@/lib/visionBoard'
import { cn } from '@/lib/utils'

const empty = {
  title: '',
  category: 'personal',
  timeframe: 'someday',
  description: '',
  achieved: false,
}

export default function VisionBoardFormModal({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(empty)

  useEffect(() => {
    setForm(initial ? { ...empty, ...initial } : empty)
  }, [initial, open])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    onSubmit(form)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit vision' : 'New vision'}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={submit}>{initial ? 'Save' : 'Add'}</Button></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Title</label>
          <Input autoFocus value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Visit Japan in spring" required />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1.5 block">Category</label>
          <div className="flex flex-wrap gap-1.5">
            {VISION_CATEGORIES.map((c) => (
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

        <div>
          <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1.5 block">Timeframe</label>
          <div className="flex flex-wrap gap-1.5">
            {TIMEFRAME_OPTIONS.map((t) => (
              <button
                type="button"
                key={t.value}
                onClick={() => set('timeframe', t.value)}
                className={cn(
                  'h-9 px-3 rounded-md text-xs font-semibold border transition-colors',
                  form.timeframe === t.value
                    ? 'bg-primary-500/12 border-ember-500/50 text-primary-600 dark:text-ember-300'
                    : 'border-[color:var(--line)] text-muted-light dark:text-muted-dark hover:border-[color:var(--line-strong)]'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Description <span className="opacity-60 font-normal">(optional)</span></label>
          <Textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="What it looks like when it's real" />
        </div>
      </form>
    </Modal>
  )
}
