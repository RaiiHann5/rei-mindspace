import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, StickyNote, Archive, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCollection } from '@/hooks/useCollection'
import { PageHeader, Button, Input, EmptyState, Skeleton } from '@/components/ui'
import { cn } from '@/lib/utils'
import CardNotes, { colorForNote } from '@/components/notes/CardNotes'

const DEFAULT_CATEGORIES = ['General', 'Work', 'Personal', 'Ideas', 'Study']

export default function NotesPage() {
  const { items, isLoading, createItem, updateItem, removeItem } = useCollection('notes')
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [showArchived, setShowArchived] = useState(false)
  const [addingCategory, setAddingCategory] = useState(false)
  const [newCategory, setNewCategory] = useState('')

  const categories = useMemo(() => {
    const existing = new Set(items.map((n) => n.folder).filter(Boolean))
    DEFAULT_CATEGORIES.forEach((c) => existing.add(c))
    return ['All', ...existing]
  }, [items])

  const filtered = useMemo(() => items
    .filter((n) => (showArchived ? !!n.archived : !n.archived))
    .filter((n) => category === 'All' || n.folder === category)
    .filter((n) => !query.trim() || `${n.title || ''}`.toLowerCase().includes(query.toLowerCase()) || `${n.content || ''}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (b.pinned - a.pinned) || (new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))),
    [items, category, query, showArchived])

  const archivedCount = useMemo(() => items.filter((n) => n.archived).length, [items])

  const createNote = async () => {
    const folder = category === 'All' ? 'General' : category
    const note = await createItem({ title: 'Untitled note', content: '', folder, tags: [], pinned: false, favorite: false, archived: false, color: '' })
    toast.success('Note created')
    navigate(`/notes/${note.id}`)
  }

  const duplicate = async (n) => {
    await createItem({ ...n, id: undefined, title: `${n.title} (copy)`, pinned: false })
    toast.success('Note duplicated')
  }

  const del = async (n) => {
    if (!confirm(`Delete "${n.title}"?`)) return
    await removeItem(n.id)
    toast.success('Note deleted')
  }

  const toggleArchive = async (n) => {
    await updateItem(n.id, { archived: !n.archived })
    toast.success(n.archived ? 'Note unarchived' : 'Note archived')
  }

  const changeColor = async (n, color) => {
    await updateItem(n.id, { color })
  }

  const submitNewCategory = (e) => {
    e.preventDefault()
    const name = newCategory.trim()
    if (name) setCategory(name)
    setNewCategory('')
    setAddingCategory(false)
  }

  return (
    <div>
      {/* Row 1 — identity and the primary action. Row 2 — search, the archive
          toggle and the folder chips, same two-bar split as the calendar. */}
      <PageHeader
        title="Notes"
        description="Notes, by folder."
        actions={<Button onClick={createNote}><Plus size={16} /> New note</Button>}
        tools={
          <>
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dusk" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="pl-9" />
            </div>

            <button
              onClick={() => setShowArchived((v) => !v)}
              className={cn(
                'h-8 px-3 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-colors neo-press shrink-0',
                showArchived
                  ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-500/30'
                  : 'border-[color:var(--line)] text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark'
              )}
            >
              <Archive size={12} /> Archived{archivedCount ? ` ${archivedCount}` : ''}
            </button>

            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((f) => (
                <button
                  key={f}
                  onClick={() => setCategory(f)}
                  className={cn(
                    'h-8 px-3 rounded-md text-[13px] font-semibold border transition-colors neo-press',
                    category === f
                      ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-500/30'
                      : 'border-[color:var(--line)] text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark'
                  )}
                >
                  {f}
                </button>
              ))}

              {addingCategory ? (
                <form onSubmit={submitNewCategory} className="inline-flex items-center gap-1">
                  <input
                    autoFocus
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onBlur={() => { if (!newCategory.trim()) setAddingCategory(false) }}
                    placeholder="Name"
                    className="h-8 w-32 rounded-md px-3 text-xs font-medium bg-surface-light dark:bg-surface-dark outline-none border border-[color:var(--line)] placeholder:text-dusk"
                  />
                  <button type="button" onClick={() => { setAddingCategory(false); setNewCategory('') }} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-light dark:text-muted-dark hover:bg-black/[0.05] dark:hover:bg-white/[0.07] hover:text-ink-light dark:hover:text-ink-dark neo-press">
                    <X size={13} />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setAddingCategory(true)}
                  className="h-8 px-3 rounded-md text-xs font-semibold border border-dashed border-[color:var(--line-strong)] text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark flex items-center gap-1 transition-colors neo-press"
                >
                  <Plus size={12} /> New category
                </button>
              )}
            </div>
          </>
        }
      />

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={showArchived ? Archive : StickyNote}
          title={showArchived ? 'Nothing archived' : 'Nothing here yet'}
          actionLabel={showArchived ? undefined : 'New note'}
          onAction={showArchived ? undefined : createNote}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((n, i) => (
            <CardNotes
              key={n.id}
              note={n}
              colorKey={colorForNote(n, i)}
              onOpen={() => navigate(`/notes/${n.id}`)}
              onTogglePin={() => updateItem(n.id, { pinned: !n.pinned })}
              onToggleFavorite={() => updateItem(n.id, { favorite: !n.favorite })}
              onDuplicate={() => duplicate(n)}
              onDelete={() => del(n)}
              onToggleArchive={() => toggleArchive(n)}
              onChangeColor={(color) => changeColor(n, color)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
