import { useMemo, useRef, useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Star, Trash2, Copy, Clock, Tag, X, Plus, Lightbulb,
  ThumbsUp, ThumbsDown, ListChecks, Link2, ExternalLink, CheckSquare,
  Check, Folder,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useCollection } from '@/hooks/useCollection'
import { Textarea, Skeleton, Progress, Checkbox } from '@/components/ui'
import { cn, formatDate, uid } from '@/lib/utils'

const STATUS = [
  { key: 'new', label: 'Baru' },
  { key: 'exploring', label: 'Dieksplor' },
  { key: 'validated', label: 'Tervalidasi' },
  { key: 'archived', label: 'Diarsipkan' },
]

const DEFAULT_CATEGORIES = ['Product', 'Engineering', 'Design', 'Marketing', 'Bisnis', 'Lainnya']

// Low-chroma chip tints, cycling by index so a given idea keeps its colour.
// The panel itself stays flat — the tint only lives on the small chip.
const TONES = [
  { chip: 'bg-teal-500/12 text-teal-600 dark:text-teal-300' },
  { chip: 'bg-rose-500/12 text-rose-600 dark:text-rose-300' },
  { chip: 'bg-amber-500/12 text-amber-600 dark:text-amber-300' },
]

function toneForItem(item, items) {
  const idx = items.findIndex((i) => i.id === item.id)
  return TONES[(idx < 0 ? 0 : idx) % TONES.length]
}

