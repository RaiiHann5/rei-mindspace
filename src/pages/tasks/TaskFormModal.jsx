import { useEffect, useState } from 'react'
import { Modal, Button, Input, Textarea, Select, Checkbox, Progress } from '@/components/ui'
import { Plus, Trash2, GripVertical, Repeat } from 'lucide-react'
import { uid, REPEAT_OPTIONS } from '@/lib/utils'

const empty = {
  title: '', notes: '', status: 'todo', priority: 'medium', dueDate: '', tags: '', checklist: [], archived: false, repeat: '',
}

export default function TaskFormModal({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(empty)

  useEffect(() => {
    if (initial) {
      setForm({ ...initial, tags: (initial.tags || []).join(', '), dueDate: initial.dueDate ? initial.dueDate.slice(0, 10) : '' })
    } else {
      setForm(empty)
    }
  }, [initial, open])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const addChecklistItem = () => set('checklist', [...(form.checklist || []), { id: uid(), text: '', done: false }])
  const updateChecklistItem = (id, patch) => set('checklist', form.checklist.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  const removeChecklistItem = (id) => set('checklist', form.checklist.filter((c) => c.id !== id))

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    onSubmit({
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
    })
  }

  const checklistTotal = form.checklist?.length || 0
  const checklistDone = form.checklist?.filter((c) => c.done).length || 0

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit task' : 'New task'} size="lg"
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={submit}>{initial ? 'Save changes' : 'Create task'}</Button>
      </>}
    >
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="text-[11px] font-medium text-dusk mb-1.5 block">Title</label>
          <Input autoFocus value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="What needs to get done?" required />
        </div>
        <div>
          <label className="text-[11px] font-medium text-dusk mb-1.5 block">Notes</label>
          <Textarea rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Add more detail..." />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-medium text-dusk mb-1.5 block">Status</label>
            <Select value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </Select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-dusk mb-1.5 block">Priority</label>
            <Select value={form.priority} onChange={(e) => set('priority', e.target.value)}>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-dusk mb-1.5 block">Due date</label>
            <Input type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-medium text-dusk mb-1.5 block">Repeat</label>
            <Select value={form.repeat || ''} onChange={(e) => set('repeat', e.target.value)}>
              {REPEAT_OPTIONS.map((r) => <option key={r.value || 'never'} value={r.value}>{r.label}</option>)}
            </Select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-dusk mb-1.5 block">Tags (comma separated)</label>
            <Input value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="design, urgent" />
          </div>
        </div>
        {form.repeat && (
          <p className="flex items-center gap-1.5 text-[11px] text-dusk -mt-2">
            <Repeat size={12} /> When completed, a new <span className="capitalize">{form.repeat}</span> occurrence is scheduled automatically.
          </p>
        )}

        <div className="rounded-2xl border border-[color:var(--line)] p-4">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-medium text-dusk">Checklist</label>
            <button type="button" onClick={addChecklistItem} className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:opacity-75 transition-opacity neo-press">
              <Plus size={12} /> Add item
            </button>
          </div>

          {checklistTotal > 0 && (
            <div className="flex items-center gap-2 mb-3 mt-2">
              <Progress value={(checklistDone / checklistTotal) * 100} tone="teal" className="h-1.5" />
              <span className="text-[11px] font-mono tabular-nums text-dusk shrink-0">{checklistDone}/{checklistTotal}</span>
            </div>
          )}

          <div className="space-y-1.5 mt-2">
            {(form.checklist || []).map((c) => (
              <div key={c.id} className="flex items-center gap-2 group">
                <GripVertical size={13} className="text-dusk shrink-0" />
                <Checkbox checked={c.done} onChange={(v) => updateChecklistItem(c.id, { done: v })} />
                <Input value={c.text} onChange={(e) => updateChecklistItem(c.id, { text: e.target.value })} placeholder="Checklist item" className="h-8" />
                <button type="button" onClick={() => removeChecklistItem(c.id)} className="text-muted-light dark:text-muted-dark hover:text-rose-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity neo-press">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {checklistTotal === 0 && (
              <p className="text-xs text-dusk text-center py-3">No checklist items yet.</p>
            )}
          </div>
        </div>
      </form>
    </Modal>
  )
}
