import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, StickyNote, Archive, X, LayoutGrid, Rows3, ArrowDownWideNarrow } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCollection } from '@/hooks/useCollection'
import { PageHeader, Button, Input, EmptyState, Skeleton, Select } from '@/components/ui'
import { cn } from '@/lib/utils'
import CardNotes, { colorForNote } from '@/components/notes/CardNotes'

const DEFAULT_CATEGORIES = ['General', 'Work', 'Personal', 'Ideas', 'Study']

// Density. `roomy` is the new default — four columns left each card around
// 330px, which clipped the preview to a couple of words. Three columns with a
// larger gap gives the card room to actually show its content.
const GRID = {
  roomy: 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5',
  dense: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3.5',
}

const SORTS = {
  updated: { label: 'Updated', fn: (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt) },
  created: { label: 'Newest', fn: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0) },
  title: { label: 'A–Z', fn: (a, b) => (a.title || '').localeCompare(b.title || '') },
}

export default function NotesPage() {
  const { items, isLoading, createItem, updateItem, removeItem } = useCollection('notes')
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [showArchived, setShowArchived] = useState(false)
  const [addingCategory, setAddingCategory] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [grid, setGrid] = useState('roomy')
  const [sort, setSort] = useState('updated')

  const categories = useMemo(() => {
    const existing = new Set(items.map((n) => n.folder).filter(Boolean))
    DEFAULT_CATEGORIES.forEach((c) => existing.add(c))
    return ['All', ...existing]
  }, [items])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items
      .filter((n) => (showArchived ? !!n.archived : !n.archived))
      .filter((n) => category === 'All' || n.folder === category)
      .filter((n) => !q || `${n.title || ''}`.toLowerCase().includes(q) || `${n.content || ''}`.toLowerCase().includes(q))
      // Pinned first always, then the chosen order within each pin group.
      .sort((a, b) => (b.pinned - a.pinned) || SORTS[sort].fn(a, b))
  }, [items, category, query, showArchived, sort])

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
            <div className="ml-auto flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-dusk hidden lg:inline flex items-center gap-1">
                  <ArrowDownWideNarrow size={12} strokeWidth={2} />
                  Sort
                </span>
                <Select value={sort} onChange={(e) => setSort(e.target.value)} className="h-8 w-32 text-[13px]">
                  {Object.entries(SORTS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </Select>
              </div>

              <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-black/[0.04] dark:bg-white/[0.05]">
                {[
                  { id: 'roomy', icon: LayoutGrid, label: 'Roomy' },
                  { id: 'dense', icon: Rows3, label: 'Dense' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setGrid(opt.id)}
                    title={opt.label}
                    aria-label={`${opt.label} grid`}
                    aria-pressed={grid === opt.id}
                    className={cn(
                      'h-7 w-8 rounded-md grid place-items-center transition-colors neo-press',
                      grid === opt.id
                        ? 'bg-surface-light dark:bg-panel2-dark text-ink-light dark:text-ink-dark shadow-soft'
                        : 'text-dusk hover:text-ink-light dark:hover:text-ink-dark'
                    )}
                  >
                    <opt.icon size={14} strokeWidth={2} />
                  </button>
                ))}
              </div>
            </div>
          </>
        }
      />

      {isLoading ? (
        <div className={cn(GRID[grid])}>
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={showArchived ? Archive : StickyNote}
          title={showArchived ? 'Nothing archived' : 'Nothing here yet'}
          actionLabel={showArchived ? undefined : 'New note'}
          onAction={showArchived ? undefined : createNote}
        />
      ) : (
        <>
          <div className={cn(GRID[grid])}>
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
                compact={grid === 'dense'}
              />
            ))}
          </div>
          <p className="mt-5 text-[11px] text-dusk font-mono tabular-nums">
            {filtered.length} note{filtered.length === 1 ? '' : 's'}
          </p>
        </>
      )}
    </div>
  )
}