export default function BrainstormDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { items, isLoading, updateItem, removeItem, createItem } = useCollection('brainstorm')
  const { createItem: createTask } = useCollection('tasks')
  const item = items.find((i) => i.id === id)

  const [tagInput, setTagInput] = useState('')
  const [proInput, setProInput] = useState('')
  const [conInput, setConInput] = useState('')
  const [stepInput, setStepInput] = useState('')
  const [linkLabel, setLinkLabel] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)
  const [newCategoryInput, setNewCategoryInput] = useState('')
  const categoryMenuRef = useRef(null)

  // --- Title editing: local draft so typing is instant instead of waiting
  // for async cache round-trips on every keystroke. Saved debounced + on blur.
  const [titleDraft, setTitleDraft] = useState('')
  const titleTimer = useRef(null)
  const titleDirtyRef = useRef(false)
  const titleLatestRef = useRef('')
  const itemRef = useRef(null)
  itemRef.current = item
  const updateItemRef = useRef(null)
  useEffect(() => { updateItemRef.current = updateItem })

  const persistTitle = (value) => {
    titleDirtyRef.current = false
    clearTimeout(titleTimer.current)
    const current = itemRef.current
    if (!current || value === (current.title ?? '')) return
    updateItem(current.id, { title: value })
  }

  const scheduleTitleSave = (value) => {
    titleDirtyRef.current = true
    titleLatestRef.current = value
    clearTimeout(titleTimer.current)
    titleTimer.current = setTimeout(() => persistTitle(value), 600)
  }

  useEffect(() => {
    if (titleDirtyRef.current) return
    clearTimeout(titleTimer.current)
    setTitleDraft(item?.title ?? '')
  }, [item])

  useEffect(() => {
    return () => {
      clearTimeout(titleTimer.current)
      if (titleDirtyRef.current && itemRef.current) {
        updateItemRef.current?.(itemRef.current.id, { title: titleLatestRef.current })
      }
    }
  }, [])

  useEffect(() => {
    const onDocClick = (e) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target)) setCategoryMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const categories = useMemo(() => {
    const existing = new Set(items.map((i) => i.category).filter(Boolean))
    DEFAULT_CATEGORIES.forEach((c) => existing.add(c))
    return [...existing]
  }, [items])

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-40" /><Skeleton className="h-64 rounded-3xl" /></div>

  if (!item) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-light dark:text-muted-dark mb-4">Ide tidak ditemukan.</p>
        <Link to="/brainstorm" className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline">
          <ArrowLeft size={15} /> Kembali ke brainstorm
        </Link>
      </div>
    )
  }

  const tone = toneForItem(item, items)
  const steps = item.steps || []
  const doneCount = steps.filter((s) => s.done).length
  const stepProgress = steps.length ? Math.round((doneCount / steps.length) * 100) : 0

  const del = async () => {
    if (!confirm(`Hapus "${item.title}"?`)) return
    await removeItem(item.id)
    toast.success('Ide dihapus')
    navigate('/brainstorm')
  }

  const duplicate = async () => {
    const copy = await createItem({ ...item, id: undefined, title: `${item.title} (copy)`, favorite: false })
    toast.success('Ide diduplikasi')
    navigate(`/brainstorm/${copy.id}`)
  }

  const setStatus = (status) => updateItem(item.id, { status })

  const setCategory = (name) => {
    updateItem(item.id, { category: name })
    setCategoryMenuOpen(false)
    setNewCategoryInput('')
  }

  const submitNewCategory = (e) => {
    e.preventDefault()
    const name = newCategoryInput.trim()
    if (name) setCategory(name)
  }

  const addTag = (e) => {
    e.preventDefault()
    const t = tagInput.trim()
    if (!t || item.tags?.includes(t)) { setTagInput(''); return }
    updateItem(item.id, { tags: [...(item.tags || []), t] })
    setTagInput('')
  }
  const removeTag = (t) => updateItem(item.id, { tags: (item.tags || []).filter((x) => x !== t) })

  const addPro = (e) => {
    e.preventDefault()
    const v = proInput.trim()
    if (!v) return
    updateItem(item.id, { pros: [...(item.pros || []), { id: uid(), text: v }] })
    setProInput('')
  }
  const removePro = (pid) => updateItem(item.id, { pros: (item.pros || []).filter((p) => p.id !== pid) })

  const addCon = (e) => {
    e.preventDefault()
    const v = conInput.trim()
    if (!v) return
    updateItem(item.id, { cons: [...(item.cons || []), { id: uid(), text: v }] })
    setConInput('')
  }
  const removeCon = (cid) => updateItem(item.id, { cons: (item.cons || []).filter((c) => c.id !== cid) })

  const addStep = (e) => {
    e.preventDefault()
    const v = stepInput.trim()
    if (!v) return
    updateItem(item.id, { steps: [...steps, { id: uid(), text: v, done: false }] })
    setStepInput('')
  }
  const toggleStep = (sid) => updateItem(item.id, { steps: steps.map((s) => (s.id === sid ? { ...s, done: !s.done } : s)) })
  const removeStep = (sid) => updateItem(item.id, { steps: steps.filter((s) => s.id !== sid) })

  const addLink = (e) => {
    e.preventDefault()
    let url = linkUrl.trim()
    if (!url) return
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`
    updateItem(item.id, { links: [...(item.links || []), { id: uid(), label: linkLabel.trim() || url, url }] })
    setLinkLabel(''); setLinkUrl('')
  }
  const removeLink = (lid) => updateItem(item.id, { links: (item.links || []).filter((l) => l.id !== lid) })

  const convertToTask = async () => {
    await createTask({
      title: item.title,
      notes: item.notes || '',
      status: 'todo',
      priority: 'medium',
      dueDate: null,
      tags: item.tags || [],
      checklist: steps.map((s) => ({ id: uid(), text: s.text, done: s.done })),
      archived: false,
    })
    updateItem(item.id, { status: 'validated' })
    toast.success('Ide diubah jadi task')
    navigate('/tasks')
  }

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/brainstorm')} className="flex items-center gap-1.5 text-sm font-medium text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark transition-colors">
        <ArrowLeft size={15} /> Kembali ke brainstorm
      </button>

      <div className="rounded-3xl border border-[color:var(--line)] bg-panel2-light dark:bg-panel2-dark overflow-hidden shadow-card">
        {/* header */}
        <div className="p-6 md:p-8 pb-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <div className={cn('h-9 w-9 rounded-lg grid place-items-center shrink-0', tone.chip)}>
                <Lightbulb size={16} />
              </div>
              <div className="relative" ref={categoryMenuRef}>
                <button
                  onClick={() => setCategoryMenuOpen((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold border border-[color:var(--line)] bg-surface-light dark:bg-surface-dark text-ink-light dark:text-ink-dark hover:border-[color:var(--line-strong)] transition-colors neo-press"
                >
                  <Folder size={11} /> {item.category || 'Lainnya'}
                </button>
                {categoryMenuOpen && (
                  <div className="absolute left-0 top-9 z-20 w-48 rounded-2xl glass-solid py-1.5 px-1.5 animate-pop" style={{ boxShadow: 'var(--shadow-pop)' }}>
                    <p className="px-2 pb-1 text-[11px] font-medium text-dusk">Kategori</p>
                    {categories.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs text-ink-light dark:text-ink-dark hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
                      >
                        {c}
                        {item.category === c && <Check size={12} />}
                      </button>
                    ))}
                    <form onSubmit={submitNewCategory} className="flex items-center gap-1 px-1 pt-1 mt-1 border-t border-[color:var(--line)]">
                      <input
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        placeholder="Nama"
                        className="flex-1 min-w-0 h-7 rounded-lg px-2 text-xs bg-black/[0.04] dark:bg-white/[0.06] outline-none placeholder:text-dusk"
                      />
                      {newCategoryInput.trim() && (
                        <button type="submit" aria-label="Add category" className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/[0.06] dark:hover:bg-white/[0.08] shrink-0 neo-press">
                          <Plus size={13} />
                        </button>
                      )}
                    </form>
                  </div>
                )}
              </div>
              <span className="text-[11px] flex items-center gap-1 text-dusk">
                <Clock size={11} /> {formatDate(item.updatedAt || item.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => updateItem(item.id, { favorite: !item.favorite })}
                aria-label={item.favorite ? 'Unfavorite' : 'Favorite'}
                className={cn('h-9 w-9 rounded-lg flex items-center justify-center transition-colors neo-press', 'text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/[0.05] dark:hover:bg-white/[0.07]', item.favorite && 'bg-black/[0.06] dark:bg-white/[0.10]')}
              >
                <Star size={16} className={item.favorite ? 'fill-amber-500 text-amber-500' : ''} />
              </button>
              <button onClick={duplicate} aria-label="Duplikasi ide" className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/[0.05] dark:hover:bg-white/[0.07] transition-colors neo-press">
                <Copy size={15} />
              </button>
              <button onClick={del} aria-label="Hapus ide" className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-light dark:text-muted-dark hover:text-rose-500 transition-colors neo-press">
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          <input
            value={titleDraft}
            onChange={(e) => { setTitleDraft(e.target.value); scheduleTitleSave(e.target.value) }}
            onBlur={() => { if (titleDirtyRef.current) persistTitle(titleLatestRef.current) }}
            placeholder="Judul ide"
            className="w-full bg-transparent outline-none placeholder:text-dusk font-display text-2xl md:text-3xl font-semibold tracking-tight leading-tight"
          />

          {/* status stepper */}
          <div className="flex flex-wrap items-center gap-1.5 mt-4">
            {STATUS.map((s) => (
              <button
                key={s.key}
                onClick={() => setStatus(s.key)}
                className={cn(
                  'h-7 px-3 rounded-md text-[11px] font-semibold border transition-colors neo-press',
                  item.status === s.key
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-500/30'
                    : 'border-[color:var(--line)] text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-4">
            {item.tags?.map((t) => (
              <span key={t} className="group inline-flex items-center gap-1 rounded-md pl-2.5 pr-1.5 py-1 text-[11px] font-medium border border-[color:var(--line)] bg-surface-light dark:bg-surface-dark text-ink-light dark:text-ink-dark">
                <Tag size={10} /> {t}
                <button onClick={() => removeTag(t)} aria-label={`Hapus tag ${t}`} className="h-3.5 w-3.5 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20">
                  <X size={9} />
                </button>
              </span>
            ))}
            <form onSubmit={addTag} className="inline-flex items-center gap-1">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Tambah tag"
                className="h-6 w-20 focus:w-28 transition-all bg-black/[0.04] dark:bg-white/[0.06] rounded-md px-2.5 text-[11px] outline-none placeholder:text-dusk text-ink-light dark:text-ink-dark"
              />
              {tagInput.trim() && (
                <button type="submit" aria-label="Add tag" className="h-6 w-6 rounded-md flex items-center justify-center shrink-0 border border-[color:var(--line)] bg-surface-light dark:bg-surface-dark text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark neo-press">
                  <Plus size={12} />
                </button>
              )}
            </form>
          </div>
        </div>

        {/* content surface */}
        <div className="bg-surface-light dark:bg-surface-dark m-2 md:m-3 rounded-2xl p-6 md:p-8 space-y-6">
          <div>
            <h3 className="font-display font-semibold tracking-tight text-sm mb-2">Deskripsi</h3>
            <Textarea
              rows={5}
              defaultValue={item.notes}
              onBlur={(e) => updateItem(item.id, { notes: e.target.value })}
              placeholder="Masalah apa yang diselesaikan, untuk siapa, kenapa penting."
            />
          </div>

          {/* pros & cons */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <h3 className="font-display font-semibold tracking-tight text-sm mb-2 flex items-center gap-1.5"><ThumbsUp size={14} className="text-teal-500" /> Kelebihan</h3>
              <div className="space-y-1.5 mb-2">
                {(item.pros || []).length === 0 && <p className="text-xs text-dusk">Belum ada poin.</p>}
                {(item.pros || []).map((p) => (
                  <div key={p.id} className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/25">
                    <span className="flex-1 min-w-0">{p.text}</span>
                    <button onClick={() => removePro(p.id)} aria-label="Hapus poin kelebihan" className="shrink-0 text-dusk hover:text-rose-500 neo-press"><X size={13} /></button>
                  </div>
                ))}
              </div>
              <form onSubmit={addPro} className="flex gap-2">
                <input
                  value={proInput}
                  onChange={(e) => setProInput(e.target.value)}
                  placeholder="Tambah kelebihan"
                  className="flex-1 h-9 rounded-lg px-3 text-sm bg-black/[0.03] dark:bg-white/[0.05] border border-[color:var(--line)] outline-none placeholder:text-dusk"
                />
                <button type="submit" aria-label="Tambah poin kelebihan" className="h-9 w-9 rounded-lg grid place-items-center bg-teal-500/12 text-teal-600 dark:text-teal-300 hover:bg-teal-500/20 shrink-0 neo-press"><Plus size={15} /></button>
              </form>
            </div>
            <div>
              <h3 className="font-display font-semibold tracking-tight text-sm mb-2 flex items-center gap-1.5"><ThumbsDown size={14} className="text-rose-500" /> Kekurangan</h3>
              <div className="space-y-1.5 mb-2">
                {(item.cons || []).length === 0 && <p className="text-xs text-dusk">Belum ada poin.</p>}
                {(item.cons || []).map((c) => (
                  <div key={c.id} className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/25">
                    <span className="flex-1 min-w-0">{c.text}</span>
                    <button onClick={() => removeCon(c.id)} aria-label="Hapus poin kekurangan" className="shrink-0 text-dusk hover:text-rose-500 neo-press"><X size={13} /></button>
                  </div>
                ))}
              </div>
              <form onSubmit={addCon} className="flex gap-2">
                <input
                  value={conInput}
                  onChange={(e) => setConInput(e.target.value)}
                  placeholder="Tambah kekurangan"
                  className="flex-1 h-9 rounded-lg px-3 text-sm bg-black/[0.03] dark:bg-white/[0.05] border border-[color:var(--line)] outline-none placeholder:text-dusk"
                />
                <button type="submit" aria-label="Tambah poin kekurangan" className="h-9 w-9 rounded-lg grid place-items-center bg-rose-500/12 text-rose-600 dark:text-rose-300 hover:bg-rose-500/20 shrink-0 neo-press"><Plus size={15} /></button>
              </form>
            </div>
          </div>

          {/* next steps */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <h3 className="font-display font-semibold tracking-tight text-sm flex items-center gap-1.5"><ListChecks size={14} /> Langkah selanjutnya</h3>
              {steps.length > 0 && <span className="text-xs font-mono tabular-nums text-dusk">{doneCount}/{steps.length} selesai</span>}
            </div>
            {steps.length > 0 && <Progress value={stepProgress} tone="primary" className="h-2 mb-3" />}
            <div className="space-y-1.5 mb-2">
              {steps.length === 0 && <p className="text-xs text-dusk">Pecah jadi langkah kecil.</p>}
              {steps.map((s) => (
                <div key={s.id} className="flex items-center gap-2.5 text-sm px-3 py-2 rounded-lg bg-black/[0.03] dark:bg-white/[0.05]">
                  <Checkbox checked={s.done} onChange={() => toggleStep(s.id)} />
                  <span className={cn('flex-1 min-w-0', s.done && 'line-through text-dusk')}>{s.text}</span>
                  <button onClick={() => removeStep(s.id)} aria-label="Hapus langkah" className="shrink-0 text-dusk hover:text-rose-500 neo-press"><X size={13} /></button>
                </div>
              ))}
            </div>
            <form onSubmit={addStep} className="flex gap-2">
              <input
                value={stepInput}
                onChange={(e) => setStepInput(e.target.value)}
                placeholder="Tambah langkah"
                className="flex-1 h-9 rounded-lg px-3 text-sm bg-black/[0.03] dark:bg-white/[0.05] border border-[color:var(--line)] outline-none placeholder:text-dusk"
              />
              <button type="submit" aria-label="Tambah langkah" className="h-9 w-9 rounded-lg grid place-items-center bg-primary-500/10 text-primary-600 dark:text-primary-400 hover:bg-primary-500/20 shrink-0 neo-press"><Plus size={15} /></button>
            </form>
          </div>

          {/* resources / links */}
          <div>
            <h3 className="font-display font-semibold tracking-tight text-sm mb-2 flex items-center gap-1.5"><Link2 size={14} /> Referensi & tautan</h3>
            <div className="space-y-1.5 mb-2">
              {(item.links || []).length === 0 && <p className="text-xs text-dusk">Belum ada tautan referensi.</p>}
              {(item.links || []).map((l) => (
                <div key={l.id} className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.05]">
                  <ExternalLink size={12} className="shrink-0 text-dusk" />
                  <a href={l.url} target="_blank" rel="noreferrer" className="flex-1 min-w-0 truncate hover:underline">{l.label}</a>
                  <button onClick={() => removeLink(l.id)} aria-label="Hapus tautan" className="shrink-0 text-dusk hover:text-rose-500 neo-press"><X size={13} /></button>
                </div>
              ))}
            </div>
            <form onSubmit={addLink} className="flex flex-wrap gap-2">
              <input
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
                placeholder="Label (opsional)"
                className="w-32 h-9 rounded-lg px-3 text-sm bg-black/[0.03] dark:bg-white/[0.05] border border-[color:var(--line)] outline-none placeholder:text-dusk"
              />
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 min-w-[160px] h-9 rounded-lg px-3 text-sm font-mono bg-black/[0.03] dark:bg-white/[0.05] border border-[color:var(--line)] outline-none placeholder:text-dusk placeholder:font-normal"
              />
              <button type="submit" aria-label="Tambah tautan" className="h-9 w-9 rounded-lg grid place-items-center bg-primary-500/10 text-primary-600 dark:text-primary-400 hover:bg-primary-500/20 shrink-0 neo-press"><Plus size={15} /></button>
            </form>
          </div>

          {/* convert to task — the single gradient CTA on this screen */}
          <div className="flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 bg-primary-500/[0.07] border border-[color:var(--line)]">
            <div className="flex items-center gap-2.5 min-w-0">
              <CheckSquare size={16} className="text-primary-600 dark:text-primary-400 shrink-0" />
              <p className="text-xs text-muted-light dark:text-muted-dark">Sudah yakin? Ubah jadi task.</p>
            </div>
            <button
              onClick={convertToTask}
              className="ember-cta neo-press inline-flex items-center gap-1.5 rounded-md text-xs font-semibold px-3.5 py-2 hover:brightness-[1.06] active:brightness-100 transition-all shrink-0"
            >
              Jadikan task
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
