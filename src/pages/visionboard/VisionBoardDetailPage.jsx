import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, CheckCircle2, Circle, StickyNote } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCollection } from '@/hooks/useCollection'
import { Card, Badge, Button, Textarea, Skeleton } from '@/components/ui'
import VisionBoardFormModal from './VisionBoardFormModal'
import { categoryInfo, timeframeLabel } from '@/lib/visionBoard'
import { formatDate, cn } from '@/lib/utils'

const iconTone = {
  primary: 'bg-primary-500/15 text-primary-600 dark:text-primary-400',
  teal: 'bg-teal-500/15 text-teal-700 dark:text-teal-300',
  amber: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  rose: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
  default: 'bg-black/[0.06] dark:bg-white/[0.08] text-ink-light dark:text-ink-dark',
}

export default function VisionBoardDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { items, isLoading, updateItem, removeItem } = useCollection('visionItems')
  const [modalOpen, setModalOpen] = useState(false)

  const vision = items.find((v) => v.id === id)

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-40" /><Skeleton className="h-64 rounded-3xl" /></div>

  if (!vision) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-light dark:text-muted-dark mb-4">No such vision.</p>
        <Link to="/vision-board" className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline">
          <ArrowLeft size={15} /> Back to vision board
        </Link>
      </div>
    )
  }

  const info = categoryInfo(vision.category)

  const save = async (data) => { await updateItem(vision.id, data); toast.success('Vision updated'); setModalOpen(false) }
  const del = async () => { if (confirm(`Delete "${vision.title}"?`)) { await removeItem(vision.id); toast.success('Removed from board'); navigate('/vision-board') } }
  const toggleAchieved = () => updateItem(vision.id, { achieved: !vision.achieved, achievedDate: !vision.achieved ? new Date().toISOString() : null })
  const saveNotes = (notes) => updateItem(vision.id, { notes })

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/vision-board')} className="flex items-center gap-1.5 text-sm font-medium text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark transition-colors">
        <ArrowLeft size={15} /> Back to vision board
      </button>

      <Card className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn('h-14 w-14 rounded-2xl flex items-center justify-center shrink-0', iconTone[info.color] || iconTone.default)}>
            <info.icon size={26} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className={cn('font-display text-xl font-semibold tracking-tight truncate', vision.achieved && 'line-through text-muted-light dark:text-muted-dark')}>{vision.title}</h1>
              {vision.achieved && <Badge tone="teal">Achieved</Badge>}
            </div>
            {/* Meta values stack — no middle-dot joining. */}
            <p className="text-sm leading-snug text-muted-light dark:text-muted-dark">
              {info.label}
              <span className="block text-dusk">{timeframeLabel(vision.timeframe)}</span>
              {vision.achieved && vision.achievedDate && <span className="block text-dusk">achieved {formatDate(vision.achievedDate, { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => setModalOpen(true)}><Pencil size={14} /> Edit</Button>
          <Button variant="danger" size="sm" onClick={del}><Trash2 size={14} /> Delete</Button>
        </div>
      </Card>

      <Card className="flex items-center justify-between gap-4">
        <div>
          <p className="font-display font-semibold tracking-tight text-sm mb-0.5">{vision.achieved ? 'Achieved' : 'In progress'}</p>
          <p className="text-xs text-muted-light dark:text-muted-dark">{vision.achieved ? 'Undo any time.' : "Mark it once it's real."}</p>
        </div>
        <Button variant={vision.achieved ? 'secondary' : 'primary'} onClick={toggleAchieved}>
          {vision.achieved ? <Circle size={15} /> : <CheckCircle2 size={15} />}
          {vision.achieved ? 'Undo' : 'Achieve'}
        </Button>
      </Card>

      {vision.description && (
        <Card>
          <h3 className="font-display font-semibold tracking-tight text-sm mb-2">Description</h3>
          <p className="text-sm text-muted-light dark:text-muted-dark whitespace-pre-wrap">{vision.description}</p>
        </Card>
      )}

      <Card>
        <h3 className="font-display font-semibold tracking-tight text-sm mb-3 flex items-center gap-1.5"><StickyNote size={15} /> Reflections</h3>
        <Textarea rows={5} defaultValue={vision.notes} onBlur={(e) => saveNotes(e.target.value)} placeholder="Why it matters, progress so far, thoughts along the way" />
      </Card>

      <VisionBoardFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={save} initial={vision} />
    </div>
  )
}
