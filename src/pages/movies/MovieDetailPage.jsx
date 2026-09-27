import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Heart, Repeat2, CalendarDays, Film, BookOpen, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCollection } from '@/hooks/useCollection'
import { Card, Badge, Button, StarRating, Skeleton } from '@/components/ui'
import MovieFormModal from './MovieFormModal'
import LogEntryModal from './LogEntryModal'
import { sortedLogs, isWatched } from '@/lib/movies'
import { formatDate, uid, cn } from '@/lib/utils'

export default function MovieDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { items, isLoading, updateItem, removeItem } = useCollection('movies')
  const [modalOpen, setModalOpen] = useState(false)
  const [logModalOpen, setLogModalOpen] = useState(false)
  const [editingLog, setEditingLog] = useState(null)

  const movie = items.find((m) => m.id === id)

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-40" /><Skeleton className="h-64 rounded-3xl" /></div>

  if (!movie) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-light dark:text-muted-dark mb-4">This entry wasn't found.</p>
        <Link to="/movies" className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
          <ArrowLeft size={15} /> Back to My Letterboxd
        </Link>
      </div>
    )
  }

  const logs = sortedLogs(movie)
  const watched = isWatched(movie)

  const save = async (data) => { await updateItem(movie.id, data); toast.success('Details updated'); setModalOpen(false) }
  const del = async () => { if (confirm(`Delete "${movie.title}"?`)) { await removeItem(movie.id); toast.success('Deleted'); navigate('/movies') } }
  const toggleFavorite = () => updateItem(movie.id, { favorite: !movie.favorite })

  const saveLog = (data) => {
    const nextLogs = editingLog
      ? movie.logs.map((l) => (l.id === editingLog.id ? { ...l, ...data } : l))
      : [...(movie.logs || []), { id: uid(), ...data }]
    updateItem(movie.id, { logs: nextLogs })
    toast.success(editingLog ? 'Entry updated' : 'Watch logged')
    setLogModalOpen(false); setEditingLog(null)
  }
  const deleteLog = (logId) => {
    if (!confirm('Delete this diary entry?')) return
    updateItem(movie.id, { logs: movie.logs.filter((l) => l.id !== logId) })
    toast.success('Entry deleted')
  }

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/movies')} className="flex items-center gap-1.5 text-sm text-muted-light dark:text-muted-dark hover:text-inherit">
        <ArrowLeft size={15} /> Back to My Letterboxd
      </button>

      <div className="grid sm:grid-cols-[160px_1fr] gap-5">
        <div className="h-56 sm:h-full rounded-2xl overflow-hidden bg-panel2-light dark:bg-panel2-dark flex items-center justify-center border border-[color:var(--line)] shrink-0">
          {movie.poster ? <img src={movie.poster} alt={movie.title} className="h-full w-full object-cover" /> : <Film size={32} className="text-dusk" />}
        </div>

        <div className="flex flex-col gap-3">
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h1 className="font-display text-xl font-semibold tracking-tight truncate">{movie.title}</h1>
                  {!watched && <Badge>Watchlist</Badge>}
                  {logs.length > 1 && <Badge tone="amber"><Repeat2 size={10} className="inline mr-1 -mt-0.5" />Watched <span className="font-mono tabular-nums">{logs.length}</span>×</Badge>}
                </div>
                <div className="text-sm text-muted-light dark:text-muted-dark">
                  {movie.year && <p className="font-mono tabular-nums">{movie.year}</p>}
                  {logs[0] && (
                    <p className="text-[11px] text-dusk flex items-center gap-1"><CalendarDays size={13} /> last watched {formatDate(logs[0].date, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0 flex-wrap">
                <Button variant="secondary" size="sm" onClick={toggleFavorite}>
                  <Heart size={14} className={cn(movie.favorite && 'fill-rose-500 text-rose-500')} /> {movie.favorite ? 'Favorited' : 'Favorite'}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setModalOpen(true)}><Pencil size={14} /> Edit</Button>
                <Button variant="danger" size="sm" onClick={del}><Trash2 size={14} /> Delete</Button>
              </div>
            </div>

            {watched && logs[0] && (
              <div className="mt-3">
                <StarRating rating={logs[0].rating} size={20} />
              </div>
            )}

            {(movie.genres || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {movie.genres.map((g) => <Badge key={g}>{g}</Badge>)}
              </div>
            )}
          </Card>

          <Button size="sm" className="self-start" onClick={() => { setEditingLog(null); setLogModalOpen(true) }}>
            <Plus size={14} /> {watched ? 'Log a rewatch' : 'Log first watch'}
          </Button>
        </div>
      </div>

      <Card>
        <h3 className="font-display text-sm font-semibold tracking-tight mb-3 flex items-center gap-1.5"><BookOpen size={15} /> Diary</h3>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-light dark:text-muted-dark">No watches logged. Still on the list.</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="group rounded-xl bg-panel2-light dark:bg-panel2-dark p-3">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold tracking-tight">{formatDate(log.date, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    {log.rewatch && <Badge tone="amber" size="sm">Rewatch</Badge>}
                    <StarRating rating={log.rating} size={12} />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => { setEditingLog(log); setLogModalOpen(true) }} aria-label="Edit log" className="h-6 w-6 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 neo-press"><Pencil size={12} /></button>
                    <button onClick={() => deleteLog(log.id)} aria-label="Hapus log" className="h-6 w-6 rounded-lg flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-500 neo-press"><X size={13} /></button>
                  </div>
                </div>
                {log.review && <p className="text-sm text-muted-light dark:text-muted-dark whitespace-pre-wrap">{log.review}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>

      <MovieFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={save} initial={movie} />
      <LogEntryModal
        open={logModalOpen}
        onClose={() => { setLogModalOpen(false); setEditingLog(null) }}
        onSubmit={saveLog}
        initial={editingLog}
        isFirstWatch={!editingLog && logs.length === 0}
      />
    </div>
  )
}
