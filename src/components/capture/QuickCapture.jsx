import { useState } from 'react'
import { Zap, CheckSquare, StickyNote, CalendarDays, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { Modal, Button, Input, Textarea, Select } from '@/components/ui'
import { useCollection } from '@/hooks/useCollection'
import { useCaptureStore, CAPTURE_TYPES } from '@/store/useCaptureStore'
import { useUIStore } from '@/store/useUIStore'
import { cn } from '@/lib/utils'

const TYPE_ICONS = { task: CheckSquare, note: StickyNote, event: CalendarDays }

// Floating quick-capture FAB (bottom-left so it never collides with the AI
// assistant on the right). Opens a minimal task/note/event form that saves to
// the same collections the full pages use, from any screen.
export default function QuickCapture() {
  const { open, type, openCapture, setType, close } = useCaptureStore()
  const { sidebarCollapsed } = useUIStore()
  const { createItem: createTask } = useCollection('tasks')
  const { createItem: createNote } = useCollection('notes')
  const { createItem: createEvent } = useCollection('events')

  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [priority, setPriority] = useState('medium')
  const [submitting, setSubmitting] = useState(false)

  const reset = () => { setTitle(''); setDetail(''); setPriority('medium') }

  const openModal = (t) => { reset(); openCapture(t) }

  const submit = async (e) => {
    e.preventDefault()
    const text = title.trim()
    if (!text) return
    setSubmitting(true)
    try {
      const now = new Date().toISOString()
      if (type === 'task') {
        await createTask({
          title: text, notes: detail.trim(), status: 'todo', priority,
          dueDate: null, tags: [], checklist: [], archived: false, repeat: '',
          createdAt: now, updatedAt: now,
        })
        toast.success('Task ditambahkan')
      } else if (type === 'note') {
        await createNote({
          title: text, content: detail.trim(), folder: '', tags: [],
          pinned: false, favorite: false, archived: false, color: '',
          createdAt: now, updatedAt: now,
        })
        toast.success('Catatan ditambahkan')
      } else {
        await createEvent({
          title: text, date: detail, end: null, category: 'personal',
          reminder: false, journal: [], createdAt: now, updatedAt: now,
        })
        toast.success('Agenda ditambahkan')
      }
      reset()
      close()
    } catch {
      toast.error('Gagal menyimpan')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Docked to the bottom-left of the floating console card, clear of the
          208px rail. Smaller and dimmed at rest so it reads as a dock control
          rather than a floating button sitting on top of the content. */}
      <button
        onClick={() => openModal('task')}
        aria-label="Quick capture — buat task, note, atau event"
        title="Quick capture"
        style={{ left: sidebarCollapsed ? 82 : 224 }}
        className="fixed bottom-4 z-[60] h-11 w-11 rounded-xl bg-accent-gradient text-accent-ink shadow-pop opacity-80 hover:opacity-100 hover:brightness-[1.07] flex items-center justify-center transition-all duration-200 neo-press max-md:!left-auto max-md:!right-4"
      >
        <Zap size={19} strokeWidth={2.2} />
      </button>

      <Modal open={open} onClose={close} title="Quick Capture" size="md"
        footer={<>
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button onClick={submit} loading={submitting} disabled={!title.trim()}>Capture</Button>
        </>}>
        <form onSubmit={submit} className="space-y-4">
          <div className="flex gap-2">
            {CAPTURE_TYPES.map((t) => {
              const Icon = TYPE_ICONS[t.value]
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  aria-pressed={type === t.value}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-xs font-semibold transition-all neo-press',
                    type === t.value
                      ? 'border-ember-500/50 bg-primary-500/10 text-primary-600 dark:text-ember-300'
                      : 'border-[color:var(--line)] text-muted-light dark:text-muted-dark hover:border-[color:var(--line-strong)]',
                  )}
                >
                  <Icon size={18} />
                  {t.label}
                </button>
              )
            })}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1.5 block">
              {type === 'task' ? 'Task title' : type === 'note' ? 'Note title' : 'Event title'}
            </label>
            <Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder={CAPTURE_TYPES.find((t) => t.value === type)?.placeholder} />
          </div>

          {type === 'task' && (
            <div>
              <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1.5 block">Priority</label>
              <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
            </div>
          )}

          {type === 'event' ? (
            <div>
              <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1.5 block">Start</label>
              <Input type="datetime-local" value={detail} onChange={(e) => setDetail(e.target.value)} />
            </div>
          ) : (
            <div>
              <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1.5 block">
                {type === 'task' ? 'Notes' : 'Content'}
              </label>
              <Textarea rows={3} value={detail} onChange={(e) => setDetail(e.target.value)} placeholder={type === 'task' ? 'Detail tambahan (opsional)…' : 'Tulis sesuatu…'} />
            </div>
          )}

          <p className="flex items-center gap-1.5 text-[11px] text-dusk">
            <X size={11} strokeWidth={2.2} /> Tekan Esc atau klik di luar untuk batal
          </p>
        </form>
      </Modal>
    </>
  )
}