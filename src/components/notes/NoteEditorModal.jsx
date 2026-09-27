import { useEffect, useState } from 'react'
import { Pin, Star, Trash2, Eye, Edit3 } from 'lucide-react'
import { Modal, Button, Input, Textarea } from '@/components/ui'
import { cn } from '@/lib/utils'
import { renderSafeMarkdown } from '@/lib/safeMarkdown'
import { NOTE_COLORS } from './CardNotes'

const EMPTY = { title: '', content: '', folder: '', tags: [], pinned: false, favorite: false, color: '' }

export default function NoteEditorModal({ open, onClose, note, onSave, onDelete }) {
  const [draft, setDraft] = useState(EMPTY)
  const [tagsInput, setTagsInput] = useState('')
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    if (!open) return
    setDraft(note ? { ...EMPTY, ...note } : EMPTY)
    setTagsInput(note?.tags?.join(', ') || '')
    setPreview(false)
  }, [open, note])

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }))

  const save = () => {
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
    onSave({ ...draft, tags, title: draft.title.trim() || 'Untitled note' })
  }

  return (
    <Modal open={open} onClose={onClose} title={note ? 'Edit note' : 'New note'} size="lg" footer={
      <>
        {note && (
          <Button variant="ghost" className="text-rose-500 hover:bg-rose-500/10 mr-auto" onClick={() => onDelete(note)}>
            <Trash2 size={15} /> Delete
          </Button>
        )}
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={save}>Save</Button>
      </>
    }>
      <div className="space-y-4">
        <Input
          value={draft.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Title"
          className="text-base font-medium"
          autoFocus
        />

        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={draft.folder}
            onChange={(e) => set({ folder: e.target.value })}
            placeholder="Folder"
            className="w-36"
          />
          <Input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Tags, comma separated"
            className="flex-1 min-w-[160px]"
          />

          <button
            onClick={() => set({ pinned: !draft.pinned })}
            className={cn('h-9 w-9 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 shrink-0', draft.pinned && 'text-primary-500 bg-primary-500/10')}
            aria-label="Toggle pin"
          >
            <Pin size={15} />
          </button>
          <button
            onClick={() => set({ favorite: !draft.favorite })}
            className={cn('h-9 w-9 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 shrink-0', draft.favorite && 'text-amber-500 bg-amber-500/10')}
            aria-label="Toggle favorite"
          >
            <Star size={15} className={draft.favorite ? 'fill-amber-500' : ''} />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-dusk mr-1">Color</span>
          {Object.keys(NOTE_COLORS).map((key) => (
            <button
              key={key}
              onClick={() => set({ color: key })}
              aria-label={`Color ${key}`}
              className={cn(
                'h-6 w-6 rounded-full transition-transform neo-press',
                NOTE_COLORS[key].dot,
                draft.color === key ? 'ring-2 ring-ember-500 scale-110' : 'opacity-70 hover:opacity-100 hover:scale-105'
              )}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-dusk">Content</span>
          <button
            onClick={() => setPreview((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border border-[color:var(--line)] text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark hover:border-[color:var(--line-strong)] transition-colors neo-press"
          >
            {preview ? <Edit3 size={12} /> : <Eye size={12} />}
            {preview ? 'Edit' : 'Preview'}
          </button>
        </div>

        {preview ? (
          <div
            className="rich-note-editor min-h-[220px] rounded-xl border border-[color:var(--line)] bg-panel2-light dark:bg-panel2-dark p-4"
            dangerouslySetInnerHTML={{ __html: renderSafeMarkdown(draft.content || '*Nothing to preview*') }}
          />
        ) : (
          <Textarea
            value={draft.content}
            onChange={(e) => set({ content: e.target.value })}
            placeholder="Write in Markdown..."
            className="min-h-[220px] font-mono text-sm"
          />
        )}
      </div>
    </Modal>
  )
}
