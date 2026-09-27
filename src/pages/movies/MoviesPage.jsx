import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Film, Heart, Pencil, Trash2, Clapperboard } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCollection } from '@/hooks/useCollection'
import { PageHeader, Button, Card, Badge, EmptyState, Skeleton, StarRating, FilterChip } from '@/components/ui'
import MovieFormModal from './MovieFormModal'
import { movieSummary, latestLog, isWatched } from '@/lib/movies'

const FILTERS = [
  { value: 'watched', label: 'Watched' },
  { value: 'watchlist', label: 'Watchlist' },
  { value: 'favorites', label: 'Favorites' },
  { value: 'all', label: 'All' },
]

export default function MoviesPage() {
  const navigate = useNavigate()
  const { items, isLoading, createItem, updateItem, removeItem } = useCollection('movies')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filter, setFilter] = useState('watched')

  const summary = useMemo(() => movieSummary(items), [items])
  const filtered = useMemo(() => {
    if (filter === 'all') return items
    if (filter === 'favorites') return items.filter((m) => m.favorite)
    if (filter === 'watched') return items.filter((m) => isWatched(m))
    return items.filter((m) => !isWatched(m))
  }, [items, filter])

  const save = async (data) => {
    if (editing) { await updateItem(editing.id, data); toast.success('Entry updated') }
    else { await createItem(data); toast.success('Logged') }
    setModalOpen(false); setEditing(null)
  }
  const del = async (m) => { if (confirm(`Delete "${m.title}"?`)) { await removeItem(m.id); toast.success('Deleted') } }

  return (
    <div>
      <PageHeader
        title="My Letterboxd"
        description="Every film you've watched, rated, and want to watch."
        actions={<Button onClick={() => { setEditing(null); setModalOpen(true) }}><Plus size={16} /> Log a Film</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card className="flex flex-col items-center text-center gap-1.5">
          <Film size={18} className="text-primary-600 dark:text-primary-400" />
          <p className="num text-xl">{summary.watchedCount}</p>
          <p className="text-[11px] font-medium text-dusk">Films Watched</p>
        </Card>
        <Card className="flex flex-col items-center text-center gap-1.5">
          <p className="num text-xl">{summary.avgRating ? summary.avgRating.toFixed(1) : '—'}</p>
          <p className="text-[11px] font-medium text-dusk">Avg Rating</p>
        </Card>
        <Card className="flex flex-col items-center text-center gap-1.5">
          <Heart size={18} className="text-rose-500" />
          <p className="num text-xl">{summary.favorites}</p>
          <p className="text-[11px] font-medium text-dusk">Favorites</p>
        </Card>
        <Card className="flex flex-col items-center text-center gap-1.5">
          <p className="num text-xl">{summary.thisYear}</p>
          <p className="text-[11px] font-medium text-dusk">Diary Entries This Year</p>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <FilterChip key={f.value} active={filter === f.value} onClick={() => setFilter(f.value)}>{f.label}</FilterChip>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-56" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Clapperboard}
          title={filter === 'watchlist' ? 'Watchlist is empty' : 'Nothing here yet'}
          description="Log a film you've watched or add one to your watchlist."
          actionLabel="Log a Film"
          onAction={() => { setEditing(null); setModalOpen(true) }}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {filtered.map((m) => {
            const log = latestLog(m)
            const watched = isWatched(m)
            const rewatchCount = (m.logs || []).length
            return (
              <Card key={m.id} hover padding={false} className="group flex flex-col overflow-hidden" onClick={() => navigate(`/movies/${m.id}`)}>
                <div className="relative h-48 bg-panel2-light dark:bg-panel2-dark flex items-center justify-center overflow-hidden">
                  {m.poster ? (
                    <img src={m.poster} alt={m.title} className="h-full w-full object-cover" />
                  ) : (
                    <Film size={28} className="text-dusk" />
                  )}
                  {m.favorite && (
                    <div className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 flex items-center justify-center">
                      <Heart size={13} className="fill-rose-500 text-rose-500" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => { setEditing(m); setModalOpen(true) }} aria-label="Edit film" className="h-7 w-7 rounded-lg bg-black/60 flex items-center justify-center text-white hover:bg-black/80 neo-press"><Pencil size={12} /></button>
                    <button onClick={() => del(m)} className="h-7 w-7 rounded-lg bg-black/60 flex items-center justify-center text-white hover:bg-rose-500 neo-press"><Trash2 size={12} /></button>
                  </div>
                  {!watched && <Badge className="absolute bottom-2 left-2">Watchlist</Badge>}
                  {rewatchCount > 1 && <Badge className="absolute bottom-2 right-2"><span className="font-mono tabular-nums">{rewatchCount}</span>×</Badge>}
                </div>
                <div className="p-2.5">
                  <p className="font-display font-semibold tracking-tight text-sm truncate">{m.title}</p>
                  <p className="text-[11px] text-dusk font-mono tabular-nums mb-1">{m.year || '—'}</p>
                  {watched && <StarRating rating={log.rating} size={11} />}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <MovieFormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }} onSubmit={save} initial={editing} />
    </div>
  )
}
