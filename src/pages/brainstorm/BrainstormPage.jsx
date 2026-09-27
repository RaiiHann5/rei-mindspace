import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Folder, Lightbulb } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCollection } from '@/hooks/useCollection'
import { EmptyState, Skeleton } from '@/components/ui'
import { CardBrainstorm } from '@/components/ui'
import BrainstormFormModal from './BrainstormFormModal'

const TABS = [
  { key: 'all', label: 'Semua' },
  { key: 'new', label: 'Baru' },
  { key: 'exploring', label: 'Dieksplor' },
  { key: 'validated', label: 'Tervalidasi' },
]

// Low-chroma folder tints, cycling by index. None of them is the ember
// gradient — the board is a place to scan, not to be dazzled.
const FOLDER_TONES = [
  { bg: 'bg-teal-500/[0.07]', icon: 'bg-teal-500/12 text-teal-600 dark:text-teal-300' },
  { bg: 'bg-rose-500/[0.07]', icon: 'bg-rose-500/12 text-rose-600 dark:text-rose-300' },
  { bg: 'bg-amber-500/[0.07]', icon: 'bg-amber-500/12 text-amber-600 dark:text-amber-300' },
]

function FolderCard({ label, count, tone }) {
  return (
    <div className={`rounded-2xl p-4 min-h-[112px] flex flex-col justify-between glass border border-[color:var(--line)] ${tone.bg}`}>
      <div className={`h-9 w-9 rounded-lg grid place-items-center ${tone.icon}`}>
        <Folder size={16} />
      </div>
      <div>
        <p className="font-display font-semibold tracking-tight text-sm">{label}</p>
        <p className="text-[11px] font-mono tabular-nums text-dusk mt-0.5">{count} ide</p>
      </div>
    </div>
  )
}

function AddCard({ label, onClick, compact }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border border-dashed border-[color:var(--line-strong)] grid place-items-center gap-2 text-muted-light dark:text-muted-dark hover:border-ember-500/60 hover:text-primary-600 dark:hover:text-primary-400 transition-colors neo-press ${compact ? 'min-h-[112px]' : 'min-h-[190px]'}`}
    >
      <span className="h-9 w-9 rounded-full border border-dashed border-current grid place-items-center">
        <Plus size={16} />
      </span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}

export default function BrainstormPage() {
  const { items, isLoading, createItem, updateItem, removeItem } = useCollection('brainstorm')
  const navigate = useNavigate()
  const [tab, setTab] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const filtered = useMemo(
    () => items.filter((i) => tab === 'all' || i.status === tab),
    [items, tab]
  )

  const topCategories = useMemo(() => {
    const counts = {}
    items.forEach((i) => {
      const key = i.category || 'Lainnya'
      counts[key] = (counts[key] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([label, count]) => ({ label, count }))
  }, [items])

  const openNew = () => { setEditing(null); setModalOpen(true) }
  const openDetail = (item) => navigate(`/brainstorm/${item.id}`)

  const save = async (data) => {
    if (editing) {
      await updateItem(editing.id, data)
      toast.success('Ide diperbarui')
      setModalOpen(false); setEditing(null)
    } else {
      const created = await createItem(data)
      toast.success('Ide tersimpan')
      setModalOpen(false); setEditing(null)
      if (created?.id) navigate(`/brainstorm/${created.id}`)
    }
  }

  const del = async (item) => {
    if (confirm(`Hapus "${item.title}"?`)) { await removeItem(item.id); toast.success('Ide dihapus') }
  }

  return (
    <div>
      {/* header ala "MY NOTES": judul besar + tombol utama */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Brainstorm</h1>
          <p className="text-sm text-muted-light dark:text-muted-dark mt-0.5">Tangkap ide sebelum lupa.</p>
        </div>
        {/* The single gradient CTA on this screen. */}
        <button
          onClick={openNew}
          className="ember-cta neo-press inline-flex items-center gap-2 rounded-md text-sm font-semibold px-4 py-2.5 hover:brightness-[1.06] active:brightness-100 transition-all"
        >
          <Plus size={16} /> Ide baru
        </button>
      </div>

      {/* section "Recent Folders" -> kategori teratas */}
      <div className="mb-8">
        <h2 className="font-display font-semibold tracking-tight mb-3">Kategori Teratas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {topCategories.map((c, idx) => (
            <FolderCard key={c.label} label={c.label} count={c.count} tone={FOLDER_TONES[idx % FOLDER_TONES.length]} />
          ))}
          <AddCard label="Kategori baru" onClick={openNew} compact />
        </div>
      </div>

      {/* section "My Notes" -> daftar ide, tab dengan underline hairline */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold tracking-tight">Semua Ide</h2>
          <div className="flex items-center gap-5">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`text-sm pb-1 border-b transition-colors neo-press ${
                  tab === t.key
                    ? 'border-ember-500 text-ink-light dark:text-ink-dark font-semibold'
                    : 'border-transparent text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[190px] rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Lightbulb} title="Belum ada ide" description="Catat apa pun yang layak dieksplor nanti." actionLabel="Ide baru" onAction={openNew} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item, idx) => (
              <CardBrainstorm
                key={item.id}
                item={item}
                index={idx}
                onOpen={openDetail}
                onDelete={del}
                onToggleFavorite={(i) => updateItem(i.id, { favorite: !i.favorite })}
              />
            ))}
            <AddCard label="Ide baru" onClick={openNew} />
          </div>
        )}
      </div>

      <BrainstormFormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }} onSubmit={save} initial={editing} />
    </div>
  )
}