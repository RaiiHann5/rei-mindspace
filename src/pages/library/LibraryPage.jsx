import { useMemo, useState } from 'react'
import { Plus, Star, Pencil, Trash2, Library as LibraryIcon, Book, Film, Gamepad2, Music, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCollection } from '@/hooks/useCollection'
import { PageHeader, Button, Card, Badge, EmptyState, Skeleton } from '@/components/ui'
import FilterChip from '@/components/ui/FilterChip'
import LibraryFormModal from './LibraryFormModal'
import { cn } from '@/lib/utils'

const TYPE_ICON = { book: Book, movie: Film, game: Gamepad2, music: Music, course: GraduationCap }
const statusTone = { planned: 'default', in_progress: 'primary', completed: 'teal', dropped: 'rose' }
// Chip labels are written out rather than pluralised from the key — "Musics".
const TYPE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'book', label: 'Books' },
  { value: 'movie', label: 'Films' },
  { value: 'game', label: 'Games' },
  { value: 'music', label: 'Music' },
  { value: 'course', label: 'Courses' },
]

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={12} className={i < rating ? 'fill-amber-500 text-amber-500' : 'text-dusk/40'} />
      ))}
    </div>
  )
}

export default function LibraryPage() {
  const { items, isLoading, createItem, updateItem, removeItem } = useCollection('library')
  const [type, setType] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const filtered = useMemo(() => items.filter((i) => type === 'all' || i.type === type), [items, type])

  const save = async (data) => {
    if (editing) { await updateItem(editing.id, data); toast.success('Updated') }
    else { await createItem(data); toast.success('Added to library') }
    setModalOpen(false); setEditing(null)
  }
  const del = async (i) => { if (confirm(`Remove "${i.title}"?`)) { await removeItem(i.id); toast.success('Removed') } }

  return (
    <div>
      <PageHeader title="Media Library" description="Books, films, games, music, courses." actions={<Button onClick={() => { setEditing(null); setModalOpen(true) }}><Plus size={16} /> Add item</Button>} />

      <div className="flex flex-wrap gap-2 mb-4">
        {TYPE_FILTERS.map((t) => (
          <FilterChip key={t.value} active={type === t.value} onClick={() => setType(t.value)}>{t.label}</FilterChip>
        ))}
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-44" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={LibraryIcon} title="Nothing here yet." description="Add a book, film, album, or course." actionLabel="Add item" onAction={() => setModalOpen(true)} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((i) => {
            const Icon = TYPE_ICON[i.type] || Book
            return (
              <Card key={i.id} hover className="group flex flex-col cursor-pointer" onClick={() => { setEditing(i); setModalOpen(true) }}>
                {i.cover ? (
                  <div className="h-32 rounded-xl overflow-hidden mb-3 bg-panel2-light dark:bg-panel2-dark">
                    <img src={i.cover} alt={i.title} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="h-24 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-3">
                    <Icon size={28} />
                  </div>
                )}
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-display font-semibold tracking-tight text-sm leading-snug flex-1">{i.title}</h3>
                  <button onClick={(ev) => { ev.stopPropagation(); updateItem(i.id, { favorite: !i.favorite }) }} aria-label={i.favorite ? 'Remove favorite' : 'Mark favorite'} className={cn('shrink-0 neo-press', i.favorite ? 'text-amber-500' : 'text-dusk opacity-0 group-hover:opacity-100')}>
                    <Star size={14} className={i.favorite ? 'fill-amber-500' : ''} />
                  </button>
                </div>
                <p className="text-[11px] text-dusk mb-2">{i.creator}</p>
                <Stars rating={i.rating} />
                <div className="mt-auto pt-3 flex items-center justify-between">
                  <Badge tone={statusTone[i.status]}>{i.status.replace('_', ' ')}</Badge>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(ev) => ev.stopPropagation()}>
                    <button onClick={() => { setEditing(i); setModalOpen(true) }} aria-label="Edit item" className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 neo-press"><Pencil size={12} /></button>
                    <button onClick={() => del(i)} className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-500 neo-press"><Trash2 size={12} /></button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
      <LibraryFormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }} onSubmit={save} initial={editing} />
    </div>
  )
}
