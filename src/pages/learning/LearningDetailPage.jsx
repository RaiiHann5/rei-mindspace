import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, ExternalLink, Plus, X, Minus, StickyNote, ListChecks } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCollection } from '@/hooks/useCollection'
import { Card, Badge, Button, Progress, Textarea, Checkbox, Skeleton } from '@/components/ui'
import LearningFormModal from './LearningFormModal'
import { categoryInfo, statusInfo, deriveStatus, milestoneProgress } from '@/lib/learning'
import { formatDate, uid, cn } from '@/lib/utils'

const iconTone = {
  primary: 'bg-primary-500/15 text-primary-600 dark:text-primary-400',
  teal: 'bg-teal-500/15 text-teal-700 dark:text-teal-300',
  amber: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  rose: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
  default: 'bg-black/[0.06] dark:bg-white/[0.08] text-ink-light dark:text-ink-dark',
}

export default function LearningDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { items, isLoading, updateItem, removeItem } = useCollection('skills')
  const [modalOpen, setModalOpen] = useState(false)
  const [milestoneText, setMilestoneText] = useState('')

  const skill = items.find((s) => s.id === id)

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-40" /><Skeleton className="h-64 rounded-3xl" /></div>

  if (!skill) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-light dark:text-muted-dark mb-4">Skill not found.</p>
        <Link to="/learning" className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline">
          <ArrowLeft size={15} /> Back to Skills & Learning
        </Link>
      </div>
    )
  }

  const info = categoryInfo(skill.category)
  const status = statusInfo(skill.status)
  const milestones = skill.milestones || []

  const save = async (data) => { await updateItem(skill.id, data); toast.success('Skill updated'); setModalOpen(false) }
  const del = async () => { if (confirm(`Delete "${skill.title}"?`)) { await removeItem(skill.id); toast.success('Skill deleted'); navigate('/learning') } }
  const saveNotes = (notes) => updateItem(skill.id, { notes })

  const bumpProgress = (delta) => {
    const progress = Math.min(100, Math.max(0, (Number(skill.progress) || 0) + delta))
    updateItem(skill.id, { progress, status: deriveStatus(progress) })
  }

  const addMilestone = () => {
    if (!milestoneText.trim()) return
    updateItem(skill.id, { milestones: [...milestones, { id: uid(), text: milestoneText.trim(), done: false }] })
    setMilestoneText('')
  }
  const toggleMilestone = (mid) => {
    updateItem(skill.id, { milestones: milestones.map((m) => (m.id === mid ? { ...m, done: !m.done } : m)) })
  }
  const removeMilestone = (mid) => {
    updateItem(skill.id, { milestones: milestones.filter((m) => m.id !== mid) })
  }

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/learning')} className="flex items-center gap-1.5 text-sm font-medium text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark transition-colors">
        <ArrowLeft size={15} /> Back to Skills & Learning
      </button>

      <Card className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn('h-14 w-14 rounded-2xl flex items-center justify-center shrink-0', iconTone[info.color] || iconTone.default)}>
            <info.icon size={26} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="font-display text-xl font-semibold tracking-tight truncate">{skill.title}</h1>
              <Badge tone={status.tone}>{status.label}</Badge>
            </div>
            {/* Meta values stack — no middle-dot joining. */}
            <p className="text-sm leading-snug text-muted-light dark:text-muted-dark">
              {info.label}
              {skill.platform && <span className="block text-dusk">{skill.platform}</span>}
              {skill.targetDate && <span className="block text-dusk">target {formatDate(skill.targetDate, { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap">
          {skill.resourceUrl && (
            <a href={skill.resourceUrl} target="_blank" rel="noreferrer">
              <Button variant="secondary" size="sm"><ExternalLink size={14} /> Resource</Button>
            </a>
          )}
          <Button variant="secondary" size="sm" onClick={() => setModalOpen(true)}><Pencil size={14} /> Edit</Button>
          <Button variant="danger" size="sm" onClick={del}><Trash2 size={14} /> Delete</Button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-semibold tracking-tight text-sm">Progress</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => bumpProgress(-10)} aria-label="Kurangi progres" className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/5 dark:hover:bg-white/10 transition-colors neo-press"><Minus size={13} /></button>
            <span className="num text-sm w-10 text-center">{skill.progress}%</span>
            <button onClick={() => bumpProgress(10)} aria-label="Tambah progres" className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/5 dark:hover:bg-white/10 transition-colors neo-press"><Plus size={13} /></button>
          </div>
        </div>
        <Progress value={skill.progress} tone={skill.status === 'completed' ? 'teal' : 'primary'} />
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="font-display font-semibold tracking-tight text-sm flex items-center gap-1.5"><ListChecks size={15} /> Milestones</h3>
          {milestones.length > 0 && <p className="text-[11px] font-mono tabular-nums text-dusk">{milestoneProgress(milestones)}% done</p>}
        </div>
        {milestones.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {milestones.map((m) => (
              <div key={m.id} className="group flex items-center gap-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] px-3 py-2">
                <Checkbox checked={m.done} onChange={() => toggleMilestone(m.id)} />
                <span className={cn('text-sm flex-1', m.done && 'line-through text-dusk')}>{m.text}</span>
                <button onClick={() => removeMilestone(m.id)} aria-label="Hapus milestone" className="h-6 w-6 rounded-lg flex items-center justify-center text-muted-light dark:text-muted-dark opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-500 transition-colors shrink-0 neo-press"><X size={12} /></button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={milestoneText}
            onChange={(e) => setMilestoneText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMilestone() } }}
            placeholder="Add a milestone..."
            className="flex-1 h-9 rounded-lg px-3 text-sm bg-surface-light dark:bg-surface-dark border border-[color:var(--line)] outline-none placeholder:text-dusk"
          />
          <Button size="sm" variant="secondary" onClick={addMilestone} aria-label="Tambah milestone"><Plus size={14} /></Button>
        </div>
      </Card>

      <Card>
        <h3 className="font-display font-semibold tracking-tight text-sm mb-3 flex items-center gap-1.5"><StickyNote size={15} /> Notes</h3>
        <Textarea rows={5} defaultValue={skill.notes} onBlur={(e) => saveNotes(e.target.value)} placeholder="What you've learned so far, resources that helped, next steps..." />
      </Card>

      <LearningFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={save} initial={skill} />
    </div>
  )
}
