import { useEffect, useState } from 'react'
import { Modal, Button, Input, Select } from '@/components/ui'

function toLocalInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const empty = { title: '', date: '', end: '', category: 'work', reminder: false }

export default function EventFormModal({ open, onClose, onSubmit, initial, defaultDate }) {
  const [form, setForm] = useState(empty)

  useEffect(() => {
    if (initial) setForm({ ...initial, date: toLocalInput(initial.date), end: toLocalInput(initial.end) })
    else setForm({ ...empty, date: defaultDate ? toLocalInput(defaultDate) : '' })
  }, [initial, open, defaultDate])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.date) return
    onSubmit({ ...form, date: new Date(form.date).toISOString(), end: form.end ? new Date(form.end).toISOString() : null })
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit event' : 'New event'}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={submit}>{initial ? 'Save' : 'Create event'}</Button></>}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Title</label>
          <Input autoFocus value={form.title} onChange={(e) => set('title', e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Starts</label>
            <Input type="datetime-local" value={form.date} onChange={(e) => set('date', e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Ends</label>
            <Input type="datetime-local" value={form.end} onChange={(e) => set('end', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Category</label>
          <Select value={form.category} onChange={(e) => set('category', e.target.value)}>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="health">Health</option>
          </Select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.reminder} onChange={(e) => set('reminder', e.target.checked)} className="h-4 w-4 rounded accent-primary-500" />
          Set a reminder
        </label>
      </form>
    </Modal>
  )
}
