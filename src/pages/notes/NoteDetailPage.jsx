import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Pin, Star, Trash2, Copy, Clock, Folder, Tag, X, Plus, Archive, ArchiveRestore, Palette, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCollection } from '@/hooks/useCollection'
import { Skeleton } from '@/components/ui'
import { cn, formatDate } from '@/lib/utils'
import { looksLikeHtml, plainTextToHtml } from '@/lib/safeMarkdown'
import { NOTE_COLORS, colorForNote } from '@/components/notes/CardNotes'
import RichTextEditor from '@/components/notes/RichTextEditor'

const DEFAULT_CATEGORIES = ['General', 'Work', 'Personal', 'Ideas', 'Study']

export default function NoteDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { items, isLoading, updateItem, removeItem, createItem } = useCollection('notes')
  const note = items.find((n) => n.id === id)
  const [tagInput, setTagInput] = useState('')
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)
  const [colorMenuOpen, setColorMenuOpen] = useState(false)
  const [newCategoryInput, setNewCategoryInput] = useState('')
  const categoryMenuRef = useRef(null)
  const colorMenuRef = useRef(null)

  // --- Title editing: the title text field is driven by a local draft so
  // keystrokes render instantly (typing directly against the query cache
  // made the cursor jump and characters get swallowed because every change
  // waited for an async write + refetch). Writes are debounced and flushed
  // on blur/unmount so we never fire one network call per keystroke.
  const [titleDraft, setTitleDraft] = useState('')
  const titleTimer = useRef(null)
  const titleDirtyRef = useRef(false)
  const titleLatestRef = useRef('')
  const noteRef = useRef(null)
  noteRef.current = note
  const updateItemRef = useRef(null)
  useEffect(() => { updateItemRef.current = updateItem })

  const persistTitle = (value) => {
    titleDirtyRef.current = false
    clearTimeout(titleTimer.current)
    const current = noteRef.current
    if (!current || value === (current.title ?? '')) return
    updateItem(current.id, { title: value })
  }

  const scheduleTitleSave = (value) => {
    titleDirtyRef.current = true
    titleLatestRef.current = value
    clearTimeout(titleTimer.current)
    titleTimer.current = setTimeout(() => persistTitle(value), 600)
  }

  // Re-sync the draft whenever the cached note object changes (loading,
  // navigating to another note, or an external save landing) — but never
  // while the user is actively typing, or the cursor would jump again.
  useEffect(() => {
    if (titleDirtyRef.current) return
    clearTimeout(titleTimer.current)
    setTitleDraft(note?.title ?? '')
  }, [note])

  // Save any still-pending title text if the user leaves the page without
  // blurring the input (e.g. browser back).
  useEffect(() => {
    return () => {
      clearTimeout(titleTimer.current)
      if (titleDirtyRef.current && noteRef.current) {
        updateItemRef.current?.(noteRef.current.id, { title: titleLatestRef.current })
      }
    }
  }, [])

  useEffect(() => {
    const onDocClick = (e) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target)) setCategoryMenuOpen(false)
      if (colorMenuRef.current && !colorMenuRef.current.contains(e.target)) setColorMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const categories = useMemo(() => {
    const existing = new Set(items.map((n) => n.folder).filter(Boolean))
    DEFAULT_CATEGORIES.forEach((c) => existing.add(c))
    return [...existing]
  }, [items])

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-40" /><Skeleton className="h-64 rounded-3xl" /></div>

  if (!note) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-light dark:text-muted-dark mb-4">No such note.</p>
        <Link to="/notes" className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline">
          <ArrowLeft size={15} /> Back to notes
        </Link>
      </div>
    )
  }

  const palette = NOTE_COLORS[colorForNote(note)]
  const initialContentHtml = looksLikeHtml(note.content) ? note.content : plainTextToHtml(note.content)

  const del = async () => {
    if (!confirm(`Delete "${note.title}"?`)) return
    await removeItem(note.id)
    toast.success('Note deleted')
    navigate('/notes')
  }

  const duplicate = async () => {
    const copy = await createItem({ ...note, id: undefined, title: `${note.title} (copy)`, pinned: false })
    toast.success('Note duplicated')
    navigate(`/notes/${copy.id}`)
  }

  const toggleArchive = async () => {
    await updateItem(note.id, { archived: !note.archived })
    toast.success(note.archived ? 'Note unarchived' : 'Note archived')
    if (!note.archived) navigate('/notes')
  }

  const setCategory = (name) => {
    updateItem(note.id, { folder: name })
    setCategoryMenuOpen(false)
    setNewCategoryInput('')
  }

  const submitNewCategory = (e) => {
    e.preventDefault()
    const name = newCategoryInput.trim()
    if (name) setCategory(name)
  }

  const setColor = (color) => {
    updateItem(note.id, { color })
    setColorMenuOpen(false)
  }

  const addTag = (e) => {
    e.preventDefault()
    const t = tagInput.trim()
    if (!t || note.tags?.includes(t)) { setTagInput(''); return }
    updateItem(note.id, { tags: [...(note.tags || []), t] })
    setTagInput('')
  }

  const removeTag = (t) => updateItem(note.id, { tags: (note.tags || []).filter((x) => x !== t) })

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/notes')} className="flex items-center gap-1.5 text-sm font-medium text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark transition-colors">
        <ArrowLeft size={15} /> Back to notes
      </button>

      <div className="rounded-3xl border border-[color:var(--line)] bg-panel2-light dark:bg-panel2-dark overflow-hidden shadow-card">
        {/* header band */}
        <div className="p-6 md:p-8 pb-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <div className="relative" ref={categoryMenuRef}>
                <button
                  onClick={() => setCategoryMenuOpen((v) => !v)}
                  className={cn('inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold neo-press', palette.tag)}
                >
                  <Folder size={11} /> {note.folder || 'General'}
                </button>
                {categoryMenuOpen && (
                  <div className="absolute left-0 top-8 z-20 w-48 rounded-2xl glass-solid p-1.5 py-1.5 animate-pop" style={{ boxShadow: 'var(--shadow-pop)' }}>
                    <p className="px-2 pb-1 text-[11px] font-medium text-dusk">Category</p>
                    {categories.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-ink-light dark:text-ink-dark"
                      >
                        {c}
                        {note.folder === c && <Check size={12} />}
                      </button>
                    ))}
                    <form onSubmit={submitNewCategory} className="flex items-center gap-1 px-1 pt-1 mt-1 border-t border-[color:var(--line)]">
                      <input
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        placeholder="Name"
                        className="flex-1 min-w-0 h-7 rounded-lg px-2 text-xs bg-black/[0.04] dark:bg-white/[0.06] outline-none placeholder:text-dusk"
                      />
                      {newCategoryInput.trim() && (
                        <button type="submit" aria-label="Add category" className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-light dark:text-muted-dark hover:bg-black/[0.06] dark:hover:bg-white/[0.08] shrink-0 neo-press">
                          <Plus size={13} />
                        </button>
                      )}
                    </form>
                  </div>
                )}
              </div>
              <span className="text-[11px] flex items-center gap-1 text-dusk">
                <Clock size={11} /> {formatDate(note.updatedAt || note.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              {note.archived && (
                <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold bg-black/[0.05] dark:bg-white/[0.08] text-muted-light dark:text-muted-dark">
                  <Archive size={10} /> Archived
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <div className="relative" ref={colorMenuRef}>
                <button
                  onClick={() => setColorMenuOpen((v) => !v)}
                  aria-label="Change note color"
                  className={cn('h-9 w-9 rounded-lg flex items-center justify-center transition-colors neo-press', palette.icon)}
                >
                  <Palette size={15} />
                </button>
                {colorMenuOpen && (
                  <div className="absolute right-0 top-10 z-20 rounded-2xl glass-solid p-2.5 animate-pop flex gap-1.5" style={{ boxShadow: 'var(--shadow-pop)' }}>
                    {Object.keys(NOTE_COLORS).map((key) => (
                      <button
                        key={key}
                        onClick={() => setColor(key)}
                        aria-label={`Color ${key}`}
                        className={cn(
                          'h-6 w-6 rounded-full transition-transform neo-press',
                          NOTE_COLORS[key].dot,
                          colorForNote(note) === key ? 'ring-2 ring-ember-500 scale-110' : 'opacity-70 hover:opacity-100 hover:scale-105'
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => updateItem(note.id, { pinned: !note.pinned })}
                aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
                className={cn('h-9 w-9 rounded-lg flex items-center justify-center transition-colors neo-press', palette.icon, note.pinned && 'bg-black/[0.06] dark:bg-white/[0.10]')}
              >
                <Pin size={16} className={note.pinned ? 'fill-current' : ''} />
              </button>
              <button
                onClick={() => updateItem(note.id, { favorite: !note.favorite })}
                aria-label={note.favorite ? 'Unfavorite' : 'Favorite'}
                className={cn('h-9 w-9 rounded-lg flex items-center justify-center transition-colors neo-press', palette.icon, note.favorite && 'bg-black/[0.06] dark:bg-white/[0.10]')}
              >
                <Star size={16} className={note.favorite ? 'fill-amber-500 text-amber-500' : ''} />
              </button>
              <button onClick={duplicate} aria-label="Duplicate note" className={cn('h-9 w-9 rounded-lg flex items-center justify-center transition-colors neo-press', palette.icon)}>
                <Copy size={15} />
              </button>
              <button
                onClick={toggleArchive}
                aria-label={note.archived ? 'Unarchive note' : 'Archive note'}
                className={cn('h-9 w-9 rounded-lg flex items-center justify-center transition-colors neo-press', palette.icon, note.archived && 'bg-black/[0.06] dark:bg-white/[0.10]')}
              >
                {note.archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
              </button>
              <button onClick={del} aria-label="Delete note" className="h-9 w-9 rounded-lg flex items-center justify-center transition-colors text-rose-500 hover:bg-rose-500/10 neo-press">
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          <input
            value={titleDraft}
            onChange={(e) => { setTitleDraft(e.target.value); scheduleTitleSave(e.target.value) }}
            onBlur={() => { if (titleDirtyRef.current) persistTitle(titleLatestRef.current) }}
            placeholder="Untitled"
            className={cn('w-full bg-transparent outline-none placeholder:text-dusk font-display text-2xl md:text-3xl font-semibold tracking-tight leading-tight', palette.title)}
          />

          <div className="flex flex-wrap items-center gap-1.5 mt-4">
            {note.tags?.map((t) => (
              <span key={t} className={cn('group inline-flex items-center gap-1 rounded-md pl-2.5 pr-1.5 py-1 text-[11px] font-medium', palette.tag)}>
                <Tag size={10} /> {t}
                <button onClick={() => removeTag(t)} aria-label={`Remove tag ${t}`} className="h-3.5 w-3.5 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20">
                  <X size={9} />
                </button>
              </span>
            ))}
            <form onSubmit={addTag} className="inline-flex items-center gap-1">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag"
                className="h-6 w-20 focus:w-28 transition-all bg-black/[0.04] dark:bg-white/[0.06] rounded-md px-2.5 text-[11px] outline-none placeholder:text-dusk text-ink-light dark:text-ink-dark"
              />
              {tagInput.trim() && (
                <button type="submit" aria-label="Add tag" className={cn('h-6 w-6 rounded-md flex items-center justify-center shrink-0 neo-press', palette.icon)}>
                  <Plus size={12} />
                </button>
              )}
            </form>
          </div>
        </div>

        {/* content surface — the writing column is the calmest thing here:
            flat surface, hairline only, 68ch measure, generous leading. */}
        <div className="bg-surface-light dark:bg-surface-dark m-2 md:m-3 rounded-2xl p-6 md:p-8 min-h-[45vh]">
          <RichTextEditor
            key={note.id}
            value={initialContentHtml}
            onChange={() => {}}
            onBlur={(html) => updateItem(note.id, { content: html })}
            placeholder="Write"
            className="mx-auto w-full max-w-[68ch]"
          />
        </div>
      </div>
    </div>
  )
}
