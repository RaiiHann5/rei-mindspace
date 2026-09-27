import { useEffect, useState } from 'react'
import { Modal, Button, Input, Textarea, StarRating } from '@/components/ui'

const empty = { date: new Date().toISOString().slice(0, 10), rating: 0, review: '', rewatch: true }

export default function LogEntryModal({ open, onClose, onSubmit, initial, isFirstWatch }) {
  const [form, setForm] = useState(empty)

  useEffect(() => {
    if (!initial) { setForm({ ...empty, rewatch: !isFirstWatch }); return }
    setForm({ ...empty, ...initial, date: initial.date ? initial.date.slice(0, 10) : empty.date })
  }, [initial, open, isFirstWatch])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = (e) => {
    e.preventDefault()
    onSubmit({ ...form, date: new Date(form.date).toISOString() })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit entry' : 'Log a watch'}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={submit}>{initial ? 'Save' : 'Add entry'}</Button></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Watched on</label>
          <Input autoFocus type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1.5 block">Rating</label>
          <StarRating rating={form.rating} onChange={(v) => set('rating', v)} size={22} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Review</label>
          <Textarea rows={3} value={form.review} onChange={(e) => set('review', e.target.value)} placeholder="What did you think this time..." />
        </div>
        {!isFirstWatch && (
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.rewatch} onChange={(e) => set('rewatch', e.target.checked)} className="h-4 w-4 accent-primary-500" />
            Rewatch
          </label>
        )}
      </form>
    </Modal>
  )
}
